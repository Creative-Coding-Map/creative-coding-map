import * as d3 from 'd3';

import { blendGraphs } from './blend';
import { colorGraph } from './coloring';
import {
    findAdjacentSubtree,
    findAllShortestPaths,
    minimumSpanningTreeFromSubtree,
    pushTerminalTagsUp,
    updateLinkCounts,
} from './dijkstra';
import { buildGraph, buildNodesFromCcmData } from './build-graph';
import { buildDomainGraph } from './domain-sets';
import { VIEW_CONFIGURATIONS } from './data';
import type { ForceGraphMethods, ForceGraphProps } from 'react-force-graph-2d';
import type {
    CCMData,
    CCMDomainModes,
    CCMFilter,
    CCMGraphData,
    CCMGraphLink,
    CCMGraphNode,
    CCMPathEnds,
    CCMViewConfiguration,
    NodesCollection,
} from '@/types/ccmap';

import { linkWeights } from '@/modules/map/link-weights.ts';
import { emitter } from '@/hooks/useEmitter';
import { databaseAtom } from '@/state/model';
import { store } from '@/state/store';

export class CCMapController {
    private selectedNodeId: any | null = null;
    private initialized = false;

    private ccmData: CCMData | null = null;
    private nodes: NodesCollection | null = null;
    private domainGraph: CCMGraphData | null = null;
    private graphRef: ForceGraphMethods<CCMGraphNode, CCMGraphLink> | null = null; // Reference to the ForceGraph2D component
    #graphData: CCMGraphData | null = null;
    #runtimeProps: ForceGraphProps<CCMGraphNode, CCMGraphLink> = {};

    public viewConfiguration = VIEW_CONFIGURATIONS[0];

    private skipPathNodes: Set<string> = new Set();
    private emitter = emitter;
    private hoverNodeId: string | null = null;

    private layoutTimeoutHandler: number | null = null;
    private layoutInterval: number | null = null;
    private theme: 'light' | 'dark' = 'light';

    private filters: Array<string> = [];

    private filterTags = false;
    private filterTechniques = false;
    private filterTools = false;

    ogGraph: CCMGraphData | null = null;

    pathEnds: CCMPathEnds = { start: null, end: null };
    #shortestPaths: Array<Array<string>> = [];

    private zoom = 1.0;

    constructor() {
        this.theme = document.documentElement.dataset.theme as 'light' | 'dark';
        console.log('theme', this.theme);
    }

    initialize(ccmData: CCMData): void {
        if (this.initialized) return;
        console.log('initializing');

        this.ccmData = ccmData;

        this.nodes = buildNodesFromCcmData(this.ccmData);

        // defer this
        setTimeout(() => {
            const database = store.get(databaseAtom);

            this.nodes?.allNodes.forEach((node) => {
                if (database.hasNode(node.id)) {
                    database.getNode(node.id)!.color = node.color;
                }
            });
        }, 0);

        this.ogGraph = buildGraph(this.ccmData, this.nodes);
        updateLinkCounts(this.ogGraph);

        this.domainGraph = buildDomainGraph(this.ogGraph, this.viewConfiguration.domainSets) as CCMGraphData;
        this.nodes.domainNodes = this.domainGraph.nodes;
        this.nodes.allNodes = this.ogGraph.nodes.concat(this.domainGraph.nodes);
        colorGraph(this.ogGraph, this.viewConfiguration.domainSets);

        const subTree = findAdjacentSubtree(this.domainGraph.links, '___root');

        const mstNamed = minimumSpanningTreeFromSubtree(
            this.nodes.allNodes,
            this.ogGraph.links.concat(this.domainGraph.links),
            subTree,
            linkWeights as any
        );

        this.graphData = this.localBuildGraph(mstNamed.mstEdges);
        this.graphData.links = mstNamed.mstEdges;

        if (this.layoutTimeoutHandler) {
            clearTimeout(this.layoutTimeoutHandler);
            this.layoutTimeoutHandler = null;
        }

        this.layoutTimeoutHandler = setTimeout(() => {
            if (!this.graphRef || !this.graphData) {
                console.log('graphref or graphdata not found, aborting layout timeout handler');
                return;
            }

            if (this.selectedNodeId != null) {
                // !important: do nothing now, an event will be emitted later to focus the node
            } else {
                const linkForce = d3
                    .forceLink(this.graphData.links as any)
                    .id((d: any) => d.id)
                    .distance(30)
                    .strength((link) => 1);

                this.graphRef.d3Force('link', linkForce);
            }
        }, 30);

        this.#runtimeProps = {};

        this.emitter.on('app:domain:changed', this.onDomainChanged);
        this.emitter.on('map:path-ends:changed', this.onPathEndsChanged);
        this.emitter.on('app:selected-node:changed', this.onSelectedNodeChanged);
        this.emitter.on('app:selected-node:focus', this.onFocusSelectedNode);
        this.emitter.on('app:shortest-path:cleared', this.onShortestPathCleared);
        this.emitter.on('app:shortest-path:changed', this.onShortestPathChanged);
        this.emitter.on('app:filters:changed', this.onFiltersChanged);
        this.emitter.on('app:theme:changed', this.onThemeChanged);
        this.emitter.on('map:zoom-in', this.zoomIn);
        this.emitter.on('map:zoom-out', this.zoomOut);
        this.emitter.on('map:recenter', this.recenter);

        this.initialized = true;
        this.emitter.emit('map:initialized');
    }

    zoomIn = () => {
        this.zoom *= 1.5;
        this.graphRef?.zoom(this.zoom, 300);
    };

    zoomOut = () => {
        this.zoom *= 1 / 1.5;
        this.graphRef?.zoom(this.zoom, 300);
    };

    recenter = () => {
        this.graphRef?.centerAt(0, 0, 500);
    };

    /**
     * Centers the graph view on the specified node.
     *
     * @param {string | CCMGraphNode} node - The target node to center on. It can be either the node's ID (string)
     * or the node object. If a string ID is provided and the node is not found, a warning will be logged, and the method will return.
     * @return {void} This method does not return a value.
     */
    centerOnNode(node: string | CCMGraphNode): CCMGraphNode | null {
        if (typeof node === 'string') {
            const candidate = this.nodeForId(node);
            if (candidate) {
                node = candidate;
            } else {
                console.warn(`Node ${node} not found`);
                return null;
            }
        }

        if (this.graphRef != null) {
            this.graphRef.centerAt(node.x, node.y, 1000);
        }
        return node;
    }

    nodeForId: (nodeId: string) => CCMGraphNode | undefined = (nodeId) => {
        return this.#graphData?.nodes.find((n) => n.id === nodeId);
    };

    setViewConfiguration(viewConfiguration: CCMViewConfiguration) {
        if (this.viewConfiguration != viewConfiguration) {
            this.viewConfiguration = viewConfiguration;
            this.emitter.emit('map:view-configuration:changed', this.viewConfiguration);
        }
    }

    set shortestPaths(shortestPaths: Array<Array<string>>) {
        console.log('setting shortest paths', shortestPaths);
        if (shortestPaths != this.#shortestPaths) {
            this.#shortestPaths = shortestPaths;
            this.emitter.emit('map:shortest-path:changed', shortestPaths);
        }
    }

    findShortestPath(source: string, target: string) {
        console.log('finding shortest path from', source, 'to', target);
        const filteredLinks: Array<CCMGraphLink> = [];

        this.ogGraph!.links.forEach((link) => {
            const source_ = (link.source as CCMGraphNode).id || (link.source as string);
            const target_ = (link.target as CCMGraphNode).id || (link.target as string);

            if (!this.skipPathNodes.has(source_) && !this.skipPathNodes.has(target_)) {
                filteredLinks.push(link);
            }
        });

        const result = findAllShortestPaths(this.graphData!.nodes, filteredLinks, source, target);
        this.shortestPaths = result.paths;
        if (this.#shortestPaths.length > 0) {
            const shortestPath = this.#shortestPaths[0];
            const subtree: Array<CCMGraphLink> = [];

            for (let i = 0; i < shortestPath.length - 1; ++i) {
                const link: CCMGraphLink = {
                    source: shortestPath[i],
                    target: shortestPath[i + 1],
                    weight: 1.0,
                    type: 'shortest-path',
                };
                subtree.push(link);
            }

            const mst = minimumSpanningTreeFromSubtree(
                this.ogGraph!.nodes.concat(this.domainGraph!.nodes),
                this.ogGraph!.links.concat(this.domainGraph!.links),
                subtree,
                linkWeights as any
            );

            // set the new graphdata
            this.graphData = this.localBuildGraph(mst.mstEdges);

            if (this.graphData.links.length > mst.mstEdges.length) {
                console.error('we have a problem, we have more links than the mst');
            }

            for (const node of this.#graphData?.nodes || []) {
                delete node.isOnShortestPath;
                delete node.pathTag;
            }

            for (const node of shortestPath) {
                const node_ = this.nodeForId(node);
                if (node_) {
                    const tags = this.nodes?.allNodes.find((n) => n.id === node)?.ccmData?.[1]?.tags || [];

                    node_.pathTag = null;
                    if (node_.type == 'domain') {
                        node_.pathTag = 'domain';
                    } else if (node_.type == 'tool') {
                        node_.pathTag = 'tool';
                    } else if (node_.type == 'technique') {
                        node_.pathTag = 'technique';
                    } else if (node_.type == 'tag') {
                        node_.pathTag = 'tag';
                    }

                    for (const tag of tags) {
                        if (
                            tag == 'library' ||
                            tag == 'application' ||
                            tag == 'file format' ||
                            tag == 'sensor' ||
                            tag == 'protocol'
                        ) {
                            node_.pathTag = tag;
                            break;
                        }
                    }
                    node_.isOnShortestPath = true;
                }
            }
            for (let i = 0; i < shortestPath.length; ++i) {
                const node = shortestPath[i];
                const l = this.#graphData?.nodes.length || 0;

                const index = this.#graphData?.nodes.findIndex((n) => n.id === node) || -1;
                if (index >= 0) {
                    const tmp = this.#graphData!.nodes[index];
                    this.#graphData!.nodes[index] = this.#graphData!.nodes[l - 1 - i];
                    this.#graphData!.nodes[l - 1 - i] = tmp;
                }
            }

            this.graphRef?.zoomToFit(0, 20, (node) => shortestPath.includes(node.id));

            setTimeout(() => {
                const startNode = this.nodeForId(shortestPath[0])!;

                let x = startNode.x!;
                const y = startNode.y!;
                const sourcePositions = shortestPath.map((node) => {
                    const n = this.nodeForId(node)!;
                    return [n.x!, n.y!];
                });
                const targetPositions = shortestPath.map((_) => {
                    x += 200.0;
                    return [x, y];
                });

                let iterations = 0;
                const interval = setInterval(() => {
                    const f = Math.min(1.0, iterations / 100.0);
                    for (let i = 0; i < shortestPath.length; ++i) {
                        const node = shortestPath[i];
                        const node_ = this.nodeForId(node)!;
                        node_.fx = sourcePositions[i][0] * (1.0 - f) + targetPositions[i][0] * f;
                        node_.fy = sourcePositions[i][1] * (1.0 - f) + targetPositions[i][1] * f;
                    }
                    iterations++;
                    this.graphRef?.zoomToFit(0, 200, (node) => shortestPath.includes(node.id));
                    const height = window.outerHeight;

                    const cx = (targetPositions[0][0] + targetPositions[targetPositions.length - 1][0]) / 2.0;
                    const cy = targetPositions[0][1] + (height / 2 - 200) / this.graphRef!.zoom();
                    this.graphRef?.centerAt(cx, cy, 1000);
                    if (iterations >= 110) {
                        clearInterval(interval);
                    }
                }, 10);
            }, 1000);
        }
    }

    resetGraph() {
        this.domainGraph = buildDomainGraph(this.ogGraph, this.viewConfiguration.domainSets) as CCMGraphData;
        this.nodes.domainNodes = this.domainGraph.nodes;
        this.nodes.allNodes = this.ogGraph.nodes.concat(this.domainGraph.nodes);
        colorGraph(this.ogGraph, this.viewConfiguration.domainSets);

        const subTree = findAdjacentSubtree(this.domainGraph.links, '___root');

        const mstNamed = minimumSpanningTreeFromSubtree(
            this.nodes.allNodes,
            this.ogGraph.links.concat(this.domainGraph.links),
            subTree,
            linkWeights as any
        );

        this.graphData = this.localBuildGraph(mstNamed.mstEdges);
        this.graphData.links = mstNamed.mstEdges;
    }

    focusOnNode(node: string | CCMGraphNode): CCMGraphNode | null {
        if (typeof node === 'string') {
            node = this.#graphData?.nodes.find((n) => n.id === node) as CCMGraphNode;
        }

        if (!this.graphRef) {
            console.log('graphRef not found, aborting focusOnNode');
            return null;
        }

        console.log('focusing on node', node);

        const graphData = this.#graphData;

        if (!graphData) return null;

        for (const graphNode of graphData.nodes) {
            delete graphNode.fx;
            delete graphNode.fy;
        }

        this.pathEnds = { start: null, end: null };
        this.shortestPaths = [];
        // Pin clicked node
        node.fx = node.x;
        node.fy = node.y;

        const subtree = (() => {
            if (node.type != 'domain') {
                return findAdjacentSubtree(this.ogGraph!.links, node.id);
            } else {
                return findAdjacentSubtree(this.domainGraph!.links, '___root');
            }
        })();
        if (subtree.length === 0) {
            throw Error('No subtree found for node ' + node.id);
        }

        const relevantNodes = this.ogGraph!.nodes.concat(this.domainGraph!.nodes);

        const mst = minimumSpanningTreeFromSubtree(
            relevantNodes,
            this.ogGraph!.links.concat(this.domainGraph!.links),
            subtree,
            linkWeights as any
        );
        console.log('number of links in mst: ', mst.mstEdges.length);
        const nextGraph = this.localBuildGraph(mst.mstEdges);

        console.log('number of links in new graph: ', nextGraph.links.length);

        pushTerminalTagsUp(relevantNodes, mst.mstEdges);
        graphData.links = mst.mstEdges;

        blendGraphs(graphData, nextGraph);

        // Update the graph data
        this.emitter.emit('map:graph-data:updated', graphData);

        let s = 0.0;
        this.graphRef.d3ReheatSimulation();

        this.centerOnNode(node.id);

        if (this.layoutInterval) {
            clearInterval(this.layoutInterval);
            this.layoutInterval = null;
        }

        this.layoutInterval = setInterval(() => {
            if (!this.graphRef) return;

            const linkForce = d3
                .forceLink(graphData.links as any)
                .id((d: any) => d.id)
                .distance(10)
                .strength((link: any) => {
                    link.strength = 1.0;
                    if (link.strengthDelta && link.strengthDelta > 0) {
                        return s * (link.strength || 0);
                    } else if (link.strengthDelta && link.strengthDelta < 0) {
                        return 0.0;
                    } else {
                        return s * (link.strength || 0.0);
                    }
                });

            s += 0.1;
            if (s > 1.0) {
                s = 1.0;
                clearInterval(this.layoutInterval!);
            }
            this.graphRef.d3Force('link', linkForce);
        }, 100);

        return node;
    }

    onPathEndsChanged = (p: CCMPathEnds) => {
        if (p.start != null && p.end != null) {
            this.skipPathNodes.clear();
            this.findShortestPath(p.start, p.end);
        }
    };

    onSelectedNodeChanged = (nodeId: string | null) => {
        this.selectedNodeId = nodeId;
    };

    onShortestPathCleared = () => {
        this.shortestPaths = [];
        for (const node of this.#graphData?.nodes || []) {
            delete node.fx;
            delete node.fy;
            delete node.isOnShortestPath;
            this.pathEnds.start = null;
            this.pathEnds.end = null;
        }
        this.resetGraph();
        setTimeout(() => {
            this.recenter();
        }, 500);
    };

    onDomainChanged = (domain: CCMDomainModes) => {
        // TODO: Implement domain changed
    };

    onShortestPathChanged = (removedId: string) => {
        this.skipPathNodes.add(removedId);

        if (this.pathEnds.start && this.pathEnds.end) {
            this.findShortestPath(this.pathEnds.start, this.pathEnds.end);
        }
    };

    onFocusSelectedNode = (nodeId: string | null) => {
        if (nodeId) {
            console.log('onFocusSelectedNode', nodeId);
            this.selectedNodeId = nodeId;
            this.focusOnNode(nodeId);
        }
    };

    onFiltersChanged = (filters: CCMFilter[]) => {
        console.log('onFiltersChanged', filters);
        this.filters = filters.map((i) => i.id);

        this.filterTags = this.filters.includes('tags');
        this.filterTechniques = this.filters.includes('techniques');
        this.filterTools = this.filters.includes('tools');

        console.log('filter tags', this.filterTags);
        console.log('filter techniques', this.filterTechniques);
        console.log('filter tools', this.filterTools);
        console.log('filters set to', this.filters);
    };

    onThemeChanged = (theme: string) => {
        this.theme = theme as 'light' | 'dark';
    };

    get background(): string {
        return this.theme === 'dark' ? '#000000' : '#ffffff';
    }

    get foreground(): string {
        return this.theme === 'dark' ? '#ffffff' : '#000000';
    }

    get graphData(): CCMGraphData | null {
        return this.#graphData;
    }

    set graphData(graphData: CCMGraphData | null) {
        this.#graphData = graphData;
        this.emitter.emit('map:graph-data:updated', graphData);
    }

    setRuntimeProps<TKey extends keyof ForceGraphProps<CCMGraphNode, CCMGraphLink>>(
        key: TKey,
        value: ForceGraphProps<CCMGraphNode, CCMGraphLink>[TKey]
    ) {
        this.#runtimeProps[key] = value;
        this.emitter.emit('map:runtime-props:updated', this.#runtimeProps);
    }

    setGraphRef(graph: ForceGraphMethods<CCMGraphNode, CCMGraphLink>) {
        this.graphRef = graph;
    }

    private localBuildGraph(mstEdges?: Array<any>): CCMGraphData {
        if (!this.ccmData || !this.nodes) {
            throw new Error('Controller not initialized');
        }

        // at this point this.nodes contains the domain nodes
        const graph = buildGraph(this.ccmData, this.nodes, mstEdges);
        if (this.domainGraph && mstEdges == null) {
            graph.links = graph.links.concat(this.domainGraph.links);
        }
        return graph;
    }

    getLinkVisibility(link: any) {
        return (link.strengthDelta || 0) >= 0.0;
    }

    getLinkLineDash(link: any) {
        if (link.type === 'shortest-path') {
            return [0.1, 0.1];
        } else {
            return [];
        }
    }

    getLinkWidth(link: any) {
        if (link.type === 'shortest-path') {
            return 10.0;
        } else {
            return 1.0;
        }
    }

    getLinkCanvasObject = (link: any, ctx: CanvasRenderingContext2D, globalScale: number) => {
        const start = link.source;
        const end = link.target;

        let linkColor = this.foreground;

        if (this.#shortestPaths.length > 0 && link.type !== 'shortest-path') {
            linkColor = this.theme === 'light' ? 'rgba(127, 127, 127, 0.5)' : 'rgba(127, 127, 127, 0.5)';
        }

        if (link.type == 'shortest-path') {
            ctx.save();

            const dx = end.x - start.x;
            const dy = end.y - start.y;

            const cx = start.x + dx / 2.0;
            const cy = start.y + dy / 2.0 - 10.0 / globalScale;

            const fontSize = 10.0 / globalScale;
            ctx.font = `bold ${fontSize}px Space Mono`;
            const label = 'DEPENDS ON';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillStyle = this.foreground;
            ctx.fillText(label, cx, cy);

            ctx.strokeStyle = linkColor;
            ctx.lineWidth = 3.0 / globalScale;
            ctx.setLineDash([5.0 / globalScale, 5.0 / globalScale]);
            ctx.beginPath();
            ctx.moveTo(start.x, start.y);
            ctx.lineTo(end.x, end.y);
            ctx.stroke();

            ctx.restore();
        } else {
            ctx.save();
            ctx.strokeStyle = linkColor;
            ctx.lineWidth = 0.25 / globalScale;
            ctx.beginPath();
            ctx.moveTo(start.x, start.y);
            ctx.lineTo(end.x, end.y);
            ctx.stroke();
            ctx.restore();
        }
    };

    getNodeHoverHandler = (node: any, _: any) => {
        if (node !== null) {
            if (this.hoverNodeId !== node.id) {
                this.hoverNodeId = node.id;
                // Remove hovered item from nodes and push it to the back to assure it the hovered over node is drawn
                // last, making sure the hovered item is visible.
                const index = this.graphData?.nodes.indexOf(node);
                if (index !== undefined && index !== -1) {
                    this.graphData?.nodes.splice(index, 1);
                }
                this.graphData?.nodes.push(node);
            }
        } else {
            this.hoverNodeId = null;
        }
    };
    getNodeClickHandler = (node: any, e: MouseEvent) => {
        if (!e.shiftKey) {
            console.log('shortest paths length', this.#shortestPaths.length);
            if (this.pathEnds.start != node.id && this.#shortestPaths.length === 0 && this.pathEnds.end != node.id) {
                console.log('setting path start to', node.id);
                this.pathEnds.start = node.id;
                this.emitter.emit('map:path-ends:changed', this.pathEnds);
            }

            if (node.id === this.selectedNodeId) {
                if (this.pathEnds.start != node.id && this.pathEnds.end != node.id) {
                    console.log('setting path start to', node.id);
                    this.pathEnds.start = node.id;
                }
                const graphCoord = this.graphRef!.screen2GraphCoords(e.clientX, e.clientY);
                const bounds = node.focusWidgetBounds;
                if (
                    graphCoord.x >= bounds[0] &&
                    graphCoord.x <= bounds[0] + bounds[2] &&
                    graphCoord.y >= bounds[1] &&
                    graphCoord.y <= bounds[1] + bounds[3]
                ) {
                    this.focusOnNode(node);
                } else {
                    this.centerOnNode(node);
                }
            }
            if (node.id != this.selectedNodeId) {
                this.selectedNodeId = node.id;
                // Remove selected item from nodes and push it to the back to assure it the hovered over node is drawn
                // last, making sure the hovered item is visible.
                const index = this.graphData?.nodes.indexOf(node);
                if (index !== undefined && index !== -1) {
                    this.graphData?.nodes.splice(index, 1);
                }
                this.graphData?.nodes.push(node);

                this.emitter.emit('map:selected-node:changed', this.selectedNodeId);
            }
        } else {
            if (this.pathEnds.end != node.id && this.pathEnds.start != node.id) {
                console.log('setting path end to', node.id);
                this.pathEnds.end = node.id;
                this.emitter.emit('map:path-ends:changed', this.pathEnds);
            }
        }
    };

    getNodeCanvasObject = (node: any, ctx: CanvasRenderingContext2D, globalScale: number) => {
        let globalScaleMapped = globalScale;
        if (globalScaleMapped < 0.4) globalScaleMapped = 0.4;

        const showingShortestPaths = this.#shortestPaths.length > 0;
        const transform = ctx.getTransform();
        const scale = (transform.a + transform.d) / 2.0;

        const domainName = `domain:${node.domain}`;
        const isFiltered =
            (node.type === 'tag' && this.filterTags) ||
            (node.type === 'tool' && this.filterTools) ||
            (node.type === 'technique' && this.filterTechniques) ||
            this.filters.includes(domainName);

        let minScale = 2.0;
        switch (node.type) {
            case 'domain':
                minScale = 0.0;
                break;
            case 'tool':
            case 'technique':
                minScale = 4.0;
                break;
            case 'tag':
                minScale = 1.5;
                break;
        }

        const filteredColor = this.theme === 'light' ? '#e0e0e0' : '#202020';
        const nodeColor = isFiltered ? filteredColor : node.color || this.foreground;

        ctx.fillStyle = nodeColor;

        // TODO: Implement glyphs per design
        switch (node.type) {
            case 'tag':
                ctx.beginPath();
                //  ctx.rect(node.x! - 4 / globalScale, node.y! - 4 / globalScale, 8 / globalScale, 8 / globalScale);
                for (let i = 0; i < 10; ++i) {
                    const x0 = node.x + (Math.cos((i * 2 * Math.PI) / 10.0) * 4.0) / globalScale;
                    const x1 = node.x + (Math.cos(((i * 2 + 1) * Math.PI) / 10.0) * 2.0) / globalScale;
                    const y0 = node.y + (Math.sin((i * 2 * Math.PI) / 10.0) * 4.0) / globalScale;
                    const y1 = node.y + (Math.sin(((i * 2 + 1) * Math.PI) / 10.0) * 2.0) / globalScale;
                    if (i == 0) {
                        ctx.moveTo(x0, y0);
                        ctx.lineTo(x1, y1);
                    } else {
                        ctx.lineTo(x0, y0);
                        ctx.lineTo(x1, y1);
                    }
                }

                ctx.fill();
                break;
            case 'technique':
                ctx.beginPath();
                ctx.lineWidth = 1 / globalScaleMapped;
                ctx.strokeStyle = nodeColor;
                ctx.arc(node.x, node.y, 4.0 / globalScale, 0, 2 * Math.PI, false);
                ctx.stroke();

                ctx.beginPath();
                ctx.arc(node.x, node.y, 2.0 / globalScaleMapped, 0, 2 * Math.PI, false);
                ctx.stroke();
                break;
            case 'tool':
                ctx.beginPath();
                ctx.arc(node.x, node.y, 4.0 / globalScaleMapped, 0, 2 * Math.PI, false);
                ctx.fill();
                break;
        }

        node.__bckgDimensions = [8, 8];

        // Draw labels if zoomed in enough
        if (scale >= minScale || node.id === this.hoverNodeId || node.id === this.selectedNodeId || node.isOnShortestPath) {
            const suffix = (() => {
                switch (node.type) {
                    case 'tag':
                        return ` [${node.count}]`;
                    default:
                        return '';
                }
            })();
            const name =
                node.type == 'root' ? '' : node.type == 'domain' || node.type == 'tag' ? node.name.toUpperCase() : node.name;
            const label = name + suffix;

            const fontSizes = {
                domain: 18 / globalScale,
                tag: 12 / globalScale,
                tool: 12 / globalScale,
                technique: 12 / globalScale,
            };

            const fontSize = fontSizes[node.type] as number;
            ctx.font = `${fontSize}px Space Mono`;
            const textWidth = ctx.measureText(label).width;
            const hmargin = 10.0 / globalScale;

            const vmargins = {
                domain: 8 / globalScale,
                tag: 8 / globalScale,
                tool: 6 / globalScale,
                technique: 6 / globalScale,
            };
            const vmargin = vmargins[node.type] as number;

            const radii = {
                domain: 10 / globalScale,
                tag: 20 / globalScale,
                tool: 2.5 / globalScale,
                technique: 2.5 / globalScale,
            };
            const radius = radii[node.type] as number;

            const labelWidth = textWidth + 2 * hmargin + fontSize * 0.2;

            const focusButtonWidth = node.id === this.selectedNodeId ? 64.0 / globalScale : 0.0;
            const labelDimensions: [number, number] = [textWidth + 2 * hmargin, fontSize + vmargin].map(
                (n) => n + fontSize * 0.2
            ) as [number, number];

            const bckgDimensions: [number, number] = [textWidth + 2 * hmargin + focusButtonWidth, fontSize + vmargin].map(
                (n) => n + fontSize * 0.2
            ) as [number, number];

            const isSelected = node.id === this.selectedNodeId;

            const nodeColor = node.type === 'domain' ? this.foreground : node.color || this.foreground;
            const backgroundColor = isSelected ? nodeColor : this.background;

            const inShortestPath = node.isOnShortestPath;
            let labelStyle: string =
                (!isFiltered && isSelected) || inShortestPath
                    ? 'pill'
                    : node.type === 'tool' || node.type === 'technique'
                      ? 'text'
                      : 'pill';

            if (!inShortestPath && showingShortestPaths) {
                labelStyle = 'text';
            }

            if (isFiltered && !isSelected && !inShortestPath) {
                labelStyle = 'text';
            }

            if (labelStyle === 'pill') {
                ctx.beginPath();
                ctx.fillStyle = backgroundColor;

                ctx.roundRect(node.x! - labelDimensions[0] / 2, node.y! - labelDimensions[1] / 2, ...labelDimensions, radius);

                ctx.fill();
                ctx.strokeStyle = isSelected ? this.background : nodeColor;
                ctx.lineWidth = 1.0 / globalScale;
                ctx.stroke();
            }

            // draw label
            const textY = labelStyle === 'pill' ? node.y + 1.5 / globalScale : node.y - 16.0 / globalScale;
            if (!isFiltered || node.isOnShortestPath) {
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                let labelColor: string = labelStyle === 'text' ? this.foreground : isSelected ? this.background : nodeColor;

                if (showingShortestPaths && !inShortestPath) {
                    labelColor = this.theme === 'light' ? 'rgba(127, 127, 127, 0.25)' : 'rgba(127, 127, 127, 0.25)';
                }

                ctx.fillStyle = labelColor;
                ctx.fillText(label, node.x, textY);
                node.__bckgDimensions = bckgDimensions;
            }

            if (node.isOnShortestPath) {
                const fontSize = 10.0 / globalScale;
                ctx.font = `bold ${fontSize}px Space Mono`;
                ctx.fillStyle = this.foreground;
                ctx.textAlign = 'left';
                ctx.fillText(node.pathTag.toUpperCase(), node.x - labelDimensions[0] / 2 + hmargin, textY - 20.0 / globalScale);
            }

            // draw focus widget, when node is selected node
            if (!showingShortestPaths && !isFiltered && node.id === this.selectedNodeId) {
                ctx.beginPath();
                node.focusX = labelDimensions[0] / 2 + 2.0 / globalScale;
                ctx.roundRect(
                    node.x! + labelDimensions[0] / 2 + 2.0 / globalScale,
                    node.y! - labelDimensions[1] / 2,
                    labelDimensions[1],
                    labelDimensions[1],
                    4.0 / globalScale
                );
                node.focusWidgetBounds = [
                    node.x! + labelDimensions[0] / 2 + 2.0 / globalScale,
                    node.y! - labelDimensions[1] / 2,
                    labelDimensions[1],
                    labelDimensions[1],
                ];

                ctx.fillStyle = isSelected ? nodeColor : this.background;
                ctx.fill();
                ctx.strokeStyle = this.background;
                ctx.lineWidth = 0.5 / globalScale;
                ctx.stroke();

                ctx.beginPath();
                ctx.arc(
                    node.x + labelDimensions[0] / 2 + 2.0 / globalScale + labelDimensions[1] / 2.0,
                    node.y,
                    4 / globalScale,
                    0,
                    2 * Math.PI,
                    false
                );

                const cx = node.x + labelDimensions[0] / 2 + 2.0 / globalScale + labelDimensions[1] / 2.0;
                const cy = node.y;
                ctx.moveTo(cx, cy + 6.0 / globalScale);
                ctx.lineTo(cx, cy - 6.0 / globalScale);
                ctx.moveTo(cx - 6.0 / globalScale, cy);
                ctx.lineTo(cx + 6.0 / globalScale, cy);

                ctx.lineWidth = 1.0 / globalScale;
                ctx.strokeStyle = this.background;
                ctx.stroke();
            }
        }
    };

    getNodePointerAreaPaint = (node: CCMGraphNode, color: string, ctx: CanvasRenderingContext2D) => {
        ctx.fillStyle = color;
        const bckgDimensions = node.__bckgDimensions;
        if (bckgDimensions) {
            ctx.fillRect(node.x! - bckgDimensions[0] / 2, node.y! - bckgDimensions[1] / 2, ...bckgDimensions);
        }
    };

    getNodeAutoColorBy = () => {
        return 'type';
    };

    onZoom = ({ k }: { k: number }) => {
        this.zoom = k;
    };

    isInitialized(): boolean {
        return this.initialized;
    }

    destroy(): void {
        // Cleanup if needed
        this.initialized = false;

        // reset all properties
        this.#graphData = null;
        this.#runtimeProps = {};
        this.ccmData = null;
        this.nodes = null;
        this.domainGraph = null;
        this.ogGraph = null;
        this.pathEnds = { start: null, end: null };
        this.graphRef = null;

        // unbind event listeners
        this.emitter.off('map:path-ends:changed', this.onPathEndsChanged);
        this.emitter.off('app:selected-node:changed', this.onSelectedNodeChanged);
        this.emitter.off('app:shortest-path:changed', this.onShortestPathChanged);
        this.emitter.off('app:selected-node:focus', this.onFocusSelectedNode);
        this.emitter.off('app:filters:changed', this.onFiltersChanged);
        this.emitter.off('app:theme:changed', this.onThemeChanged);
        this.emitter.off('map:zoom-in', this.zoomIn);
        this.emitter.off('map:zoom-out', this.zoomOut);
        this.emitter.off('map:recenter', this.recenter);
    }
}

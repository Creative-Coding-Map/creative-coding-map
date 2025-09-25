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

    ogGraph: CCMGraphData | null = null;

    pathEnds: CCMPathEnds = { start: null, end: null };
    #shortestPaths: Array<Array<string>> = [];

    private zoom = 1.0;

    constructor() {}

    initialize(ccmData: CCMData): void {
        if (this.initialized) return;
        console.log('initializing');
        this.ccmData = ccmData;

        this.nodes = buildNodesFromCcmData(this.ccmData);

        this.ogGraph = buildGraph(this.ccmData, this.nodes);
        updateLinkCounts(this.ogGraph);

        this.domainGraph = buildDomainGraph(this.ogGraph, this.viewConfiguration.domainSets) as CCMGraphData;
        this.nodes.domainNodes = this.domainGraph.nodes;
        this.nodes.allNodes = this.ogGraph.nodes.concat(this.domainGraph.nodes);
        colorGraph(this.ogGraph, this.viewConfiguration.colorSets);

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
        }, 300);

        this.#runtimeProps = {};

        this.emitter.on('map:path-ends:changed', this.onPathEndsChanged);
        this.emitter.on('app:selected-node:changed', this.onSelectedNodeChanged);
        this.emitter.on('app:selected-node:focus', this.onFocusSelectedNode);
        this.emitter.on('app:shortest-path:changed', this.onShortestPathChanged);
        this.emitter.on('app:filters:changed', this.onFiltersChanged);
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
        const filteredLinks: Array<CCMGraphLink> = [];

        this.ogGraph!.links.forEach((link) => {
            const source_ = (link.source as CCMGraphNode).id || (link.source as string);
            const target_ = (link.target as CCMGraphNode).id || (link.target as string);

            if (!this.skipPathNodes.has(source_) && !this.skipPathNodes.has(target_)) {
                filteredLinks.push(link);
            }
        });

        this.shortestPaths = findAllShortestPaths(this.graphData!.nodes, filteredLinks, source, target).paths;

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
            this.graphData = this.localBuildGraph(mst.mstEdges);

            if (this.graphData.links.length > mst.mstEdges.length) {
                console.error("we have a problem, we have more links than the mst");
            }

            let x = 0.0;
            for (const node of shortestPath) {
                const node_ = this.nodeForId(node);
                if (node_) {
                    node_.fx = x;
                    node_.fy = 0;
                    x += 30.0;
                }
            }
        }
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
    };

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
            if (node.id === this.selectedNodeId) {
                // TODO: Fix bounds check
                const graphCoord = this.graphRef!.screen2GraphCoords(e.clientX, e.clientY);
                const dx = graphCoord.x - node.x - node.__bckgDimensions[0] / 2.0;
                if (dx > -40.0) {
                    this.focusOnNode(node);
                } else {
                    this.centerOnNode(node);
                }

                // TODO: Fix shortest path start selection logic
                if (this.pathEnds.start != node.id && this.#shortestPaths.length === 0) {
                    this.pathEnds.start = node.id;
                    this.emitter.emit('map:path-ends:changed', this.pathEnds);
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
            if (this.pathEnds.end != node.id) {
                this.pathEnds.end = node.id;
                this.emitter.emit('map:path-ends:changed', this.pathEnds);
            }
        }
    };

    getNodeCanvasObject = (node: any, ctx: CanvasRenderingContext2D, globalScale: number) => {
        const transform = ctx.getTransform();
        const scale = (transform.a + transform.d) / 2.0;

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

        ctx.fillStyle = node.color || '#000000';

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
                ctx.lineWidth = 1 / globalScale;
                ctx.strokeStyle = node.color || '#000000';
                ctx.arc(node.x, node.y, 4 / globalScale, 0, 2 * Math.PI, false);
                ctx.stroke();

                ctx.beginPath();
                ctx.arc(node.x, node.y, 2 / globalScale, 0, 2 * Math.PI, false);
                ctx.stroke();
                break;
            case 'tool':
                ctx.beginPath();
                ctx.arc(node.x, node.y, 4 / globalScale, 0, 2 * Math.PI, false);
                ctx.fill();
                break;
        }

        node.__bckgDimensions = [8, 8];

        // Draw labels if zoomed in enough
        if (scale >= minScale || node.id === this.hoverNodeId || node.id === this.selectedNodeId) {
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

            const nodeColor = node.color || '#000000';
            const backgroundColor = isSelected ? nodeColor : node.type === 'domain' ? '#F4EBFC' : '#ffffff';

            const labelStyle: string = isSelected ? 'pill' : node.type === 'tool' || node.type === 'technique' ? 'text' : 'pill';

            if (labelStyle === 'pill') {
                ctx.beginPath();
                ctx.roundRect(node.x! - labelDimensions[0] / 2, node.y! - labelDimensions[1] / 2, ...labelDimensions, radius);

                ctx.fillStyle = backgroundColor;
                ctx.fill();
                ctx.strokeStyle = isSelected ? 'white' : nodeColor;
                ctx.lineWidth = 1.0 / globalScale;
                ctx.stroke();
            }

            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            const labelColor: string = labelStyle === 'text' ? 'black' : isSelected ? 'white' : nodeColor;
            ctx.fillStyle = labelColor;
            const textY = labelStyle === 'pill' ? node.y + 1.5 / globalScale : node.y - 16.0 / globalScale;
            ctx.fillText(label, node.x, textY);
            node.__bckgDimensions = bckgDimensions;

            // draw focus widget, when node is selected node
            if (node.id === this.selectedNodeId) {
                ctx.beginPath();
                node.focusX = labelDimensions[0] / 2 + 2.0 / globalScale;
                ctx.roundRect(
                    node.x! + labelDimensions[0] / 2 + 2.0 / globalScale,
                    node.y! - labelDimensions[1] / 2,
                    labelDimensions[1],
                    labelDimensions[1],
                    radius
                );

                ctx.fillStyle = isSelected ? nodeColor : 'white';
                ctx.fill();
                ctx.strokeStyle = isSelected ? 'white' : nodeColor;
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
                ctx.strokeStyle = isSelected ? 'white' : nodeColor;
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
    }
}

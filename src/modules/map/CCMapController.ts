import * as d3 from 'd3';

import { blendGraphs } from './blend';
import { colorGraph } from './coloring';
import {
    findAdjacentSubtree,
    findAllShortestPaths,
    minimumSpanningTreeFromSubtree,
    updateLinkCounts,
} from './dijkstra';
import { buildGraph, buildNodesFromCcmData } from './build-graph';
import { buildDomainGraph } from './domain-sets';
import { VIEW_CONFIGURATIONS } from './data';
import type { ForceGraphMethods, ForceGraphProps } from 'react-force-graph-2d';
import type {
    CCMData,
    CCMGraphData,
    CCMGraphLink,
    CCMGraphNode,
    CCMPathEnds,
    CCMViewConfiguration,
    NodesCollection,
} from '@/types/ccmap';

import { linkWeights } from '@/modules/map/link-weights.ts';
import { emitter } from '@/hooks/useMitt';

export class CCMapController {
    private selectedNodeId: any | null = null;

    private ccmData: CCMData | null = null;
    private nodes: NodesCollection | null = null;
    private domainGraph: CCMGraphData | null = null;
    private graphRef: ForceGraphMethods<CCMGraphNode, CCMGraphLink> | null = null; // Reference to the ForceGraph2D component
    #graphData: CCMGraphData | null = null;
    #runtimeProps: ForceGraphProps<CCMGraphNode, CCMGraphLink> = {};

    public viewConfiguration = VIEW_CONFIGURATIONS[0];

    private skipPathNodes: Set<string> = new Set();
    private emitter = emitter;

    ogGraph: CCMGraphData | null = null

    pathEnds: CCMPathEnds = { start: null, end: null };
    private _shortestPaths: Array<Array<string>> = [];
    public set shortestPaths(shortestPaths: Array<Array<string>>) {
        if (shortestPaths != this._shortestPaths) {
            this._shortestPaths = shortestPaths;
            this.emitter.emit('shortest-paths:changed', shortestPaths);
        }
    }

    constructor() {
        this.emitter.on('path-ends:changed', (p: CCMPathEnds) => {
            if (p.start != null && p.end != null) {
                console.log('finding shortest path between: ', p.start, p.end);
                this.findShortestPath(p.start, p.end);
            }
        });
    }

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
            this.emitter.emit('view-configuration:changed', this.viewConfiguration);
        }
    }

    findShortestPath(source: string, target: string) {
        const filteredLinks: Array<CCMGraphLink> = [];
        this.graphData!.links.forEach((link) => {
            const source = (link.source as CCMGraphNode).id || (link.source as string);
            const target = (link.target as CCMGraphNode).id || (link.target as string);

            if (!this.skipPathNodes.has(source) && !this.skipPathNodes.has(target)) {
                filteredLinks.push(link);
            }
        });
        this.shortestPaths = findAllShortestPaths(filteredLinks, source, target).paths;
    }

    focusOnNode(node: string | CCMGraphNode): CCMGraphNode | null {
        if (typeof node === 'string') {
            node = this.#graphData?.nodes.find((n) => n.id === node) as CCMGraphNode;
        }

        if (!this.graphRef) return null;

        const graphData = this.#graphData;

        if (!graphData) return null;

        for (const graphNode of graphData.nodes) {
            delete graphNode.fx;
            delete graphNode.fy;
        }

        // Pin clicked node
        node.fx = node.x;
        node.fy = node.y;

        const subtree = (() => {
            if (node.type != 'domain') {
                return findAdjacentSubtree(this.ogGraph!.links, node.id);
            } else {
                return findAdjacentSubtree(this.domainGraph!.links, '___root');
            }
        })()
        if (subtree.length === 0) {
            throw Error('No subtree found for node ' + node.id);
        }

        const mst = minimumSpanningTreeFromSubtree(
            this.ogGraph!.nodes.concat(this.domainGraph!.nodes),
            this.ogGraph!.links.concat(this.domainGraph!.links),
            subtree, linkWeights);
        console.log("number of links in mst: ", mst.mstEdges.length)
        const nextGraph = this.localBuildGraph(mst.mstEdges);

        console.log("number of links in new graph: ", nextGraph.links.length)

        graphData.links = mst.mstEdges

        blendGraphs(graphData, nextGraph);

        // Update the graph data
        this.emitter.emit('graph-data:updated', graphData);
        this.emitter.emit('focus-node:changed', node.id);

        let s = 0.0;
        this.graphRef.d3ReheatSimulation();

        this.centerOnNode(node.id);
        const interval = setInterval(() => {
            if (!this.graphRef) return;

            const linkForce = d3
                .forceLink(graphData.links as any)
                .id((d: any) => d.id)
                .distance(100)
                .strength((link: any) => {
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
                clearInterval(interval);
            }
            this.graphRef.d3Force('link', linkForce);
        }, 100);
        return node;
    }

    initialize(ccmData: CCMData): void {
        console.log("initializing")
        this.ccmData = ccmData;

        this.nodes = buildNodesFromCcmData(this.ccmData);

        this.ogGraph = buildGraph(this.ccmData, this.nodes)
        updateLinkCounts(this.ogGraph)

        this.domainGraph = buildDomainGraph(this.ogGraph, this.viewConfiguration.domainSets) as CCMGraphData;
        this.nodes.domainNodes = this.domainGraph.nodes;
        this.nodes.allNodes = this.ogGraph.nodes.concat(this.domainGraph.nodes);
        colorGraph(this.ogGraph, VIEW_CONFIGURATIONS[0].colorSets);

        const subTree = findAdjacentSubtree(this.domainGraph.links, '___root');


        const mstNamed = minimumSpanningTreeFromSubtree(
            this.nodes.allNodes,
            this.ogGraph.links.concat(this.domainGraph.links),
            subTree,
            linkWeights);


        this.graphData = this.localBuildGraph(mstNamed.mstEdges)
        this.graphData.links = mstNamed.mstEdges;

        this.#runtimeProps = {};
    }

    get graphData(): CCMGraphData | null {
        return this.#graphData;
    }

    set graphData(graphData: CCMGraphData | null) {
        this.#graphData = graphData;
        this.emitter.emit('graph-data:updated', graphData);
    }

    setRuntimeProps<TKey extends keyof ForceGraphProps<CCMGraphNode, CCMGraphLink>>(
        key: TKey,
        value: ForceGraphProps<CCMGraphNode, CCMGraphLink>[TKey]
    ) {
        this.#runtimeProps[key] = value;
        this.emitter.emit('runtime-props:updated', this.#runtimeProps);
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
        if (this.domainGraph) {
            graph.links = graph.links.concat(this.domainGraph.links);
        }
        return graph;
    }

    getLinkVisibility(link: any) {
        return (link.strengthDelta || 0) >= 0.0;
    }

    getNodeClickHandler = (node: any, e: MouseEvent) => {
        if (!e.shiftKey) {
            if (node.id === this.selectedNodeId) {
                this.focusOnNode(node);
            }
            if (node.id != this.selectedNodeId) {
                this.selectedNodeId = node.id;
                this.emitter.emit('selected-node:changed', this.selectedNodeId);
            }
            if (this.pathEnds.start != node.id) {
                this.pathEnds.start = node.id;
                this.emitter.emit('path-ends:changed', this.pathEnds);
            }
        } else {
            if (this.pathEnds.end != node.id) {
                this.pathEnds.end = node.id;
                this.emitter.emit('path-ends:changed', this.pathEnds);
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
                minScale = 1.0;
                break;
        }

        // Draw node shape
        ctx.fillStyle = node.color || '#000000';

        // TODO: Implement glyphs per design
        switch (node.type) {
            case 'tag':
                ctx.beginPath();
                ctx.rect(node.x! - 4 / globalScale, node.y! - 4 / globalScale, 8 / globalScale, 8 / globalScale);
                ctx.fill();
                break;
            case 'technique':
                ctx.beginPath();
                ctx.arc(node.x, node.y, 4 / globalScale, 0, 2 * Math.PI, false);
                ctx.lineWidth = 2 / globalScale;
                ctx.strokeStyle = node.color || '#000000';
                ctx.stroke();
                break;
            case 'tool':
                ctx.beginPath();
                ctx.arc(node.x, node.y, 4 / globalScale, 0, 2 * Math.PI, false);
                ctx.fill();
                break;
        }

        node.__bckgDimensions = [4, 4];

        // Draw labels if zoomed in enough
        if (scale >= minScale) {
            const suffix = (() => {
                switch (node.type) {
                    case 'tag':
                        return ` [${node.count}]`;
                    default:
                        return '';
                }
            })();
            const label = node.name + suffix;

            const fontSizes = {
                domain: 14 / globalScale,
                tag: 12 / globalScale,
                tool: 12 / globalScale,
                technique: 9 / globalScale,
            };

            const fontSize = fontSizes[node.type] as number;
            ctx.font = `${fontSize}px Space Mono`;
            const textWidth = ctx.measureText(label).width;
            const hmargin = 10.0 / globalScale;

            const vmargins = {
                domain: 16 / globalScale,
                tag: 8 / globalScale,
                tool: 6 / globalScale,
                technique: 2 / globalScale,
            };
            const vmargin = vmargins[node.type] as number;

            const radii = {
                domain: 10 / globalScale,
                tag: 5 / globalScale,
                tool: 2.5 / globalScale,
                technique: 2.5 / globalScale,
            };
            const radius = radii[node.type] as number;

            const labelWidth = textWidth + 2 * hmargin + fontSize * 0.2;

            const bckgDimensions: [number, number] = [textWidth + 2 * hmargin, fontSize + vmargin].map(
                (n) => n + fontSize * 0.2
            ) as [number, number];

            const isSelected = node.id === this.selectedNodeId;

            const nodeColor = node.color || '#000000';

            // TODO: implement labels per design
            ctx.fillStyle = nodeColor;
            ctx.beginPath();
            ctx.roundRect(node.x! - bckgDimensions[0] / 2, node.y! - bckgDimensions[1] / 2, ...bckgDimensions, radius);

            ctx.fillStyle = isSelected ? nodeColor : 'white';
            ctx.fill();
            ctx.strokeStyle = isSelected ? 'white' : nodeColor;
            ctx.lineWidth = 0.5 / globalScale;
            ctx.stroke();

            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillStyle = isSelected ? 'white' : nodeColor;
            ctx.fillText(label, node.x, node.y);
            node.__bckgDimensions = bckgDimensions;

            // TODO: add focus widget right from the label

            if (node.id === this.selectedNodeId) {
                ctx.beginPath();
                ctx.roundRect(
                    node.x! + bckgDimensions[0] / 2 + 2.0 / globalScale,
                    node.y! - bckgDimensions[1] / 2,
                    bckgDimensions[1],
                    bckgDimensions[1],
                    radius
                );

                ctx.fillStyle = isSelected ? nodeColor : 'white';
                ctx.fill();
                ctx.strokeStyle = isSelected ? 'white' : nodeColor;
                ctx.lineWidth = 0.5 / globalScale;
                ctx.stroke();

                ctx.beginPath();
                ctx.arc(
                    node.x + bckgDimensions[0] / 2 + 2.0 / globalScale + bckgDimensions[1] / 2.0,
                    node.y,
                    4 / globalScale,
                    0,
                    2 * Math.PI,
                    false
                );

                const cx = node.x + bckgDimensions[0] / 2 + 2.0 / globalScale + bckgDimensions[1] / 2.0;
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

    isInitialized(): boolean {
        return this.ccmData !== null && this.nodes !== null;
    }

    destroy(): void {
        // Cleanup if needed
        this.graphRef = null;
    }
}

import * as d3 from 'd3';

import { blendGraphs } from './blend';
import { colorGraph } from './coloring';
import { findAdjacentSubtree, minimumSpanningTreeFromSubtree } from './dijkstra';
import { buildGraph, buildNodesFromCcmData } from './build-graph';
import { buildDomainGraph } from './domain-sets';
import { COLOR_SETS, DOMAIN_SETS } from './data';
import type { TypedEventEmitter } from '@/lib/EventEmitter';
import type { ForceGraphMethods, ForceGraphProps } from 'react-force-graph-2d';
import type { CCMData, CCMGraphData, CCMGraphLink, CCMGraphNode, NodesCollection } from '@/types/ccmap';
import { EventEmitter } from '@/lib/EventEmitter';
import { linkWeights } from '@/modules/map/link-weights.ts';

interface CCMapControllerEvents {
    'graph-data:updated': (graphData: CCMGraphData | null) => void;
    'runtime-props:updated': (runtimeProps: ForceGraphProps<CCMGraphNode, CCMGraphLink>) => void;
}

export class CCMapController extends (EventEmitter as new () => TypedEventEmitter<CCMapControllerEvents>) {
    private ccmData: CCMData | null = null;
    private nodes: NodesCollection | null = null;
    private domainGraph: CCMGraphData | null = null;
    private graphRef: ForceGraphMethods<CCMGraphNode, CCMGraphLink> | null = null; // Reference to the ForceGraph2D component
    #graphData: CCMGraphData | null = null;
    #runtimeProps: ForceGraphProps<CCMGraphNode, CCMGraphLink> = {};

    constructor() {
        super();
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
        return node
    }

    nodeForId: (nodeId: string) => CCMGraphNode | undefined = (nodeId) => {
        return this.#graphData?.nodes.find((n) => n.id === nodeId);
    };

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

        const subtree = findAdjacentSubtree(graphData.links, node.id);

        const mst = minimumSpanningTreeFromSubtree(graphData.links, subtree, linkWeights);
        const nextGraph = this.localBuildGraph(mst.mstEdges);
        blendGraphs(graphData, nextGraph);

        // Update the graph data
        this.emit('graph-data:updated', graphData);

        let s = 0.0;
        this.graphRef.d3ReheatSimulation();

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
        return node
    }

    initialize(ccmData: CCMData): void {
        this.ccmData = ccmData;

        this.nodes = buildNodesFromCcmData(this.ccmData);

        const ogGraph = buildGraph(this.ccmData, this.nodes);

        this.domainGraph = buildDomainGraph(ogGraph, DOMAIN_SETS) as CCMGraphData;
        this.nodes.domainNodes = this.domainGraph.nodes;
        this.nodes.allNodes = this.domainGraph.nodes.concat(ogGraph.nodes);
        colorGraph(ogGraph, COLOR_SETS);

        this.graphData = this.localBuildGraph();
        this.#runtimeProps = {};
    }

    get graphData(): CCMGraphData | null {
        return this.#graphData;
    }

    set graphData(graphData: CCMGraphData | null) {
        this.#graphData = graphData;
        this.emit('graph-data:updated', graphData);
    }

    setRuntimeProps<TKey extends keyof ForceGraphProps<CCMGraphNode, CCMGraphLink>>(
        key: TKey,
        value: ForceGraphProps<CCMGraphNode, CCMGraphLink>[TKey]
    ) {
        this.#runtimeProps[key] = value;
        this.emit('runtime-props:updated', this.#runtimeProps);
    }

    setGraphRef(graph: ForceGraphMethods<CCMGraphNode, CCMGraphLink>) {
        this.graphRef = graph;
    }

    private localBuildGraph(mstEdges?: Array<any>): CCMGraphData {
        if (!this.ccmData || !this.nodes) {
            throw new Error('Controller not initialized');
        }

        const graph = buildGraph(this.ccmData, this.nodes, mstEdges);
        if (this.domainGraph) {
            graph.links = graph.links.concat(this.domainGraph.links);
        }
        return graph;
    }

    getLinkVisibility(link: any) {
        return (link.strengthDelta || 0) >= 0.0;
    }

    getNodeClickHandler = (node: any, _?: MouseEvent) => {
        this.focusOnNode(node);
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
            const label = node.name;

            const fontSizes = {
                'domain': 14 / globalScale,
                'tag' : 12 / globalScale,
                'tool': 12 / globalScale,
                'technique': 9 / globalScale,
            }

            const fontSize = fontSizes[node.type] as number;
            ctx.font = `${fontSize}px Space Mono`;
            const textWidth = ctx.measureText(label).width;
            const hmargin = 10.0 / globalScale;

            const vmargins = {
                'domain': 16 / globalScale,
                'tag' : 8 / globalScale,
                'tool': 6 / globalScale,
                'technique': 2 / globalScale,
            }
            const vmargin = vmargins[node.type] as number;

            const radii = {
                'domain': 10 / globalScale,
                'tag' : 5 / globalScale,
                'tool': 2.5 / globalScale,
                'technique': 2.5 / globalScale,
            }
            const radius = radii[node.type] as number;
            const bckgDimensions: [number, number] = [textWidth + 2*hmargin, fontSize + vmargin].map((n) => n + fontSize * 0.2) as [
                number,
                number,
            ];

            // TODO: implement labels per design
            ctx.fillStyle = 'orange';
            ctx.beginPath();
            ctx.roundRect(
                node.x! - bckgDimensions[0] / 2,
                node.y! - bckgDimensions[1] / 2,
                ...bckgDimensions, radius)

            ctx.fillStyle = 'white'
            ctx.fill()
            ctx.strokeStyle = 'red'
            ctx.lineWidth = 0.5 / globalScale
            ctx.stroke();

            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillStyle = 'red'; //node.color || '#000000';
            ctx.fillText(label, node.x, node.y!);
            node.__bckgDimensions = bckgDimensions;

            // TODO: add focus widget right from the label
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

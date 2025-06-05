import * as d3 from 'd3';

import { blendGraphs } from './blend';
import { colorGraph } from './coloring';
import { findAdjacentSubtree, minimumSpanningTreeFromSubtree } from './dijkstra';
import { fetchCcmData } from './ccm-data';
import { buildGraph, buildNodesFromCcmData } from './build-graph';
import { buildDomainGraph } from './domain-sets';
import { COLOR_SETS, DOMAIN_SETS } from './data';
import type { TypedEventEmitter } from '@/lib/EventEmitter';
import type { ForceGraphMethods, ForceGraphProps } from 'react-force-graph-2d';
import type { CCMData, CCMGraphData, CCMGraphLink, CCMGraphNode, NodesCollection } from '@/types/ccmap';
import { EventEmitter } from '@/lib/EventEmitter';

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

    async initialize(): Promise<void> {
        this.ccmData = await fetchCcmData();

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

    localBuildGraph(mstEdges?: Array<any>): CCMGraphData {
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
        if (!this.graphRef) return;

        const graphData = this.#graphData;

        if (!graphData) return;

        for (const graphNode of graphData.nodes) {
            delete graphNode.fx;
            delete graphNode.fy;
        }

        // Pin clicked node
        node.fx = node.x;
        node.fy = node.y;

        const subtree = findAdjacentSubtree(graphData.links, node.id);

        const weight = (link: any, _2: any, _3: any): number => {
            const t = `${link.source.type}-${link.target.type}`;

            switch (t) {
                case 'root-domain':
                    return 1;
                case 'domain-domain':
                case 'tag-tag':
                    return 0;
                case 'domain-tool':
                case 'tool-domain':
                case 'domain-technique':
                case 'technique-domain':
                    return 8;
                case 'domain-tag':
                case 'tag-domain':
                    return 4;
                case 'tag-tool':
                case 'tool-tag':
                case 'tag-technique':
                case 'technique-tag':
                    return 5;
                case 'tool-tool':
                case 'technique-tool':
                case 'tool-technique':
                    return 10;
                default:
                    console.warn(`Unknown link type ${t}`);
                    return 10;
            }
        };

        const mst = minimumSpanningTreeFromSubtree(graphData.links, subtree, weight);
        const nextGraph = this.localBuildGraph(mst.mstEdges);
        blendGraphs(graphData, nextGraph);

        // Update the graph data
        this.emit('graph-data:updated', graphData);

        let s = 0.0;
        this.graphRef.d3ReheatSimulation();

        this.setRuntimeProps('d3AlphaDecay', 0.0001);

        const interval = setInterval(() => {
            if (!this.graphRef) return;
            // TODO: does it need to be set here? It never gets changed anywhere else
            //this.graphRef.d3AlphaDecay(0.0001);

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
            const fontSize = 16 / globalScale;
            ctx.font = `${fontSize}px Space Mono`;
            const textWidth = ctx.measureText(label).width;
            const bckgDimensions: [number, number] = [textWidth, fontSize + 16 / globalScale].map((n) => n + fontSize * 0.2) as [
                number,
                number,
            ];

            ctx.fillStyle = 'bisque';
            ctx.fillRect(node.x! - bckgDimensions[0] / 2, 16 / globalScale + node.y! - bckgDimensions[1] / 2, ...bckgDimensions);

            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillStyle = node.color || '#000000';
            ctx.fillText(label, node.x, 16 / globalScale + node.y!);
            node.__bckgDimensions = bckgDimensions;
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

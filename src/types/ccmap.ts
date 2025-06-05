import type { LinkObject, NodeObject } from 'react-force-graph-2d';

export enum CCMNodeType {
    Tool = 'tool',
    Technique = 'technique',
    Tag = 'tag',
    Domain = 'domain',
}

export interface CCMNode {
    key: string;
    name?: string;
    tags?: string[];
    dependsOn?: string[];
    references?: string[];
    supports?: string[];
    actions?: {
        [actionKey: string]: {
            techniques?: string[];
        };
    };
}

export interface CCMData {
    tools: Array<[string, CCMNode]>;
    techniques: Array<[string, CCMNode]>;
    tags: string[];
}

export type CCMGraphNode = NodeObject<{
    name: string;
    type: CCMNodeType;
    color?: string;
    ccmData?: [string, CCMNode];
    __bckgDimensions?: [number, number];
}>;

export type CCMGraphLink = LinkObject<CCMGraphNode> & {
    type: string;
    curvature?: number;
    strengthDelta?: number;
    strength?: number;
};

export interface CCMGraphData {
    nodes: CCMGraphNode[];
    links: CCMGraphLink[];
}

export interface CCMDomainSet {
    name: string;
    tags?: string[];
    nodes: Array<{
        id: string;
        degree: number;
    }>;
}

export interface ColorSet {
    name: string;
    tags?: string[];
    nodes?: Array<{
        id: string;
        degree: number;
    }>;
    color: string;
}

export interface NodesCollection {
    toolNodes: CCMGraphNode[];
    techniqueNodes: CCMGraphNode[];
    tagNodes: CCMGraphNode[];
    allNodes: CCMGraphNode[];
    domainNodes?: CCMGraphNode[];
}

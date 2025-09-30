import type { LinkObject, NodeObject } from 'react-force-graph-2d';

export enum CCMNodeType {
    Tool = 'tool',
    Technique = 'technique',
    Tag = 'tag',
    Domain = 'domain',
    Breakdown = 'breakdown',
}

export type CCMDomainModes = 'domain' | 'frameworks' | 'use-cases';

export interface CCMNode {
    id: string;
    type: CCMNodeType;
    description?: string;
    color?: string;
    name?: string;
    tags?: string[];
    partOf?: string[];
    dependsOn?: string[];
    references?: string[];
    supports?: string[];
    isA?: string[];
    input?: string[];
    output?: string[];
    techniques?: string[];
}

export interface CCMTag {
    id?: string;
    description?: string;
}

export interface CCMData {
    tools: Array<[string, CCMNode]>;
    techniques: Array<[string, CCMNode]>;
    tags: string[];
}

export type CCMGraphNode = NodeObject<{
    id: string;
    name: string;
    type: CCMNodeType;
    color?: string;
    ccmData?: [string, CCMNode];
    __bckgDimensions?: [number, number];
    count?: number;
}>;

export type CCMGraphLink = LinkObject<CCMGraphNode> & {
    type: string;
    curvature?: number;
    strengthDelta?: number;
    strength?: number;
    domainDegree?: number;
};

export interface CCMGraphData {
    nodes: CCMGraphNode[];
    links: CCMGraphLink[];
}

export interface CCMDomainSet {
    name: string;
    color: string;
    tags?: string[];
    nodes: {
        id: string;
        degree: number;
    }[];
}

export interface ColorSet {
    name: string;
    tags?: string[];
    nodes?: {
        id: string;
        degree: number;
    }[];
    color: string;
}

export interface CCMViewConfiguration {
    name: string;
    id: string;
    domainSets: CCMDomainSet[];
}

export interface NodesCollection {
    toolNodes: CCMGraphNode[];
    techniqueNodes: CCMGraphNode[];
    tagNodes: CCMGraphNode[];
    allNodes: CCMGraphNode[];
    domainNodes?: CCMGraphNode[];
}

export interface CCMPathEnds {
    start: string | null;
    end: string | null;
}

export interface CCMBreakdown {
    id: string;
    title: string;
    tags: string[];
    useCases: string[];
    addedBy: string;
    language: string;
    createdAt: string;
    updatedAt: string;
    country: string;
    media: {
        type: string;
        url: string;
        caption: string;
    }[];
    description: string;
}

export type CCMFilter = {
    id: string;
    type: 'node' | 'shape';
};

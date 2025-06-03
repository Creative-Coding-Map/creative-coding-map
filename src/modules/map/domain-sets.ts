import { findAllDegreesOfSeparation } from './dijkstra';
import { calculateNodeScore } from './set-score';
import type { CCMDomainSet, CCMGraphData } from '@/types/ccmap';

export function buildDomainGraph(graph: CCMGraphData, domainSets: CCMDomainSet[]) {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    const allSetNodeIds = new Set(domainSets.flatMap((set) => set.nodes || []).map((node) => node.id));
    const degreesOfSeparation: any = {};

    for (const nodeId of allSetNodeIds) {
        degreesOfSeparation[nodeId] = findAllDegreesOfSeparation(graph.links, nodeId);
    }

    const rootNode = { id: '___root', name: 'root', type: 'root', color: '#ffffff' };

    const domainNodes = domainSets.map((set) => {
        return {
            id: `domain:${set.name}`,
            name: `${set.name}`,
            type: 'domain',
            color: '#ffffff',
        };
    });

    const domainLinks: any[] = [];
    for (const node of graph.nodes) {
        const scores = domainSets.map((set) => calculateNodeScore(node, set, degreesOfSeparation));

        scores.forEach((scr, idx) => {
            if (scr > 0) {
                domainLinks.push({
                    source: node.id,
                    target: domainNodes[idx].id,
                    strengthDelta: 1.0,
                    type: 'domain',
                });
            }
        });
    }

    const rootLinks = domainSets.map((set) => {
        return {
            source: rootNode.id,
            target: `domain:${set.name}`,
            strengthDelta: 1.0,
        };
    });
    console.log(domainLinks);

    return {
        nodes: domainNodes.concat([rootNode]),
        links: domainLinks.concat(rootLinks),
    };
}

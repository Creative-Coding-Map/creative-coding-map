import { findAllDegreesOfSeparation } from './dijkstra';
import { calculateNodeScore } from './set-score';
import type { CCMDomainSet, CCMGraphData, ColorSet } from '@/types/ccmap';

function argmax(array: Array<number>) {
    return array.reduce((iMax, x, i, arr) => (x > arr[iMax] ? i : iMax), 0);
}

export function colorGraph(graph: CCMGraphData, colorSets: CCMDomainSet[]) {
    const allSetNodeIds = new Set(colorSets.flatMap((set) => set.nodes || []).map((node) => node.id));

    // TODO: add proper typings
    const degreesOfSeparation: any = {};

    for (const nodeId of allSetNodeIds) {
        degreesOfSeparation[nodeId] = findAllDegreesOfSeparation(graph.links, nodeId);
    }

    for (const node of graph.nodes) {
        const scores = colorSets.map((set) => calculateNodeScore(node, set, degreesOfSeparation));
        const bestIdx = argmax(scores);
        if (scores[bestIdx] > 0) {
            const bestSet = colorSets[bestIdx];
            node.color = bestSet.color;
            node.unfilteredColor = node.color;
            node.domain = bestSet.name;
        } else {
            node.color = '#7f7f7f';
            node.unfilteredColor = node.color;
            node.domain = 'none';
        }
    }
}

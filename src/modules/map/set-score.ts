import type { CCMDomainSet, CCMGraphNode, ColorSet } from '@/types/ccmap';
import intersect from 'just-intersect';

/**
 * Calculates a score for a given node based on its tags, degrees of separation, and interaction with a color set.
 *
 * @param {Object} node - The node to be scored. Should contain `ccmData` with tags information.
 * @param {Object} set - Contains tags and nodes used for scoring along with degrees of separation constraints.
 * @param {Object} graph - The graph structure representing node relationships (unused in this function).
 * @param {Object} degreesOfSeparation - A map representing the degrees of separation between nodes.
 *
 * @return {number} The calculated score of the node as an aggregated value of tag similarity and node relationships.
 */
export function calculateNodeScore(node: CCMGraphNode, set: CCMDomainSet | ColorSet, degreesOfSeparation: any) {
    if (!node.ccmData) {
        node.ccmData = [node.id, { tags: [node.id], id: node.id, type: node.type }];
    }

    const nodeTagSet = new Set(node.ccmData?.[1]?.tags || []);
    const colorSetTagSet = new Set(set.tags);
    const tagScore = intersect(Array.from(nodeTagSet), Array.from(colorSetTagSet)).length / Math.max(1, colorSetTagSet.size);

    const nodeScore = (set.nodes || [])
        .map((setNode) => {
            const degree = degreesOfSeparation[setNode.id][node.id];
            if (setNode.degree >= 0 && degree >= 0 && degree <= setNode.degree) {
                return 1;
            } else if (setNode.degree < 0 && degree >= 0 && degree <= Math.abs(setNode.degree)) {
                // penalize
                return -1;
            } else {
                return 0;
            }
        })
        .reduce((a, b) => a + b, 0 as number);

    return tagScore + nodeScore * 2;
}

export function calculateNodeDegree(node: CCMGraphNode, set: CCMDomainSet, degreesOfSeparation: any) {
    if (!node.ccmData) {
        node.ccmData = [node.id, { tags: [node.id], id: node.id, type: node.type }];
    }

    const degrees = (set.nodes || []).map((setNode) => {
        const degree = degreesOfSeparation[setNode.id][node.id];
        return degree >= 0 ? degree : 1e32;
    });

    return Math.min(...degrees);
}

import type { CCMGraphData } from '@/types/ccmap';

function nodeId(node) {
    return node.id || node;
}

/**
 * Blend two graphs
 * @param currentGraph The active graph (from the graph view)
 * @param nextGraph The new graph, which is a subset of currentGraph
 */
export function blendGraphs(viewGraph: CCMGraphData, nextGraph: CCMGraphData): void {
    const linkCountMap = new Map();

    // would be nice to have asymmetric hashing such that hash(a,b) == hash(b,a)

    for (const link of nextGraph.links) {
        const sourceId = nodeId(link.source);
        const targetId = nodeId(link.target);

        linkCountMap.set(sourceId, (linkCountMap.get(sourceId) || 0) + 1);
        linkCountMap.set(targetId, (linkCountMap.get(targetId) || 0) + 1);
    }

    const viewLinks = new Set(
        viewGraph.links.flatMap((it) => [
            `${nodeId(it.source)}-${nodeId(it.target)}`,
            `${nodeId(it.target)}-${nodeId(it.source)}`,
        ])
    );
    const nextLinks = new Set(
        nextGraph.links.flatMap((it) => [
            `${nodeId(it.source)}-${nodeId(it.target)}`,
            `${nodeId(it.target)}-${nodeId(it.source)}`,
        ])
    );

    const newLinks = nextLinks.difference(viewLinks);
    const removeLinks = viewLinks.difference(nextLinks);

    for (const link of viewGraph.links) {
        const sourceId = nodeId(link.source);
        const targetId = nodeId(link.target);

        if (removeLinks.has(`${nodeId(link.source)}-${nodeId(link.target)}`)) {
            link.strength = 0.0;
            link.strengthDelta = -0.01;
        } else if (newLinks.has(`${nodeId(link.source)}-${nodeId(link.target)}`)) {
            const count = Math.min(linkCountMap.get(sourceId), linkCountMap.get(targetId));
            link.strength = 1.0 / count;
            link.strengthDelta = 0.01;
        } else {
            const count = Math.min(linkCountMap.get(sourceId), linkCountMap.get(targetId));
            link.strength = 1.0 / count;
            link.strengthDelta = 0.0;
        }
    }
}

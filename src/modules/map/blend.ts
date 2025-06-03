import type { CCMGraphData } from '@/types/ccmap';

/**
 * Blend two graphs
 * @param currentGraph The active graph (from the graph view)
 * @param nextGraph The new graph, which is a subset of currentGraph
 */
export function blendGraphs(currentGraph: CCMGraphData, nextGraph: CCMGraphData): void {
    // Mark existing links as fading out
    currentGraph.links.forEach(link => {
        if (!nextGraph.links.find(nextLink =>
            nextLink.source === link.source && nextLink.target === link.target)) {
            link.strengthDelta = -1.0;
        }
    });

    // Add new links from nextGraph
    nextGraph.links.forEach(nextLink => {
        const existingLink = currentGraph.links.find(link =>
            link.source === nextLink.source && link.target === nextLink.target);

        if (!existingLink) {
            // Add new link
            currentGraph.links.push({
                ...nextLink,
                strengthDelta: 1.0
            });
        } else {
            // Update existing link
            existingLink.strengthDelta = 1.0;
        }
    });

    // Update nodes if needed
    nextGraph.nodes.forEach(nextNode => {
        const existingNode = currentGraph.nodes.find(node => node.id === nextNode.id);
        if (!existingNode) {
            currentGraph.nodes.push(nextNode);
        }
    });
}

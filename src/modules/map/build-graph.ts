import type { CCMData, CCMGraphData, CCMGraphLink, CCMGraphNode, NodesCollection } from '@/types/ccmap';
import { CCMNodeType } from '@/types/ccmap';

/**
 * Builds node objects from the provided CCM data object by transforming tools, techniques, and tags into separate node collections.
 *
 * @param {Object} ccmData - The CCM data object containing arrays of tools, techniques, and tags.
 * @param {Array} ccmData.tools - An array of tools, where each tool is represented as an array with its identifier as the first element.
 * @param {Array} ccmData.techniques - An array of techniques, where each technique is an array with its identifier as the first element and an object containing additional details as the second element.
 * @param {Array} ccmData.tags - An array of tags, where each tag is represented as a string.
 * @return {Object} An object containing tool, technique, and tag nodes, along with a combined list of all nodes:
 *                  - toolNodes: An array of tool node objects.
 *                  - techniqueNodes: An array of technique node objects.
 *                  - tagNodes: An array of tag node objects.
 *                  - allNodes: A combined array containing all nodes.
 */
export function buildNodesFromCcmData(ccmData: CCMData): NodesCollection {
    const toolNodes: Array<CCMGraphNode> = ccmData.tools.map((it) => {
        return { id: it[0], name: it[0], type: CCMNodeType.Tool, ccmData: it };
    });

    const techniqueNodes: Array<CCMGraphNode> = ccmData.techniques.map((it) => {
        return { id: it[0], name: it[1].name || '', type: CCMNodeType.Technique, ccmData: it };
    });

    const tagNodes: Array<CCMGraphNode> = ccmData.tags.map((it) => {
        return { id: it, name: it, type: CCMNodeType.Tag };
    });

    return {
        toolNodes,
        techniqueNodes,
        tagNodes,
        allNodes: toolNodes.concat(techniqueNodes).concat(tagNodes),
    };
}

export function buildGraph(ccmData: CCMData, nodes: NodesCollection, mst?: Array<any>): CCMGraphData {
    const { toolNodes, techniqueNodes, tagNodes, allNodes } = nodes;

    // TODO: remove this once we have a proper config
    /* eslint-disable @typescript-eslint/no-unnecessary-condition */
    const enableToolTagLinks = true;
    const enableTechniqueTagLinks = true;
    const enableDependencyLinks = true;
    const enableSupportLinks = true;
    const enableTechniqueLinks = true;

    const links: Array<CCMGraphLink> = [];
    const nodesById: { [id: string]: CCMGraphNode } = {};

    ccmData.tools.forEach((n) => {
        const tooln = toolNodes.find((it) => it.name === n[0]);
        if (tooln) {
            nodesById[n[0]] = tooln;

            if (enableToolTagLinks && !mst) {
                (n[1].tags || []).forEach((t) => {
                    const tn = tagNodes.find((it) => it.name === t);
                    if (tn) {
                        nodesById[t] = tn;
                        const link: CCMGraphLink = {
                            source: tn.id,
                            target: tooln.id,
                            type: 'tag',
                            curvature: 0.0,
                        };
                        links.push(link);
                    }
                });
            }

            if (enableDependencyLinks && !mst) {
                (n[1].dependsOn || []).forEach((t) => {
                    const dependn = toolNodes.find((it) => it.name === t);
                    if (dependn) {
                        const link: CCMGraphLink = {
                            source: dependn.id,
                            target: tooln.id,
                            type: 'dependency',
                            curvature: 0.0,
                        };
                        links.push(link);
                    }
                });
            }

            if (enableSupportLinks && !mst) {
                (n[1].supports || []).forEach((t) => {
                    const supportn = toolNodes.find((it) => it.name === t);
                    if (supportn) {
                        const link: CCMGraphLink = {
                            source: supportn.id,
                            target: tooln.id,
                            type: 'support',
                            curvature: 0.0,
                        };
                        links.push(link);
                    }
                });
            }

            if (enableTechniqueLinks && !mst) {
                Object.entries(n[1].actions || {}).forEach((a) => {
                    (a[1].techniques || []).forEach((t) => {
                        const link: CCMGraphLink = {
                            source: tooln.id,
                            target: t,
                            type: 'tool-technique',
                        };
                        links.push(link);
                    });
                });
            }
        }
    });

    if (mst) {
        for (const link of mst) {
            links.push(link);
        }
    }

    ccmData.techniques.forEach((n) => {
        const techniquen = techniqueNodes.find((it) => it.id === n[0]);
        if (techniquen) {
            nodesById[n[0]] = techniquen;

            if (enableTechniqueTagLinks && !mst) {
                (n[1].tags || []).forEach((t) => {
                    const tagn = tagNodes.find((it) => it.name === t);
                    if (tagn) {
                        const link: CCMGraphLink = {
                            source: tagn.id,
                            target: techniquen.id,
                            type: 'tag',
                            curvature: 0.0,
                        };
                        links.push(link);
                    }
                });
            }
        }
    });

    for (const link of links) {
        link.strengthDelta = 1.0;
    }

    return { nodes: allNodes, links };
}

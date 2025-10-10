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
        return { id: it[0], name: it[1].name || it[0], type: CCMNodeType.Tool, ccmData: it };
    });

    const techniqueNodes: Array<CCMGraphNode> = ccmData.techniques.map((it) => {
        return { id: it[0], name: it[1].name || it[0], type: CCMNodeType.Technique, ccmData: it };
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

    if (!mst) {
        for (const node of allNodes) {
            node.incoming = 0
            node.outgoing = 0
        }
    }

    const links: Array<CCMGraphLink> = [];
    const nodesById: { [id: string]: CCMGraphNode } = {};

    ccmData.tools.forEach((n) => {
        const tooln = toolNodes.find((it) => it.id === n[0]);
        if (tooln) {
            nodesById[n[0]] = tooln;

            if (enableToolTagLinks && !mst) {
                (n[1].tags || []).forEach((t) => {
                    const tagn = tagNodes.find((it) => it.id === t);
                    if (tagn) {
                        tagn.incoming+=1
                        tooln.outgoing+=1
                        nodesById[t] = tagn;
                        const link: CCMGraphLink = {
                            source: tooln.id,
                            target: tagn.id,
                            type: 'tag',
                            curvature: 0.0,
                        };
                        links.push(link);
                    } else {
                        console.log("Can't find tag:",n[1], t )
                    }
                });
            }

            if (enableDependencyLinks && !mst) {
                (n[1].dependsOn || []).forEach((t) => {
                    const dependn = toolNodes.find((it) => it.id === t);
                    if (dependn) {
                        tooln.outgoing+=1
                        dependn.incoming+=1
                        const link: CCMGraphLink = {
                            source: tooln.id,
                            target: dependn.id,
                            type: 'dependency',
                        };
                        links.push(link);
                    }
                });
            }

            if (!mst) {
                (n[1].partOf || []).forEach((t) => {
                    const partn = toolNodes.find((it) => it.id === t);
                    if (partn) {
                        tooln.outgoing+=1
                        partn.incoming+=1
                        const link: CCMGraphLink = {
                            source: tooln.id,
                            target: partn.id,
                            type: 'part-of',
                        };
                        links.push(link);
                    }
                });
            }

            if (enableSupportLinks && !mst) {
                (n[1].supports || []).forEach((t) => {
                    const supportn = toolNodes.find((it) => it.id === t);
                    if (supportn) {
                        supportn.incoming+=1
                        tooln.outgoing+=1
                        const link: CCMGraphLink = {
                            source: tooln.id,
                            target: supportn.id,
                            type: 'support',
                        };
                        links.push(link);
                    } else {
                        console.log("Can't find support tool:",n[1], t )
                    }
                });
            }

            if (enableTechniqueLinks && !mst) {
                const techniques = n[1].techniques || [];
                for (const technique of techniques) {
                    const techniquen = techniqueNodes.find((it) => it.id === technique);
                    if (techniquen) {
                        tooln.outgoing+=1
                        techniquen.incoming+=1
                        const link: CCMGraphLink = {
                            source: tooln.id,
                            target: technique,
                            type: 'tool-technique',
                        };
                        links.push(link);
                    } else {
                        console.log("Can't find technique:",n[1], technique )
                    }
                }
            }
            if (!mst) {
                const inputs = n[1].input || [];
                for (const input of inputs) {
                    const link: CCMGraphLink = {
                        source: tooln.id,
                        target: input,
                        type: 'input',
                    };
                    links.push(link);
                }
            }
            if (!mst) {
                const outputs = n[1].output || [];
                for (const output of outputs) {
                    const link: CCMGraphLink = {
                        source: tooln.id,
                        target: output,
                        type: 'output',
                    };
                    links.push(link);
                }
            }
            if (!mst) {
                const isA = n[1].isA || [];
                for (const tool of isA) {
                    const link: CCMGraphLink = {
                        source: tooln.id,
                        target: tool,
                        type: 'is-a',
                    };
                    links.push(link);
                }
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
                        techniquen.outgoing+=1
                        tagn.incoming+=1
                        const link: CCMGraphLink = {
                            source: techniquen.id,
                            target: tagn.id,
                            type: 'tag',
                            curvature: 0.0,
                        };
                        links.push(link);
                    }
                });
            }

            if (!mst) {
                (n[1].isA || []).forEach((t) => {
                        const link: CCMGraphLink = {
                            source: techniquen.id,
                            target: t,
                            type: 'is-a',
                            curvature: 0.0,
                        };
                        links.push(link);

                });
            }
        }
    });

    for (const link of links) {
        link.strengthDelta = 1.0;
    }

    return { nodes: allNodes, links };
}

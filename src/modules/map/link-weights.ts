import type { CCMGraphLink, CCMGraphNode } from '@/types/ccmap.ts';

export function linkWeights(link: CCMGraphLink, source: CCMGraphNode, target: CCMGraphNode): number {
    const t = `${source.type}-${target.type}`;
    if (source.count === undefined) {
        throw new Error(`source node ${source.id} has no count`);
    }
    if (target.count === undefined) {
        throw new Error(`target node ${target.id} has no count`);
    }

    const tagCountPenalty = Math.log(1 + (source.type === 'tag' ? source.count : 0) + (target.type === 'tag' ? target.count : 0));

    // if (link.type === 'domain') {
    //     if (link.domainDegree === 0) {
    //         return 1;
    //     } else if (link.domainDegree === 1) {
    //         return 2;
    //     }
    // }

    switch (t) {
        case 'root-domain':
            return 1;
        case 'domain-domain':
        case 'tag-tag':
            return 2;

        case 'domain-tool':
        case 'tool-domain':
            if (target.id.endsWith(source.name)) {
                return 1
            }
        case 'domain-technique':
        case 'technique-domain':
            return 20;

        case 'domain-tag':
        case 'tag-domain':
            return 1;
        case 'tag-tool':
        case 'tool-tag':
        case 'tag-technique':
        case 'technique-tag':
            return 5 + Math.min(5, tagCountPenalty);
        case 'tool-tool':
            if (link.type === 'part-of') {
                return 1;
            }
            if (link.type == 'dependency') {
                return 100;
            }

        case 'technique-tool':
        case 'tool-technique':
            return 7;
        default:
            console.log(link);
            throw new Error(`unknown link type ${t} ${link.source} ${link.target}`);
    }
}

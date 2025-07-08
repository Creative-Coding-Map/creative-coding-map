import type { CCMGraphLink, CCMGraphNode } from '@/types/ccmap.ts';

export function linkWeights(link: CCMGraphLink, source: CCMGraphNode, target: CCMGraphNode): number {
    const t = `${source.type}-${target.type}`;
    switch (t) {
        case 'root-domain':
            return 1;
        case 'domain-domain':
        case 'tag-tag':
            return 2;
        case 'domain-tool':
        case 'tool-domain':
        case 'domain-technique':
        case 'technique-domain':
            return 8;
        case 'domain-tag':
        case 'tag-domain':
            return 1;
        case 'tag-tool':
        case 'tool-tag':
        case 'tag-technique':
        case 'technique-tag':
            return 5;
        case 'tool-tool':
        case 'technique-tool':
        case 'tool-technique':
            return 10;
        default:
            console.log(link);
            throw new Error(`unknown link type ${t} ${link.source} ${link.target}`);
    }
}

export function linkWeights(link: any): number {
    const t = `${link.source.type}-${link.target.type}`;

    switch (t) {
        case 'root-domain':
            return 1;
        case 'domain-domain':
        case 'tag-tag':
            return 0;
        case 'domain-tool':
        case 'tool-domain':
        case 'domain-technique':
        case 'technique-domain':
            return 8;
        case 'domain-tag':
        case 'tag-domain':
            return 4;
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
            console.warn(`Unknown link type ${t}`);
            return 10;
    }
}
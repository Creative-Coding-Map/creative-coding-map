import { Link } from 'wouter';
import type { CCMNode } from '@/types/ccmap';
import { NODE_DATA_KEYS } from '@/state/constants';
import { Link as ExternalLink } from '@/components/Link';

interface NodeDataProps {
    node: CCMNode;
    prop: 'tags' | 'dependsOn' | 'references' | 'supports';
}

export function NodeData({ node, prop }: NodeDataProps) {
    if (!node[prop]) return null;

    return (
        <div className="grid grid-cols-4 auto-rows-max gap-x-2">
            <p className="col-span-1 type-metadata line-clamp-1">{NODE_DATA_KEYS[prop]}</p>
            <ul className="col-span-3 type-link flex flex-wrap gap-y-0.5 gap-x-2">
                {node[prop].map((value) =>
                    value.includes('http') ? (
                        <ExternalLink
                            url={value}
                            label={new URL(value).hostname}
                            key={value}
                            as="li"
                            className="clear-right wrap-anywhere"
                        />
                    ) : (
                        <li key={value} className="ellipsis pointer-events-auto">
                            <Link href={`/?focusNode=${value}`}>{value}</Link>
                        </li>
                    )
                )}
            </ul>
        </div>
    );
}

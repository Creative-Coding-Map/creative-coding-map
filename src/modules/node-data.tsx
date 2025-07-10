import type { CCMNode } from '@/types/ccmap';
import { NODE_DATA_KEYS } from '@/state/constants';
import { Link } from '@/components/Link';

interface NodeDataProps {
    node: CCMNode;
    prop: 'tags' | 'dependsOn' | 'references' | 'supports';
}

export function NodeData({ node, prop }: NodeDataProps) {
    if (!node[prop]) return null;

    return (
        <div className="grid grid-cols-4 auto-rows-max">
            <p className="col-span-1 type-metadata line-clamp-1">{NODE_DATA_KEYS[prop]}</p>
            <ul className="col-span-3 type-link flex flex-wrap gap-y-0.5 gap-x-2">
                {node[prop].map((value) =>
                    value.includes('http') ? (
                        <Link
                            url={value}
                            label={new URL(value).hostname}
                            key={value}
                            as="li"
                            className="clear-right wrap-anywhere"
                        />
                    ) : (
                        <li key={value} className="ellipsis">
                            {value}
                        </li>
                    )
                )}
            </ul>
        </div>
    );
}

import { useAtomValue } from 'jotai';
import type { CCMNode } from '@/types/ccmap';
import { selectedNodeAtom } from '@/state/model';
import { store } from '@/state/store';
import { ExternalLink } from '@/components/external-link';
import { NODE_DATA_KEYS } from '@/state/constants';

export function MapOverlay() {
    const selectedNode = useAtomValue(selectedNodeAtom, { store });
    // const database = useAtomValue(databaseAtom, { store });

    if (!selectedNode) return null;
    console.log(selectedNode);
    // const node = database.getNode(selectedNode);

    // if (!selectedNode) return null;

    return (
        <aside className="max-w-md z-10 absolute p-3.5 right-4 lg:right-5 bottom-4 flex flex-col ccm-colors ccm-border ccm-rounded">
            <div className="w-full flex flex-col gap-2">
                <div>
                    <h3 className="type-window-title">{selectedNode.id}</h3>
                    <p className="type-hint flex items-center gap-1">NODE SELECTED ({selectedNode.type.toUpperCase()})</p>
                </div>
                <p className="type-body mb-4">
                    A flexible software sketchbook and language for learning how to code within the visual arts.
                </p>
                {renderNodeData(selectedNode, 'tags')}
                {renderNodeData(selectedNode, 'dependsOn')}
                {renderNodeData(selectedNode, 'supports')}
                {renderNodeData(selectedNode, 'references')}
            </div>
        </aside>
    );
}

function renderNodeData(selectedNode: CCMNode, key: 'tags' | 'dependsOn' | 'references' | 'supports') {
    if (!selectedNode[key]) return null;
    return (
        <div className="grid grid-cols-4 auto-rows-max">
            <p className="col-span-1 type-metadata">{NODE_DATA_KEYS[key]}</p>
            <ul className="col-span-3 type-link flex flex-wrap gap-y-0.5 gap-x-2">
                {selectedNode[key].map((value) =>
                    value.includes('http') ? (
                        <li key={value}>
                            <ExternalLink url={value}>{value}</ExternalLink>
                        </li>
                    ) : (
                        <li key={value}>{value}</li>
                    )
                )}
            </ul>
        </div>
    );
}

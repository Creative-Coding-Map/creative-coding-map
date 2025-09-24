import { useAtomValue, useSetAtom } from 'jotai';
import { m } from 'motion/react';
import { NodeData } from './node-data';
import { ActionButton } from '@/components/action-button';
import { store } from '@/state/store';
import CloseIcon from '@/components/icons/Close';
import { selectedNodeAtom, selectedNodeIdAtom } from '@/state/model';
import { useLocation } from 'wouter';
import { useEmitter } from '@/hooks/useEmitter';

export function SelectedNode() {
    const selectedNode = useAtomValue(selectedNodeAtom, { store });
    const setSelectedNodeId = useSetAtom(selectedNodeIdAtom, { store });
    const [_, navigate] = useLocation();
    const { emitter } = useEmitter();

    // const database = useAtomValue(databaseAtom, { store });

    // const breakdowns = useMemo(() => {
    //     return selectedNode ? database.getBreakdowns('OPENRNDR') : null;
    // }, [selectedNode]);

    if (!selectedNode) return null;

    return (
        <m.aside
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            key="selected-node"
            className="max-w-2xl z-10 relative flex flex-col ccm-card ccm-card-px mr-4"
        >
            <ActionButton
                className="absolute top-4 right-4"
                onClick={() => {
                    setSelectedNodeId(null);
                    emitter.emit('app:selected-node:changed', null);
                    navigate('/');
                }}
                label="Close"
            >
                <CloseIcon className="ccm-invert" />
            </ActionButton>
            <div className="w-full flex flex-col gap-2">
                <div>
                    <h3 className="type-window-title">{selectedNode.id}</h3>
                    <p className="type-hint flex items-center gap-1">NODE SELECTED ({selectedNode.type.toUpperCase()})</p>
                </div>
                <p className="type-body mb-4">{selectedNode.description}</p>
                <NodeData node={selectedNode} prop="tags" />
                <NodeData node={selectedNode} prop="dependsOn" />
                <NodeData node={selectedNode} prop="supports" />
                <NodeData node={selectedNode} prop="references" />
            </div>
        </m.aside>
    );
}

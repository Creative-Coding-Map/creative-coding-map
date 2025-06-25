import { useAtomValue } from 'jotai';
import { AnimatePresence } from 'motion/react';
import { NodeData } from './node-data';
import { ShortestPath } from './shortest-path';
import { InfoOverlay } from './info-overlay';
import { SearchOverlay } from './search';
import { selectedNodeAtom, showInfoAtom, showSearchAtom } from '@/state/model';
import { store } from '@/state/store';

export function MapOverlay() {
    const showInfo = useAtomValue(showInfoAtom);
    const showSearch = useAtomValue(showSearchAtom);
    return (
        <>
            <AnimatePresence>{showInfo && <InfoOverlay />}</AnimatePresence>
            <AnimatePresence>{showSearch && <SearchOverlay />}</AnimatePresence>
            <ShortestPath />
            <SelectedNode />
        </>
    );
}

function SelectedNode() {
    const selectedNode = useAtomValue(selectedNodeAtom, { store });

    if (!selectedNode) return null;

    return (
        <aside className="max-w-xl z-10 absolute p-3.5 right-4 lg:right-5 bottom-4 flex flex-col ccm-colors ccm-border ccm-rounded ccm-transition">
            <div className="w-full flex flex-col gap-2">
                <div>
                    <h3 className="type-window-title">{selectedNode.id}</h3>
                    <p className="type-hint flex items-center gap-1">NODE SELECTED ({selectedNode.type.toUpperCase()})</p>
                </div>
                <p className="type-body mb-4">
                    A flexible software sketchbook and language for learning how to code within the visual arts.
                </p>
                <NodeData node={selectedNode} prop="tags" />
                <NodeData node={selectedNode} prop="dependsOn" />
                <NodeData node={selectedNode} prop="supports" />
                <NodeData node={selectedNode} prop="references" />
            </div>
        </aside>
    );
}

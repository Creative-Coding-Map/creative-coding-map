import { useAtomValue } from 'jotai';
import { AnimatePresence } from 'motion/react';
import { ShortestPath } from './shortest-path';
import { SearchOverlay } from './search';
import { SelectedNode } from './selected-node';
import { selectedNodeIdAtom } from '@/state/model';
import { store } from '@/state/store';

export function MapOverlay() {
    const selectedNodeId = useAtomValue(selectedNodeIdAtom, { store });

    return (
        <>
            <div className="flex flex-col justify-end gap-2 absolute left-2 md:left-auto right-2 bottom-4 md:right-4 h-[calc(100dvh-5lh)] md:h-[calc(100vh-5lh)] md:w-xl overflow-hidden">
                <ShortestPath />
                <AnimatePresence mode="wait" propagate>
                    {selectedNodeId && <SelectedNode />}
                </AnimatePresence>
                <SearchOverlay />
            </div>
        </>
    );
}

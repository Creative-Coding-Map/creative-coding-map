import { useAtom, useAtomValue } from 'jotai';
import { AnimatePresence } from 'motion/react';
import { ShortestPath } from './shortest-path';
import { InfoOverlay } from './info-overlay';
import { SearchOverlay } from './search';
import { SelectedNode } from './selected-node';
import { showInfoAtom, showSearchAtom } from '@/state/model';
import { store } from '@/state/store';

export function MapOverlay() {
    const showInfo = useAtomValue(showInfoAtom);
    const [showSearch] = useAtom(showSearchAtom, { store });

    return (
        <>
            <AnimatePresence>{showInfo && <InfoOverlay />}</AnimatePresence>
            <div className="flex flex-col justify-end gap-2 absolute bottom-4 right-0 h-[calc(100vh-5lh)] w-xl overflow-hidden">
                <ShortestPath />
                <SelectedNode />
                <AnimatePresence>{showSearch && <SearchOverlay />}</AnimatePresence>
            </div>
        </>
    );
}

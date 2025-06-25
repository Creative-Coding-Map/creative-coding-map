import { useAtom, useAtomValue } from 'jotai';
import { AnimatePresence } from 'motion/react';
import * as m from 'motion/react-m';
import clsx from 'clsx';
import { useMemo } from 'react';
import { CreatePath } from './create-path';
import { ConnectionPath } from './connection-path';
import type { ConnectionItem } from './connection-path';
import { store } from '@/state/store';
import { pathEndNodeAtom, pathStartNodeAtom, shortestPathNodesAtom, showCreatePathAtom } from '@/state/model';
import CreatePathIcon from '@/components/icons/CreatePath';
import CloseIcon from '@/components/icons/Close';
import { ActionButton } from '@/components/action-button';

export function ShortestPath() {
    const createPath = useAtomValue(showCreatePathAtom, { store });
    const shortestPathNodes = useAtomValue(shortestPathNodesAtom, { store });

    return (
        <AnimatePresence>
            {createPath && <CreatePath />}
            {shortestPathNodes.length > 0 && <Path />}
        </AnimatePresence>
    );
}

function Path() {
    const [shortestPathNodes, setShortestPathNodes] = useAtom(shortestPathNodesAtom, { store });
    const startNode = useAtomValue(pathStartNodeAtom, { store });
    const endNode = useAtomValue(pathEndNodeAtom, { store });

    const connections: ConnectionItem[] = useMemo(() => {
        return shortestPathNodes
            .map((_, index) => {
                if (index < shortestPathNodes.length - 1) {
                    return [
                        { style: 'filled', type: 'node' },
                        { style: 'dashed', type: 'link' },
                    ];
                }
                return [{ style: 'filled', type: 'node' }];
            })
            .flat() as ConnectionItem[];
    }, [shortestPathNodes]);

    console.log(connections);

    return (
        <m.aside
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            key="create-path"
            className={clsx(
                'max-w-xl z-10 absolute p-3.5 right-4 lg:right-5 bottom-4 flex flex-col',
                'ccm-colors ccm-border rounded-md'
            )}
        >
            <ActionButton
                className="absolute top-4 right-4"
                onClick={() => {
                    setShortestPathNodes([]);
                }}
                label="Close"
            >
                <CloseIcon className="ccm-invert" />
            </ActionButton>
            <div className="w-full flex flex-col">
                <div className="flex items-center gap-2">
                    <p className="type-window-title">Shortest Path</p>
                    <CreatePathIcon className="size-6 ccm-invert inline-block" />
                </div>
                <p className="type-hint block mb-4">PATH SELECTED</p>
                <div className="flex flex-col items-center justify-baseline w-full gap-2">
                    <p className="type-body mb-4">
                        The shortest path between <span className="font-bold">{startNode?.id}</span> and{' '}
                        <span className="font-bold">{endNode?.id}</span> is as follows:
                    </p>
                    <div className="flex items-center justify-baseline w-full gap-2">
                        <ConnectionPath connections={connections} />
                        <div className="flex flex-col gap-2 max-w-[320px] relative">
                            {/* <Input
                                        ref={startInputRef}
                                        id="start-node-input"
                                        type="text"
                                        placeholder="CLICK OR TYPE FIRST NODE"
                                        value={startNodeInput}
                                        onFocus={() => handleFocus('start')}
                                        onChange={(e) => handleInputChange(e.target.value, 'start')}
                                        onBlur={handleBlur}
                                        onKeyDown={handleKeyDown}
                                    /> */}
                            {shortestPathNodes.map((node) => (
                                <div key={node.id} className="type-body h-6">
                                    {node.id}
                                </div>
                            ))}
                            {/* <Input
                                        ref={endInputRef}
                                        id="end-node-input"
                                        type="text"
                                        placeholder="CLICK OR TYPE SECOND NODE"
                                        value={endNodeInput}
                                        onFocus={() => handleFocus('end')}
                                        onChange={(e) => handleInputChange(e.target.value, 'end')}
                                        onKeyDown={handleKeyDown}
                                    /> */}
                        </div>
                    </div>
                </div>
                <div className="flex items-center justify-end mt-8">
                    <button className="btn type-button ccm-action ccm-transition ease-linear px-2">CLEAR</button>
                </div>
            </div>
        </m.aside>
    );
}

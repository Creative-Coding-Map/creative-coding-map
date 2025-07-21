import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import { AnimatePresence } from 'motion/react';
import * as m from 'motion/react-m';
import clsx from 'clsx';
import { useMemo } from 'react';
import { CreatePath } from './create-path';
import { ConnectionPath } from './connection-path';
import type { ConnectionItem } from './connection-path';
import { store } from '@/state/store';
import { pathEndNodeAtom, pathStartNodeAtom, selectedNodeIdAtom, shortestPathNodesAtom, showCreatePathAtom } from '@/state/model';
import CreatePathIcon from '@/components/icons/CreatePath';
import CloseIcon from '@/components/icons/Close';
import { ActionButton } from '@/components/action-button';
import { useEmitter } from '@/hooks/useEmitter';

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
    const setSelectedNodeId = useSetAtom(selectedNodeIdAtom, { store });
    const startNode = useAtomValue(pathStartNodeAtom, { store });
    const endNode = useAtomValue(pathEndNodeAtom, { store });
    const { emitter } = useEmitter();

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

    const selectNode = (nodeId: string) => {
        return (event: React.MouseEvent<HTMLButtonElement>) => {
            event.preventDefault();
            setSelectedNodeId(nodeId);
        };
    };

    console.log(connections);

    return (
        <m.aside
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            key="create-path"
            className={clsx('max-w-xl z-10 p-3.5 flex flex-col ccm-colors ccm-border rounded-md basis-1/3')}
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
                        <div className="flex flex-col gap-2 w-[320px] relative ccm-colors">
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
                            {shortestPathNodes.map((node, index) => {
                                const isLast = index === shortestPathNodes.length - 1;
                                const isFirst = index === 0;

                                if (isLast || isFirst) {
                                    return (
                                        <div key={node.id} className="border border-transparent type-body h-6 px-1.5 w-full ">
                                            <button onClick={selectNode(node.id)} className="w-full h-full text-left">
                                                {node.id}
                                            </button>
                                        </div>
                                    );
                                }

                                return (
                                    <div
                                        key={node.id}
                                        className="type-body h-6 rounded-md w-full flex group gap-1 hover:dark ccm-colors ccm-transition-fast"
                                    >
                                        <button
                                            onClick={(evt) => {
                                                evt.preventDefault();
                                                selectNode(node.id);
                                            }}
                                            className={clsx(
                                                'flex-1 rounded-md px-1.5 text-left cursor-pointer ccm-transition-fast',
                                                'ccm-border-hover hover:bg-black hover:text-white'
                                            )}
                                        >
                                            {node.id}
                                        </button>
                                        <button
                                            className="h-6 w-6 rounded-md cursor-pointer ccm-transition-fast"
                                            onClick={(evt) => {
                                                evt.preventDefault();
                                                emitter.emit('app:shortest-path:changed', node.id);
                                            }}
                                        >
                                            <CloseIcon className="opacity-0 group-hover:opacity-100 border border-black h-6 w-6 rounded-md hover:bg-black hover:stroke-white ccm-transition-fast" />
                                        </button>
                                    </div>
                                );
                            })}
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

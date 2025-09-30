import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import { useCallback, useLayoutEffect, useRef, useState } from 'react';
import clsx from 'clsx';
import * as m from 'motion/react-m';
import { AnimatePresence } from 'motion/react';
import { Suggestions } from '../suggestions';
import type { CCMNode } from '@/types/ccmap';
import { databaseAtom, pathEndNodeAtom, pathStartNodeAtom, showCreatePathAtom } from '@/state/model';
import { store } from '@/state/store';
import CreatePathIcon from '@/components/icons/CreatePath';
import CloseIcon from '@/components/icons/Close';
import { Input } from '@/components/input';
import ConnectionIcon from '@/components/symbols/Connection';
import { ActionButton } from '@/components/action-button';
import { useEmitter } from '@/hooks/useEmitter';
import { useSuggestions } from '@/hooks/useSuggestions';

export function CreatePath() {
    const setShowCreatePath = useSetAtom(showCreatePathAtom, { store });
    const [startNode, setStartNode] = useAtom(pathStartNodeAtom, { store });
    const [endNode, setEndNode] = useAtom(pathEndNodeAtom, { store });
    const database = useAtomValue(databaseAtom, { store });

    const [startNodeInput, setStartNodeInput] = useState('');
    const [endNodeInput, setEndNodeInput] = useState('');
    const [activeInput, setActiveInput] = useState<'start' | 'end' | null>(null);
    const startInputRef = useRef<HTMLInputElement>(null);
    const endInputRef = useRef<HTMLInputElement>(null);
    const [suggestionsPosition, setSuggestionsPosition] = useState({ top: 0, left: 0 });
    const { emitter } = useEmitter();

    const selectSuggestion = useCallback(
        (suggestion: CCMNode) => {
            if (activeInput === 'start') {
                setStartNodeInput(suggestion.id);
                setStartNode(suggestion);
                endInputRef.current?.focus();
            } else {
                setEndNodeInput(suggestion.id);
                setEndNode(suggestion);
            }

            emitter.emit('app:suggestions:reset');
            setActiveInput(null);
        },
        [activeInput, setStartNode, setEndNode, startNode]
    );

    useLayoutEffect(() => {
        if (startNode && endNode) {
            setShowCreatePath(false);
            emitter.emit('app:shortest-path:create');
        }
    }, [startNode, endNode]);

    const {
        handleInputChange,
        handleKeyDown,
        handleBlur,
        suggestions,
        suggestionsRef,
        selectedSuggestionIndex,
        setSelectedSuggestionIndex,
        reset,
    } = useSuggestions({
        selectSuggestion,
        triggerKey: 'ArrowUp',
    });

    const handleFocus = useCallback(
        (inputType: 'start' | 'end') => {
            setActiveInput(inputType);

            const inputRef = inputType === 'start' ? startInputRef : endInputRef;

            if (inputRef.current) {
                const rect = inputRef.current.getBoundingClientRect();
                setSuggestionsPosition({
                    top: rect.top,
                    left: rect.left,
                });
            }
        },
        [setSuggestionsPosition, startInputRef, endInputRef, setActiveInput]
    );

    const onInputChange = useCallback(
        (value: string, inputType: 'start' | 'end') => {
            if (inputType === 'start') {
                setStartNodeInput(value);
            } else {
                setEndNodeInput(value);
            }

            handleInputChange(value);
        },
        [handleInputChange, setStartNodeInput, setEndNodeInput]
    );

    const onSelectedNodeChanged = useCallback(
        (nodeId: string | null) => {
            if (nodeId) {
                if (startNodeInput === '') {
                    setStartNodeInput(nodeId);
                    setStartNode(database.getNode(nodeId)!);
                } else if (endNodeInput === '') {
                    setEndNodeInput(nodeId);
                    setEndNode(database.getNode(nodeId)!);

                    if (startNodeInput) {
                        setShowCreatePath(false);
                        emitter.emit('app:shortest-path:create');
                    }
                }
            }
        },
        [startNodeInput, endNodeInput]
    );
    useLayoutEffect(() => {
        if (startInputRef.current) {
            startInputRef.current.focus();
        }
    }, []);

    useLayoutEffect(() => {
        emitter.on('map:selected-node:changed', onSelectedNodeChanged);

        return () => {
            emitter.off('map:selected-node:changed', onSelectedNodeChanged);
        };
    }, [onSelectedNodeChanged]);

    return (
        <m.aside
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            key="create-path"
            className={clsx('relative z-10 p-3.5 flex flex-col ccm-colors ccm-border rounded-md ')}
        >
            <ActionButton
                className="absolute top-4 right-4"
                label="Close"
                onClick={() => {
                    setShowCreatePath(false);
                    setStartNode(null);
                    setEndNode(null);
                }}
            >
                <CloseIcon className="ccm-icon " />
            </ActionButton>
            <div className="w-full flex flex-col gap-2">
                <div className="flex items-center gap-2 mb-4">
                    <p className="type-window-title">Shortest Path</p>
                    <CreatePathIcon className="size-6 ccm-icon " />
                </div>
                <div className="flex items-center justify-baseline w-full gap-2">
                    <div className="flex flex-col gap-2 ccm-transition-colors">
                        <ConnectionIcon
                            className="w-2 h-10 "
                            source={{ dashed: startNode === null, filled: startNode !== null }}
                            line={{ dashed: startNode === null || endNode === null }}
                            destination={{ dashed: endNode === null, filled: endNode !== null }}
                        />
                    </div>
                    <div className="flex flex-col gap-2 w-full ">
                        <div className="flex flex-col gap-2 max-w-[320px] relative">
                            <div className=" flex flex-col gap-2 ccm-transition-colors">
                                <Input
                                    ref={startInputRef}
                                    id="start-node-input"
                                    type="text"
                                    placeholder="CLICK OR TYPE FIRST NODE"
                                    value={startNodeInput}
                                    onFocus={() => handleFocus('start')}
                                    onChange={(e) => onInputChange(e.target.value, 'start')}
                                    onBlur={handleBlur}
                                    onKeyDown={handleKeyDown}
                                />
                                <Input
                                    ref={endInputRef}
                                    id="end-node-input"
                                    type="text"
                                    placeholder="CLICK OR TYPE SECOND NODE"
                                    value={endNodeInput}
                                    onFocus={() => handleFocus('end')}
                                    onChange={(e) => onInputChange(e.target.value, 'end')}
                                    onBlur={handleBlur}
                                    onKeyDown={handleKeyDown}
                                />
                            </div>
                            <AnimatePresence>
                                {suggestions.length > 0 && (
                                    <Suggestions
                                        fixed
                                        ref={suggestionsRef}
                                        suggestions={suggestions}
                                        selectSuggestion={selectSuggestion}
                                        position={suggestionsPosition}
                                        selectedIndex={selectedSuggestionIndex}
                                        setSelectedIndex={setSelectedSuggestionIndex}
                                        activeInputRef={activeInput === 'start' ? startInputRef : endInputRef}
                                        onBlur={(evt) => {
                                            console.log('blurring', evt);
                                            if (evt.relatedTarget?.nodeName === 'INPUT') {
                                                return;
                                            }

                                            if (suggestions.length > 0) {
                                                reset();
                                            }
                                        }}
                                    />
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>
                <p className="type-hint">* or click on one node and SHIFT+click on the second one</p>
            </div>
        </m.aside>
    );
}

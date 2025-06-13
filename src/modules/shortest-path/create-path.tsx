import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import { useCallback, useLayoutEffect, useRef, useState } from 'react';
import throttle from 'just-throttle';
import clsx from 'clsx';
import * as m from 'motion/react-m';
import { AnimatePresence } from 'motion/react';
import { Suggestions } from './suggestions';
import type { CCMNode } from '@/types/ccmap';
import { databaseAtom, pathEndNodeAtom, pathStartNodeAtom, showCreatePathAtom } from '@/state/model';
import { store } from '@/state/store';
import CreatePathIcon from '@/components/icons/CreatePath';
import CloseIcon from '@/components/icons/Close';
import { Input } from '@/components/input';
import ConnectionIcon from '@/components/symbols/Connection';
import { ActionButton } from '@/components/action-button';
import { useMitt } from '@/hooks/useMitt';

const MIN_CHAR_SUGGESTIONS = 2;

export function CreatePath() {
    const setShowCreatePath = useSetAtom(showCreatePathAtom, { store });
    const database = useAtomValue(databaseAtom, { store });
    const [startNode, setStartNode] = useAtom(pathStartNodeAtom, { store });
    const [endNode, setEndNode] = useAtom(pathEndNodeAtom, { store });

    const [startNodeInput, setStartNodeInput] = useState('');
    const [endNodeInput, setEndNodeInput] = useState('');
    const [suggestions, setSuggestions] = useState<CCMNode[]>([]);
    const [activeInput, setActiveInput] = useState<'start' | 'end' | null>(null);
    const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1);
    const startInputRef = useRef<HTMLInputElement>(null);
    const endInputRef = useRef<HTMLInputElement>(null);
    const [suggestionsPosition, setSuggestionsPosition] = useState({ top: 0, left: 0 });
    const suggestionsRef = useRef<HTMLUListElement>(null);
    const { emitter } = useMitt();

    const getSuggestions = useCallback(
        (value: string) => {
            if (value.length < MIN_CHAR_SUGGESTIONS) {
                return [];
            }
            const regex = new RegExp(value, 'i');
            return database.values.filter((node) => regex.test(node.id));
        },
        [database.nodeIds]
    );

    const throttledSetSuggestions = useCallback(
        throttle((value: string) => {
            const newSuggestions = getSuggestions(value);
            setSuggestions(newSuggestions);
        }, 300),
        [getSuggestions]
    );

    const handleInputChange = useCallback(
        (value: string, inputType: 'start' | 'end') => {
            if (inputType === 'start') {
                setStartNodeInput(value);
            } else {
                setEndNodeInput(value);
            }

            if (value.length >= MIN_CHAR_SUGGESTIONS) {
                throttledSetSuggestions(value);
            } else {
                setSuggestions([]);
            }
            setSelectedSuggestionIndex(-1);
        },
        [throttledSetSuggestions]
    );

    const selectSuggestion = useCallback(
        (suggestion: CCMNode) => {
            if (activeInput === 'start') {
                setStartNodeInput(suggestion.id);
                setStartNode(suggestion);
                startInputRef.current?.focus();
            } else if (activeInput === 'end') {
                setEndNodeInput(suggestion.id);
                setEndNode(suggestion);
                endInputRef.current?.focus();
            }

            setSuggestions([]);
            setSelectedSuggestionIndex(-1);
            setActiveInput(null);

            if (activeInput === 'end') {
                setTimeout(() => {
                    if (startNode) {
                        setShowCreatePath(false);
                        emitter.emit('shortest-path:create');
                    }
                }, 100);
            }
        },
        [activeInput, setStartNode, setEndNode, startNode]
    );

    const handleFocus = useCallback((inputType: 'start' | 'end') => {
        setActiveInput(inputType);
        // setSuggestions([]);

        const inputRef = inputType === 'start' ? startInputRef : endInputRef;
        if (inputRef.current) {
            const rect = inputRef.current.getBoundingClientRect();
            setSuggestionsPosition({
                top: rect.top,
                left: rect.left,
            });
        }
    }, []);

    const handleKeyDown = useCallback(
        (e: React.KeyboardEvent<HTMLInputElement>) => {
            switch (e.key) {
                case 'ArrowDown':
                    if (suggestions.length > 0) {
                        e.preventDefault();
                        e.stopPropagation();
                        setSelectedSuggestionIndex(0);
                    }
                    break;
                case 'Enter':
                    if (selectedSuggestionIndex !== -1) {
                        e.preventDefault();
                        selectSuggestion(suggestions[selectedSuggestionIndex]);
                    }
                    break;
                case 'Escape':
                    setSuggestions([]);
                    break;
                case 'Tab':
                    if (suggestions.length > 0 && selectedSuggestionIndex === -1) {
                        e.preventDefault();
                        setSelectedSuggestionIndex(0);
                    } else if (selectedSuggestionIndex > -1) {
                        e.preventDefault();
                        suggestionsRef.current?.focus();
                    }
                    break;
            }
        },
        [suggestions, selectedSuggestionIndex, selectSuggestion, setSelectedSuggestionIndex, setSuggestions]
    );

    const handleBlur = useCallback(
        (event: React.FocusEvent<HTMLInputElement>) => {
            if (event.target.nodeName === event.relatedTarget?.nodeName) {
                setSuggestions([]);
            }
        },
        [suggestions]
    );

    useLayoutEffect(() => {
        if (startInputRef.current) {
            startInputRef.current.focus();
        }
    }, [startInputRef.current]);

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
                label="Close"
                onClick={() => {
                    setShowCreatePath(false);
                    setStartNode(null);
                    setEndNode(null);
                }}
            >
                <CloseIcon className="ccm-invert" />
            </ActionButton>
            <div className="w-full flex flex-col gap-2">
                <div className="flex items-center gap-2 mb-4">
                    <p className="type-window-title">Shortest Path</p>
                    <CreatePathIcon className="size-6 ccm-invert" />
                </div>
                <div className="flex items-center justify-baseline w-full gap-2">
                    <ConnectionIcon
                        className="w-2 h-10 ccm-invert"
                        source={{ dashed: startNode === null, filled: startNode !== null }}
                        line={{ dashed: startNode === null || endNode === null }}
                        destination={{ dashed: endNode === null, filled: endNode !== null }}
                    />
                    <div className="flex flex-col gap-2 w-full">
                        <div className="flex flex-col gap-2 max-w-[320px] relative">
                            <Input
                                ref={startInputRef}
                                id="start-node-input"
                                type="text"
                                placeholder="CLICK OR TYPE FIRST NODE"
                                value={startNodeInput}
                                onFocus={() => handleFocus('start')}
                                onChange={(e) => handleInputChange(e.target.value, 'start')}
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
                                onChange={(e) => handleInputChange(e.target.value, 'end')}
                                onKeyDown={handleKeyDown}
                            />
                            <AnimatePresence>
                                {suggestions.length > 0 && (
                                    <Suggestions
                                        ref={suggestionsRef}
                                        suggestions={suggestions}
                                        selectSuggestion={selectSuggestion}
                                        position={suggestionsPosition}
                                        selectedIndex={selectedSuggestionIndex}
                                        setSelectedIndex={setSelectedSuggestionIndex}
                                        activeInputRef={activeInput === 'start' ? startInputRef : endInputRef}
                                        onBlur={(evt) => {
                                            if (evt.relatedTarget?.nodeName === 'INPUT') {
                                                return;
                                            }

                                            if (suggestions.length > 0) {
                                                setSuggestions([]);
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

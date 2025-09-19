import * as m from 'motion/react-m';
import { useCallback, useLayoutEffect, useRef, useState } from 'react';
import clsx from 'clsx';
import { AnimatePresence } from 'motion/react';
import { useAtom, useSetAtom } from 'jotai';
import { Suggestions } from './suggestions';
import type { CCMNode } from '@/types/ccmap';
import { useSuggestions } from '@/hooks/useSuggestions';
import { useEmitter } from '@/hooks/useEmitter';
import Search from '@/components/icons/Search';
import { selectedNodeIdAtom, showSearchAtom } from '@/state/model';
import { store } from '@/state/store';
import { useLocation } from 'wouter';

export function SearchOverlay() {
    const setShowSearch = useSetAtom(showSearchAtom, { store });
    const setSelectedNodeId = useSetAtom(selectedNodeIdAtom, { store });
    const inputRef = useRef<HTMLInputElement>(null);
    const [search, setSearch] = useState('');
    const [_, navigate] = useLocation();

    const { emitter } = useEmitter();

    const selectSuggestion = useCallback(
        (suggestion: CCMNode) => {
            setShowSearch(false);
            setSelectedNodeId(suggestion.id);
            const params = new URLSearchParams({ focusNode: suggestion.id });
            navigate(`/?${params.toString()}`);
            emitter.emit('app:selected-node:focus', suggestion.id);
            emitter.emit('app:suggestions:reset');
        },
        [emitter, setSelectedNodeId]
    );

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

    const onInputChange = useCallback(
        (value: string) => {
            setSearch(value);

            handleInputChange(value);
        },
        [handleInputChange, setSearch]
    );

    return (
        <m.aside
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onAnimationComplete={(def: any) => {
                if (inputRef.current && def.opacity === 1) {
                    setTimeout(() => {
                        inputRef.current?.focus();
                    }, 100);
                }
            }}
            className="w-[400px] z-20 p-1 ml-auto mr-4 flex flex-col ccm-colors ccm-border ccm-invert rounded-md ccm-transition-colors"
        >
            <div className="w-full flex flex-col ">
                <AnimatePresence mode="wait">
                    {suggestions.length > 0 && (
                        <Suggestions
                            suggestions={suggestions}
                            selectSuggestion={selectSuggestion}
                            selectedIndex={selectedSuggestionIndex}
                            setSelectedIndex={setSelectedSuggestionIndex}
                            activeInputRef={inputRef}
                            onBlur={(evt) => {
                                if (evt.relatedTarget?.nodeName === 'INPUT') {
                                    return;
                                }

                                if (suggestions.length > 0) {
                                    reset();
                                }
                            }}
                            ref={suggestionsRef}
                        />
                    )}
                </AnimatePresence>
                <div className="flex items-center justify-between gap-2 p-1">
                    <Search className="size-4" />
                    <input
                        ref={inputRef}
                        id="search-input"
                        type="text"
                        className={clsx('type-filter w-full px-1 font-mono ccm-colors ccm-transition outline-none')}
                        value={search}
                        onKeyDown={(e) => {
                            if (e.key === 'Escape') {
                                setSearch('');
                                reset();
                                setShowSearch(false);
                            } else {
                                handleKeyDown(e);
                            }
                        }}
                        onBlur={handleBlur}
                        onChange={(e) => onInputChange(e.target.value)}
                        placeholder="Search"
                    />
                </div>
            </div>
        </m.aside>
    );
}

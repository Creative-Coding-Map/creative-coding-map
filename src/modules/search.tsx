import * as m from 'motion/react-m';
import { useCallback, useRef, useState } from 'react';
import clsx from 'clsx';
import { AnimatePresence } from 'motion/react';
import { useSetAtom } from 'jotai';
import { useLocation } from 'wouter';
import { Suggestions } from './suggestions';
import type { CCMNode } from '@/types/ccmap';
import { useSuggestions } from '@/hooks/useSuggestions';
import { useEmitter } from '@/hooks/useEmitter';
import Search from '@/components/icons/Search';
import { selectedNodeIdAtom } from '@/state/model';
import { store } from '@/state/store';

export function SearchOverlay() {
    const setSelectedNodeId = useSetAtom(selectedNodeIdAtom, { store });
    const inputRef = useRef<HTMLInputElement>(null);
    const [search, setSearch] = useState('');
    const [url, navigate] = useLocation();

    const { emitter } = useEmitter();

    const selectSuggestion = useCallback(
        (suggestion: CCMNode) => {
            setSelectedNodeId(suggestion.id);
            setSearch('');
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

    if (new URL(url, window.location.href).pathname !== '/') {
        return null;
    }

    return (
        <m.aside
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            key="search-overlay"
            onAnimationComplete={(def: any) => {
                if (inputRef.current && def.opacity === 1) {
                    setTimeout(() => {
                        inputRef.current?.focus();
                    }, 100);
                }
            }}
            className="max-w-xl w-full z-20 px-1 ml-auto flex flex-col ccm-colors ccm-border rounded-md overflow-hidden"
        >
            <div className="w-full flex flex-col">
                <AnimatePresence mode="wait" propagate>
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
                            animateHeight
                        />
                    )}
                </AnimatePresence>
                <div className="flex items-center justify-between gap-2 p-1 py-2 z-10 ccm-colors">
                    <Search className="size-4" />
                    <input
                        ref={inputRef}
                        id="search-input"
                        autoComplete="off"
                        type="text"
                        className={clsx('type-filter w-full px-1 font-mono ccm-colors outline-none')}
                        value={search}
                        onKeyDown={(e) => {
                            if (e.key === 'Escape') {
                                setSearch('');
                                reset();
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

import * as m from 'motion/react-m';
import { useCallback, useLayoutEffect, useRef, useState } from 'react';
import clsx from 'clsx';
import { AnimatePresence } from 'motion/react';
import { useSetAtom } from 'jotai';
import { Suggestions } from './suggestions';
import type { CCMNode } from '@/types/ccmap';
import { useSuggestions } from '@/hooks/useSuggestions';
import { useMitt } from '@/hooks/useMitt';
import Search from '@/components/icons/Search';
import { selectedNodeIdAtom, showSearchAtom } from '@/state/model';

export function SearchOverlay() {
    const setShowSearch = useSetAtom(showSearchAtom);
    const setSelectedNodeId = useSetAtom(selectedNodeIdAtom);
    const inputRef = useRef<HTMLInputElement>(null);
    const [search, setSearch] = useState('');

    const { emitter } = useMitt();

    const selectSuggestion = useCallback(
        (suggestion: CCMNode) => {
            setShowSearch(false);
            setSelectedNodeId(suggestion.id);

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
    });

    const onInputChange = useCallback(
        (value: string) => {
            setSearch(value);

            handleInputChange(value);
        },
        [handleInputChange, setSearch]
    );

    useLayoutEffect(() => {
        inputRef.current?.focus();
    }, []);

    return (
        <m.aside
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-[400px] z-20 absolute p-1 right-4 bottom-4 flex flex-col ccm-colors ccm-border rounded-md ccm-transition"
        >
            <div className="w-full flex flex-col">
                <AnimatePresence>
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
                    <Search className="size-4 ccm-invert stroke-gray" />
                    <input
                        ref={inputRef}
                        type="text"
                        className={clsx('type-filter w-full px-1 font-mono', 'ccm-colors ccm-invert', 'outline-none')}
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

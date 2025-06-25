import * as m from 'motion/react-m';
import { useCallback, useLayoutEffect, useRef, useState } from 'react';
import { Search } from 'lucide-react';
import clsx from 'clsx';
import { AnimatePresence } from 'motion/react';
import { Suggestions } from './suggestions';
import type { CCMNode } from '@/types/ccmap';
import { useSuggestions } from '@/hooks/useSuggestions';
import { useMitt } from '@/hooks/useMitt';

export function SearchOverlay() {
    const [searchNode, setSearchNode] = useState<CCMNode | null>(null);
    const [selectedIndex, setSelectedIndex] = useState(0);
    const inputRef = useRef<HTMLInputElement>(null);
    const suggestionsRef = useRef<HTMLUListElement>(null);
    const [search, setSearch] = useState('');

    const { emitter } = useMitt();

    const selectSuggestion = useCallback(
        (suggestion: CCMNode) => {
            setSearchNode(suggestion);
            inputRef.current?.focus();

            emitter.emit('suggestions:reset');

            // if (activeInput === 'end') {
            //     setTimeout(() => {
            //         if (startNode) {
            //             setShowCreatePath(false);
            //             emitter.emit('shortest-path:create');
            //         }
            //     }, 100);
            // }
        },
        [emitter, setSearchNode, inputRef]
    );

    const { handleInputChange, handleKeyDown, handleBlur, suggestions, setSuggestions } = useSuggestions({
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
                            selectedIndex={selectedIndex}
                            setSelectedIndex={setSelectedIndex}
                            activeInputRef={inputRef}
                            onBlur={(evt) => {
                                if (evt.relatedTarget?.nodeName === 'INPUT') {
                                    return;
                                }

                                if (suggestions.length > 0) {
                                    setSuggestions([]);
                                }
                            }}
                            ref={suggestionsRef}
                        />
                    )}
                </AnimatePresence>
                <div className="flex justify-between gap-2">
                    <Search className="size-6 ccm-invert stroke-gray" />
                    <input
                        ref={inputRef}
                        type="text"
                        className={clsx(
                            'type-filter w-full px-1',
                            'ccm-colors ccm-invert border-b-2 border-gray-200 focus:border-gray-400',
                            'placeholder:uppercase outline-none'
                        )}
                        value={search}
                        onKeyDown={handleKeyDown}
                        onBlur={handleBlur}
                        onChange={(e) => onInputChange(e.target.value)}
                        placeholder="Search for a node"
                    />
                </div>
            </div>
        </m.aside>
    );
}

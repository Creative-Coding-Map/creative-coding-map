import { useAtomValue } from 'jotai';
import { useCallback, useEffect, useRef, useState } from 'react';
import throttle from 'just-throttle';
import { useEmitter } from './useEmitter';
import type { CCMNode } from '@/types/ccmap';
import { databaseAtom } from '@/state/model';
import { store } from '@/state/store';
import { MIN_CHAR_SUGGESTIONS } from '@/state/constants';

interface UseSuggestionsProps {
    selectSuggestion: (suggestion: CCMNode) => void;
    triggerKey?: 'ArrowDown' | 'ArrowUp';
}

export function useSuggestions({ selectSuggestion, triggerKey = 'ArrowDown' }: UseSuggestionsProps) {
    const database = useAtomValue(databaseAtom, { store });
    const [suggestions, setSuggestions] = useState<CCMNode[]>([]);
    const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1);
    const suggestionsRef = useRef<HTMLUListElement>(null);
    const { emitter } = useEmitter();

    const reset = useCallback(() => {
        setSuggestions([]);
        setSelectedSuggestionIndex(-1);
    }, [setSuggestions, setSelectedSuggestionIndex]);

    useEffect(() => {
        emitter.on('app:suggestions:reset', reset);
        return () => {
            emitter.off('app:suggestions:reset', reset);
        };
    }, [reset]);

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
        (value: string) => {
            if (value.length >= MIN_CHAR_SUGGESTIONS) {
                throttledSetSuggestions(value);
            } else {
                setSuggestions([]);
            }
            setSelectedSuggestionIndex(-1);
        },
        [throttledSetSuggestions]
    );

    const handleKeyDown = useCallback(
        (e: React.KeyboardEvent<HTMLInputElement>) => {
            switch (e.key) {
                case triggerKey:
                    if (suggestions.length > 0) {
                        e.preventDefault();
                        e.stopPropagation();
                        setSelectedSuggestionIndex(0);
                        suggestionsRef.current?.focus();
                    }
                    break;
                case 'Enter':
                    console.log('selecting suggestion', suggestions[selectedSuggestionIndex]);
                    if (selectedSuggestionIndex !== -1) {
                        e.preventDefault();
                        selectSuggestion(suggestions[selectedSuggestionIndex]);
                    }
                    break;
                case 'Escape':
                    e.preventDefault();
                    reset();
                    break;
                case 'Tab':
                    if (suggestions.length > 0) {
                        if (selectedSuggestionIndex === -1) {
                            setSelectedSuggestionIndex(0);
                        }
                        e.preventDefault();
                        suggestionsRef.current?.focus();
                    }

                    break;
            }
        },
        [suggestions, selectedSuggestionIndex, selectSuggestion, reset]
    );

    const handleBlur = useCallback(
        (event: React.FocusEvent<HTMLInputElement>) => {
            if (event.target.nodeName === event.relatedTarget?.nodeName) {
                reset();
            }
        },
        [reset]
    );

    return {
        handleKeyDown,
        handleInputChange,
        handleBlur,
        suggestions,
        setSuggestions,
        suggestionsRef,
        selectedSuggestionIndex,
        setSelectedSuggestionIndex,
        reset,
    };
}

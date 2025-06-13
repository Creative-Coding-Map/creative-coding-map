import clsx from 'clsx';
import { useEffect } from 'react';
import * as m from 'motion/react-m';
import type { CCMNode } from '@/types/ccmap';
import { CCMNodeType } from '@/types/ccmap';
import TagIcon from '@/components/icons/Tag';
import Breakdowns from '@/components/symbols/Breakdowns';
import Techniques from '@/components/symbols/Techniques';
import Tools from '@/components/symbols/Tools';

interface SuggestionsProps {
    suggestions: CCMNode[];
    activeInputRef: React.RefObject<HTMLInputElement | null>;
    position: { top: number; left: number };
    selectedIndex: number;
    setSelectedIndex: (index: number) => void;
    selectSuggestion: (suggestion: CCMNode) => void;
    onBlur: (event: React.FocusEvent<HTMLUListElement>) => void;
    ref: React.RefObject<HTMLUListElement | null>;
}

export function Suggestions({
    suggestions,
    selectSuggestion,
    selectedIndex,
    setSelectedIndex,
    activeInputRef,
    onBlur,
    position,
    ref,
}: SuggestionsProps) {
    useEffect(() => {
        if (selectedIndex !== -1) {
            ref.current?.focus();
        }
    }, [selectedIndex]);

    useEffect(() => {
        if (selectedIndex > -1 && ref.current?.children[selectedIndex]) {
            ref.current.children[selectedIndex].scrollIntoView({
                block: 'nearest',
            });
        }
    }, [selectedIndex]);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        switch (e.key) {
            case 'ArrowUp':
                e.preventDefault();
                if (selectedIndex > 0) {
                    setSelectedIndex(selectedIndex - 1);
                } else {
                    setSelectedIndex(-1);
                    activeInputRef.current?.focus();
                }
                break;
            case 'ArrowDown':
                e.preventDefault();
                if (selectedIndex < suggestions.length - 1) {
                    setSelectedIndex(selectedIndex + 1);
                }
                break;
            case 'Enter':
                e.preventDefault();
                if (selectedIndex > -1) {
                    selectSuggestion(suggestions[selectedIndex]);
                }
                break;
            case 'Escape':
                e.preventDefault();
                setSelectedIndex(-1);
                activeInputRef.current?.focus();
                break;
            case 'Tab':
                e.preventDefault();
                activeInputRef.current?.focus();
                break;
        }
    };

    return (
        <m.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={clsx('fixed z-10 ccm-colors ccm-border p-2 rounded-md -mt-2 w-[320px] ccm-transition')}
            style={{
                top: `${position.top}px`,
                left: `${position.left}px`,
                transform: 'translateY(-100%)',
            }}
        >
            <p className="type-hint text-gray mb-1">SUGGESTED NODES</p>
            <ul
                ref={ref}
                tabIndex={-1}
                onKeyDown={handleKeyDown}
                onBlur={onBlur}
                className="flex flex-col max-h-[6lh] overflow-y-auto ccm-scrollbar focus:outline-none group"
            >
                {suggestions.map((suggestion, index) => (
                    <li
                        key={suggestion.id}
                        className={clsx('hover:invert ccm-colors cursor-pointer flex items-center p-1', {
                            'group-focus:invert group-not-focus:bg-light-gray': selectedIndex === index,
                        })}
                        onClick={() => selectSuggestion(suggestion)}
                        onMouseOver={(evt) => {
                            evt.preventDefault();
                            // if the focus element isn't an input, set the selected index
                            if (document.activeElement !== activeInputRef.current) {
                                setSelectedIndex(index);
                            }
                        }}
                    >
                        <div className="w-5 flex items-center">{renderIcon(suggestion.type, 'w-[12px] h-[12px]')}</div>
                        <span className="type-filter">{suggestion.id}</span>
                        <span className={clsx('ml-auto type-hint ellipsis category')}>
                            [{suggestion.tags?.[0] ?? suggestion.type}]
                        </span>
                    </li>
                ))}
            </ul>
        </m.div>
    );
}

function renderIcon(type: CCMNodeType, className?: string) {
    switch (type) {
        case CCMNodeType.Tag:
            return <TagIcon className={className} />;
        case CCMNodeType.Tool:
            return <Tools className={className} />;
        case CCMNodeType.Technique:
            return <Techniques className={className} />;
        case CCMNodeType.Breakdown:
            return <Breakdowns className={className} />;
        default:
            break;
    }
}

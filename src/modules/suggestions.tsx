import clsx from 'clsx';
import { useEffect, useRef } from 'react';
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
    selectedIndex: number;
    setSelectedIndex: (index: number) => void;
    selectSuggestion: (suggestion: CCMNode) => void;
    onBlur: (event: React.FocusEvent<HTMLUListElement>) => void;
    ref: React.RefObject<HTMLUListElement | null>;
    fixed?: boolean;
    position?: { top: number; left: number };
}

type MousePos = { x: number; y: number };

const hasMouseMovedSignificantly = (prev: MousePos, current: MousePos) => {
    return Math.abs(current.x - prev.x) > 10 || Math.abs(current.y - prev.y) > 10 || prev.x === Infinity || prev.y === Infinity;
};

export function Suggestions({
    suggestions,
    selectSuggestion,
    selectedIndex,
    setSelectedIndex,
    activeInputRef,
    onBlur,
    position,
    ref,
    fixed = false,
}: SuggestionsProps) {
    const mousePosRef = useRef<{ x: number; y: number }>({ x: Infinity, y: Infinity });

    useEffect(() => {
        if (selectedIndex > -1 && ref.current?.children[selectedIndex]) {
            ref.current.children[selectedIndex].scrollIntoView({
                block: 'nearest',
            });
        } else if (selectedIndex !== -1) {
            ref.current?.focus();
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

    const style = position ? { top: `${position.top}px`, left: `${position.left}px`, transform: 'translateY(-100%)' } : {};

    return (
        <m.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={clsx(
                'z-10 ccm-colors p-2 rounded-md ccm-transition',
                fixed ? 'fixed w-[320px] -mt-2 ccm-border' : 'w-full'
            )}
            style={style}
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
                        className={clsx('ccm-colors cursor-pointer flex items-center p-1', {
                            'group-focus:invert group-not-focus:bg-light-gray': selectedIndex === index,
                        })}
                        onClick={() => selectSuggestion(suggestion)}
                        onMouseEnter={(evt) => {
                            evt.preventDefault();
                            const hasMouseMoved = hasMouseMovedSignificantly(mousePosRef.current, {
                                x: evt.clientX,
                                y: evt.clientY,
                            });

                            // if the focus element isn't an input, set the selected index
                            if (document.activeElement !== activeInputRef.current && hasMouseMoved) {
                                console.log('setting selected index', index);
                                setSelectedIndex(index);
                            }
                            mousePosRef.current = { x: evt.clientX, y: evt.clientY };
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

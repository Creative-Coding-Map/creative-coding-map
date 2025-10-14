/* eslint-disable no-shadow */
import { memo, useCallback, useEffect, useMemo, useState } from 'react';
import clsx from 'clsx';
import { atom, useAtom } from 'jotai';
import { VariableSizeList as List } from 'react-window';
import useResizeObserver from 'use-resize-observer';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { AnimatePresence } from 'motion/react';
import * as m from 'motion/react-m';
import { NodeData } from '../modules/node-data';
import type { CCMNode } from '@/types/ccmap';
import { CCMNodeType } from '@/types/ccmap';
import Breakdowns from '@/components/symbols/Breakdowns';
import Tags from '@/components/symbols/Tags';
import Tools from '@/components/symbols/Tools';
import Techniques from '@/components/symbols/Techniques';
import { databaseAtom } from '@/state/model';
import { updateArray } from '@/lib/utils';
import Tooltip, { TooltipProvider } from '@/components/tooltip';
import { fetchCCMData } from '@/modules/map/fetch-data';
import { store } from '@/state/store';
import { useEmitter } from '@/hooks/useEmitter';
import { useIsMobile } from '@/hooks/useIsMobile';

type IndexNode = CCMNode & { category: string; description: string };

type ColumnItem = { type: 'header'; letter: string } | { type: 'node'; node: IndexNode };

interface ListCellProps {
    index: number;
    style: React.CSSProperties;
    data: ColumnItem[];
    isLastColumn: boolean;
}

const asyncDatabase = atom(async (get) => {
    const database = get(databaseAtom);

    if (!database.initialized) {
        console.log('fetching CCMData');
        await fetchCCMData();
    }

    console.log('database initialized', database.initialized);

    return database;
});

export default function IndexView() {
    const [database] = useAtom(asyncDatabase, { store });
    const [filters, setFilters] = useState<CCMNodeType[]>([]);

    // IMPORTANT: dataByLetter only runs once on mount, so it doesn't need to be optimized
    const dataByLetter = useMemo(() => {
        const data = database.values;

        const map = new Map<string, IndexNode[]>();

        for (const node of data) {
            if (![CCMNodeType.Tag, CCMNodeType.Tool, CCMNodeType.Technique, CCMNodeType.Breakdown].includes(node.type)) {
                continue;
            }
            const letter = node.id[0].toUpperCase();
            if (!map.has(letter)) {
                map.set(letter, []);
            }
            map.get(letter)?.push({
                ...node,
                category: node.tags ? node.tags[0] : '',
                description: node.description || '',
            });
        }

        return Array.from(map.entries());
    }, [database]);

    return (
        <main id="index-view" className="w-full h-screen relative ccm-pt ccm-px overflow-hidden ccm-colors">
            <section className={clsx('w-full h-full ccm-filters', addActiveFilters(filters))}>
                <section className="md:pt-[80px] ml-auto z-10 relative ccm-transition">
                    <ul className="flex flex-col gap-0.5 type-hint">
                        <li className={clsx('ccm-transition', CCMNodeType.Tag)}>
                            <button
                                onClick={(evt) => {
                                    evt.preventDefault();
                                    setFilters(updateArray(CCMNodeType.Tag));
                                }}
                                className="btn flex items-center gap-2"
                            >
                                <Tags className="ccm-icon" /> <span>TAGS</span>
                            </button>
                        </li>
                        <li className={clsx('ccm-transition', CCMNodeType.Tool)}>
                            <button
                                onClick={(evt) => {
                                    evt.preventDefault();
                                    setFilters(updateArray(CCMNodeType.Tool));
                                }}
                                className="btn flex items-center gap-2"
                            >
                                <Tools className="ccm-icon" /> <span>TOOLS</span>
                            </button>
                        </li>
                        <li className={clsx('ccm-transition', CCMNodeType.Technique)}>
                            <button
                                onClick={() => setFilters(updateArray(CCMNodeType.Technique))}
                                className="btn flex items-center gap-2"
                            >
                                <Techniques className="ccm-icon" /> <span>TECHNIQUES</span>
                            </button>
                        </li>
                        <li className={clsx('ccm-transition', CCMNodeType.Breakdown)}>
                            <button
                                onClick={(evt) => {
                                    evt.preventDefault();
                                    setFilters(updateArray(CCMNodeType.Breakdown));
                                }}
                                className="btn flex items-center gap-2"
                            >
                                <Breakdowns className="ccm-icon" /> <span>BREAKDOWNS</span>
                            </button>
                        </li>
                    </ul>
                </section>
                <AnimatePresence propagate>
                    {dataByLetter.length > 0 && (
                        <m.article
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.5 }}
                            className="flex w-full h-full pb-20"
                        >
                            <IndexColumns dataByLetter={dataByLetter} />
                        </m.article>
                    )}
                </AnimatePresence>
            </section>
        </main>
    );
}

const IndexColumns = memo(function IndexColumns({ dataByLetter }: { dataByLetter: [string, IndexNode[]][] }) {
    const { ref, width } = useResizeObserver();

    const { columns, columnWidth, maxHeight } = useMemo(() => {
        if (!width) return { columns: [], columnWidth: 0, columnsHeights: [], maxHeight: 0 };

        // Calculate number of columns based on width
        const minColumnWidth = 280;
        const gutter = 16;
        const columnCount = Math.max(1, Math.min(6, Math.floor(width / minColumnWidth)));

        // Keep letters in alphabetical order
        const sortedDataByLetter = [...dataByLetter].sort(([a], [b]) => a.localeCompare(b));

        // Initialize columns
        const columns: ColumnItem[][] = Array.from({ length: columnCount }, () => []);

        // Calculate target height per column for balanced distribution
        const totalHeight = sortedDataByLetter.reduce((acc, [letter, nodes]) => {
            return acc + getItemSize({ type: 'header', letter }) + nodes.length * getItemSize({ type: 'node', node: nodes[0] });
        }, 0);
        const targetHeightPerColumn = totalHeight / columnCount;

        // Distribute letters across columns with height-based balancing
        let columnIndex = 0;
        let currentColumnHeight = 0;

        for (const [letter, nodes] of sortedDataByLetter) {
            // Calculate height of this letter group
            const groupHeight =
                getItemSize({ type: 'header', letter }) + nodes.length * getItemSize({ type: 'node', node: nodes[0] });

            // If adding this group would exceed target and we're not on the last column,
            // and the current column isn't empty, move to next column
            if (
                currentColumnHeight + groupHeight > targetHeightPerColumn * 1.1 &&
                columnIndex < columnCount - 1 &&
                columns[columnIndex].length > 0
            ) {
                columnIndex++;
                currentColumnHeight = 0;
            }

            // Add letter header
            columns[columnIndex].push({ type: 'header', letter });
            currentColumnHeight += getItemSize({ type: 'header', letter });

            // Add all nodes for this letter
            for (const node of nodes) {
                columns[columnIndex].push({ type: 'node', node });
                currentColumnHeight += getItemSize({ type: 'node', node });
            }
        }

        // Helper function to calculate column height
        const getColumnHeight = (col: ColumnItem[]) => col.reduce((acc, item) => acc + getItemSize(item), 0);

        // Fine-tuning pass: move letter groups between adjacent columns for better balance
        for (let iteration = 0; iteration < 5; iteration++) {
            const columnHeights = columns.map(getColumnHeight);
            const maxHeight = Math.max(...columnHeights);
            const minHeight = Math.min(...columnHeights);

            // If columns are reasonably balanced, we're done
            if (maxHeight - minHeight < targetHeightPerColumn * 0.25) break;

            let moved = false;

            // Try to move letters between adjacent columns to balance height
            for (let colIndex = 0; colIndex < columns.length - 1; colIndex++) {
                const currentColumn = columns[colIndex];
                const nextColumn = columns[colIndex + 1];
                const currentHeight = columnHeights[colIndex];
                const nextHeight = columnHeights[colIndex + 1];

                // If current column is significantly heavier, try to move last group to next column
                if (currentHeight > nextHeight + 50) {
                    // Find the last letter group
                    let lastGroupStart = currentColumn.length - 1;
                    while (lastGroupStart > 0 && currentColumn[lastGroupStart].type !== 'header') {
                        lastGroupStart--;
                    }

                    // Check if there's at least one other group in the column
                    let hasEarlierGroup = false;
                    for (let i = 0; i < lastGroupStart; i++) {
                        if (currentColumn[i].type === 'header') {
                            hasEarlierGroup = true;
                            break;
                        }
                    }

                    if (hasEarlierGroup && lastGroupStart < currentColumn.length) {
                        // Calculate the height of the group we're about to move
                        const groupHeight = currentColumn.slice(lastGroupStart).reduce((acc, item) => acc + getItemSize(item), 0);

                        // Only move if it improves balance
                        const newCurrentHeight = currentHeight - groupHeight;
                        const newNextHeight = nextHeight + groupHeight;
                        const currentImbalance = Math.abs(currentHeight - nextHeight);
                        const newImbalance = Math.abs(newCurrentHeight - newNextHeight);

                        if (newImbalance < currentImbalance) {
                            const groupItems = currentColumn.splice(lastGroupStart);
                            nextColumn.unshift(...groupItems);
                            columnHeights[colIndex] = newCurrentHeight;
                            columnHeights[colIndex + 1] = newNextHeight;
                            moved = true;
                        }
                    }
                }
            }

            // If no moves were made, we're done
            if (!moved) break;
        }

        const columnWidth = Math.floor((width - gutter * (columns.length - 1)) / columns.length);
        const columnsHeights = columns.map((col) => col.reduce((acc, item) => acc + getItemSize(item), 0));

        const maxHeight = Math.max(...columnsHeights) + 100;

        return { columns, columnWidth, columnsHeights, maxHeight };
    }, [dataByLetter, width]);

    return (
        <TooltipProvider scrollContainerId="index-view-container">
            <div
                id="index-view-container"
                ref={ref}
                className="flex flex-auto gap-x-4 w-full h-full pb-10 pr-1 my-8 overflow-y-auto ccm-scrollbar"
            >
                {width && width > 0
                    ? columns.map((columnItems, columnIndex) => (
                          <List
                              key={columnIndex}
                              className="hide-scrollbar"
                              height={maxHeight}
                              itemCount={columnItems.length}
                              itemSize={(index) => getItemSize(columnItems[index])}
                              itemData={columnItems}
                              width={columnWidth}
                          >
                              {(props) => <ListCell {...props} isLastColumn={columnIndex === columns.length - 1} />}
                          </List>
                      ))
                    : null}
            </div>
        </TooltipProvider>
    );
});

function getItemSize(item: ColumnItem): number {
    if (item.type === 'header') {
        return 72; // Double the node height for headers
    }

    return 22; // Base height for nodes
}

const ListCell = memo(function ListCell({ index, style, data, isLastColumn }: ListCellProps) {
    const item = data[index];

    if (item.type === 'header') {
        return (
            <div style={style} className="py-2">
                <p className="type-filter uppercase border-b-2 border-gray-200 pb-4 w-full font-bold">{item.letter}</p>
            </div>
        );
    }

    // item.type === 'node'
    return (
        <div style={style} className="overflow-hidden md:overflow-visible">
            <NodeListItem node={item.node} isLastColumn={isLastColumn} />
        </div>
    );
});

const NodeListItem = memo(function NodeListItem({ node, isLastColumn }: { node: IndexNode; isLastColumn: boolean }) {
    const { emitter } = useEmitter();
    const [showContent, setShowContent] = useState(false);
    const { isMobile } = useIsMobile();

    const onShowContent = useCallback(() => {
        const element = document.getElementById('index-view-container');

        if (element) {
            if (element.dataset.details === node.id) {
                element.removeAttribute('data-details');
                setShowContent(false);
            } else {
                if (element.dataset.details) {
                    emitter.emit('app:index:close-tooltip', element.dataset.details);
                }
                element.dataset.details = node.id;
                setShowContent(true);
            }
        }
    }, [node.id, setShowContent]);

    useEffect(() => {
        if (showContent) {
            emitter.once('app:index:close-tooltip', (id: string) => id === node.id).then(() => setShowContent(false));
        }
    }, [node.id, showContent]);

    return (
        <div
            key={node.id}
            className={clsx('flex relative items-center gap-2 group ccm-transition', node.type)}
            role="button"
            onClick={onShowContent}
        >
            <span className="w-4 flex-shrink-0 ccm-icon">{renderIcon(node.type)}</span>
            <Tooltip
                className="type-filter cursor-pointer pointer-events-auto"
                forceShow={showContent}
                onClose={() => setShowContent(false)}
                onlyShowOnClick
                scrollContainerId="index-view-container"
                align={isMobile ? 'center' : isLastColumn ? 'start' : 'end'}
                message={
                    <div className="flex flex-col gap-1">
                        <p className="flex items-center gap-1 type-filter">
                            {node.name} ({node.type.toUpperCase()})
                        </p>
                        <Link
                            href={`/?focusNode=${node.id}`}
                            className="type-hint flex items-center gap-1 text-xs border-b border-transparent hover:border-black ccm-transition w-fit"
                        >
                            SHOW IT ON THE MAP <ArrowRight className="size-3" />
                        </Link>
                        <p className="type-body mb-2 line-clamp-3 text-xs mt-2">{node.description}</p>
                        <div className="space-y-1">
                            <NodeData node={node} prop="tags" />
                            <NodeData node={node} prop="dependsOn" />
                            <NodeData node={node} prop="supports" />
                            <NodeData node={node} prop="references" />
                        </div>
                    </div>
                }
            >
                <span className={clsx('ellipsis text-sm hover:underline hover:font-bold', showContent && 'font-bold underline')}>
                    {node.id}
                </span>
            </Tooltip>
            <span className="hidden group-[.show-content]:block group-[.show-content]:font-bold ellipsis type-filter text-sm">
                {node.id}
            </span>
            {node.category && (
                <span className={clsx('ml-auto type-hint ellipsis category text-xs opacity-60')}>[{node.category}]</span>
            )}
        </div>
    );
});

function addActiveFilters(filters: CCMNodeType[]) {
    if (filters.length === 0) {
        return 'filter-tag filter-tool filter-technique filter-breakdown';
    }
    return filters.map((f) => `filter-${f}`).join(' ');
}

function renderIcon(type: CCMNodeType) {
    switch (type) {
        case CCMNodeType.Tag:
            return <Tags />;
        case CCMNodeType.Tool:
            return <Tools />;
        case CCMNodeType.Technique:
            return <Techniques />;
        case CCMNodeType.Breakdown:
            return <Breakdowns />;
        default:
            return null;
    }
}

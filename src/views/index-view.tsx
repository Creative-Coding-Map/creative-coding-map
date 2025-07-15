import { memo, useMemo, useState } from 'react';
import clsx from 'clsx';
import { faker } from '@faker-js/faker';
import { atom, useAtom } from 'jotai';
import { NodeData } from '../modules/node-data';
import type { CCMNode } from '@/types/ccmap';
import { CCMNodeType } from '@/types/ccmap';
import Breakdowns from '@/components/symbols/Breakdowns';
import Tags from '@/components/symbols/Tags';
import Tools from '@/components/symbols/Tools';
import Techniques from '@/components/symbols/Techniques';
import { databaseAtom } from '@/state/model';
import { pick, updateArray } from '@/lib/utils';
import Tooltip from '@/components/tooltip';
import { fetchCCMData } from '@/modules/map/fetch-data';
import { store } from '@/state/store';
import { Details, DetailsProvider } from '@/components/Details';

type IndexNode = CCMNode & { category: string; description: string };

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
                category: node.tags ? pick(node.tags) : pick(['application', 'tools', 'framework', 'libraries', 'language']),
                description: faker.lorem.paragraph(),
            });
        }
        return Array.from(map.entries());
    }, [database]);

    // console.log('Entries:', dataByLetter.flatMap(([_, nodes]) => nodes).length);
    console.log('IndexView render');

    return (
        <main id="index-view" className="w-full h-screen relative ccm-pt ccm-px overflow-y-auto">
            <section className={clsx('w-full h-full ccm-filters', addActiveFilters(filters))}>
                <section className="pt-[80px] ml-auto z-10 relative ccm-colors transition-all duration-300">
                    <ul className="flex flex-col gap-0.5 type-hint">
                        <li className={clsx(CCMNodeType.Tag)}>
                            <button
                                onClick={(evt) => {
                                    evt.preventDefault();
                                    setFilters(updateArray(CCMNodeType.Tag));
                                }}
                                className="btn flex items-center gap-2"
                            >
                                <Tags /> <span>TAGS</span>
                            </button>
                        </li>
                        <li className={clsx(CCMNodeType.Tool)}>
                            <button
                                onClick={(evt) => {
                                    evt.preventDefault();
                                    setFilters(updateArray(CCMNodeType.Tool));
                                }}
                                className="btn flex items-center gap-2"
                            >
                                <Tools /> <span>TOOLS</span>
                            </button>
                        </li>
                        <li className={clsx(CCMNodeType.Technique)}>
                            <button
                                onClick={() => setFilters(updateArray(CCMNodeType.Technique))}
                                className="btn flex items-center gap-2"
                            >
                                <Techniques /> <span>TECHNIQUES</span>
                            </button>
                        </li>
                        <li className={clsx(CCMNodeType.Breakdown)}>
                            <button
                                onClick={(evt) => {
                                    evt.preventDefault();
                                    setFilters(updateArray(CCMNodeType.Breakdown));
                                }}
                                className="btn flex items-center gap-2"
                            >
                                <Breakdowns /> <span>BREAKDOWNS</span>
                            </button>
                        </li>
                    </ul>
                </section>
                <RenderLetterCollection data={dataByLetter} />
            </section>
        </main>
    );
}

function addActiveFilters(filters: CCMNodeType[]) {
    if (filters.length === 0) {
        return 'filter-tag filter-tool filter-technique filter-breakdown';
    }
    return filters.map((f) => `filter-${f}`).join(' ');
}

const RenderLetterCollection = memo(function RenderLetterCollection({ data }: { data: [string, IndexNode[]][] }) {
    console.log('RenderLetterCollection', data[0]);

    return (
        <section className="mosaic mt-8">
            <DetailsProvider>
                {data.map(([letter, nodes]) => (
                    <div key={letter} className="mosaic-item">
                        <p className="type-filter uppercase border-b-2 border-gray-200 pb-4 w-full">{letter}</p>
                        <ul className="flex flex-col gap-0.5 mt-6">
                            {nodes.map((node) => {
                                return <NodeListItem key={node.id} node={node} />;
                            })}
                        </ul>
                    </div>
                ))}
            </DetailsProvider>
        </section>
    );
});

const NodeListItem = memo(function NodeListItem({ node }: { node: IndexNode }) {
    return (
        <li key={node.id}>
            <Details.Root id={node.id} context="index-view">
                <Details.Summary className={clsx('flex items-center gap-2 ccm-transition', node.type)}>
                    <span className="w-4">{renderIcon(node.type)}</span>{' '}
                    <Tooltip
                        className="type-filter cursor-pointer group-[.show-content]:hidden"
                        message={<span className="type-hint">{node.description}</span>}
                    >
                        <span className="group-open:font-bold ellipsis">{node.id}</span>
                    </Tooltip>
                    <span className="hidden group-[.show-content]:block group-[.show-content]:font-bold ellipsis type-filter">
                        {node.id}
                    </span>
                    <span className={clsx('ml-auto type-hint ellipsis category')}>[{node.category}]</span>
                </Details.Summary>
                <Details.Content className="flex flex-col gap-2 pl-6 pb-5 ">
                    <p className="type-hint flex items-center gap-1">NODE SELECTED ({node.type.toUpperCase()})</p>
                    <p className="type-body mb-4 line-clamp-4">{node.description}</p>
                    <NodeData node={node} prop="tags" />
                    <NodeData node={node} prop="dependsOn" />
                    <NodeData node={node} prop="supports" />
                    <NodeData node={node} prop="references" />
                </Details.Content>
            </Details.Root>
        </li>
    );
});

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

import clsx from 'clsx';
import { useState } from 'react';
import * as m from 'motion/react-m';
import { ChevronRight } from 'lucide-react';
import { useAtomValue, useSetAtom } from 'jotai';
import { AnimatePresence } from 'motion/react';
import { VIEW_CONFIGURATIONS } from './map/data';
import type { CCMDomainModes } from '@/types/ccmap';
import Breakdowns from '@/components/symbols/Breakdowns';
import Tags from '@/components/symbols/Tags';
import Techniques from '@/components/symbols/Techniques';
import Tools from '@/components/symbols/Tools';
import { domainAtom, filtersAtom, setDomainAtom, toggleFilterAtom } from '@/state/model';
import { store } from '@/state/store';

const viewConfigVariants = {
    open: {
        transition: { staggerChildren: 0.07, delayChildren: 0.2 },
    },
    closed: {
        transition: { staggerChildren: 0.05, staggerDirection: -1 },
    },
};

const itemVariants = {
    open: {
        opacity: 1,
        transition: { duration: 0.2 },
    },
    closed: {
        opacity: 0,
        transition: { duration: 0.2 },
    },
};

const SHAPE_CLASSNAME = 'flex items-center gap-2 cursor-pointer uppercase';
const FILTER_CLASSNAME = 'text-gray ccm-transition-colors';

const DOMAIN_LEGEND: Record<CCMDomainModes, string> = {
    ['domain']: 'Domain mode',
    ['frameworks']: 'Frameworks',
    ['use-cases']: 'Use cases',
};
const DOMAIN_MODES: CCMDomainModes[] = ['domain', 'frameworks', 'use-cases'];

export function LegendOverlay() {
    const selectedDomain = useAtomValue(domainAtom, { store });
    const setSelectedDomain = useSetAtom(setDomainAtom, { store });
    const [showOtherDomains, setShowOtherDomains] = useState<boolean>(false);
    const filters = useAtomValue(filtersAtom, { store });
    const toggleFilter = useSetAtom(toggleFilterAtom, { store });

    const isTagFilter = filters.some((f) => f.id === 'tags' && f.type === 'shape');
    const isToolFilter = filters.some((f) => f.id === 'tools' && f.type === 'shape');
    const isTechniqueFilter = filters.some((f) => f.id === 'techniques' && f.type === 'shape');
    const isBreakdownFilter = filters.some((f) => f.id === 'breakdowns' && f.type === 'shape');

    return (
        <aside className="z-10 absolute ccm-px top-1/5 flex flex-col type-hint gap-0.5">
            <h4 className="text-gray">SHAPE</h4>
            <ul className="flex flex-col gap-0.5">
                <li className={clsx(SHAPE_CLASSNAME)} role="button" onClick={() => toggleFilter({ id: 'tags', type: 'shape' })}>
                    <Tags className="ccm-icon" />{' '}
                    <span className={clsx(isTagFilter ? FILTER_CLASSNAME : 'ccm-colors-fg')}>TAGS</span>
                </li>
                <li className={clsx(SHAPE_CLASSNAME)} role="button" onClick={() => toggleFilter({ id: 'tools', type: 'shape' })}>
                    <Tools className="ccm-icon" />{' '}
                    <span className={clsx(isToolFilter ? FILTER_CLASSNAME : 'ccm-colors-fg')}>TOOLS</span>
                </li>
                <li
                    className={clsx(SHAPE_CLASSNAME)}
                    role="button"
                    onClick={() => toggleFilter({ id: 'techniques', type: 'shape' })}
                >
                    <Techniques className="ccm-icon" />{' '}
                    <span className={clsx(isTechniqueFilter ? FILTER_CLASSNAME : 'ccm-colors-fg')}>TECHNIQUES</span>
                </li>
                <li
                    className={clsx(SHAPE_CLASSNAME)}
                    role="button"
                    onClick={() => toggleFilter({ id: 'breakdowns', type: 'shape' })}
                >
                    <Breakdowns className="ccm-icon" />{' '}
                    <span className={clsx(isBreakdownFilter ? FILTER_CLASSNAME : 'ccm-colors-fg')}>BREAKDOWNS</span>
                </li>
            </ul>
            <div className="flex flex-col gap-2 mt-4 w-40">
                <AnimatePresence>
                    <div
                        className={clsx(SHAPE_CLASSNAME, 'ccm-colors-fg')}
                        onClick={() => {
                            setShowOtherDomains(!showOtherDomains);
                        }}
                    >
                        {selectedDomain}
                        <ChevronRight className={clsx('size-4 ccm-transition ccm-colors-fg', showOtherDomains && 'rotate-90')} />
                        {/* {showOtherDomains ? <ChevronDown className="size-4" /> : } */}
                    </div>
                </AnimatePresence>
                <AnimatePresence mode="wait" propagate>
                    {showOtherDomains && (
                        <m.ul
                            className="flex flex-col pointer-events-auto relative gap-2"
                            initial="closed"
                            animate="open"
                            exit="closed"
                            variants={viewConfigVariants}
                        >
                            {DOMAIN_MODES.map((domain, index) => {
                                if (domain === selectedDomain) return null;

                                return (
                                    <m.li
                                        key={domain}
                                        className={clsx(
                                            'flex items-center cursor-pointer uppercase text-gray hover:text-black ccm-invert',
                                            // selectedDomain !== domain && 'bg-white',
                                            index === DOMAIN_MODES.length - 1 && ''
                                        )}
                                        onClick={() => {
                                            setShowOtherDomains(false);
                                            setTimeout(() => {
                                                setSelectedDomain(domain);
                                            }, 200);
                                        }}
                                        variants={itemVariants}
                                    >
                                        {DOMAIN_LEGEND[domain]}
                                    </m.li>
                                );
                            })}
                        </m.ul>
                    )}
                    {!showOtherDomains && (
                        <m.ul
                            key={selectedDomain}
                            className="flex flex-col gap-1"
                            initial="closed"
                            animate="open"
                            exit="closed"
                            variants={viewConfigVariants}
                        >
                            {VIEW_CONFIGURATIONS.filter((view) => view.name.includes(DOMAIN_LEGEND[selectedDomain]))
                                .flatMap((view) => view.domainSets)
                                .map((domain) => {
                                    const color = domain.color;
                                    let nodeId = '';
                                    if (selectedDomain === 'domain') {
                                        nodeId = `domain:${domain.name}`;
                                    } else if (selectedDomain === 'frameworks') {
                                        const node = domain.nodes[0];
                                        nodeId = node.id;
                                    }
                                    const isDomainFilter = filters.some((f) => f.id === nodeId && f.type === 'node');
                                    return (
                                        <m.li
                                            key={domain.name}
                                            role="button"
                                            onClick={(evt) => {
                                                evt.preventDefault();

                                                if (nodeId) {
                                                    toggleFilter({ id: nodeId, type: 'node' });
                                                }
                                            }}
                                            variants={itemVariants}
                                            className="flex items-center gap-2 cursor-pointer"
                                        >
                                            <Tools className={clsx('')} style={{ fill: color }} />{' '}
                                            <span
                                                className={clsx(
                                                    'capitalize',
                                                    isDomainFilter ? FILTER_CLASSNAME : 'ccm-colors-fg'
                                                )}
                                            >
                                                {domain.name}
                                            </span>
                                        </m.li>
                                    );
                                })}
                        </m.ul>
                    )}
                </AnimatePresence>
            </div>
        </aside>
    );
}

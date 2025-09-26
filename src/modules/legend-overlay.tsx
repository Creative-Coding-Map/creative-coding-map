import clsx from 'clsx';
import { useState } from 'react';
import * as m from 'motion/react-m';
import { ChevronRight } from 'lucide-react';
import { useSetAtom } from 'jotai';
import { AnimatePresence } from 'motion/react';
import { VIEW_CONFIGURATIONS } from './map/data';
import Breakdowns from '@/components/symbols/Breakdowns';
import Tags from '@/components/symbols/Tags';
import Techniques from '@/components/symbols/Techniques';
import Tools from '@/components/symbols/Tools';
import { toggleFilterAtom } from '@/state/model';
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

export function LegendOverlay() {
    const [selectedDomain, setSelectedDomain] = useState<string>('Domain mode');
    const [showOtherDomains, setShowOtherDomains] = useState<boolean>(false);
    const toggleFilter = useSetAtom(toggleFilterAtom, { store });
    const domains = ['Domain mode', 'Frameworks', 'Use cases'];
    return (
        <aside className="z-10 absolute ccm-px top-1/5 flex flex-col type-hint gap-0.5">
            <h4 className="text-gray">SHAPE</h4>
            <ul className="flex flex-col gap-0.5 ">
                <li className={SHAPE_CLASSNAME} role="button" onClick={() => toggleFilter({ id: 'tags', type: 'shape' })}>
                    <Tags /> <span>TAGS</span>
                </li>
                <li className={SHAPE_CLASSNAME} role="button" onClick={() => toggleFilter({ id: 'tools', type: 'shape' })}>
                    <Tools /> <span>TOOLS</span>
                </li>
                <li className={SHAPE_CLASSNAME} role="button" onClick={() => toggleFilter({ id: 'techniques', type: 'shape' })}>
                    <Techniques /> <span>TECHNIQUES</span>
                </li>
                <li className={SHAPE_CLASSNAME} role="button" onClick={() => toggleFilter({ id: 'breakdowns', type: 'shape' })}>
                    <Breakdowns /> <span>BREAKDOWNS</span>
                </li>
            </ul>
            <div className="flex flex-col gap-2 mt-4 w-40">
                <AnimatePresence>
                    <div
                        className={SHAPE_CLASSNAME}
                        onClick={() => {
                            setShowOtherDomains(!showOtherDomains);
                        }}
                    >
                        {selectedDomain}
                        <ChevronRight className={clsx('size-4 ccm-transition', showOtherDomains && 'rotate-90')} />
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
                            {domains.map((domain, index) => {
                                if (domain === selectedDomain) return null;

                                return (
                                    <m.li
                                        key={domain}
                                        className={clsx(
                                            'flex items-center cursor-pointer uppercase text-gray hover:text-black transition-colors duration-200',
                                            // selectedDomain !== domain && 'bg-white',
                                            index === domains.length - 1 && ''
                                        )}
                                        onClick={() => {
                                            setShowOtherDomains(false);
                                            setTimeout(() => {
                                                setSelectedDomain(domain);
                                            }, 200);
                                        }}
                                        variants={itemVariants}
                                    >
                                        {domain}
                                    </m.li>
                                );
                            })}
                        </m.ul>
                    )}
                    {selectedDomain && !showOtherDomains && (
                        <m.ul
                            key={selectedDomain}
                            className="flex flex-col gap-1"
                            initial="closed"
                            animate="open"
                            exit="closed"
                            variants={viewConfigVariants}
                        >
                            {VIEW_CONFIGURATIONS.filter((view) => view.name.includes(selectedDomain))
                                .flatMap((view) => view.domainSets)
                                .map((domain) => {
                                    const color = VIEW_CONFIGURATIONS.find((view) =>
                                        view.name.includes(selectedDomain)
                                    )?.colorSets.find((colorSet) => colorSet.name === domain.name)?.color;
                                    const colorClass = color ? `fill-[${color}]` : 'fill-black';
                                    return (
                                        <m.li
                                            key={domain.name}
                                            role="button"
                                            onClick={(evt) => {
                                                evt.preventDefault();
                                                let nodeId = '';
                                                if (selectedDomain === 'Domain mode') {
                                                    nodeId = `domain:${domain.name}`;
                                                } else if (selectedDomain === 'Frameworks') {
                                                    const node = domain.nodes[0];
                                                    nodeId = node.id;
                                                }

                                                if (nodeId) {
                                                    toggleFilter({ id: nodeId, type: 'node' });
                                                }
                                            }}
                                            variants={itemVariants}
                                            className="flex items-center gap-2 cursor-pointer"
                                        >
                                            <Tools className={colorClass} style={{ fill: color }} />{' '}
                                            <span className={clsx(`capitalize`)}>{domain.name}</span>
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

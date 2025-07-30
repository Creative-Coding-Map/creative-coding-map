import clsx from 'clsx';
import { useState } from 'react';
import { AnimatePresence, m } from 'motion/react';
import { ChevronDown } from 'lucide-react';
import { VIEW_CONFIGURATIONS } from './map/data';
import Breakdowns from '@/components/symbols/Breakdowns';
import Tags from '@/components/symbols/Tags';
import Techniques from '@/components/symbols/Techniques';
import Tools from '@/components/symbols/Tools';

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

export function LegendOverlay() {
    const [selectedDomain, setSelectedDomain] = useState<string>('Domain mode');
    const domains = ['Domain mode', 'Frameworks', 'Use cases'];
    return (
        <aside className="z-10 absolute ccm-px top-1/5 flex flex-col type-hint gap-0.5">
            <h4 className="text-gray">SHAPE</h4>
            <ul className="flex flex-col gap-0.5">
                <li className="flex items-center gap-2">
                    <Tags /> <span>TAGS</span>
                </li>
                <li className="flex items-center gap-2">
                    <Tools /> <span>TOOLS</span>
                </li>
                <li className="flex items-center gap-2">
                    <Techniques /> <span>TECHNIQUES</span>
                </li>
                <li className="flex items-center gap-2">
                    <Breakdowns /> <span>BREAKDOWNS</span>
                </li>
            </ul>
            <div className="flex flex-col gap-2 mt-4 w-40">
                <AnimatePresence mode="popLayout" propagate>
                    <ul className="flex flex-col pointer-events-auto relative">
                        {domains.map((domain, index) => (
                            <m.li
                                key={domain}
                                className={clsx(
                                    'flex items-center cursor-pointer uppercase  text-gray p-1 gap-1 ccm-transition',
                                    selectedDomain !== domain && 'bg-white',
                                    index === domains.length - 1 && ''
                                )}
                                onClick={() => setSelectedDomain(domain)}
                            >
                                {domain}
                                {selectedDomain === domain && (
                                    <m.span
                                        initial={{ opacity: 0, scale: 0 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0 }}
                                    >
                                        <ChevronDown className="size-4" />
                                    </m.span>
                                )}
                            </m.li>
                        ))}
                    </ul>
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
                            .map((domain) => (
                                <m.li key={domain.name} variants={itemVariants} className="flex items-center gap-2">
                                    <Tools className="fill-black" /> <span className="capitalize">{domain.name}</span>
                                </m.li>
                            ))}
                    </m.ul>
                </AnimatePresence>
            </div>
        </aside>
    );
}

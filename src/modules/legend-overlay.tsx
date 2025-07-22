import clsx from 'clsx';
import { useMemo, useState } from 'react';
import { AnimatePresence, m } from 'framer-motion';
import { VIEW_CONFIGURATIONS } from './map/data';
import Breakdowns from '@/components/symbols/Breakdowns';
import Tags from '@/components/symbols/Tags';
import Techniques from '@/components/symbols/Techniques';
import Tools from '@/components/symbols/Tools';

function Sep({ className }: { className?: string }) {
    return <span className={clsx('w-px h-4 bg-gray', className)} />;
}

export function LegendOverlay() {
    const [selectedDomain, setSelectedDomain] = useState<string>('Domain mode');

    const domains = useMemo(() => {
        if (selectedDomain === 'Domain mode') return ['Domain mode', 'Frameworks', 'Use cases'];
        if (selectedDomain === 'Frameworks') return ['Frameworks', 'Use cases', 'Domain mode'];
        return ['Use cases', 'Domain mode', 'Frameworks'];
    }, [selectedDomain]);

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
            <div className="flex flex-col gap-1 mt-4">
                <ul className="flex gap-2 pointer-events-auto relative">
                    {domains.map((domain, index) => (
                        <li
                            key={domain}
                            className={clsx(
                                'flex items-center cursor-pointer uppercase',
                                selectedDomain === domain && 'underline',
                                index === domains.length - 1 && ''
                            )}
                            onClick={() => setSelectedDomain(domain)}
                        >
                            {domain}
                        </li>
                    ))}
                    <li className="absolute inset-0 bg-gradient-to-r from-transparent via-10% via-transparent to-70% to-white pointer-events-none" />
                </ul>
                {VIEW_CONFIGURATIONS.filter((view) => view.name.includes(selectedDomain)).map((view) => (
                    <ul key={view.name} className="flex flex-col gap-1">
                        {view.domainSets.map((domain) => (
                            <li key={domain.name} className="flex items-center gap-2">
                                <Tools className="fill-black" /> <span>{domain.name}</span>
                            </li>
                        ))}
                    </ul>
                ))}
            </div>
        </aside>
    );
}

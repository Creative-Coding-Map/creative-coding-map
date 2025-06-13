import * as m from 'motion/react-m';
import Info from '@/components/icons/Info';

export function InfoOverlay() {
    return (
        <m.aside
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="max-w-xl z-10 absolute p-1 left-5 bottom-56 flex flex-col ccm-colors ccm-border rounded-md ccm-transition"
        >
            <div className="w-full flex flex-col">
                <div className="flex justify-between gap-2">
                    <h3 className="type-hint text-gray">SHORTCUTS</h3>
                    <Info className="size-6 ccm-invert" />
                </div>
                <ul className="grid grid-cols-2 gap-x-4 gap-y-2 type-filter">
                    <li>SEARCH BAR</li>
                    <li>Space Bar</li>
                    <li>DOMAINS MODE</li>
                    <li>D</li>
                    <li>FRAMEWORKS MODE</li>
                    <li>F</li>
                    <li>USE CASES MODE</li>
                    <li>C</li>
                    <li>SHORTEST PATH</li>
                    <li>SHIFT + click</li>
                </ul>
            </div>
        </m.aside>
    );
}

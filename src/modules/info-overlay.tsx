import Breakdowns from '@/components/symbols/Breakdowns';
import Tags from '@/components/symbols/Tags';
import Techniques from '@/components/symbols/Techniques';
import Tools from '@/components/symbols/Tools';

export function InfoOverlay() {
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
            <h4 className="mt-4 text-gray">DOMAINS MODE - COLOR</h4>
            <ul className="flex flex-col gap-1">
                <li className="flex items-center gap-2">
                    <Tools className="fill-red" /> <span>GAMES</span>
                </li>
                <li className="flex items-center gap-2">
                    <Tools className="fill-green" /> <span>TOOLS</span>
                </li>
                <li className="flex items-center gap-2">
                    <Tools className="fill-blue" /> <span>GRAPHICS</span>
                </li>
                <li className="flex items-center gap-2">
                    <Tools className="fill-salmon" /> <span>SOFTWARE TECHNOLOGY</span>
                </li>
                <li className="flex items-center gap-2">
                    <Tools /> <span>other</span>
                </li>
            </ul>
        </aside>
    );
}

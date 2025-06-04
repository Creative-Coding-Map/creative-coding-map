import { DarkModeToggle } from '@/components/color-scheme-toggle';
import CreatePath from '@/components/icons/CreatePath';
import Info from '@/components/icons/Info';
import Recenter from '@/components/icons/Recenter';
import ZoomIn from '@/components/icons/ZoomIn';
import ZoomOut from '@/components/icons/ZoomOut';

export function ActionsOverlay() {
    return (
        <aside className="z-10 absolute ccm-px bottom-4 flex flex-col type-hint gap-0.5">
            <ul className="flex flex-col gap-2">
                <li>
                    <CreatePath className="btn ccm-invert" />
                </li>
                <li>
                    <ZoomIn className="btn ccm-invert" />
                </li>
                <li>
                    <ZoomOut className="btn ccm-invert" />
                </li>
                <li>
                    <Recenter className="btn ccm-invert" />
                </li>
                <li>
                    <DarkModeToggle />
                </li>
                <li>
                    <Info className="btn ccm-invert" />
                </li>
            </ul>
        </aside>
    );
}

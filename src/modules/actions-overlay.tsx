import { useAtom } from 'jotai';
import clsx from 'clsx';
import { ActionButton } from '@/components/action-button';
import { DarkModeToggle } from '@/components/color-scheme-toggle';
import CreatePathIcon from '@/components/icons/CreatePath';
import Info from '@/components/icons/Info';
import Recenter from '@/components/icons/Recenter';
import ZoomIn from '@/components/icons/ZoomIn';
import ZoomOut from '@/components/icons/ZoomOut';
import { showCreatePathAtom, showInfoAtom } from '@/state/model';
import { store } from '@/state/store';

export function ActionsOverlay() {
    const [createPath, setCreatePath] = useAtom(showCreatePathAtom, { store });
    const [showInfo, setShowInfo] = useAtom(showInfoAtom, { store });
    return (
        <aside className="z-20 absolute ccm-px bottom-4 flex flex-col type-hint gap-0.5">
            <ul className="flex flex-col gap-2">
                <li>
                    <ActionButton
                        onClick={() => {
                            setCreatePath(!createPath);
                        }}
                        className={clsx(createPath && 'invert')}
                        label="Create a path"
                    >
                        <CreatePathIcon className={clsx('size-6 ccm-invert')} />
                    </ActionButton>
                </li>
                <li>
                    <ActionButton onClick={() => {}} label="Zoom in">
                        <ZoomIn className="size-6 ccm-invert" />
                    </ActionButton>
                </li>
                <li>
                    <ActionButton onClick={() => {}} label="Zoom out">
                        <ZoomOut className="size-6 ccm-invert" />
                    </ActionButton>
                </li>
                <li>
                    <ActionButton onClick={() => {}} label="Recenter">
                        <Recenter className="size-6 ccm-invert" />
                    </ActionButton>
                </li>
                <li>
                    <DarkModeToggle />
                </li>
                <li>
                    <ActionButton
                        onClick={() => {
                            setShowInfo(!showInfo);
                        }}
                        className={clsx(showInfo && 'invert')}
                        label="Info"
                    >
                        <Info className="size-6 ccm-invert" />
                    </ActionButton>
                </li>
            </ul>
        </aside>
    );
}

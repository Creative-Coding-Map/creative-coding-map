import { useAtom } from 'jotai';
import clsx from 'clsx';
import { ActionButton } from '@/components/action-button';
import { DarkModeToggle } from '@/components/color-scheme-toggle';
import CreatePathIcon from '@/components/icons/CreatePath';
import Recenter from '@/components/icons/Recenter';
import ZoomIn from '@/components/icons/ZoomIn';
import ZoomOut from '@/components/icons/ZoomOut';
import { showCreatePathAtom } from '@/state/model';
import { store } from '@/state/store';
import { useEmitter } from '@/hooks/useEmitter';

export function ActionsOverlay() {
    const [createPath, setCreatePath] = useAtom(showCreatePathAtom, { store });
    const { emitter } = useEmitter();

    return (
        <aside className="z-20 absolute ccm-px bottom-4 flex flex-col type-hint gap-0.5">
            <ul className="flex flex-col gap-2">
                <li className="hidden md:block">
                    <ActionButton
                        onClick={() => {
                            setCreatePath(!createPath);
                        }}
                        className={clsx(createPath && 'invert')}
                        label="Create a path"
                    >
                        <CreatePathIcon className={clsx('size-6 ccm-icon')} />
                    </ActionButton>
                </li>
                <li>
                    <ActionButton
                        onClick={() => {
                            console.log('zoom in');
                            emitter.emit('map:zoom-in');
                        }}
                        label="Zoom in"
                    >
                        <ZoomIn className="size-6 ccm-icon" />
                    </ActionButton>
                </li>
                <li>
                    <ActionButton
                        onClick={() => {
                            emitter.emit('map:zoom-out');
                        }}
                        label="Zoom out"
                    >
                        <ZoomOut className="size-6 ccm-icon" />
                    </ActionButton>
                </li>
                <li>
                    <ActionButton
                        onClick={() => {
                            emitter.emit('map:recenter');
                        }}
                        label="Recenter"
                    >
                        <Recenter className="size-6 ccm-icon" />
                    </ActionButton>
                </li>
                <li>
                    <DarkModeToggle />
                </li>
            </ul>
        </aside>
    );
}

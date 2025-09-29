import { useRef } from 'react';
import clsx from 'clsx';
import { noop } from '@/lib/utils';

export const Shell = ({
    children,
    onOutsideClick = noop,
    className,
}: {
    children: React.ReactNode;
    onOutsideClick?: (evt: React.MouseEvent<HTMLElement>) => void;
    className?: string;
}) => {
    const shellRef = useRef<HTMLDivElement>(null);
    return (
        <section
            ref={shellRef}
            className={clsx('relative h-dvh md:h-screen', className)}
            onMouseDown={(evt) => {
                if (evt.target === shellRef.current) {
                    onOutsideClick(evt);
                }
            }}
        >
            {children}
        </section>
    );
};

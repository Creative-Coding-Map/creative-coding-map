import * as m from 'motion/react-m';
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
        <m.section
            ref={shellRef}
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ duration: 0.5 }}
            className={clsx('relative h-dvh md:h-screen', className)}
            onMouseDown={(evt) => {
                if (evt.target === shellRef.current) {
                    onOutsideClick(evt);
                }
            }}
        >
            {children}
        </m.section>
    );
};

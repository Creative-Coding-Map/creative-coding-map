import { useRef } from 'react';
import clsx from 'clsx';
import { noop } from '@/lib/utils';

export const Shell = ({
    children,
    onOutsideClick = noop,
    className,
}: {
    children: React.ReactNode;
    onOutsideClick?: () => void;
    className?: string;
}) => {
    const shellRef = useRef<HTMLDivElement>(null);
    return (
        <section
            ref={shellRef}
            className={clsx('relative h-full bg-amber-250', className)}
            onClick={(evt) => {
                if (evt.target === shellRef.current) {
                    onOutsideClick();
                }
            }}
        >
            {children}
        </section>
    );
};

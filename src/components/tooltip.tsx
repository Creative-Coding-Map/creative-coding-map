import clsx from 'clsx';
import type { ElementType } from 'react';

export default function Tooltip({
    as: Component = 'div',
    className,
    tooltipClassName,
    message,
    children,
    ...props
}: {
    as?: ElementType;
    className?: string;
    tooltipClassName?: string;
    message: React.ReactNode;
    children: React.ReactNode;
    [key: string]: any;
}) {
    return (
        <Component className={clsx('group/tooltip relative', className)} {...props}>
            {children}
            <div
                className={clsx(
                    'absolute left-full top-4 min-w-max transition-opacity delay-150 duration-300 hidden z-10',
                    'group-hover/tooltip:block opacity-100 starting:group-hover/tooltip:opacity-0',
                    tooltipClassName
                )}
            >
                <div className="flex max-w-xs flex-col items-center ccm-border ccm-rounded ccm-colors p-2">{message}</div>
            </div>
        </Component>
    );
}

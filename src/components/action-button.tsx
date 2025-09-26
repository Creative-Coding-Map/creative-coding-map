import clsx from 'clsx';

export const ActionButton = ({
    children,
    onClick,
    label,
    className,
    borderless = false,
}: {
    children: React.ReactNode;
    onClick: () => void;
    label: string;
    className?: string;
    borderless?: boolean;
}) => {
    return (
        <button
            type="button"
            onClick={(evt) => {
                evt.preventDefault();
                onClick();
            }}
            className={clsx(
                'btn ccm-colors ccm-border flex items-center group overflow-hidden transition-all duration-300',
                borderless ? '' : 'ccm-action',
                className
            )}
        >
            {children}
            <span
                className={clsx(
                    'type-hint uppercase whitespace-nowrap overflow-hidden flex-auto leading-[1em]',
                    'max-w-0 opacity-0',
                    'group-hover:max-w-xs group-hover:opacity-100 group-hover:px-2',
                    'transition-all duration-300 ease-out'
                )}
            >
                {label}
            </span>
        </button>
    );
};

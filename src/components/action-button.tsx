import clsx from 'clsx';

export const ActionButton = ({
    children,
    onClick,
    label,
    className,
}: {
    children: React.ReactNode;
    onClick: () => void;
    label: string;
    className?: string;
}) => {
    return (
        <button
            type="button"
            onClick={(evt) => {
                evt.preventDefault();
                onClick();
            }}
            className={clsx(
                'btn ccm-action ccm-colors flex items-center group overflow-hidden transition-all duration-300',
                className
            )}
        >
            {children}
            <span
                className={clsx(
                    'type-hint uppercase whitespace-nowrap overflow-hidden align-middle',
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

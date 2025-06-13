import clsx from 'clsx';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    ref?: React.RefObject<HTMLInputElement | null>;
}

export function Input({ className, ref, ...props }: InputProps) {
    return <input ref={ref} autoComplete="off" className={clsx('ccm-input', className)} {...props} />;
}

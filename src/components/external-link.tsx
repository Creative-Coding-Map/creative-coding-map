import type { ReactNode } from 'react';

type Props = { url: string; children: ReactNode; className?: string };

export const ExternalLink = ({ url, children, className }: Props): React.ReactNode => {
    return (
        <a href={url} target="_blank" rel="noopener noreferrer" className={className}>
            {children}
        </a>
    );
};

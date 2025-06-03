import type { ReactNode } from 'react';

type Props = { url: string; children: ReactNode };

export const ExternalLink = ({ url, children }: Props): React.ReactNode => {
    return (
        <a href={url} target="_blank" rel="noopener noreferrer">
            {children}
        </a>
    );
};

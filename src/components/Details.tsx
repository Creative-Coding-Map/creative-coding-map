import clsx from 'clsx';
import { createContext, memo, useCallback, useContext, useState } from 'react';
import type { Dispatch, ReactNode, SetStateAction } from 'react';

// Global context to manage which Details is currently open
const DetailsGlobalContext = createContext<{
    openId: string | null;
    setOpenId: Dispatch<SetStateAction<string | null>>;
} | null>(null);

// Local context for individual Details components
const DetailsLocalContext = createContext<{
    id: string;
    showContent: boolean;
    onShowContent: () => void;
} | null>(null);

// Provider for managing global Details state
export function DetailsProvider({ children }: { children: ReactNode }) {
    const [openId, setOpenId] = useState<string | null>(null);

    return <DetailsGlobalContext.Provider value={{ openId, setOpenId }}>{children}</DetailsGlobalContext.Provider>;
}

function DetailsRoot({
    id,
    context,
    children,
    className,
}: {
    id: string;
    context: string;
    children: React.ReactNode;
    className?: string;
}) {
    const [showContent, setShowContent] = useState(false);

    const onShowContent = useCallback(() => {
        const element = document.getElementById(context);

        if (element) {
            if (element.dataset.details === id) {
                element.dataset.details = undefined;
                setShowContent(false);
            } else {
                element.dataset.details = id;
                setShowContent(true);
            }
        }
    }, [context, id]);

    return (
        <DetailsLocalContext.Provider value={{ id, showContent, onShowContent }}>
            <div className={clsx('relative group ccm-transition overflow-visible', showContent && 'show-content', className)}>
                {children}
            </div>
        </DetailsLocalContext.Provider>
    );
}

function DetailsSummary({ children, className }: { children: React.ReactNode; className?: string }) {
    const context = useContext(DetailsLocalContext);

    if (!context) {
        throw new Error('Details.Summary must be used within Details.Root');
    }

    return (
        <div className={clsx('cursor-pointer', className)} role="button" onClick={context.onShowContent}>
            {children}
        </div>
    );
}

const DetailsContent = memo(function DetailsContent({ children, className }: { children: ReactNode; className?: string }) {
    const context = useContext(DetailsLocalContext);

    console.log('DetailsContent', context);

    if (!context) {
        throw new Error('Details.Content must be used within Details.Root');
    }

    if (!context.showContent) {
        return null;
    }

    return <div className={clsx('absolute top-full left-0 w-full bg-white pt-2 z-50', className)}>{children}</div>;
});

export function Details({ children }: { children: React.ReactNode }) {
    return children;
}

Details.Root = DetailsRoot;
Details.Summary = DetailsSummary;
Details.Content = DetailsContent;

import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';

interface RouterContextValue {
    path: string;
    navigate: (to: string) => void;
}

const RouterContext = createContext<RouterContextValue | null>(null);

function getHashPath(): string {
    const hash = window.location.hash;
    // Remove the # and return the path, default to '/'
    return hash.slice(1) || '/';
}

export function Router({ children }: { children: ReactNode }) {
    const [path, setPath] = useState(getHashPath);

    useEffect(() => {
        const handleHashChange = () => {
            setPath(getHashPath());
        };

        window.addEventListener('hashchange', handleHashChange);
        return () => window.removeEventListener('hashchange', handleHashChange);
    }, []);

    const navigate = useCallback((to: string) => {
        window.location.hash = to;
    }, []);

    return <RouterContext.Provider value={{ path, navigate }}>{children}</RouterContext.Provider>;
}

export function useRouter(): RouterContextValue {
    const context = useContext(RouterContext);
    if (!context) {
        throw new Error('useRouter must be used within a Router');
    }
    return context;
}

export function useMatch(pattern: string): boolean {
    const { path } = useRouter();
    return path === pattern;
}

export function useSearchParams(): URLSearchParams {
    const { path } = useRouter();
    const searchString = path.includes('?') ? path.split('?')[1] : '';
    return new URLSearchParams(searchString);
}

interface LinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
    href: string;
    children: ReactNode;
    replace?: boolean;
}

export function Link({ href, children, onClick, ...props }: LinkProps) {
    const { navigate } = useRouter();

    const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
        e.preventDefault();
        navigate(href);
        onClick?.(e);
    };

    return (
        <a href={`#${href}`} onClick={handleClick} {...props}>
            {children}
        </a>
    );
}

interface NavLinkProps extends Omit<LinkProps, 'className'> {
    className?: string | ((props: { isActive: boolean }) => string);
}

export function NavLink({ href, className, children, ...props }: NavLinkProps) {
    const { path } = useRouter();
    const isActive = path === href;

    const computedClassName = typeof className === 'function' ? className({ isActive }) : className;

    return (
        <Link href={href} className={computedClassName} {...props}>
            {children}
        </Link>
    );
}

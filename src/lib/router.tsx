import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';

interface RouterContextValue {
    path: string;
    navigate: (to: string) => void;
    updateParams: (updater: (params: URLSearchParams) => void) => void;
}

const RouterContext = createContext<RouterContextValue | null>(null);

function getHashPath(): string {
    const hash = window.location.hash;
    // Remove the # and return the path, default to '/'
    return hash.slice(1) || '/';
}

function getPathWithoutSearch(path: string): string {
    return path.split('?')[0];
}

function getSearchString(path: string): string {
    const searchIndex = path.indexOf('?');
    return searchIndex >= 0 ? path.slice(searchIndex + 1) : '';
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

    const updateParams = useCallback((updater: (params: URLSearchParams) => void) => {
        const currentPath = getHashPath();
        const pathWithoutSearch = getPathWithoutSearch(currentPath);
        const searchString = getSearchString(currentPath);
        const params = new URLSearchParams(searchString);

        updater(params);

        const newSearch = params.toString();
        const newPath = newSearch ? `${pathWithoutSearch}?${newSearch}` : pathWithoutSearch;
        window.location.hash = newPath;
    }, []);

    return <RouterContext.Provider value={{ path, navigate, updateParams }}>{children}</RouterContext.Provider>;
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

export function useSearchParams(): [URLSearchParams, (updater: (params: URLSearchParams) => void) => void] {
    const { path, updateParams } = useRouter();
    const searchString = path.includes('?') ? path.split('?')[1] : '';
    const searchParams = new URLSearchParams(searchString);
    return [searchParams, updateParams];
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

import config from '@/lib/config';

/**
 * The shared header component.
 */
export default function Header() {
    return (
        <header className="text-center sm:text-left">
            <h1>
                <a href="/">{config.siteName}</a>
            </h1>
            <nav className="flex flex-row gap-4"></nav>
        </header>
    );
}

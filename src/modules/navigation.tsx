import clsx from 'clsx';
import { Link } from 'wouter';

export const Navbar = () => {
    return (
        <nav className="flex justify-between items-start md:items-center absolute top-0 left-0 right-0 ccm-padding">
            <section className="flex items-center gap-4">
                <Link className="type-header z-20 ccm-colors-fg" to="/">
                    Creative Coding Map
                </Link>
            </section>
            <section className="flex flex-col items-end gap-1 md:flex-row md:items-center  md:gap-4">
                <Link
                    className={(active) => clsx('link type-body font-bold z-20 ccm-colors-fg', active && 'active')}
                    href="/index-page"
                >
                    Index
                </Link>
                <Link
                    className={(active) => clsx('link type-body font-bold z-20 ccm-colors-fg', active && 'active')}
                    href="/about"
                >
                    About
                </Link>
                <Link
                    className={(active) => clsx('link type-body font-bold z-20 ccm-colors-fg', active && 'active')}
                    href="/breakdowns"
                >
                    Breakdowns
                </Link>
            </section>
        </nav>
    );
};

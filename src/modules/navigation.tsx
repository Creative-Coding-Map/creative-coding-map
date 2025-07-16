import clsx from 'clsx';
import { Link } from 'wouter';

export const Navbar = () => {
    return (
        <nav className="flex justify-between items-center absolute top-0 left-0 right-0 ccm-padding">
            <section className="flex items-center gap-4">
                <Link className="type-header z-20" to="/">
                    Creative Coding Map
                </Link>
            </section>
            <section className="flex items-center gap-4">
                <Link className={(active) => clsx('link type-header z-20', active && 'active')} href="/index">
                    Index
                </Link>
                <Link className={(active) => clsx('link type-header z-20', active && 'active')} href="/about">
                    About
                </Link>
                <Link className={(active) => clsx('link type-header z-20', active && 'active')} href="/breakdown/test-breakdown">
                    Breakdown
                </Link>
                <button className="link type-header z-20">Search</button>
            </section>
        </nav>
    );
};

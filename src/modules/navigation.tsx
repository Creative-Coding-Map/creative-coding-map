import clsx from 'clsx';
import { Link } from '@tanstack/react-router';

export const Navbar = () => {
    return (
        <nav className="flex justify-between items-center absolute top-0 left-0 right-0 ccm-padding">
            <section className="flex items-center gap-4">
                <Link className="type-header z-10" to="/">
                    Creative Coding Map
                </Link>
            </section>
            <section className="flex items-center gap-4">
                <button className="link type-header z-10">Index</button>
                <Link className="link type-header z-10" to="/about">
                    {({ isActive }) => <span className={clsx(isActive && 'active')}>About</span>}
                </Link>
                <button className="link type-header z-10">Search</button>
            </section>
        </nav>
    );
};

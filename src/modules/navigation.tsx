import clsx from 'clsx';
import { Link, NavLink } from 'react-router-dom';

export const Navbar = () => {
    return (
        <nav className="flex justify-between items-start md:items-center absolute top-0 left-0 right-0 ccm-padding">
            <section className="flex items-center gap-4">
                <Link className="type-header z-20 ccm-colors-fg" to="/">
                    Creative Coding Map
                </Link>
            </section>
            <section className="flex flex-col items-end gap-1 md:flex-row md:items-center  md:gap-4">
                <NavLink
                    className={({ isActive }) =>
                        clsx('link type-body md:type-header font-bold z-20 ccm-colors-fg', isActive && 'active')
                    }
                    to="/index-page"
                >
                    Index
                </NavLink>
                <NavLink
                    className={({ isActive }) =>
                        clsx('link type-body md:type-header font-bold z-20 ccm-colors-fg', isActive && 'active')
                    }
                    to="/about"
                >
                    About
                </NavLink>
                <NavLink
                    className={({ isActive }) =>
                        clsx('link type-body md:type-header font-bold z-20 ccm-colors-fg', isActive && 'active')
                    }
                    to="/breakdowns"
                >
                    Breakdowns
                </NavLink>
            </section>
        </nav>
    );
};

import clsx from 'clsx';
import { useAtom } from 'jotai';
import { Link } from 'wouter';
import { store } from '@/state/store';
import { showSearchAtom } from '@/state/model';

export const Navbar = () => {
    const [showSearch, setShowSearch] = useAtom(showSearchAtom, { store });
    return (
        <nav className="flex justify-between items-center absolute top-0 left-0 right-0 ccm-padding">
            <section className="flex items-center gap-4">
                <Link className="type-header z-20 ccm-colors-fg" to="/">
                    Creative Coding Map
                </Link>
            </section>
            <section className="flex items-center gap-4">
                <Link className={(active) => clsx('link type-header z-20 ccm-colors-fg', active && 'active')} href="/index-page">
                    Index
                </Link>
                <Link className={(active) => clsx('link type-header z-20 ccm-colors-fg', active && 'active')} href="/about">
                    About
                </Link>
                <Link className={(active) => clsx('link type-header z-20 ccm-colors-fg', active && 'active')} href="/breakdowns">
                    Breakdowns
                </Link>
                <button
                    className="link type-header z-20 ccm-colors-fg"
                    onClick={(event) => {
                        event.preventDefault();
                        event.stopPropagation();

                        setShowSearch(!showSearch);
                    }}
                >
                    Search
                </button>
            </section>
        </nav>
    );
};

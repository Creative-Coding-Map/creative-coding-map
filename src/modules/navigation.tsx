import { useAtom } from 'jotai';
import { store } from '@/state/store';
import { showAboutAtom } from '@/state/pages';
import { DarkModeToggle } from '@/components/color-scheme-toggle';

export const Navbar = () => {
    const [showAbout, setShowAbout] = useAtom(showAboutAtom, { store });
    return (
        <nav className="absolute top-0 left-0 right-0 flex justify-between items-center p-4 z-10">
            <section className="flex items-center gap-4">
                <h1 className="type-header">Creative Coding Map</h1>
            </section>
            <section className="flex items-center gap-4">
                <DarkModeToggle />
                <button className="type-header">Index</button>
                <button className="type-header" onClick={() => setShowAbout(!showAbout)}>
                    About
                </button>
                <button className="type-header">Search</button>
            </section>
        </nav>
    );
};

import { useAtomValue } from 'jotai';
import CCMap from '@/modules/map/CCMap';
import { Navbar } from '@/modules/navigation';
import { showAboutAtom } from '@/state/pages';
import { store } from '@/state/store';
import { About } from '@/modules/about';

export default function App() {
    const showAbout = useAtomValue(showAboutAtom, { store });
    return (
        <section className="min-h-screen ccm-grid relative">
            <Navbar />
            {showAbout && <About />}
            <CCMap className="flex" />
        </section>
    );
}




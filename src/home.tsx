import { Suspense } from 'react';
import { Route, useRoute } from 'wouter';

import { AnimatePresence, m } from 'motion/react';
import AboutView from './views/about-view.tsx';

import { Loading } from './components/loading';
import { LegendOverlay } from '@/modules/legend-overlay.tsx';
import CCMap from '@/modules/map/CCMap';
import { ActionsOverlay } from '@/modules/actions-overlay';
import { MapOverlay } from '@/modules/map-overlay';

export default function Home() {
    const [isAboutPage] = useRoute('/about');

    return (
        <section className="flex flex-col w-screen overflow-hidden">
            <LegendOverlay />
            <ActionsOverlay />
            <MapOverlay />
            <Suspense fallback={<Loading />}>
                <CCMap />
            </Suspense>
            <AnimatePresence>
                {isAboutPage && (
                    <m.div
                        initial={{ opacity: 0, x: '100%' }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: '100%' }}
                        transition={{ duration: 0.5 }}
                    >
                        <AboutView />
                    </m.div>
                )}
            </AnimatePresence>
        </section>
    );
}

import { Suspense } from 'react';
import { useRoute } from 'wouter';

import * as m from 'motion/react-m';
import { AnimatePresence } from 'motion/react';

import AboutView from './views/about-view.tsx';

import { Loading } from './components/loading';
import BreakdownsView from './views/breakdowns-view.tsx';
import { LegendOverlay } from '@/modules/legend-overlay.tsx';
import CCMap from '@/modules/map/CCMap';
import { ActionsOverlay } from '@/modules/actions-overlay';
import { MapOverlay } from '@/modules/map-overlay';

export default function Home() {
    const [isAboutPage] = useRoute('/about');
    const [isBreakdownsPage] = useRoute('/breakdowns');
    return (
        <section className="flex flex-col w-screen overflow-hidden">
            <LegendOverlay />
            <ActionsOverlay />
            <MapOverlay />
            <Suspense fallback={<Loading />}>
                <CCMap />
            </Suspense>
            <AnimatePresence mode="wait" propagate>
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
                {isBreakdownsPage && (
                    <m.div
                        initial={{ opacity: 0, x: '100%' }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: '100%' }}
                        transition={{ duration: 0.5 }}
                    >
                        <BreakdownsView />
                    </m.div>
                )}
            </AnimatePresence>
        </section>
    );
}

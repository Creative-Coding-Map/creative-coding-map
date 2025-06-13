import { Suspense } from 'react';
import { Route } from 'wouter';

import { AnimatePresence } from 'motion/react';
import BreakdownView from './views/breakdown-view.tsx';
import AboutView from './views/about-view.tsx';

import { Loading } from './components/loading';
import { LegendOverlay } from '@/modules/legend-overlay.tsx';
import CCMap from '@/modules/map/CCMap';
import { ActionsOverlay } from '@/modules/actions-overlay';
import { MapOverlay } from '@/modules/map-overlay';

export default function Home() {
    return (
        <section className="max-h-screen flex flex-col overflow-hidden">
            <AnimatePresence>
                <LegendOverlay />
                <ActionsOverlay />
                <MapOverlay />
                <Suspense fallback={<Loading />}>
                    <CCMap />
                </Suspense>
                <Route path="/breakdown/:id">{(params) => <BreakdownView id={params.id} />}</Route>
                <Route path="/about" component={AboutView} />
            </AnimatePresence>
        </section>
    );
}

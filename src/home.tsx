import { Suspense } from 'react';
import { Route } from 'wouter';

import AboutView from './views/about-view.tsx';

import { Loading } from './components/loading';
import { LegendOverlay } from '@/modules/legend-overlay.tsx';
import CCMap from '@/modules/map/CCMap';
import { ActionsOverlay } from '@/modules/actions-overlay';
import { MapOverlay } from '@/modules/map-overlay';

export default function Home() {
    return (
        <section className="flex flex-col w-screen overflow-hidden">
            <LegendOverlay />
            <ActionsOverlay />
            <MapOverlay />
            <Suspense fallback={<Loading />}>
                <CCMap />
            </Suspense>
            <Route path="/about" component={AboutView} />
        </section>
    );
}

import { Suspense, lazy, useLayoutEffect, useState } from 'react';
import ReactDOM from 'react-dom/client';
import { useAtomValue, useSetAtom } from 'jotai';
import reportWebVitals from './reportWebVitals.ts';

import { Providers } from './modules/providers.tsx';
import { Loading } from './components/loading.tsx';

import '@/styles/globals.css';
import { Navbar } from './modules/navigation.tsx';
import { databaseAtom, pathEndNodeAtom, pathStartNodeAtom, selectedNodeIdAtom } from './state/model.ts';
import { useEmitter } from './hooks/useEmitter.tsx';
import { useColorScheme } from './hooks/useColorScheme.tsx';
import { useShowMobileOverlay } from './hooks/useShowMobileOverlay.tsx';
import { useSessionStorageWithDefault } from './hooks/useSessionStorage.tsx';
import { Router, useRouter, useSearchParams } from './lib/router.tsx';
import { store } from './state/store.ts';

const IndexView = lazy(() => import('./views/index-view.tsx'));
const Home = lazy(() => import('./home.tsx'));
const MobileOverlay = lazy(() => import('./modules/mobile-overlay.tsx').then((module) => ({ default: module.MobileOverlay })));

const rootElement = document.getElementById('app');

function App() {
    const database = useAtomValue(databaseAtom);
    const [showMobileOverlay, setShowMobileOverlay] = useShowMobileOverlay();
    const setSelectedNodeId = useSetAtom(selectedNodeIdAtom);
    const { emitter } = useEmitter();
    const [searchParams] = useSearchParams();
    const { path } = useRouter();
    // const [isMapInitialized, setIsMapInitialized] = useSessionStorageWithDefault('isMapInitialized', false);
    const [isMapInitialized, setIsMapInitialized] = useState(false);
    const setStartNode = useSetAtom(pathStartNodeAtom);
    const setEndNode = useSetAtom(pathEndNodeAtom);

    useColorScheme();

    const focusNodeParam = searchParams.get('focusNode');
    const nodeParam = searchParams.get('node');
    const pathParam = searchParams.get('path');

    console.log('isMapInitialized', isMapInitialized);

    useLayoutEffect(() => {
        if (isMapInitialized) return;

        function onMapInitialized() {
            setIsMapInitialized(true);
        }

        emitter.on('map:initialized', onMapInitialized);

        return () => {
            emitter.off('map:initialized', onMapInitialized);
        };
    }, [emitter, setSelectedNodeId, focusNodeParam, isMapInitialized, setIsMapInitialized]);

    useLayoutEffect(() => {
        if (!isMapInitialized || !nodeParam) return;

        setSelectedNodeId(nodeParam);
        emitter.emit('app:selected-node:changed', nodeParam);
    }, [nodeParam, isMapInitialized, setSelectedNodeId, emitter, database]);

    useLayoutEffect(() => {
        if (!isMapInitialized || !focusNodeParam) return;

        setSelectedNodeId(focusNodeParam);

        setTimeout(() => {
            emitter.emit('app:selected-node:focus', focusNodeParam);
        }, 500);
    }, [focusNodeParam, emitter, isMapInitialized, setSelectedNodeId, database]);

    useLayoutEffect(() => {
        if (!isMapInitialized || !pathParam) return;

        const [start, end] = pathParam.split(':');
        const startNode = database.getNode(start);
        const endNode = database.getNode(end);
        if (!startNode || !endNode) return;

        const startPathNode = store.get(pathStartNodeAtom);
        const endPathNode = store.get(pathEndNodeAtom);

        if (startPathNode && endPathNode) return;

        setStartNode(startNode);
        setEndNode(endNode);

        emitter.emit('app:shortest-path:create');
    }, [pathParam, database, emitter, isMapInitialized, setStartNode, setEndNode]);

    return (
        <main className="w-full h-dvh max-h-dvh overflow-hidden relative antialiased ccm-colors">
            {showMobileOverlay && <MobileOverlay setShowMobileOverlay={setShowMobileOverlay} />}
            <Navbar />
            <Suspense fallback={<Loading />}>{path === '/index-page' ? <IndexView /> : <Home />}</Suspense>
        </main>
    );
}

if (rootElement && !rootElement.innerHTML) {
    const root = ReactDOM.createRoot(rootElement);
    root.render(
        <Router>
            <Providers>
                <App />
            </Providers>
        </Router>
    );
}

reportWebVitals();

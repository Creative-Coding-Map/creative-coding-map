import { Suspense, lazy, useLayoutEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { useSetAtom } from 'jotai';
import reportWebVitals from './reportWebVitals.ts';

import { Providers } from './modules/providers.tsx';
import { Loading } from './components/loading.tsx';

import '@/styles/globals.css';
import { Navbar } from './modules/navigation.tsx';
import { selectedNodeIdAtom } from './state/model.ts';
import { useEmitter } from './hooks/useEmitter.tsx';
import { useColorScheme } from './hooks/useColorScheme.tsx';
import { useShowMobileOverlay } from './hooks/useShowMobileOverlay.tsx';
import { useSessionStorage } from './hooks/useSessionStorage.tsx';
import { Router, useRouter, useSearchParams } from './lib/router.tsx';
import Home from './home.tsx';

const IndexView = lazy(() => import('./views/index-view.tsx'));
const MobileOverlay = lazy(() => import('./modules/mobile-overlay.tsx').then((module) => ({ default: module.MobileOverlay })));

const rootElement = document.getElementById('app');

function App() {
    const [showMobileOverlay, setShowMobileOverlay] = useShowMobileOverlay();
    const setSelectedNodeId = useSetAtom(selectedNodeIdAtom);
    const { emitter } = useEmitter();
    const searchParams = useSearchParams();
    const { path } = useRouter();
    const [isMapInitialized, setIsMapInitialized] = useSessionStorage('isMapInitialized');
    useColorScheme();

    console.log('isMapInitialized', isMapInitialized);

    const focusNodeParam = searchParams.get('focusNode');
    const nodeParam = searchParams.get('node');

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
        if (!isMapInitialized && !nodeParam) return;

        setSelectedNodeId(nodeParam);
        emitter.emit('app:selected-node:changed', nodeParam);
    }, [nodeParam, isMapInitialized, setSelectedNodeId, emitter]);

    useLayoutEffect(() => {
        if (!isMapInitialized && !focusNodeParam) return;

        if (focusNodeParam) {
            setSelectedNodeId(focusNodeParam);
            emitter.emit('app:selected-node:focus', focusNodeParam);
        }
    }, [focusNodeParam, emitter, isMapInitialized, setSelectedNodeId]);

    return (
        <main className="w-full h-dvh max-h-dvh overflow-hidden relative antialiased ccm-colors">
            {showMobileOverlay && <MobileOverlay setShowMobileOverlay={setShowMobileOverlay} />}
            <Navbar />
            {path === '/index-page' ? (
                <Suspense fallback={<Loading />}>
                    <IndexView />
                </Suspense>
            ) : (
                <Home />
            )}
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

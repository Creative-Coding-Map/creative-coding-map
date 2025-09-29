import { Suspense, lazy, useLayoutEffect, useState } from 'react';
import ReactDOM from 'react-dom/client';
import { Route, Switch, useSearchParams } from 'wouter';
import { useSetAtom } from 'jotai';
import reportWebVitals from './reportWebVitals.ts';

import { Providers } from './modules/providers.tsx';
import { Loading } from './components/loading.tsx';

import '@/styles/globals.css';
import { Navbar } from './modules/navigation.tsx';
import { selectedNodeIdAtom } from './state/model.ts';
import { useEmitter } from './hooks/useEmitter.tsx';
import { useColorScheme } from './hooks/useColorScheme.tsx';

const IndexView = lazy(() => import('./views/index-view.tsx'));
const Home = lazy(() => import('./home.tsx'));

const rootElement = document.getElementById('app');

function App() {
    const setSelectedNodeId = useSetAtom(selectedNodeIdAtom);
    const { emitter } = useEmitter();
    const [params] = useSearchParams();
    const [isMapInitialized, setIsMapInitialized] = useState(false);
    useColorScheme();

    const focusNodeParam = params.get('focusNode');
    const nodeParam = params.get('node');

    useLayoutEffect(() => {
        if (isMapInitialized) return;

        function onMapInitialized() {
            setIsMapInitialized(true);
        }

        emitter.on('map:initialized', onMapInitialized);

        return () => {
            emitter.off('map:initialized', onMapInitialized);
            setIsMapInitialized(false);
        };
    }, [emitter, setSelectedNodeId, focusNodeParam, isMapInitialized]);

    useLayoutEffect(() => {
        if (!isMapInitialized && !nodeParam) return;

        setSelectedNodeId(nodeParam);
        emitter.emit('app:selected-node:changed', nodeParam);
    }, [nodeParam, isMapInitialized]);

    useLayoutEffect(() => {
        if (!isMapInitialized && !focusNodeParam) return;

        if (focusNodeParam) {
            setSelectedNodeId(focusNodeParam);
            emitter.emit('app:selected-node:focus', focusNodeParam);
        }
    }, [focusNodeParam, emitter, isMapInitialized]);

    return (
        <main className="w-full h-dvh max-h-dvh overflow-hidden relative antialiased ccm-colors">
            <Navbar />
            <Switch>
                <Route path="/index-page">
                    <Suspense fallback={<Loading />}>
                        <IndexView />
                    </Suspense>
                </Route>
                <Route path="/" component={Home} nest />
            </Switch>
        </main>
    );
}

if (rootElement && !rootElement.innerHTML) {
    const root = ReactDOM.createRoot(rootElement);
    root.render(
        <Providers>
            <App />
        </Providers>
    );
}

reportWebVitals();

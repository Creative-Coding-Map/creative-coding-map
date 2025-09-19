import { StrictMode, Suspense, lazy, useEffect, useLayoutEffect, useState } from 'react';
import ReactDOM from 'react-dom/client';
import { Route, Switch, useSearchParams } from 'wouter';
import { useSetAtom } from 'jotai';
import throttle from 'just-throttle';
import reportWebVitals from './reportWebVitals.ts';

import { Providers } from './modules/providers.tsx';
import { Loading } from './components/loading.tsx';

import '@/styles/globals.css';
import { Navbar } from './modules/navigation.tsx';
import { selectedNodeIdAtom, showSearchAtom } from './state/model.ts';
import { store } from './state/store.ts';
import { useEmitter } from './hooks/useEmitter.tsx';
import { ESCAPE_KEY, SPACE_KEY } from './state/constants.ts';

const IndexView = lazy(() => import('./views/index-view.tsx'));
const Home = lazy(() => import('./home.tsx'));

const rootElement = document.getElementById('app');

function App() {
    const setSelectedNodeId = useSetAtom(selectedNodeIdAtom);
    const { emitter } = useEmitter();
    const [params] = useSearchParams();
    const [isMapInitialized, setIsMapInitialized] = useState(false);

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

    useLayoutEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === SPACE_KEY) {
                if (event.target instanceof HTMLInputElement) return;

                event.preventDefault();
                event.stopPropagation();

                const showSearch = store.get(showSearchAtom);
                store.set(showSearchAtom, !showSearch);
            }

            if (event.key === ESCAPE_KEY) {
                const isTargetSuggestions = (event.target as HTMLElement).id === 'suggestions';

                if (!isTargetSuggestions) {
                    const showSearch = store.get(showSearchAtom);

                    if (showSearch) {
                        event.preventDefault();
                        event.stopPropagation();
                        emitter.emit('app:suggestions:reset');

                        store.set(showSearchAtom, false);
                    }
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);

        const resizeObserver = new ResizeObserver(() => {
            throttle(
                () => {
                    emitter.emit('map:resize');
                },
                300,
                { leading: true, trailing: false }
            );
        });

        const onCanvasClick = (event: MouseEvent) => {
            const showSearch = store.get(showSearchAtom);
            if (showSearch && event.target instanceof HTMLCanvasElement) {
                event.preventDefault();
                event.stopPropagation();
                store.set(showSearchAtom, false);
            }
        };

        window.addEventListener('click', onCanvasClick);

        resizeObserver.observe(document.body);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('click', onCanvasClick);
            resizeObserver.disconnect();
        };
    }, []);

    return (
        <main className="w-full h-screen max-h-screen overflow-hidden relative antialiased">
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

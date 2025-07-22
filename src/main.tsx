import { StrictMode, Suspense, lazy, useEffect, useLayoutEffect, useState } from 'react';
import ReactDOM from 'react-dom/client';
import { Route, Switch, useSearchParams } from 'wouter';
import { useSetAtom } from 'jotai';
import reportWebVitals from './reportWebVitals.ts';

import { Providers } from './modules/providers.tsx';
import { Loading } from './components/loading.tsx';

import '@/styles/globals.css';
import { Navbar } from './modules/navigation.tsx';
import { selectedNodeIdAtom, showSearchAtom } from './state/model.ts';
import { store } from './state/store.ts';
import { useEmitter } from './hooks/useEmitter.tsx';

const IndexView = lazy(() => import('./views/index-view.tsx'));
const Home = lazy(() => import('./home.tsx'));

const rootElement = document.getElementById('app');

function App() {
    const setSelectedNodeId = useSetAtom(selectedNodeIdAtom);
    const { emitter } = useEmitter();
    const [params] = useSearchParams();
    const [isMapInitialized, setIsMapInitialized] = useState(false);

    useEffect(() => {
        emitter.once('map:initialized').then(() => {
            const focusNode = params.get('focusNode');

            if (focusNode) {
                setSelectedNodeId(focusNode);
                emitter.emit('app:selected-node:focus', focusNode);
            }

            setIsMapInitialized(true);
        });
    }, [emitter, setSelectedNodeId]);

    useEffect(() => {
        if (!isMapInitialized) return;

        const node = params.get('node');

        if (node) {
            setSelectedNodeId(node);
        }

        console.log('main.tsx set selectedNodeId', node);
    }, [params, setSelectedNodeId, emitter, isMapInitialized]);

    useLayoutEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === ' ') {
                if (event.target instanceof HTMLInputElement) return;

                event.preventDefault();
                event.stopPropagation();

                const showSearch = store.get(showSearchAtom);
                store.set(showSearchAtom, !showSearch);
            }

            if (event.key === 'Escape') {
                const showSearch = store.get(showSearchAtom);

                if (showSearch) {
                    event.preventDefault();
                    event.stopPropagation();
                    store.set(showSearchAtom, false);
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
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
        <StrictMode>
            <Providers>
                <App />
            </Providers>
        </StrictMode>
    );
}

reportWebVitals();

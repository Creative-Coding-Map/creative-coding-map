import { StrictMode, Suspense, lazy, useEffect, useLayoutEffect } from 'react';
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

const IndexView = lazy(() => import('./views/index-view.tsx'));
const Home = lazy(() => import('./home.tsx'));

const rootElement = document.getElementById('app');

function App() {
    const setSelectedNodeId = useSetAtom(selectedNodeIdAtom);
    const [params] = useSearchParams();

    useEffect(() => {
        const node = params.get('node');

        if (node) {
            setSelectedNodeId(node);
        }
    }, [params, setSelectedNodeId]);

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
                <Route path="/index">
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

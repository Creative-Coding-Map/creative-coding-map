import { StrictMode, Suspense, lazy, useLayoutEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { Route, Switch } from 'wouter';
import reportWebVitals from './reportWebVitals.ts';

import { Providers } from './modules/providers.tsx';
import { Loading } from './components/loading.tsx';

import '@/styles/globals.css';
import { Navbar } from './modules/navigation.tsx';
import { showSearchAtom } from './state/model.ts';
import { store } from './state/store.ts';

const IndexView = lazy(() => import('./views/index-view.tsx'));
const Home = lazy(() => import('./home.tsx'));

const rootElement = document.getElementById('app');

function App() {
    useLayoutEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === ' ') {
                if (event.target instanceof HTMLInputElement) return;

                event.preventDefault();
                event.stopPropagation();

                const showSearch = store.get(showSearchAtom);
                store.set(showSearchAtom, !showSearch);
            }
        };

        window.addEventListener('keydown', handleKeyDown);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, []);

    return (
        <main className="w-full h-screen relative antialiased">
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

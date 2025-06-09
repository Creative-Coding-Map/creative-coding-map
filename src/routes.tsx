import { Outlet, createRootRoute, createRoute } from '@tanstack/react-router';
import App from './App';

export const RootRoute = createRootRoute({
    component: () => (
        <>
            <Outlet />
            {/* <TanStackRouterDevtools initialIsOpen={false} position="top-left" /> */}
        </>
    ),
});

export const HomeRoute = createRoute({
    getParentRoute: () => RootRoute,
    path: '/',
    component: App,
});

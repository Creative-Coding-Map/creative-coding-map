'use client';

import { Provider } from 'jotai';
import type { ReactNode } from 'react';
import { store } from '@/state/store';
import { IsMobileProvider } from '@/hooks/useIsMobile';

export function Providers({ children }: { children: ReactNode }) {
    // const theme = getLocalStorage<'light' | 'dark'>('theme');
    // const prefersDark = useMedia('(prefers-color-scheme: dark)');
    // const isDark = useMemo(() => theme === 'dark' || prefersDark, [theme, prefersDark]);

    return (
        <Provider store={store}>
            <IsMobileProvider>{children}</IsMobileProvider>
        </Provider>
    );
}

'use client';

import { Provider } from 'jotai';
import { LazyMotion, domAnimation } from 'motion/react';
import type { ReactNode } from 'react';
import { store } from '@/state/store';
import { IsMobileProvider } from '@/hooks/useIsMobile';

export function Providers({ children }: { children: ReactNode }) {
    return (
        <Provider store={store}>
            <IsMobileProvider>
                <LazyMotion features={domAnimation}>{children}</LazyMotion>
            </IsMobileProvider>
        </Provider>
    );
}

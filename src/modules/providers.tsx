'use client';

import { Provider } from 'jotai';
import { LazyMotion, domAnimation } from 'motion/react';
import type { ReactNode } from 'react';
import { store } from '@/state/store';

export function Providers({ children }: { children: ReactNode }) {
    return (
        <Provider store={store}>
            <LazyMotion features={domAnimation}>{children}</LazyMotion>
        </Provider>
    );
}

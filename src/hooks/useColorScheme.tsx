'use client';

import { useEffect, useLayoutEffect, useMemo } from 'react';
import { useLocalStorage } from './useLocalStorage';
import { useMedia } from './useMedia';
import { useEmitter } from './useEmitter';

export function useColorScheme() {
    const [colorScheme, setColorScheme] = useLocalStorage<'light' | 'dark'>('theme');
    const systemPrefersDark = useMedia('(prefers-color-scheme: dark)');
    const { emitter } = useEmitter();

    const isDarkMode = useMemo(
        () => (colorScheme === undefined ? !!systemPrefersDark : colorScheme === 'dark'),
        [colorScheme, systemPrefersDark]
    );

    useLayoutEffect(() => {
        document.documentElement.dataset.theme = colorScheme;
        emitter.emit('app:theme:changed', colorScheme ?? 'light');
    }, [colorScheme]);

    useEffect(() => {
        // document.documentElement.classList.toggle('dunkle', isDarkMode);
        document.documentElement.dataset.theme = isDarkMode ? 'dark' : 'light';
        emitter.emit('app:theme:changed', isDarkMode ? 'dark' : 'light');
    }, [isDarkMode]);

    return {
        colorScheme,
        toggleColorScheme: () => setColorScheme(colorScheme === 'dark' ? 'light' : 'dark'),
    };
}

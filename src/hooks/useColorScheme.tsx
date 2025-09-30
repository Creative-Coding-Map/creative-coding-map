'use client';

import { useLayoutEffect, useMemo } from 'react';
import { useLocalStorage } from './useLocalStorage';
import { useEmitter } from './useEmitter';

export function useColorScheme() {
    const [colorScheme, setColorScheme] = useLocalStorage<'light' | 'dark'>('theme');
    const systemPrefersDark = typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches;
    const { emitter } = useEmitter();

    const isDarkMode = useMemo(() => {
        if (colorScheme === undefined) {
            return !!systemPrefersDark;
        }
        return colorScheme === 'dark';
    }, [colorScheme, systemPrefersDark]);

    useLayoutEffect(() => {
        document.documentElement.dataset.theme = isDarkMode ? 'dark' : 'light';
        emitter.emit('app:theme:changed', isDarkMode ? 'dark' : 'light');
    }, [isDarkMode]);

    return {
        colorScheme,
        toggleColorScheme: () => setColorScheme(isDarkMode ? 'light' : 'dark'),
    };
}

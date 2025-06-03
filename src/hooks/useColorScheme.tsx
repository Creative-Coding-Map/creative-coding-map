'use client';

import { useEffect, useMemo } from 'react';
import { useLocalStorage } from './useLocalStorage';
import { useMedia } from './useMedia';

export function useColorScheme() {
    const [colorScheme, setColorScheme] = useLocalStorage('theme');
    const systemPrefersDark = useMedia('(prefers-color-scheme: dark)', colorScheme === 'dark');

    const value = useMemo(() => (colorScheme === undefined ? !!systemPrefersDark : colorScheme === 'dark'), [colorScheme, systemPrefersDark]);

    useEffect(() => {
        console.log('useColorScheme', value);
        document.documentElement.dataset.theme = value ? 'dark' : 'light';
    }, [value]);

    return {
        colorScheme,
        toggleColorScheme: () => setColorScheme(colorScheme === 'dark' ? 'light' : 'dark'),
    };
}

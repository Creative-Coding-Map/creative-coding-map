'use client';

import { useEffect, useMemo } from 'react';
import { useLocalStorage } from './useLocalStorage';
import { useMedia } from './useMedia';

export function useColorScheme() {
    const [colorScheme, setColorScheme] = useLocalStorage('theme');
    const systemPrefersDark = useMedia('(prefers-color-scheme: dark)');

    const isDarkMode = useMemo(
        () => (colorScheme === undefined ? !!systemPrefersDark : colorScheme === 'dark'),
        [colorScheme, systemPrefersDark]
    );

    useEffect(() => {
        // document.documentElement.classList.toggle('dunkle', isDarkMode);
        document.documentElement.dataset.theme = isDarkMode ? 'dark' : 'light';
    }, [isDarkMode]);

    return {
        colorScheme,
        toggleColorScheme: () => setColorScheme(colorScheme === 'dark' ? 'light' : 'dark'),
    };
}

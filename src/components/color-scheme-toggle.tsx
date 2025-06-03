'use client';

import clsx from 'clsx';
import { useColorScheme } from '@/hooks/useColorScheme';
import ThemeToggle from '@/components/icons/ThemeToggle';

export const DarkModeToggle = () => {
    const { colorScheme, toggleColorScheme } = useColorScheme();
    return (
        <button type="button" onClick={toggleColorScheme} className={clsx('cursor-pointer ccm-rounded p-1.5')}>
            {colorScheme === 'dark' ? <ThemeToggle className="w-6 h-6 dark:invert" /> : <ThemeToggle className="w-6 h-6" />}
        </button>
    );
};

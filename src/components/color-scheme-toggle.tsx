'use client';

import clsx from 'clsx';
import { useColorScheme } from '@/hooks/useColorScheme';
import ThemeToggle from '@/components/icons/ThemeToggle';

export const DarkModeToggle = () => {
    const { toggleColorScheme } = useColorScheme();
    return (
        <button type="button" onClick={toggleColorScheme} className={clsx('btn ccm-invert ccm-rounded')}>
            <ThemeToggle />
        </button>
    );
};

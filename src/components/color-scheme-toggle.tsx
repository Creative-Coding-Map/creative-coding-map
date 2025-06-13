'use client';

import { ActionButton } from './action-button';
import { useColorScheme } from '@/hooks/useColorScheme';
import ThemeToggle from '@/components/icons/ThemeToggle';

export const DarkModeToggle = () => {
    const { toggleColorScheme } = useColorScheme();
    return (
        <ActionButton onClick={toggleColorScheme} label="dark theme">
            <ThemeToggle className="size-6 z-10 ccm-invert" />
        </ActionButton>
    );
};

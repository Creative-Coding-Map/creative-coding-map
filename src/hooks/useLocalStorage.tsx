'use client';

import { useEffect, useState } from 'react';
import type { Dispatch, SetStateAction } from 'react';

export function getLocalStorageOrDefault<T>(key: string, defaultValue: T): T {
    if (typeof window === 'undefined') return defaultValue;

    const stored = window.localStorage.getItem(key);

    if (!stored) {
        return defaultValue;
    }

    return JSON.parse(stored);
}

export function getLocalStorage<T>(key: string): T | undefined {
    if (typeof window === 'undefined') return undefined;

    const stored = window.localStorage.getItem(key);

    if (!stored) {
        return undefined;
    }

    return JSON.parse(stored);
}

export function saveLocalStorage<T>(key: string, value: T): void {
    if (typeof window === 'undefined') return;

    window.localStorage.setItem(key, JSON.stringify(value));
}

export function removeFromLocalStorage(key: string): void {
    if (typeof window === 'undefined') return;

    window.localStorage.removeItem(key);
}

export function useLocalStorageWithDefault<T>(key: string, defaultValue: T): [T, Dispatch<SetStateAction<T>>] {
    const [value, setValue] = useState<T>(getLocalStorageOrDefault(key, defaultValue));

    useEffect(() => {
        saveLocalStorage(key, value);
    }, [key, value]);

    return [value, setValue];
}

export function useLocalStorage<T>(key: string): [T | undefined, Dispatch<SetStateAction<T | undefined>>] {
    const [value, setValue] = useState<T | undefined>(getLocalStorage(key));

    useEffect(() => {
        if (value !== undefined) {
            saveLocalStorage(key, value);
        } else {
            removeFromLocalStorage(key);
        }
    }, [key, value]);

    return [value, setValue];
}

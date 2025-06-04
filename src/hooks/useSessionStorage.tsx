'use client';

import { useEffect, useState } from 'react';
import type { Dispatch, SetStateAction } from 'react';

export function getSessionStorageOrDefault<T>(key: string, defaultValue: T): T {
    if (typeof window === 'undefined') return defaultValue;

    const stored = window.sessionStorage.getItem(key);

    if (!stored) {
        return defaultValue;
    }

    return JSON.parse(stored);
}

export function getSessionStorage<T>(key: string): T | undefined {
    if (typeof window === 'undefined') return undefined;

    const stored = window.sessionStorage.getItem(key);

    if (!stored) {
        return undefined;
    }

    return JSON.parse(stored);
}

export function saveSessionStorage<T>(key: string, value: T): void {
    if (typeof window === 'undefined') return;

    window.sessionStorage.setItem(key, JSON.stringify(value));
}

export function removeFromSessionStorage(key: string): void {
    if (typeof window === 'undefined') return;

    window.sessionStorage.removeItem(key);
}

export function useSessionStorageWithDefault<T>(key: string, defaultValue: T): [T, Dispatch<SetStateAction<T>>] {
    const [value, setValue] = useState<T>(getSessionStorageOrDefault(key, defaultValue));

    useEffect(() => {
        saveSessionStorage(key, value);
    }, [key, value]);

    return [value, setValue];
}

export function useSessionStorage<T>(key: string): [T | undefined, Dispatch<SetStateAction<T | undefined>>] {
    const [value, setValue] = useState<T | undefined>(getSessionStorage(key));

    useEffect(() => {
        if (value !== undefined) {
            saveSessionStorage(key, value);
        } else {
            removeFromSessionStorage(key);
        }
    }, [key, value]);

    return [value, setValue];
}

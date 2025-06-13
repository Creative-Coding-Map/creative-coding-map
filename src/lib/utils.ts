import type { SetStateAction } from 'react';

export const noop = () => ({});

// eslint-disable-next-line @typescript-eslint/naming-convention
export const updateArray = <T, K extends T>(item: K): SetStateAction<T[]> => {
    return (prev: T[]): T[] => {
        if (prev.includes(item)) {
            return prev.filter((f) => f !== item);
        }
        return [...prev, item];
    };
};

export const pick = <T>(collection: T[]): T => {
    return collection[Math.floor(Math.random() * collection.length)];
};

import { atom } from 'jotai';

export const showAboutAtom = atom(false);
export const showDetailsContentAtom = atom<string | null>(null);

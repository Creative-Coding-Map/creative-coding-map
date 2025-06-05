import { atom } from 'jotai';
import { Database } from './database';
import type { CCMNode } from '@/types/ccmap';

export const databaseAtom = atom<Database>(new Database());

export const selectedNodeIdAtom = atom<string | undefined>('Processing');

export const selectedNodeAtom = atom<CCMNode | undefined>((get) => {
    const db = get(databaseAtom);
    const id = get(selectedNodeIdAtom);
    return id ? db.getNode(id) : undefined;
});

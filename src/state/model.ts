import { atom } from 'jotai';
import { Database } from './database';
import type { CCMNode } from '@/types/ccmap';

export const databaseAtom = atom<Database>(new Database());

export const selectedNodeIdAtom = atom<string | null>(null);

export const selectedNodeAtom = atom<CCMNode | null>((get) => {
    const db = get(databaseAtom);
    const id = get(selectedNodeIdAtom);
    return id ? (db.getNode(id) ?? null) : null;
});

export const showInfoAtom = atom<boolean>(false);
export const showCreatePathAtom = atom<boolean>(false);
export const showPathAtom = atom<boolean>(false);

export const pathStartNodeAtom = atom<CCMNode | null>(null);
export const pathEndNodeAtom = atom<CCMNode | null>(null);
export const shortestPathNodesAtom = atom<CCMNode[]>([]);

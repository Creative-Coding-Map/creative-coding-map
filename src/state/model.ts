import { atom } from 'jotai';
import { Database } from './database';
import type { CCMDomainModes, CCMFilter, CCMNode } from '@/types/ccmap';
import { emitter } from '@/hooks/useEmitter';

export const databaseAtom = atom<Database>(new Database());

export const selectedNodeIdAtom = atom(null as string | null, (_, set, newNodeId: string | null) => {
    set(selectedNodeIdAtom, newNodeId);
});

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

export const domainAtom = atom<CCMDomainModes>('domain');
export const setDomainAtom = atom(null, (_, set, domain: CCMDomainModes) => {
    set(domainAtom, domain);
    emitter.emit('app:domain:changed', domain);
});

export const filtersAtom = atom<CCMFilter[]>([]);

// Write-only atom to toggle filters: add if missing, remove if present
export const toggleFilterAtom = atom(null, (get, set, filter: CCMFilter) => {
    const currentFilters = get(filtersAtom);
    const exists = currentFilters.some((f) => f.id === filter.id && f.type === filter.type);
    const nextFilters = exists
        ? currentFilters.filter((f) => !(f.id === filter.id && f.type === filter.type))
        : [...currentFilters, filter];

    set(filtersAtom, nextFilters);
    emitter.emit('app:filters:changed', nextFilters);
});

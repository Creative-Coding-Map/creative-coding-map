import { createStore } from 'jotai';
import { databaseAtom, pathEndNodeAtom, pathStartNodeAtom, shortestPathNodesAtom } from './model';
import { emitter } from '@/hooks/useMitt';

export const store = createStore();

emitter.on('app:shortest-path:create', () => {
    const startNode = store.get(pathStartNodeAtom);
    const endNode = store.get(pathEndNodeAtom);

    if (!startNode || !endNode) {
        return;
    }

    emitter.emit('map:path-ends:changed', { start: startNode.id, end: endNode.id });
});

emitter.on('map:shortest-path:changed', (shortestPath: Array<Array<string>>) => {
    console.log('shortest path changed', shortestPath);
    const database = store.get(databaseAtom);
    const head = shortestPath[0];
    const path = head.map((nodeId) => database.getNode(nodeId)).filter((node) => node != null);

    store.set(shortestPathNodesAtom, path);
});

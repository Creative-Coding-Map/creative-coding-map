import { createStore } from 'jotai';
import { databaseAtom, pathEndNodeAtom, pathStartNodeAtom, shortestPathNodesAtom } from './model';
import { emitter } from '@/hooks/useMitt';

export const store = createStore();

emitter.on('shortest-path:create', () => {
    const database = store.get(databaseAtom);
    const startNode = store.get(pathStartNodeAtom);
    const endNode = store.get(pathEndNodeAtom);

    if (!startNode || !endNode) {
        return;
    }

    // get 3 to 5 random nodes from the database
    const randomNodes = database.values.sort(() => Math.random() - 0.5).slice(0, 3);

    // get the shortest path between the start and end nodes
    store.set(shortestPathNodesAtom, [startNode, ...randomNodes, endNode]);
});

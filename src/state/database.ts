import type { CCMNode } from '@/types/ccmap';

export class Database {
    #data: Map<string, CCMNode>;
    #initialized: boolean;

    constructor() {
        this.#data = new Map();
        this.#initialized = false;
    }

    init(data: Map<string, CCMNode>) {
        if (this.#initialized) {
            console.log('%c[Database]: already initialized', 'color: green');
            return;
        }

        this.#data = data;
        this.#initialized = true;
        // log in orange
        console.log('%c[Database]: initialized', 'color: orange');
    }

    getNode(id: string): CCMNode | undefined {
        return this.#data.get(id);
    }
}

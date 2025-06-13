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

    get initialized(): boolean {
        return this.#initialized;
    }

    get values(): CCMNode[] {
        return Array.from(this.#data.values()).sort((a, b) => a.id.localeCompare(b.id));
    }

    get nodeIds(): string[] {
        return Array.from(this.#data.keys()).sort();
    }

    getNode(id: string): CCMNode | undefined {
        return this.#data.get(id);
    }
}

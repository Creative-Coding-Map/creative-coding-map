import { faker } from '@faker-js/faker';
import type { CCMBreakdown, CCMNode } from '@/types/ccmap';

function createBreakdown(id: string): CCMBreakdown {
    return {
        id,
        title: faker.book.title(),
        tags: [faker.word.noun(), faker.word.noun()],
        useCases: [faker.word.noun(), faker.word.noun()],
        addedBy: faker.person.fullName(),
        language: faker.word.noun(),
        createdAt: faker.date.past().toISOString(),
        updatedAt: faker.date.past().toISOString(),
        country: faker.location.country(),
        media: [{ type: 'image', url: `https://picsum.photos/seed/${id}/800/600`, caption: faker.lorem.sentence() }],
        description: faker.lorem.paragraphs(8),
    };
}

export class Database {
    #data: Map<string, CCMNode>;
    #breakdowns: Map<string, CCMBreakdown[]>;
    #initialized: boolean;

    constructor() {
        this.#data = new Map();
        this.#breakdowns = new Map();
        this.#initialized = false;
    }

    init(data: Map<string, CCMNode>) {
        if (this.#initialized) {
            console.log('%c[Database]: already initialized', 'color: green');
            return;
        }

        this.#data = data;
        this.#breakdowns.set('OPENRNDR', [
            createBreakdown(faker.string.uuid()),
            createBreakdown(faker.string.uuid()),
            createBreakdown(faker.string.uuid()),
        ]);
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

    getBreakdowns(id: string): CCMBreakdown[] {
        return this.#breakdowns.get(id) || [];
    }
}

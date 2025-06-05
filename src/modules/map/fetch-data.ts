import * as d3 from 'd3';
import type { CCMData, CCMNode } from '@/types/ccmap';
import { CCMNodeType } from '@/types/ccmap';
import { TECHNIQUES_URL, TOOLS_URL } from '@/state/constants';
import { store } from '@/state/store';
import { databaseAtom } from '@/state/model';
import { Database } from '@/state/database';
/**
 * Fetches data related to tools, techniques, and tags from specified URLs and processes it.
 *
 * @return {Promise<CCMData>} A promise that resolves to an object containing:
 *   - `tools`: An array of tool entries sorted alphabetically by their keys.
 *   - `techniques`: An array of technique entries sorted alphabetically by their keys.
 *   - `tags`: A sorted array of unique tags extracted from tools and techniques.
 */
export async function fetchCCMData(): Promise<CCMData> {
    try {
        const tools = ((await d3.json(TOOLS_URL)) as { tools: Record<string, CCMNode> }).tools;
        const techniques = ((await d3.json(TECHNIQUES_URL)) as { techniques: Record<string, CCMNode> }).techniques;

        const data = new Map<string, CCMNode>();
        const toolsArray = [];
        const techniquesArray = [];

        for (const [id, tool] of Object.entries(tools).sort((a, b) => a[0].localeCompare(b[0]))) {
            const toolNode = {
                ...tool,
                id,
                type: CCMNodeType.Tool,
            };
            if (data.has(id)) {
                console.log('%c[fetchCCMData] duplicate id', 'color: red', id);
            }
            toolsArray.push(toolNode);

            data.set(id, toolNode);
        }

        for (const [id, technique] of Object.entries(techniques).sort((a, b) => a[0].localeCompare(b[0]))) {
            const techniqueNode = {
                ...technique,
                id,
                type: CCMNodeType.Technique,
            };
            if (data.has(id)) {
                console.log('%c[fetchCCMData] duplicate id', 'color: red', id);
            }
            techniquesArray.push(techniqueNode);
            data.set(id, techniqueNode);
        }

        const tagsArray = [...new Set(toolsArray.concat(techniquesArray).flatMap((it) => it.tags || []))].sort();

        for (const tag of tagsArray) {
            if (data.has(tag)) {
                console.log('%c[fetchCCMData] duplicate id', 'color: red', tag);
            }
            data.set(tag, {
                id: tag,
                name: tag,
                type: CCMNodeType.Tag,
            });
        }

        const database = new Database();
        database.init(data);
        store.set(databaseAtom, database);

        const ccmData: CCMData = {
            tools: toolsArray.map((tool) => [tool.id, tool]),
            techniques: techniquesArray.map((technique) => [technique.id, technique]),
            tags: tagsArray,
        };

        return ccmData;
    } catch (error) {
        console.error('Error fetching CCM data:', error);
        throw error;
    }
}

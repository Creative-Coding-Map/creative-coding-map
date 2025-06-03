import * as d3 from 'd3';
import type { CCMData, CCMNode } from '@/types/ccmap';
import { TECHNIQUES_URL, TOOLS_URL } from '@/state/constants';


interface CCMRawData {
    tools: { [key: string]: CCMNode };
    techniques: { [key: string]: CCMNode };
}

/**
 * Fetches data related to tools, techniques, and tags from specified URLs and processes it.
 *
 * @return {Promise<CCMData>} A promise that resolves to an object containing:
 *   - `tools`: An array of tool entries sorted alphabetically by their keys.
 *   - `techniques`: An array of technique entries sorted alphabetically by their keys.
 *   - `tags`: A sorted array of unique tags extracted from tools and techniques.
 */
export async function fetchCcmData(): Promise<CCMData> {
    try {
        const tools = (await d3.json(TOOLS_URL) as CCMRawData).tools;
        const techniques = (await d3.json(TECHNIQUES_URL) as CCMRawData).techniques;

        const ccmData: CCMData = {
            tools: Object.entries(tools).sort((a, b) => a[0].localeCompare(b[0])),
            techniques: Object.entries(techniques).sort((a, b) => a[0].localeCompare(b[0])),
            tags: [],
        };

        ccmData.tags = [...new Set(ccmData.tools.concat(ccmData.techniques as any).flatMap((it) => it[1].tags || []))].sort();

        return ccmData;
    } catch (error) {
        console.error('Error fetching CCM data:', error);
        throw error;
    }
}

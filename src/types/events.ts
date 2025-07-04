import type { ForceGraphProps } from 'react-force-graph-2d';
import type { CCMGraphData, CCMGraphLink, CCMGraphNode, CCMPathEnds, CCMViewConfiguration } from './ccmap';

export type CCMEvents = {
    'graph-data:updated': CCMGraphData | null;
    'runtime-props:updated': ForceGraphProps<CCMGraphNode, CCMGraphLink>;
    'view-configuration:changed': CCMViewConfiguration;
    'shortest-path:create': undefined;
    'suggestions:reset': undefined;
    'selected-node:changed': string | null;
    'focus-node:changed': string | null;
    'path-ends:changed': CCMPathEnds;
    'shortest-paths:changed': Array<Array<string>>;
};

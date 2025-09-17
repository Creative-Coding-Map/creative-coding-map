import type { ForceGraphProps } from 'react-force-graph-2d';
import type { CCMGraphData, CCMGraphLink, CCMGraphNode, CCMPathEnds, CCMViewConfiguration } from './ccmap';

export type CCMEvents = {
    'app:shortest-path:create': undefined;
    'app:shortest-path:changed': string;
    'app:suggestions:reset': undefined;
    'app:selected-node:changed': string | null;
    'app:selected-node:focus': string | null;
    'app:index:close-tooltip': string;
    'map:initialized': undefined;
    'map:graph-data:updated': CCMGraphData | null;
    'map:runtime-props:updated': ForceGraphProps<CCMGraphNode, CCMGraphLink>;
    'map:view-configuration:changed': CCMViewConfiguration;
    'map:selected-node:changed': string | null;
    'map:focus-node:changed': string | null;
    'map:path-ends:changed': CCMPathEnds;
    'map:shortest-path:changed': Array<Array<string>>;
    'map:resize': undefined;
};

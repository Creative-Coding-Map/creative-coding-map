import type { ForceGraphProps } from 'react-force-graph-2d';
import type {
    CCMDomainModes,
    CCMFilter,
    CCMGraphData,
    CCMGraphLink,
    CCMGraphNode,
    CCMPathEnds,
    CCMViewConfiguration,
} from './ccmap';

export type CCMEvents = {
    'app:shortest-path:create': undefined;
    'app:shortest-path:changed': string;
    'app:shortest-path:cleared': undefined;
    'app:domain:changed': CCMDomainModes;
    'app:suggestions:reset': undefined;
    'app:selected-node:changed': string | null;
    'app:selected-node:focus': string | null;
    'app:filters:changed': CCMFilter[];
    'app:index:close-tooltip': string;
    'app:theme:changed': string;
    'map:initialized': undefined;
    'map:graph-data:updated': CCMGraphData | null;
    'map:runtime-props:updated': ForceGraphProps<CCMGraphNode, CCMGraphLink>;
    'map:view-configuration:changed': CCMViewConfiguration;
    'map:selected-node:changed': string | null;
    'map:focus-node:changed': string | null;
    'map:path-ends:changed': CCMPathEnds;
    'map:shortest-path:changed': Array<Array<string>>;
    'map:resize': undefined;
    'map:zoom-in': undefined;
    'map:zoom-out': undefined;
    'map:recenter': undefined;
};

import type { CCMDomainSet, ColorSet } from '@/types/ccmap';

export const DOMAIN_SETS: Array<CCMDomainSet> = [
    {
        name: 'graphics',
        nodes: [
            { id: '3d graphics', degree: 1 },
            { id: 'computer graphics', degree: 1 },
            { id: 'vector graphics', degree: 1 },
            { id: 'geometry', degree: 1 },
            { id: 'shaders', degree: 1 },
            { id: 'graphics api', degree: 1 },
            { id: 'raster graphics', degree: 1 },
            { id: 'video', degree: 1 },
        ],
    },
    {
        name: 'sound',
        nodes: [
            { id: 'audio', degree: 1 },
            { id: 'sound', degree: 1 },
        ],
    },
    {
        name: 'text',
        nodes: [
            { id: 'text', degree: 1 },
            { id: 'typography', degree: 1 },
        ],
    },
    {
        name: 'games',
        nodes: [
            { id: 'fantasy console', degree: 1 },
            { id: 'game development', degree: 1 },
        ],
    },
    {
        name: 'data',
        nodes: [
            { id: 'structured data', degree: 1 },
            { id: 'data visualization', degree: 1 },
            { id: 'data science', degree: 1 },
            { id: 'file format', degree: 1 },
        ],
    },
    {
        name: 'physical',
        nodes: [
            { id: 'hardware', degree: 1 },
            { id: 'microcontroller', degree: 1 },
            { id: 'media technology', degree: 1 },
            { id: 'print', degree: 1 },
        ],
    },
    {
        name: 'software technology',
        nodes: [{ id: 'language', degree: 1 }],
    },
];

export const COLOR_SETS: Array<ColorSet> = [
    {
        name: '3d graphics',
        tags: ['3d graphics'],
        color: '#ff0000',
    },
    {
        name: 'file formats',
        tags: ['file format'],
        color: '#00ff00',
    },
    {
        name: 'OPENRNDR',
        nodes: [{ id: 'OPENRNDR', degree: 1 }],
        color: '#ffc0cb',
    },
    {
        name: 'Processing',
        nodes: [{ id: 'Processing', degree: 1 }],
        color: '#0000ff',
    },
];

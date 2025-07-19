import type { CCMViewConfiguration } from '@/types/ccmap';

export const VIEW_CONFIGURATIONS: Array<CCMViewConfiguration> = [
    {
        name: 'Domain mode',
        domainSets: [
            {
                name: 'graphics',
                nodes: [
                    { id: '3d graphics', degree: 1 },
                    { id: 'computer graphics', degree: 1 },
                    { id: 'vector graphics', degree: 1 },
                    { id: 'geometry', degree: 1 },
                    { id: 'shaders', degree: 1 },
                    { id: 'raster graphics', degree: 1 },
                    { id: 'video', degree: 1 },
                    { id: 'image processing', degree: 1 },
                    { id: 'print', degree: 1 },
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
                    { id: 'compression', degree: 1 },
                ],
            },
            {
                name: 'physical',
                nodes: [
                    { id: 'hardware', degree: 1 },
                    { id: 'microcontroller', degree: 1 },
                    { id: 'media technology', degree: 1 },

                ],
            },
            {
                name: 'software technology',
                nodes: [
                    { id: 'language', degree: 1 },
                    { id: 'library', degree: 1 },
                    { id: 'parsing', degree: 1 },
                    { id: 'binding', degree: 1 },
                ],
            },
        ],
        colorSets: [
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
        ],
    },
    {
        name: 'Frameworks',
        domainSets: [
            {
                name: 'Processing',
                nodes: [{ id: 'Processing', degree: 1 }],
            },
            {
                name: 'OpenFrameworks',
                nodes: [{ id: 'OpenFrameworks', degree: 1 }],
            },
            {
                name: 'p5.js',
                nodes: [{ id: 'P5Js', degree: 1 }],
            },
            {
                name: 'Cinder',
                nodes: [{ id: 'Cinder', degree: 1 }],
            },
            {
                name: 'Three.js',
                nodes: [{ id: 'ThreeJS', degree: 1 }],
            },
            {
                name: 'OPENRNDR',
                nodes: [{ id: 'OPENRNDR', degree: 1 }],
            },
        ],
        colorSets: [
            {
                name: 'Processing',
                nodes: [{ id: 'Processing', degree: 1 }],
                color: '#0000ff',
            },
            {
                name: 'OpenFrameworks',
                nodes: [{ id: 'OpenFrameworks', degree: 1 }],
                color: '#00ffff',
            },
            {
                name: 'p5.js',
                nodes: [{ id: 'P5Js', degree: 1 }],
                color: '#ff00ff',
            },
            {
                name: 'Cinder',
                nodes: [{ id: 'Cinder', degree: 1 }],
                color: '#ff7f00',
            },
            {
                name: 'Three.js',
                nodes: [{ id: 'ThreeJS', degree: 1 }],
                color: '#7f7f00',
            },
            {
                name: 'OPENRNDR',
                nodes: [{ id: 'OPENRNDR', degree: 1 }],
                color: '#ffc0cb',
            },
        ],
    },
];

import { defineConfig } from 'vite';
import viteReact from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
// import legacy from '@vitejs/plugin-legacy';
import svgr from 'vite-plugin-svgr';

import { resolve } from 'node:path';

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [
        viteReact(),
        tailwindcss(),
        svgr(),
        // legacy({
        //     polyfills: ['set-methods-v2'],
        // }),
    ],
    test: {
        globals: true,
        environment: 'jsdom',
    },
    resolve: {
        alias: {
            '@': resolve(__dirname, './src'),
        },
    },
});

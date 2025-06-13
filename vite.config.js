import { resolve } from 'node:path';
import { defineConfig } from 'vite';
import viteReact from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { purgeCSSPlugin } from '@fullhuman/postcss-purgecss';
import { visualizer } from 'rollup-plugin-visualizer';
// import legacy from '@vitejs/plugin-legacy';
import svgr from 'vite-plugin-svgr';

// Custom PostCSS plugin to remove comments
const removeCommentRules = (root) => {
    root.walkComments((comment) => {
        comment.remove();
    });
};

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [
        viteReact(),
        svgr(),
        tailwindcss(),
        visualizer({ open: true }),
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
    // css: {
    //     postcss: {
    //         plugins: [
    //             purgeCSSPlugin({
    //                 content: [
    //                     './src/**/*.html',
    //                     './src/**/*.js',
    //                     './src/**/*.jsx',
    //                     './src/**/*.ts',
    //                     './src/**/*.tsx',
    //                     './src/**/*.css',
    //                 ],
    //                 defaultExtractor: (content) => content.match(/[\w-/:.\[\]\(\)_\[\]]+(?<!:)/g) || [],
    //                 variables: true, // Remove unused CSS variables
    //                 keyframes: true, // Remove unused animations
    //                 fontFace: true, // Remove unused font faces
    //             }),
    //             removeCommentRules,
    //         ],
    //     },
    // },
    build: {
        rollupOptions: {
            output: {
                manualChunks(id) {
                    if (id.includes('faker')) {
                        return 'faker'; // Split components into their own chunk
                    }
                    if (id.includes('node_modules')) {
                        return 'vendor'; // Split vendor libraries
                    }
                    if (id.includes('src/components/')) {
                        return 'components'; // Split components into their own chunk
                    }
                    if (id.includes('src/modules/')) {
                        return 'modules'; // Split components into their own chunk
                    }
                },
            },
        },
    },
});

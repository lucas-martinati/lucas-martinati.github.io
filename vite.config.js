import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { SITE_URL, SITE_TITLE, SITE_DESCRIPTION, DEVELOPER_NAME } from './src/config/site.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
    plugins: [
        react(),
        {
            // Injecte l'identité centralisée (src/config/site.js) dans index.html,
            // pour que nom / titre / description / URLs sociales suivent la config.
            name: 'site-meta',
            transformIndexHtml(html) {
                return html
                    .replaceAll('__SITE_TITLE__', SITE_TITLE)
                    .replaceAll('__SITE_DESCRIPTION__', SITE_DESCRIPTION)
                    .replaceAll('__SITE_URL__', SITE_URL)
                    .replaceAll('__DEVELOPER_NAME__', DEVELOPER_NAME);
            },
        },
    ],
    base: './',
    build: {
        // Deux pages : portfolio (/) et CV (/cv/), même build, même données.
        rollupOptions: {
            input: {
                main: resolve(__dirname, 'index.html'),
                cv: resolve(__dirname, 'cv/index.html'),
            },
        },
    },
});

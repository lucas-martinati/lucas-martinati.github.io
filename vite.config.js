import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { SITE_URL, SITE_TITLE, SITE_DESCRIPTION, DEVELOPER_NAME } from './src/config/site.js';

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
});

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { SITE_URL, SITE_TITLE, SITE_DESCRIPTION, DEVELOPER_NAME, GITHUB_URL, LINKEDIN_URL } from './src/config/site.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
    plugins: [
        react(),
        {
            // Injecte l'identité centralisée (src/config/site.js) dans index.html,
            // pour que nom / titre / description / URLs sociales suivent la config.
            name: 'site-meta',
            transformIndexHtml(html) {
                const escapeHtml = (value) => value.replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
                const cleanUrl = SITE_URL.replace(/\/$/, '');
                const jsonLd = JSON.stringify({
                    '@context': 'https://schema.org',
                    '@type': 'ProfilePage',
                    url: `${cleanUrl}/`,
                    name: SITE_TITLE,
                    description: SITE_DESCRIPTION,
                    mainEntity: {
                        '@type': 'Person',
                        name: DEVELOPER_NAME,
                        url: `${cleanUrl}/`,
                        image: `${cleanUrl}/img/photo.png`,
                        jobTitle: 'Étudiant en BUT Informatique & Développeur Full-Stack',
                        affiliation: {
                            '@type': 'CollegeOrUniversity',
                            name: 'IUT Nancy-Charlemagne — Université de Lorraine',
                        },
                        sameAs: [GITHUB_URL, LINKEDIN_URL].filter(Boolean),
                    },
                }).replace(/</g, '\\u003c');
                return html
                    .replaceAll('__SITE_TITLE__', escapeHtml(SITE_TITLE))
                    .replaceAll('__SITE_DESCRIPTION__', escapeHtml(SITE_DESCRIPTION))
                    .replaceAll('__SITE_URL__', escapeHtml(cleanUrl))
                    .replaceAll('__DEVELOPER_NAME__', escapeHtml(DEVELOPER_NAME))
                    .replaceAll('__SITE_JSON_LD__', jsonLd);
            },
            generateBundle() {
                const url = SITE_URL.replace(/\/$/, '');
                this.emitFile({ type: 'asset', fileName: 'robots.txt', source: `User-agent: *\nAllow: /\nSitemap: ${url}/sitemap.xml\n` });
                this.emitFile({ type: 'asset', fileName: 'sitemap.xml', source: `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>${url}/</loc></url><url><loc>${url}/cv/</loc></url></urlset>\n` });
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

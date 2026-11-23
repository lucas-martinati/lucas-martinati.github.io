import { createServer } from 'vite';
import { readFile, writeFile, readdir, unlink } from 'node:fs/promises';
import { dirname, resolve, basename } from 'node:path';

// Runs only during the build: the deployed site needs no Node server.
const vite = await createServer({ server: { middlewareMode: true }, appType: 'custom' });
const orphanAssets = new Set();
try {
    const { render } = await vite.ssrLoadModule('/src/entry-server.jsx');
    const pages = render();
    for (const [page, file, id] of [['main', 'dist/index.html', 'root'], ['cv', 'dist/cv/index.html', 'cv-root']]) {
        let html = await readFile(file, 'utf8');
        const placeholder = `<div id="${id}"></div>`;
        if (!html.includes(placeholder)) throw new Error(`Conteneur ${id} introuvable dans ${file}`);
        html = html.replace(placeholder, () => `<div id="${id}">${pages[page]}</div>`);
        // These small stylesheets are needed for the entire static document.
        // Inlining avoids a blocking round trip without a flash of unstyled HTML.
        for (const match of [...html.matchAll(/<link\b[^>]*rel="stylesheet"[^>]*>/g)]) {
            const href = match[0].match(/href="([^"]+)"/)[1];
            const cssPath = resolve(dirname(file), href);
            const css = await readFile(cssPath, 'utf8');
            orphanAssets.add(cssPath);
            const assetBase = href.slice(0, href.lastIndexOf('/') + 1);
            const inlineCss = css.replace(/url\(\.\/([^)]*)\)/g, (_, asset) => `url(${assetBase}${asset})`);
            const fontName = page === 'main' ? 'inter-latin' : 'lexend-latin';
            const font = inlineCss.match(new RegExp(`url\\(([^)]*${fontName}[^)]*\\.woff2)\\)`))?.[1];
            html = html.replace(match[0], () => `${font ? `<link rel="preload" href="${font}" as="font" type="font/woff2" crossorigin>\n` : ''}<style>${inlineCss}</style>`);
        }
        // The CV has only native links; it needs no React runtime in production.
        // Development keeps its normal Vite entry and hot reload.
        if (page === 'cv') {
            for (const match of html.matchAll(/<script\b[^>]*type="module"[^>]*src="([^"]+)"[^>]*><\/script>/g)) {
                orphanAssets.add(resolve(dirname(file), match[1]));
            }
            html = html.replace(/<script\b[^>]*type="module"[^>]*><\/script>/g, '')
                .replace(/<link\b[^>]*rel="modulepreload"[^>]*>/g, '');
        } else {
            // Discover the display font/styles before the interactive runtime.
            const modules = [...html.matchAll(/<script\b[^>]*type="module"[^>]*><\/script>|<link\b[^>]*rel="modulepreload"[^>]*>/g)]
                .map((match) => match[0]);
            for (const module of modules) html = html.replace(module, '');
            const prioritizedModules = modules.map((module) => module.replace(/^(<script|<link)\b/, '$1 fetchpriority="low"'));
            html = html.replace('</head>', `${prioritizedModules.join('\n')}\n</head>`);
        }
        await writeFile(file, html);
        console.log(`HTML statique généré : ${file}`);
    }

    // Remove CSS/JS assets that were fully inlined or stripped from static HTML.
    for (const assetPath of orphanAssets) {
        await unlink(assetPath).catch(() => {});
    }

    // Keep public/img/ originals as source files, but avoid deploying unused raw PNGs to dist/img/.
    const keepRawPngs = new Set(['og-preview.png', 'photo.png']);
    const distImgDir = resolve('dist/img');
    for (const entry of await readdir(distImgDir, { withFileTypes: true })) {
        if (entry.isFile() && /\.(png|jpe?g)$/i.test(entry.name) && !keepRawPngs.has(basename(entry.name))) {
            await unlink(resolve(distImgDir, entry.name));
        }
    }
} finally {
    await vite.close();
}

import { createServer } from 'vite';
import { readFile, writeFile } from 'node:fs/promises';

// Runs only during the build: the deployed site needs no Node server.
const vite = await createServer({ server: { middlewareMode: true }, appType: 'custom' });
try {
    const { render } = await vite.ssrLoadModule('/src/entry-server.jsx');
    const pages = render();
    for (const [page, file, id] of [['main', 'dist/index.html', 'root'], ['cv', 'dist/cv/index.html', 'cv-root']]) {
        const html = await readFile(file, 'utf8');
        const placeholder = `<div id="${id}"></div>`;
        if (!html.includes(placeholder)) throw new Error(`Conteneur ${id} introuvable dans ${file}`);
        await writeFile(file, html.replace(placeholder, () => `<div id="${id}">${pages[page]}</div>`));
        console.log(`HTML statique généré : ${file}`);
    }
} finally {
    await vite.close();
}

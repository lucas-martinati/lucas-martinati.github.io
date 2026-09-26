// Génère public/cv.pdf depuis la page /cv/ avec le vrai moteur
// d'impression de Chrome headless : rendu strictement identique
// au Ctrl+P → « Enregistrer au format PDF » (fond perdu, 1 page A4).
//
// Usage : npm run cv:pdf
//   1. rebuild le site (dist/)
//   2. sert dist/ en local, imprime /cv/ en PDF
//   3. écrit public/cv.pdf (+ copie dist/cv.pdf pour un déploiement immédiat)
//
// À relancer après chaque modification du CV ou de ses données.
// Requiert Chrome (téléchargé auto via le paquet `puppeteer`).
import { spawnSync } from 'node:child_process';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import puppeteer from 'puppeteer';

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const OUT_PUBLIC = path.join(root, 'public', 'cv.pdf');
const OUT_DIST = path.join(root, 'dist', 'cv.pdf');

const MIME = {
    '.html': 'text/html',
    '.js': 'text/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.svg': 'image/svg+xml',
    '.pdf': 'application/pdf',
    '.ico': 'image/x-icon',
};

function serve(dir) {
    const server = http.createServer((req, res) => {
        const urlPath = decodeURIComponent(req.url.split('?')[0]);
        const file =
            urlPath === '/' || urlPath.endsWith('/')
                ? path.join(dir, urlPath, 'index.html')
                : path.join(dir, urlPath);
        fs.readFile(file, (err, data) => {
            if (err) {
                res.writeHead(404);
                res.end('not found');
                return;
            }
            res.writeHead(200, { 'Content-Type': MIME[path.extname(file)] || 'application/octet-stream' });
            res.end(data);
        });
    });
    return new Promise((resolve) => server.listen(0, '127.0.0.1', () => resolve(server)));
}

console.log('→ build…');
spawnSync('npm', ['run', 'build'], { cwd: root, stdio: 'inherit', shell: true });

const server = await serve(path.join(root, 'dist'));
const port = server.address().port;
const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
try {
    const page = await browser.newPage();
    await page.goto(`http://127.0.0.1:${port}/cv/`, { waitUntil: 'networkidle0', timeout: 60000 });
    await page.evaluate(() => document.fonts?.ready);
    await new Promise((r) => setTimeout(r, 800));
    // preferCSSPageSize : respecte le `@page { size: A4; margin: 0 }` de cv/cv.css.
    await page.pdf({ path: OUT_PUBLIC, format: 'A4', printBackground: true, preferCSSPageSize: true });
    fs.copyFileSync(OUT_PUBLIC, OUT_DIST);
    console.log(`✓ public/cv.pdf + dist/cv.pdf (${(fs.statSync(OUT_PUBLIC).size / 1024).toFixed(0)} Ko)`);
} finally {
    await browser.close();
    server.close();
}

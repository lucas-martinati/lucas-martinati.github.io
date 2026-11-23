// Génère public/cv.pdf depuis la page /cv/ avec le vrai moteur
// d'impression de Chrome headless : rendu strictement identique
// au Ctrl+P → « Enregistrer au format PDF » (fond perdu, 1 page A4).
//
// Usage : npm run cv:pdf
//   1. rebuild le site (dist/)
//   2. sert dist/ en local, imprime /cv/ en PDF
//   3. vérifie que le PDF tient bien sur 1 seule page A4
//   4. écrit public/cv.pdf (+ copie dist/cv.pdf pour un déploiement immédiat)
//
// À relancer après chaque modification du CV ou de ses données.
import { spawnSync } from 'node:child_process';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { launchBrowser } from './browser.mjs';

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const OUT_PUBLIC = path.join(root, 'public', 'cv.pdf');
const OUT_DIST = path.join(root, 'dist', 'cv.pdf');

const MIME = {
    '.html': 'text/html',
    '.js': 'text/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.webp': 'image/webp',
    '.avif': 'image/avif',
    '.woff2': 'font/woff2',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.svg': 'image/svg+xml',
    '.pdf': 'application/pdf',
    '.ico': 'image/x-icon',
};

function serve(dir) {
    const resolvedDir = path.resolve(dir);
    const server = http.createServer((req, res) => {
        let urlPath;
        try {
            urlPath = decodeURIComponent(req.url.split('?')[0]);
        } catch {
            res.writeHead(400);
            res.end('bad request');
            return;
        }
        const candidate = path.resolve(
            resolvedDir,
            `.${urlPath === '/' || urlPath.endsWith('/') ? `${urlPath}index.html` : urlPath}`
        );
        if (!candidate.startsWith(`${resolvedDir}${path.sep}`) && candidate !== resolvedDir) {
            res.writeHead(403);
            res.end('forbidden');
            return;
        }
        fs.readFile(candidate, (err, data) => {
            if (err) {
                res.writeHead(404);
                res.end('not found');
                return;
            }
            res.writeHead(200, { 'Content-Type': MIME[path.extname(candidate)] || 'application/octet-stream' });
            res.end(data);
        });
    });
    return new Promise((resolve) => server.listen(0, '127.0.0.1', () => resolve(server)));
}

function countPdfPages(pdfBuffer) {
    const text = pdfBuffer.toString('latin1');
    const matches = text.match(/\/Type\s*\/Page\b(?!s)/g);
    return matches ? matches.length : 0;
}

// Le build exécute aussi l'optimisation des images (prebuild) et le prerender.
// Il doit précéder l'impression afin que dist/ reflète les dernières sources.
console.log('→ build…');
const build = spawnSync('npm', ['run', 'build'], { cwd: root, stdio: 'inherit' });
if (build.error || build.status !== 0) {
    throw build.error ?? new Error(`Échec du build (code ${build.status})`);
}

const server = await serve(path.join(root, 'dist'));
const port = server.address().port;
const browser = await launchBrowser();
try {
    const page = await browser.newPage();
    await page.goto(`http://127.0.0.1:${port}/cv/`, { waitUntil: 'networkidle0', timeout: 60000 });
    await page.evaluate(() => document.fonts?.ready);
    await new Promise((r) => setTimeout(r, 800));
    await page.pdf({ path: OUT_PUBLIC, format: 'A4', printBackground: true, preferCSSPageSize: true });
    const pageCount = countPdfPages(fs.readFileSync(OUT_PUBLIC));
    if (pageCount !== 1) {
        throw new Error(`Le CV PDF déborde sur ${pageCount} pages (1 page A4 attendue). Ajuster @media print dans cv/cv.css.`);
    }
    fs.copyFileSync(OUT_PUBLIC, OUT_DIST);
    console.log(`✓ public/cv.pdf + dist/cv.pdf (${(fs.statSync(OUT_PUBLIC).size / 1024).toFixed(0)} Ko, ${pageCount} page A4)`);
} finally {
    await browser.close();
    server.close();
}

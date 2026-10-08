import sharp from 'sharp';
import { mkdir, readFile, writeFile, stat, readdir, unlink } from 'node:fs/promises';
import { basename, extname } from 'node:path';

const data = JSON.parse(await readFile('src/data/data.json', 'utf8'));
const cv = JSON.parse(await readFile('cv/cv-data.json', 'utf8'));
const sources = [...new Set([...data.projects.map((p) => p.imageUrl), cv.photo])]
    .filter((src) => src?.startsWith('img/'));
await mkdir('public/img/optimized', { recursive: true });
const manifest = {};
const generatedFiles = new Set();
let originalBytes = 0;
let optimizedBytes = 0;

for (const src of sources) {
    const input = `public/${src}`;
    const { width, height } = await sharp(input).metadata();
    const stem = basename(src, extname(src));
    const widths = [...new Set([160, 320, 480, 800, 1440].map((size) => Math.min(size, width)))];
    const variants = [];
    for (const size of widths) {
        const url = `img/optimized/${stem}-${size}.webp`;
        generatedFiles.add(basename(url));
        const info = await sharp(input).resize({ width: size, withoutEnlargement: true })
            .webp({ quality: 80, effort: 5 }).toFile(`public/${url}`);
        variants.push({ url, width: info.width, bytes: info.size });
    }
    const preferred = variants.find((variant) => variant.width >= 800) ?? variants.at(-1);
    manifest[src] = { src: preferred.url, variants, width, height };
    if (data.projects.some((project) => project.imageUrl === src)) {
        // Match the card's actual 16:10 frame. Portrait screenshots keep their
        // proportions without downloading a full-height image for a thumbnail.
        const cards = { avif: [], webp: [] };
        for (const size of [320, 480, 672, 800, 1080]) {
            for (const format of ['avif', 'webp']) {
                const url = `img/optimized/${stem}-card-${size}.${format}`;
                generatedFiles.add(basename(url));
                const info = await sharp(input).resize({
                    width: size, height: size * 10 / 16, fit: 'contain',
                    background: '#090d16',
                }).toFormat(format, { quality: format === 'avif' ? 48 : 74, effort: 5 }).toFile(`public/${url}`);
                cards[format].push({ url, width: info.width });
            }
        }
        manifest[src].card = cards;
    }
    originalBytes += (await stat(input)).size;
    optimizedBytes += preferred.bytes;
}

// This directory contains only generated assets; discard obsolete variants.
for (const file of await readdir('public/img/optimized')) {
    if (!generatedFiles.has(file)) await unlink(`public/img/optimized/${file}`);
}
await writeFile('src/data/images.json', `${JSON.stringify(manifest, null, 2)}\n`);
console.log(`Images : ${(originalBytes / 1024).toFixed(0)} → ${(optimizedBytes / 1024).toFixed(0)} Ko à 800 px (${Math.round((1 - optimizedBytes / originalBytes) * 100)} % de réduction). Vignettes AVIF/WebP générées séparément.`);

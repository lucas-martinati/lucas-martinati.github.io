import sharp from 'sharp';
import { mkdir, readFile, writeFile, stat } from 'node:fs/promises';
import { basename, extname } from 'node:path';

const data = JSON.parse(await readFile('src/data/data.json', 'utf8'));
const cv = JSON.parse(await readFile('cv/cv-data.json', 'utf8'));
const sources = [...new Set([...data.projects.map((p) => p.imageUrl), cv.photo])]
    .filter((src) => src?.startsWith('img/'));
await mkdir('public/img/optimized', { recursive: true });
const manifest = {};
let originalBytes = 0;
let optimizedBytes = 0;

for (const src of sources) {
    const input = `public/${src}`;
    const { width, height } = await sharp(input).metadata();
    const stem = basename(src, extname(src));
    const widths = [...new Set([480, 960, 1440].map((size) => Math.min(size, width)))];
    const variants = [];
    for (const size of widths) {
        const url = `img/optimized/${stem}-${size}.webp`;
        const info = await sharp(input).resize({ width: size, withoutEnlargement: true })
            .webp({ quality: 80, effort: 5 }).toFile(`public/${url}`);
        variants.push({ url, width: info.width, bytes: info.size });
    }
    const preferred = variants.find((variant) => variant.width >= 960) ?? variants.at(-1);
    manifest[src] = { src: preferred.url, variants, width, height };
    originalBytes += (await stat(input)).size;
    optimizedBytes += preferred.bytes;
}

await writeFile('src/data/images.json', `${JSON.stringify(manifest, null, 2)}\n`);
console.log(`Images : ${(originalBytes / 1024).toFixed(0)} → ${(optimizedBytes / 1024).toFixed(0)} Ko à 960 px (${Math.round((1 - optimizedBytes / originalBytes) * 100)} % de réduction).`);

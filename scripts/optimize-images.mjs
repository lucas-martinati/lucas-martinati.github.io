import sharp from 'sharp';
import { mkdir, readFile, writeFile, stat, readdir, unlink } from 'node:fs/promises';
import { basename, extname } from 'node:path';
import { DEVELOPER_NAME, DEVELOPER_INITIALS, BRAND_SUFFIX, SITE_URL } from '../src/config/site.js';
import { getComputedMetrics } from '../src/utils/metrics.js';

const escapeXml = (value) => String(value ?? '').replace(/[&<>"']/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
}[char]));

function buildOgSvg({ metrics, badge }) {
    const cards = metrics.slice(0, 4).map((m, i) => {
        const x = 68 + i * 266;
        const borderRight = i < 3 ? `<line x1="${x + 266}" y1="452" x2="${x + 266}" y2="554" stroke="#f3efe6" stroke-opacity="0.1"/>` : '';
        return `
        <g>
            <text x="${x + 18}" y="476" font-family="DejaVu Sans Mono, Liberation Mono, monospace" font-weight="600" font-size="11" letter-spacing="1" fill="#8c96a4">${escapeXml(m.label.toUpperCase())}</text>
            <text x="${x + 18}" y="518" font-family="DejaVu Sans, Liberation Sans, Arial, sans-serif" font-weight="700" font-size="${m.value.length > 8 ? 24 : 32}" fill="#f3efe6">${escapeXml(m.value)}</text>
            <text x="${x + 18}" y="544" font-family="DejaVu Sans, Liberation Sans, Arial, sans-serif" font-weight="400" font-size="13" fill="#a4adb9">${escapeXml(m.sub)}</text>
            ${borderRight}
        </g>`;
    }).join('');

    const host = SITE_URL.replace(/^https?:\/\//, '').replace(/\/$/, '');
    return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
    <defs>
        <radialGradient id="tealGlow" cx="18%" cy="0%" r="65%">
            <stop offset="0%" stop-color="#10807c" stop-opacity="0.28"/>
            <stop offset="100%" stop-color="#0c0f13" stop-opacity="0"/>
        </radialGradient>
        <radialGradient id="amberGlow" cx="88%" cy="8%" r="48%">
            <stop offset="0%" stop-color="#e8ad5c" stop-opacity="0.12"/>
            <stop offset="100%" stop-color="#0c0f13" stop-opacity="0"/>
        </radialGradient>
        <pattern id="grid" width="64" height="64" patternUnits="userSpaceOnUse">
            <path d="M 64 0 L 0 0 0 64" fill="none" stroke="#f3efe6" stroke-opacity="0.032" stroke-width="1"/>
        </pattern>
    </defs>

    <rect width="1200" height="630" fill="#0c0f13"/>
    <rect width="1200" height="630" fill="url(#grid)"/>
    <rect width="1200" height="630" fill="url(#tealGlow)"/>
    <rect width="1200" height="630" fill="url(#amberGlow)"/>

    <!-- Top editorial header -->
    <text x="68" y="64" font-family="DejaVu Sans, Liberation Sans, Arial, sans-serif" font-weight="700" font-size="22">
        <tspan fill="#38cfc1">${escapeXml(DEVELOPER_INITIALS)}</tspan><tspan fill="#f3efe6">${escapeXml(BRAND_SUFFIX)}</tspan>
    </text>
    <text x="1132" y="62" text-anchor="end" font-family="DejaVu Sans Mono, Liberation Mono, monospace" font-size="15" fill="#8c96a4">${escapeXml(host)}</text>
    <line x1="68" y1="88" x2="1132" y2="88" stroke="#f3efe6" stroke-opacity="0.1"/>

    <!-- Availability pill -->
    <rect x="68" y="118" width="520" height="36" rx="18" fill="#38cfc1" fill-opacity="0.12" stroke="#38cfc1" stroke-opacity="0.34"/>
    <circle cx="90" cy="136" r="4.5" fill="#38cfc1"/>
    <text x="108" y="141" font-family="DejaVu Sans, Liberation Sans, Arial, sans-serif" font-weight="600" font-size="14" fill="#38cfc1">${escapeXml(badge)}</text>
    <text x="1132" y="141" text-anchor="end" font-family="DejaVu Sans Mono, Liberation Mono, monospace" font-size="14" fill="#8c96a4">Nancy, France · BUT Informatique</text>

    <!-- Editorial Title -->
    <text x="68" y="248" font-family="DejaVu Sans, Liberation Sans, Arial, sans-serif" font-weight="700" font-size="74" letter-spacing="-2" fill="#f3efe6">${escapeXml(DEVELOPER_NAME)}</text>
    <text x="68" y="298" font-family="DejaVu Sans, Liberation Sans, Arial, sans-serif" font-weight="600" font-size="27" fill="#38cfc1">Développeur Full-Stack &amp; Systèmes Linux</text>
    <text x="68" y="346" font-family="DejaVu Sans, Liberation Sans, Arial, sans-serif" font-weight="400" font-size="19" fill="#a4adb9">Applications web modernes, extensions Chrome / VS Code et outils d'automatisation système.</text>

    <!-- Unified architectural metrics strip -->
    <rect x="68" y="438" width="1064" height="128" fill="#131820" fill-opacity="0.72"/>
    <line x1="68" y1="438" x2="1132" y2="438" stroke="#f3efe6" stroke-opacity="0.16"/>
    <line x1="68" y1="566" x2="1132" y2="566" stroke="#f3efe6" stroke-opacity="0.1"/>
    ${cards}
</svg>`;
}

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
    const variantWidths = [];
    let preferredBytes = 0;
    for (const size of widths) {
        const url = `img/optimized/${stem}-${size}.webp`;
        generatedFiles.add(basename(url));
        const info = await sharp(input).resize({ width: size, withoutEnlargement: true })
            .webp({ quality: 80, effort: 5 }).toFile(`public/${url}`);
        variantWidths.push(info.width);
        if (!preferredBytes && info.width >= 800) preferredBytes = info.size;
        if (size === widths.at(-1) && !preferredBytes) preferredBytes = info.size;
    }
    const entry = { s: stem, w: width, h: height, v: variantWidths };
    if (data.projects.some((project) => project.imageUrl === src)) {
        // Match the card's actual 16:10 frame. Portrait screenshots keep their
        // proportions without downloading a full-height image for a thumbnail.
        const cardWidths = [];
        for (const size of [320, 480, 672, 800, 1080]) {
            for (const format of ['avif', 'webp']) {
                const url = `img/optimized/${stem}-card-${size}.${format}`;
                generatedFiles.add(basename(url));
                const info = await sharp(input).resize({
                    width: size, height: size * 10 / 16, fit: 'contain',
                    background: '#090d16',
                }).toFormat(format, { quality: format === 'avif' ? 48 : 74, effort: 5 }).toFile(`public/${url}`);
                if (format === 'webp') cardWidths.push(info.width);
            }
        }
        entry.c = cardWidths;
    }
    manifest[src] = entry;
    originalBytes += (await stat(input)).size;
    optimizedBytes += preferredBytes;
}

// This directory contains only generated assets; discard obsolete variants.
for (const file of await readdir('public/img/optimized')) {
    if (!generatedFiles.has(file)) await unlink(`public/img/optimized/${file}`);
}
await writeFile('src/data/images.json', `${JSON.stringify(manifest)}\n`);

// Generate Apple Touch Icon (180x180) from favicon.svg
await sharp('public/favicon.svg').resize(180, 180).png({ compressionLevel: 9 }).toFile('public/apple-touch-icon.png');

// Generate up-to-date Open Graph preview (1200x630) from live portfolio metrics
const metrics = getComputedMetrics({ projects: data.projects, education: data.education });
const isSeeking = data.developer?.recruitment?.enabled ?? data.developer?.recruitment?.seeking;
const badge = isSeeking ? data.developer?.recruitment?.badge : data.developer?.recruitment?.passiveBadge;
const ogSvg = buildOgSvg({ developer: data.developer, metrics, badge });
await sharp(Buffer.from(ogSvg)).png({ compressionLevel: 9, palette: true }).toFile('public/img/og-preview.png');

console.log(`Images : ${(originalBytes / 1024).toFixed(0)} → ${(optimizedBytes / 1024).toFixed(0)} Ko à 800 px (${Math.round((1 - optimizedBytes / originalBytes) * 100)} % de réduction). Manifeste compact (${(Buffer.byteLength(JSON.stringify(manifest)) / 1024).toFixed(1)} Ko), apple-touch-icon.png et og-preview.png (1200×630) générés.`);

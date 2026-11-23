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

function buildOgSvg({ developer, metrics, badge }) {
    const cards = metrics.slice(0, 4).map((m, i) => {
        const x = 90 + i * 260;
        return `
        <g transform="translate(${x}, 435)">
            <rect width="240" height="122" rx="16" fill="#0f172a" fill-opacity="0.88" stroke="#ffffff" stroke-opacity="0.1" />
            <text x="120" y="52" text-anchor="middle" font-family="DejaVu Sans, Liberation Sans, Arial, sans-serif" font-weight="800" font-size="${m.value.length > 8 ? 24 : 34}" fill="url(#metricGrad)">${escapeXml(m.value)}</text>
            <text x="120" y="82" text-anchor="middle" font-family="DejaVu Sans, Liberation Sans, Arial, sans-serif" font-weight="700" font-size="14" fill="#f8fafc">${escapeXml(m.label)}</text>
            <text x="120" y="103" text-anchor="middle" font-family="DejaVu Sans, Liberation Sans, Arial, sans-serif" font-weight="400" font-size="12" fill="#94a3b8">${escapeXml(m.sub)}</text>
        </g>`;
    }).join('');

    const host = SITE_URL.replace(/^https?:\/\//, '').replace(/\/$/, '');
    return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
    <defs>
        <linearGradient id="bgGlow" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#0f172a"/>
            <stop offset="50%" stop-color="#030712"/>
            <stop offset="100%" stop-color="#111827"/>
        </linearGradient>
        <radialGradient id="purpleGlow" cx="50%" cy="22%" r="55%">
            <stop offset="0%" stop-color="#7c3aed" stop-opacity="0.22"/>
            <stop offset="100%" stop-color="#030712" stop-opacity="0"/>
        </radialGradient>
        <linearGradient id="accentGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stop-color="#60a5fa"/>
            <stop offset="100%" stop-color="#c084fc"/>
        </linearGradient>
        <linearGradient id="titleGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#ffffff"/>
            <stop offset="65%" stop-color="#cbd5e1"/>
            <stop offset="100%" stop-color="#a5b4fc"/>
        </linearGradient>
        <linearGradient id="metricGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#ffffff"/>
            <stop offset="100%" stop-color="#93c5fd"/>
        </linearGradient>
        <pattern id="grid" width="48" height="48" patternUnits="userSpaceOnUse">
            <path d="M 48 0 L 0 0 0 48" fill="none" stroke="#ffffff" stroke-opacity="0.035" stroke-width="1"/>
        </pattern>
    </defs>

    <rect width="1200" height="630" fill="url(#bgGlow)"/>
    <rect width="1200" height="630" fill="url(#grid)"/>
    <rect width="1200" height="630" fill="url(#purpleGlow)"/>

    <!-- Top bar -->
    <rect x="0" y="0" width="1200" height="68" fill="#030712" fill-opacity="0.72"/>
    <line x1="0" y1="68" x2="1200" y2="68" stroke="#ffffff" stroke-opacity="0.08"/>
    <text x="64" y="42" font-family="DejaVu Sans, Liberation Sans, Arial, sans-serif" font-weight="800" font-size="24">
        <tspan fill="url(#accentGrad)">${escapeXml(DEVELOPER_INITIALS)}</tspan><tspan fill="#ffffff">${escapeXml(BRAND_SUFFIX)}</tspan>
    </text>
    <text x="1136" y="41" text-anchor="end" font-family="DejaVu Sans, Liberation Sans, Arial, sans-serif" font-weight="600" font-size="16" fill="#94a3b8">${escapeXml(host)}</text>

    <!-- Availability Badge -->
    <rect x="330" y="104" width="540" height="38" rx="19" fill="#10b981" fill-opacity="0.12" stroke="#10b981" stroke-opacity="0.4"/>
    <circle cx="358" cy="123" r="5" fill="#10b981"/>
    <text x="608" y="128" text-anchor="middle" font-family="DejaVu Sans, Liberation Sans, Arial, sans-serif" font-weight="600" font-size="15" fill="#6ee7b7">${escapeXml(badge)}</text>

    <!-- Name & Role -->
    <text x="600" y="226" text-anchor="middle" font-family="DejaVu Sans, Liberation Sans, Arial, sans-serif" font-weight="800" font-size="74" fill="url(#titleGrad)">${escapeXml(DEVELOPER_NAME)}</text>
    <text x="600" y="280" text-anchor="middle" font-family="DejaVu Sans, Liberation Sans, Arial, sans-serif" font-weight="700" font-size="28" fill="url(#accentGrad)">Développeur Full-Stack &amp; Étudiant BUT Informatique</text>
    <text x="600" y="328" text-anchor="middle" font-family="DejaVu Sans, Liberation Sans, Arial, sans-serif" font-weight="400" font-size="19" fill="#94a3b8">Applications web modernes, extensions Chrome / VS Code et outils système Linux</text>

    <!-- Subtle CTA Pills -->
    <g transform="translate(365, 356)">
        <rect x="0" y="0" width="225" height="44" rx="12" fill="url(#accentGrad)"/>
        <text x="112" y="28" text-anchor="middle" font-family="DejaVu Sans, Liberation Sans, Arial, sans-serif" font-weight="700" font-size="16" fill="#030712">Portfolio &amp; Projets</text>
        <rect x="245" y="0" width="225" height="44" rx="12" fill="#111827" stroke="#ffffff" stroke-opacity="0.18"/>
        <text x="357" y="28" text-anchor="middle" font-family="DejaVu Sans, Liberation Sans, Arial, sans-serif" font-weight="600" font-size="16" fill="#f8fafc">CV interactif &amp; PDF</text>
    </g>

    <!-- Live Metrics Cards -->
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

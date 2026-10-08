import lighthouse from 'lighthouse';
import desktopConfig from 'lighthouse/core/config/desktop-config.js';
import puppeteer from 'puppeteer';
import { preview } from 'vite';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

// Fresh Chrome process/profile per route, with Lighthouse's standard throttling.
const [target = 'local', output = 'reports/lighthouse', preset = 'mobile'] = process.argv.slice(2);
if (!['mobile', 'desktop'].includes(preset)) throw new Error('Preset attendu : mobile ou desktop');
const directory = resolve(output);
await mkdir(directory, { recursive: true });
let server;
try {
    if (target === 'local') server = await preview({ preview: { host: '127.0.0.1', port: 0, open: false } });
    const base = server ? `http://127.0.0.1:${server.httpServer.address().port}` : target;
    const routes = server ? ['/', '/#projects', '/cv/'] : [''];
    for (const route of routes) {
        const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-extensions'] });
        try {
            const url = `${base}${route}`;
            const result = await lighthouse(url, {
                port: Number(new URL(browser.wsEndpoint()).port),
                output: ['html', 'json'],
                logLevel: 'error',
                onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'],
            }, preset === 'desktop' ? desktopConfig : undefined);
            if (result.lhr.runtimeError) throw new Error(`${url}: ${result.lhr.runtimeError.message}`);
            const name = `${url.includes('#projects') ? 'projects' : new URL(url).pathname.includes('/cv') ? 'cv' : 'home'}-${preset}`;
            for (const [index, extension] of ['html', 'json'].entries()) {
                await writeFile(resolve(directory, `${name}.${extension}`), result.report[index]);
            }
            console.log(JSON.stringify({
                url,
                formFactor: result.lhr.configSettings.formFactor,
                scores: Object.fromEntries(Object.entries(result.lhr.categories).map(([key, category]) => [key, Math.round(category.score * 100)])),
                metrics: Object.fromEntries(['first-contentful-paint', 'largest-contentful-paint', 'total-blocking-time', 'cumulative-layout-shift', 'speed-index'].map((key) => [key, result.lhr.audits[key].displayValue])),
                warnings: result.lhr.runWarnings,
                report: resolve(directory, `${name}.html`),
            }, null, 2));
        } finally {
            await browser.close();
        }
    }
} finally {
    if (server) await new Promise((done) => server.httpServer.close(done));
}

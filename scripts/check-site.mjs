import assert from 'node:assert/strict';
import { readFile, mkdir } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { preview } from 'vite';
import puppeteer from 'puppeteer';
import { AxePuppeteer } from '@axe-core/puppeteer';

const data = JSON.parse(await readFile('src/data/data.json', 'utf8'));
const server = await preview({ preview: { host: '127.0.0.1', port: 0, open: false } });
const url = `http://127.0.0.1:${server.httpServer.address().port}`;
const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
const screenshots = join(tmpdir(), 'portfolio-checks');
await mkdir(screenshots, { recursive: true });
const errors = [];
const page = await browser.newPage();
page.on('pageerror', (error) => errors.push(error.message));
page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()); });
page.on('response', (response) => { if (response.status() >= 400) errors.push(`${response.status()} ${response.url()}`); });

async function audit(label) {
    const result = await new AxePuppeteer(page).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();
    assert.deepEqual(result.violations.map((v) => ({ id: v.id, nodes: v.nodes.map((n) => ({ target: n.target, reason: n.failureSummary })) })), [], label);
}

try {
    await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
    await page.setViewport({ width: 1440, height: 1000 });
    await page.goto(url, { waitUntil: 'networkidle0' });
    assert.equal(await page.$$eval('.project-card', (cards) => cards.length), data.projects.length);
    assert.equal(await page.$$eval('main', (elements) => elements.length), 1);
    await audit('Accessibilité de la page');
    await page.screenshot({ path: join(screenshots, 'desktop.png') });

    await page.evaluate(() => {
        navigator.clipboard.writeText = async (text) => { window.lastCopiedText = text; };
    });
    await page.click('.email-card .copy-btn');
    assert.equal(await page.evaluate(() => window.lastCopiedText), await page.$eval('.email-action-link', (node) => node.textContent));
    await page.waitForFunction(() => document.querySelector('.email-card .copy-btn').textContent.includes('Copié'));
    await page.evaluate(() => {
        navigator.clipboard.writeText = async () => { throw new Error('Permission refusée'); };
    });
    await page.click('.email-card .copy-btn');
    await page.waitForFunction(() => document.querySelector('.email-card .copy-btn').textContent.includes('Copie impossible'));
    await page.click('.code-copy-btn');
    await page.waitForFunction(() => document.querySelector('.code-copy-btn').textContent.includes('Échec'));

    await page.type('.project-search-input', '  LINUX  ');
    assert.ok(await page.$$eval('.project-card', (cards) => cards.length) > 0);
    await page.click('.search-clear-btn');
    await page.type('.project-search-input', 'aucun-projet-xyz');
    await page.waitForSelector('.projects-empty-state');
    await page.click('.projects-empty-state button');
    assert.equal(await page.$$eval('.project-card', (cards) => cards.length), data.projects.length);
    await page.click('.filter-btn:nth-child(3)');
    assert.equal(await page.$eval('.filter-btn:nth-child(3)', (button) => button.getAttribute('aria-pressed')), 'true');
    const titles = await page.$$eval('.project-title', (nodes) => nodes.map((node) => node.textContent));
    await page.click('.card-quick-btn');
    await page.waitForSelector('dialog[open]');
    assert.equal(await page.$eval('.modal-title', (node) => node.textContent), titles[0]);
    assert.equal(await page.$eval('.modal-counter', (node) => node.textContent), `1 / ${titles.length}`);
    await audit('Accessibilité de la fiche projet');
    for (let i = 0; i < 12; i++) {
        await page.keyboard.press('Tab');
        assert.equal(await page.evaluate(() => Boolean(document.activeElement.closest('dialog'))), true);
    }
    await page.keyboard.press('ArrowRight');
    assert.equal(await page.$eval('.modal-title', (node) => node.textContent), titles[1]);
    await page.keyboard.press('Escape');
    assert.equal(await page.evaluate(() => document.activeElement.matches('.card-quick-btn')), true);
    assert.equal(await page.evaluate(() => document.body.style.overflow), '');
    await page.click('.reset-filters');

    for (const width of [320, 390, 768, 1024, 1440]) {
        await page.setViewport({ width, height: 900 });
        assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), true, `Débordement à ${width}px`);
    }
    await page.setViewport({ width: 390, height: 844 });
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.screenshot({ path: join(screenshots, 'mobile.png'), fullPage: true });
    await page.click('.mobile-nav-toggle');
    await page.waitForSelector('#mobile-navigation[open]');
    await audit('Accessibilité du menu mobile');
    for (let i = 0; i < 15; i++) {
        await page.keyboard.press('Tab');
        assert.equal(await page.evaluate(() => Boolean(document.activeElement.closest('dialog'))), true);
    }
    await page.keyboard.press('Escape');
    assert.equal(await page.evaluate(() => document.activeElement.matches('.mobile-nav-toggle')), true);
    await page.click('.mobile-nav-toggle');
    await page.click('.mobile-nav-link[href="#projects"]');
    await page.waitForFunction(() => location.hash === '#projects' && !document.querySelector('dialog[open]'));
    assert.equal(await page.evaluate(() => document.body.style.overflow), '');
    await page.click('.mobile-nav-toggle');
    await page.setViewport({ width: 1440, height: 1000 });
    await page.waitForFunction(() => !document.querySelector('dialog[open]'));
    assert.equal(await page.evaluate(() => document.body.style.overflow), '');

    await page.goto(`${url}/#projects`, { waitUntil: 'networkidle0' });
    const anchorTop = await page.$eval('#projects', (element) => element.getBoundingClientRect().top);
    assert.ok(anchorTop >= 0 && anchorTop < 200, `Ancre masquée : ${anchorTop}`);
    assert.equal(await page.evaluate(() => performance.getEntriesByType('resource').some((entry) => !entry.name.startsWith(location.origin))), false, 'Ressources externes inattendues');
    await page.screenshot({ path: join(screenshots, 'projects.png') });

    await page.goto(`${url}/cv/`, { waitUntil: 'networkidle0' });
    await audit('Accessibilité du CV');
    assert.equal(await page.$eval('.cv-photo', (image) => image.complete && image.naturalWidth > 0), true);
    await page.screenshot({ path: join(screenshots, 'cv.png'), fullPage: true });
    await page.setJavaScriptEnabled(false);
    await page.goto(url, { waitUntil: 'networkidle0' });
    assert.equal(await page.$$eval('.project-card', (cards) => cards.length), data.projects.length);
    assert.ok(await page.$eval('h1', (node) => node.textContent.includes('Lucas')));
    assert.equal(await page.$eval('.projects-controls-wrap', (node) => getComputedStyle(node).display), 'none');
    await page.goto(`${url}/cv/`, { waitUntil: 'networkidle0' });
    assert.ok(await page.$eval('h1', (node) => node.textContent.includes('Lucas')));
    assert.deepEqual(errors, [], 'Erreurs navigateur');
    console.log(`✓ Recherche, filtres, dialogues, clavier, mobile, ancres, CV, HTML sans JS et audits axe validés. Captures : ${screenshots}`);
} finally {
    await browser.close();
    await new Promise((resolve) => server.httpServer.close(resolve));
}

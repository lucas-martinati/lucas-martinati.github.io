import { existsSync } from 'node:fs';
import puppeteer from 'puppeteer';

const FALLBACK_EXECUTABLES = [
    process.env.PUPPETEER_EXECUTABLE_PATH,
    '/usr/bin/google-chrome',
    '/usr/bin/google-chrome-stable',
    '/usr/bin/chromium',
    '/usr/bin/chromium-browser',
    '/usr/bin/brave-browser',
    '/usr/bin/microsoft-edge',
].filter(Boolean);

export async function launchBrowser(extraArgs = []) {
    const args = ['--no-sandbox', ...extraArgs];
    try {
        return await puppeteer.launch({ args });
    } catch (error) {
        const executablePath = FALLBACK_EXECUTABLES.find((candidate) => existsSync(candidate));
        if (!executablePath) throw error;
        return puppeteer.launch({ executablePath, args });
    }
}

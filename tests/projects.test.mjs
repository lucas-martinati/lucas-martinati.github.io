import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { getProjectCategory, getProjectSlug, matchesSearch } from '../src/utils/projects.js';

test('la recherche accepte accents, casse, espaces, année, points forts et plusieurs mots', () => {
    const project = {
        title: 'Éditeur de schémas',
        description: 'Une application pour le système',
        year: '2026',
        highlights: 'Rendu temps réel 60 FPS',
        challenges: 'Synchronisation asynchrone',
        tags: ['React', 'TypeScript'],
    };
    assert.equal(matchesSearch(project, '  EDITEUR   react  '), true);
    assert.equal(matchesSearch(project, 'systeme'), true);
    assert.equal(matchesSearch(project, '2026 60 fps'), true);
    assert.equal(matchesSearch(project, 'asynchrone'), true);
    assert.equal(matchesSearch(project, 'react python'), false);
    assert.equal(matchesSearch(project, '   '), true);
    assert.equal(matchesSearch({ title: 'Minimal' }, 'minimal'), true);
});

test('les slugs projets sont stables, propres et uniques dans data.json', async () => {
    assert.equal(getProjectSlug({ title: 'G502 Hub — édition Rust' }), 'g502-hub-edition-rust');
    assert.equal(getProjectSlug({ title: 'Pseudo-Code Language Support (VSCode)' }), 'pseudo-code-language-support-vscode');

    const data = JSON.parse(await readFile(new URL('../src/data/data.json', import.meta.url), 'utf8'));
    const slugs = data.projects.map(getProjectSlug);
    assert.equal(slugs.every((slug) => /^[a-z0-9-]+$/.test(slug) && slug.length > 0), true);
    assert.equal(new Set(slugs).size, slugs.length, 'Chaque projet doit avoir un slug unique');

    // Vérifie qu'aucun tag en minuscule brute ("js", "html", "css") ou texte générique n'a régressé
    const allTags = data.projects.flatMap((p) => p.tags || []);
    for (const forbidden of ['js', 'html', 'css', 'Chrome extension', 'requests']) {
        assert.equal(allTags.includes(forbidden), false, `Tag non harmonisé détecté : ${forbidden}`);
    }
    for (const proj of data.projects) {
        assert.equal(
            String(proj.highlights || '').includes('Projet conçu avec passion mettant en pratique'),
            false,
            `Highlight générique restant sur ${proj.title}`
        );
    }
});

test('les catégories explicites priment sur les tags et les anciennes données restent compatibles', () => {
    assert.equal(getProjectCategory({ category: 'web', tags: ['Rust'] }), 'web');
    assert.equal(getProjectCategory({ tags: ['Chrome Extension'] }), 'extension');
    assert.equal(getProjectCategory({ tags: ['Bash'] }), 'system');
    assert.equal(getProjectCategory({ tags: ['OCaml'] }), 'system');
    assert.equal(getProjectCategory({}), 'web');
});

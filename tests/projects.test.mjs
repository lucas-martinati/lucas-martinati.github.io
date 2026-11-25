import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { getProjectCategory, getProjectOrigin, getProjectSlug, matchesSearch } from '../src/utils/projects.js';
import { getComputedMetrics } from '../src/utils/metrics.js';

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
    assert.equal(getProjectCategory({ tags: ['Java'] }), 'system');
    assert.equal(getProjectCategory({}), 'web');
});

test('les origines projets (perso vs IUT Nancy-Charlemagne) sont détectées et recherchables', async () => {
    assert.equal(getProjectOrigin({ origin: 'iut' }), 'iut');
    assert.equal(getProjectOrigin({ origin: 'personal' }), 'personal');
    assert.equal(getProjectOrigin({ link: { org: true, github: 'Deefy' } }), 'iut');
    assert.equal(getProjectOrigin({ link: { github: 'rcloneDash' } }), 'personal');

    assert.equal(matchesSearch({ title: 'Deefy', origin: 'iut' }, 'iut charlemagne'), true);
    assert.equal(matchesSearch({ title: 'rcloneDash', origin: 'personal' }, 'iut charlemagne'), false);

    const data = JSON.parse(await readFile(new URL('../src/data/data.json', import.meta.url), 'utf8'));
    const iutProjects = data.projects.filter((p) => getProjectOrigin(p) === 'iut');
    const personalProjects = data.projects.filter((p) => getProjectOrigin(p) === 'personal');
    assert.equal(iutProjects.length, 7, 'Les 7 projets académiques IUT hors TDs doivent être présents');
    assert.equal(personalProjects.length, 15, 'Les 15 projets personnels doivent être présents');
    assert.equal(data.projects.every((p) => Boolean(p.imageUrl)), true, 'Tous les projets doivent avoir un aperçu');
    assert.equal(iutProjects.every((p) => Number(p.year) >= 2025), true, 'Les projets IUT (BUT 2025-2028) doivent être datés de 2025 ou après');
});

test('les métriques calculées restent valides même sur des données partielles', async () => {
    const data = JSON.parse(await readFile(new URL('../src/data/data.json', import.meta.url), 'utf8'));
    const full = getComputedMetrics({ projects: data.projects, education: data.education });
    assert.equal(full[0].value, String(data.projects.length));
    assert.equal(full[1].value, '3');
    assert.equal(full[2].value, '583');
    assert.equal(full[3].value, 'Mention Bien');

    const empty = getComputedMetrics({ projects: [], education: [] });
    assert.equal(empty[2].value, '—');
});

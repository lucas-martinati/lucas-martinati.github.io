import test from 'node:test';
import assert from 'node:assert/strict';
import { getProjectCategory, matchesSearch } from '../src/utils/projects.js';

test('la recherche accepte accents, casse, espaces et plusieurs mots', () => {
    const project = { title: 'Éditeur de schémas', description: 'Une application pour le système', tags: ['React', 'TypeScript'] };
    assert.equal(matchesSearch(project, '  EDITEUR   react  '), true);
    assert.equal(matchesSearch(project, 'systeme'), true);
    assert.equal(matchesSearch(project, 'react python'), false);
    assert.equal(matchesSearch(project, '   '), true);
    assert.equal(matchesSearch({ title: 'Minimal' }, 'minimal'), true);
});

test('les catégories explicites priment sur les tags et les anciennes données restent compatibles', () => {
    assert.equal(getProjectCategory({ category: 'web', tags: ['Rust'] }), 'web');
    assert.equal(getProjectCategory({ tags: ['Chrome Extension'] }), 'extension');
    assert.equal(getProjectCategory({ tags: ['Bash'] }), 'system');
    assert.equal(getProjectCategory({}), 'web');
});

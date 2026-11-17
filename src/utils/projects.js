export function getProjectCategory(project) {
    if (project.category) return project.category;
    const tags = (project.tags || []).join(' ').toLowerCase();
    if (/extension|chrome|vscode/.test(tags)) return 'extension';
    if (/linux|systemd|bash|pyqt5|rust|tui|ocaml/.test(tags)) return 'system';
    return 'web';
}

export function normalizeSearch(value = '') {
    return String(value).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
}

export function getProjectSlug(project) {
    return normalizeSearch(project?.title || '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
}

export function matchesSearch(project, query) {
    const normalizedQuery = normalizeSearch(query);
    if (!normalizedQuery) return true;
    const text = normalizeSearch([
        project.title,
        project.description,
        project.year,
        project.highlights,
        project.challenges,
        ...(project.tags || []),
    ].filter(Boolean).join(' '));
    return normalizedQuery.split(/\s+/).every((word) => text.includes(word));
}

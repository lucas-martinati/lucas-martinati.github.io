export function getProjectCategory(project) {
    if (project.category) return project.category;
    const tags = (project.tags || []).join(' ').toLowerCase();
    if (/extension|chrome|vscode/.test(tags)) return 'extension';
    if (/linux|systemd|bash|pyqt5|rust|tui/.test(tags)) return 'system';
    return 'web';
}

export function normalizeSearch(value) {
    return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
}

export function matchesSearch(project, query) {
    const text = normalizeSearch([project.title, project.description, ...(project.tags || [])].join(' '));
    return normalizeSearch(query).split(/\s+/).every((word) => text.includes(word));
}

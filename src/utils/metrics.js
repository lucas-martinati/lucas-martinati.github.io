// Dynamic metrics generator from raw portfolio data

export function getComputedMetrics({ developer = {}, projects = [], education = [] } = {}) {
    // 1. Total projects count
    const totalProjects = projects.length;

    // 2. Published extensions on Chrome Web Store & VS Code Marketplace
    const extensionsCount = projects.filter((p) => {
        const isExtensionCat = p.category === 'extension';
        const hasStoreLink = p.link?.href && (
            p.link.href.includes('chromewebstore.google.com') ||
            p.link.href.includes('marketplace.visualstudio.com')
        );
        const tags = (p.tags || []).map((t) => t.toLowerCase());
        const hasExtensionTag = tags.some((t) => t.includes('extension') || t.includes('vscode') || t.includes('chrome'));
        return isExtensionCat || hasStoreLink || hasExtensionTag;
    }).length;

    // 3. PIX certification score
    const pixItem = education.find((e) =>
        (e.title && e.title.toLowerCase().includes('pix')) ||
        (e.highlight && e.highlight.toLowerCase().includes('pix'))
    );
    const pixScore = pixItem?.highlight?.replace(/[^\d]/g, '');

    // 4. Baccalauréat mention
    const bacItem = education.find((e) =>
        e.title && e.title.toLowerCase().includes('bac')
    );
    let bacMention = 'Mention Bien';;
    if (bacItem?.title) {
        if (/très bien/i.test(bacItem.title)) {
            bacMention = 'Mention TB';
        } else if (/bien/i.test(bacItem.title)) {
            bacMention = 'Mention Bien';
        } else if (/assez bien/i.test(bacItem.title)) {
            bacMention = 'Mention AB';
        }
    }

    return [
        {
            value: `${totalProjects}`,
            label: 'Projets Conçus',
            sub: 'Web, Mobile & CLI'
        },
        {
            value: `${extensionsCount}`,
            label: 'Extensions Publiées',
            sub: 'Chrome & VS Code Stores'
        },
        {
            value: `${pixScore}`,
            label: 'Score PIX',
            sub: 'Maîtrise Numérique'
        },
        {
            value: bacMention,
            label: 'Baccalauréat',
            sub: 'Maths Expertes'
        }
    ];
}

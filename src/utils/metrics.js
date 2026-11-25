// Dynamic metrics generator from raw portfolio data
import { getProjectOrigin } from './projects.js';

export function getComputedMetrics({ developer = {}, projects = [], education = [] } = {}) {
    // 1. Total projects count & breakdown (personal vs IUT)
    const totalProjects = projects.length;
    const iutCount = projects.filter((p) => getProjectOrigin(p) === 'iut').length;
    const personalCount = totalProjects - iutCount;
    const projectsSub = totalProjects > 0 && iutCount > 0
        ? `${personalCount} perso · ${iutCount} SAÉ IUT`
        : 'Web, Mobile & CLI';

    // 2. Published extensions on Chrome Web Store & VS Code Marketplace
    const extensionsCount = projects.filter((p) => {
        const isExtensionCat = p.category === 'extension';
        const hasStoreLink = p.link?.href && (
            p.link.href.includes('chromewebstore.google.com') ||
            p.link.href.includes('marketplace.visualstudio.com')
        );
        return isExtensionCat || hasStoreLink;
    }).length;

    // 3. Recruitment horizon or current degree fallback
    const recruitment = developer?.recruitment || {};
    const isSeeking = recruitment.enabled ?? recruitment.seeking ?? false;
    const periodMatch = String(recruitment.period || '').match(/20\d{2}\s*[-–]\s*20\d{2}/);
    const targetPeriod = periodMatch ? periodMatch[0].replace(/\s*[-–]\s*/, '–') : '2027–2028';

    const currentEducation = education.find((e) => e.type === 'education');
    const fallbackEducationValue = currentEducation?.period || 'Bac+3';

    return [
        {
            value: `${totalProjects}`,
            label: 'Projets Conçus',
            sub: projectsSub
        },
        {
            value: `${extensionsCount}`,
            label: 'Extensions Publiées',
            sub: 'Chrome & VS Code Stores'
        },
        {
            value: 'Web & Linux',
            label: 'Double Culture',
            sub: 'PHP, JS, Java, Rust & Bash'
        },
        isSeeking
            ? {
                value: targetPeriod,
                label: 'Alternance BUT 3',
                sub: 'Nancy · Grand Est · Remote'
            }
            : {
                value: fallbackEducationValue,
                label: 'BUT Informatique',
                sub: 'IUT Nancy-Charlemagne'
            }
    ];
}

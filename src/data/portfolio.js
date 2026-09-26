// ─────────────────────────────────────────────────────────────
// COUCHE DATA — fusionne le contenu (data.json, modifiable à
// volonté) avec l'identité canonique (config/site.js).
//
// Règle : data.json ne contient AUCUNE info d'identité en dur
// (ni nom, ni email, ni pseudo GitHub/LinkedIn dans les URLs).
// Les liens de projets sont stockés sans pseudo :
//   { text, github: "mon-repo" }  → github.com/<compte>/mon-repo
//   { text, pages: "MonSite" }     → <compte>.github.io/MonSite/
//   { text, href: "https://..." }  → lien externe tel quel
// Le compte est le perso, sauf `"org": true` (compte organisation
// centralisé dans config : GITHUB_ORG_USERNAME).
//
// App.jsx importe CE module (jamais data.json directement).
// ─────────────────────────────────────────────────────────────
import rawData from './data.json';
import {
    DEVELOPER_NAME,
    DEVELOPER_INITIALS,
    BRAND_SUFFIX,
    CONTACT_EMAIL,
    GITHUB_URL,
    GITHUB_USERNAME,
    GITHUB_ORG_USERNAME,
    LINKEDIN_URL,
    SITE_URL,
} from '../config/site';

/** Construit l'URL complète d'un lien projet depuis le compte centralisé (perso ou org). */
export function resolveProjectLink(link) {
    if (!link) return link;
    if (link.href) return link;
    const owner = link.org ? GITHUB_ORG_USERNAME : GITHUB_USERNAME;
    if (link.github) return { ...link, href: `https://github.com/${owner}/${link.github}` };
    if (link.pages) return { ...link, href: `https://${owner}.github.io/${link.pages}/` };
    return link;
}

const developer = {
    ...rawData.developer,
    name: DEVELOPER_NAME,
    initials: DEVELOPER_INITIALS,
    brandSuffix: BRAND_SUFFIX,
    email: CONTACT_EMAIL,
    github: GITHUB_URL,
    linkedin: LINKEDIN_URL,
    site: SITE_URL,
};

const projects = rawData.projects.map((project) => ({
    ...project,
    link: resolveProjectLink(project.link),
}));

const portfolio = {
    ...rawData,
    developer,
    projects,
};

export { developer, projects };
export default portfolio;

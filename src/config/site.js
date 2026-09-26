// ─────────────────────────────────────────────────────────────
// SOURCE UNIQUE — Identité & contact.
//
// C'est ICI (et uniquement ici) que se modifient :
// nom, email, pseudo GitHub, LinkedIn, URL du site, marque.
//
// Tout le reste en découle automatiquement :
//  - src/data/portfolio.js y injecte l'identité dans les datas
//    (plus aucun doublon nom/email/github/linkedin dans data.json)
//  - les composants lisent tout via la prop `developer`
//  - index.html est généré au build via vite.config.js
//
// Changer CONTACT_EMAIL ici = changé partout (cartes contact,
// hero, navbar, CodeBio, espace recruteur, sujet du mailto).
// Changer GITHUB_USERNAME ici = profil + tous les liens de
// projets reconstruits (les projets sont stockés sans pseudo,
// voir resolveProjectLink dans src/data/portfolio.js).
// ─────────────────────────────────────────────────────────────

export const DEVELOPER_NAME = 'Lucas Martinati';
export const DEVELOPER_INITIALS = 'LM';
export const BRAND_SUFFIX = '_DEV';

export const CONTACT_EMAIL = 'lucasm54800@gmail.com';

export const GITHUB_USERNAME = 'lucas-martinati';
export const GITHUB_URL = `https://github.com/${GITHUB_USERNAME}`;
export const GITHUB_PAGES_BASE = `https://${GITHUB_USERNAME}.github.io`;
export const SITE_URL = GITHUB_PAGES_BASE;

// Compte organisation (projets scolaires / d'équipe).
// Dans data.json, un lien marqué `"org": true` est construit
// sur ce compte au lieu du compte perso.
export const GITHUB_ORG_USERNAME = 'lucas-martinati-pro';

export const LINKEDIN_URL = 'https://www.linkedin.com/in/lucas-martinati-7452bb3b0/';

// Textes SEO / partage social (utilisés par vite.config.js dans index.html)
export const SITE_TITLE = `${DEVELOPER_NAME} — Développeur Full-Stack | Portfolio`;
export const SITE_DESCRIPTION = `Portfolio de ${DEVELOPER_NAME} — Développeur Full-Stack, concepteur d'extensions Chrome/VS Code et étudiant en BUT Informatique à Nancy. À la recherche d'une alternance.`;

export default {
    DEVELOPER_NAME,
    DEVELOPER_INITIALS,
    BRAND_SUFFIX,
    CONTACT_EMAIL,
    GITHUB_USERNAME,
    GITHUB_URL,
    GITHUB_PAGES_BASE,
    SITE_URL,
    GITHUB_ORG_USERNAME,
    LINKEDIN_URL,
    SITE_TITLE,
    SITE_DESCRIPTION,
};

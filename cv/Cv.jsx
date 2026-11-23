import { useMemo } from 'react';
import ResponsiveImage from '../src/components/ResponsiveImage';
import { getProjectOrigin } from '../src/utils/projects';
// Page CV — imprimable (voir cv/cv.css pour les règles @media print).
// Le bouton télécharge public/cv.pdf, généré par `npm run cv:pdf`
// (impression headless Chrome : rendu identique au Ctrl+P).
// Tout le contenu vient des datas centralisées : aucune info en dur.
// `photo` et `cv.pdf` sont préfixés de "../" car cette page vit dans /cv/
// alors que les assets publics sont servis à la racine.
const TYPE_LABELS = {
    education: 'Formation',
    certification: 'Certification',
    work: 'Expérience',
};

const SKILL_LEVELS = ['Notions', 'Pratique guidée', 'Autonome', 'Avancé'];
// Nombre de projets "coup de cœur" affichés dans la section Expérience informatique du CV.
const CV_PROJECT_COUNT = 3;

function SkillLevel({ title, level }) {
    if (!Number.isInteger(level) || level < 1 || level > SKILL_LEVELS.length) return null;
    return (
        <span className="cv-skill-level" role="img" aria-label={`${title} : ${level} sur ${SKILL_LEVELS.length} — ${SKILL_LEVELS[level - 1]}`}>
            <span className="cv-level-value" aria-hidden="true"><strong>{level}</strong><span>/{SKILL_LEVELS.length}</span></span>
            <span className="cv-level-marks" aria-hidden="true">
                {SKILL_LEVELS.map((label, index) => (
                    <span key={label} className={`cv-level-mark${index < level ? ' is-filled' : ''}`} />
                ))}
            </span>
        </span>
    );
}

// "Français — natif" → nom + pastille de niveau.
function splitLevel(label) {
    const parts = String(label).split('—').map((s) => s.trim());
    if (parts.length >= 2) return { name: parts[0], level: parts.slice(1).join(' — ') };
    return { name: label, level: null };
}

export default function Cv({ developer = {}, education = [], skills = [], projects = [], cv = {} }) {
    const photoSrc = cv.photo && !cv.photo.startsWith('http') ? `../${cv.photo}` : cv.photo;
    const phoneHref = cv.phone ? `tel:+33${cv.phone.replace(/\D/g, '').replace(/^0/, '')}` : null;
    const pdfFile = `CV-${(developer.name || 'Candidat').replace(/\s+/g, '-')}.pdf`;
    // Les "coup de cœur" du CV : les 3 projets featured les plus récents, les plus récents d'abord.
    const featuredProjects = useMemo(() => {
        const featured = [...(projects || [])]
            .filter((project) => project.featured)
            .sort((a, b) => Number(b.year || 0) - Number(a.year || 0));
        return featured.slice(0, CV_PROJECT_COUNT).map((project) => ({
            ...project,
            projectTitle: project.title,
            displayTitle: project.title,
            summary: project.highlights || project.description,
        }));
    }, [projects]);
    const projectsNote = useMemo(() => {
        const origins = new Set(featuredProjects.map((project) => getProjectOrigin(project)));
        if (origins.has('iut') && origins.has('personal')) return 'Projets personnels et universitaires — conception et développement';
        if (origins.has('iut')) return 'Projets universitaires — conception et développement';
        return 'Projets personnels — conception et développement';
    }, [featuredProjects]);

    return (
        <div className="cv-page">
            {/* Barre d'actions — écran uniquement, masquée à l'impression */}
            <div className="cv-toolbar no-print">
                <a
                    href="../"
                    className="cv-toolbar-btn cv-back"
                >
                    <span aria-hidden="true">←</span> Retour au portfolio
                </a>
                <span className="cv-toolbar-brand" aria-hidden="true">
                    <span className="cv-brand-accent">{developer.initials}</span>{developer.brandSuffix}
                </span>
                <a
                    href="../cv.pdf"
                    download={pdfFile}
                    className="cv-toolbar-btn cv-print"
                >
                    <span aria-hidden="true">⬇</span> Télécharger le PDF
                </a>
            </div>

            <main className="cv-sheet">
                {/* En-tête : identité + photo */}
                <header className="cv-header">
                    <div className="cv-identity">
                        <p className="cv-kicker">{cv.headline}</p>
                        <h1 className="cv-name">{developer.name}</h1>
                        <p className="cv-age">{cv.age}</p>
                        <div className="cv-contact">
                            <a href={`mailto:${developer.email}`} className="cv-chip">
                                <span aria-hidden="true">✉</span> {developer.email}
                            </a>
                            {cv.phone && (
                                <a href={phoneHref} className="cv-chip">
                                    <span aria-hidden="true">📞</span> {cv.phone}
                                </a>
                            )}
                            <a href={developer.site} target="_blank" rel="noopener noreferrer" className="cv-chip">
                                <span aria-hidden="true">🌐</span> {developer.site?.replace(/^https?:\/\//, '')}
                            </a>
                            {cv.location && (
                                <span className="cv-chip">
                                    <span aria-hidden="true">📍</span> {cv.location}
                                </span>
                            )}
                            {cv.permit && (
                                <span className="cv-chip">
                                    <span aria-hidden="true">🚗</span> {cv.permit}
                                </span>
                            )}
                        </div>
                    </div>
                    {photoSrc && (
                        <ResponsiveImage src={cv.photo} prefix={cv.photo.startsWith('http') ? '' : '../'} alt={`Photo de ${developer.name}`} className="cv-photo" sizes="160px" />
                    )}
                </header>

                {/* Accroche + stack en pleine largeur : visibles au premier coup d'œil */}
                <section className="cv-section cv-profile-section">
                    <h2 className="cv-section-title">Profil</h2>
                    <p className="cv-profile">{cv.profile}</p>
                </section>

                <section className="cv-section">
                    <h2 className="cv-section-title">Stack technique</h2>
                    <div className="cv-tech-grid">
                        {(skills || []).map((cat) => (
                            <div key={cat.title} className="cv-tech-cat">
                                <div className="cv-tech-content">
                                    <p className="cv-tech-label">{cat.title}</p>
                                    <p className="cv-tech-tools">{(cat.tags || []).join(' · ')}</p>
                                </div>
                                <SkillLevel title={cat.title} level={cv.technicalLevels?.[cat.title]} />
                            </div>
                        ))}
                        <div className="cv-level-legend" aria-label="Échelle de maîtrise technique">
                            <p>Échelle de maîtrise (sur {SKILL_LEVELS.length})</p>
                            <div className="cv-level-key">
                                {SKILL_LEVELS.map((label, index) => (
                                    <span key={label}><b>{index + 1}</b> {label}</span>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                <div className="cv-columns">
                    {/* Colonne principale */}
                    <div className="cv-col cv-col-main">
                        {featuredProjects.length > 0 && (
                            <section className="cv-section cv-projects-section" aria-labelledby="cv-projects-heading">
                                <h2 className="cv-section-title" id="cv-projects-heading">Expérience informatique</h2>
                                <p className="cv-section-note">{projectsNote}</p>
                                {featuredProjects.map((project) => {
                                    const linkHref = project.link?.href || null;
                                    return (
                                        <article key={project.title} className="cv-project-item">
                                            <h3 className="cv-project-title">
                                                {linkHref ? (
                                                    <a href={linkHref} target="_blank" rel="noopener noreferrer">{project.displayTitle}</a>
                                                ) : (
                                                    project.displayTitle
                                                )}
                                            </h3>
                                            <p className="cv-project-meta">
                                                {project.year}{project.status?.className === 'status-in-progress' ? ' · En cours' : ''}
                                                {' · '}{project.tags.slice(0, 4).join(' · ')}
                                            </p>
                                            <p className="cv-project-summary">{project.summary}</p>
                                        </article>
                                    );
                                })}
                            </section>
                        )}

                        <section className="cv-section">
                            <h2 className="cv-section-title">Expérience professionnelle</h2>
                            {(cv.experiences || []).map((exp) => (
                                <article key={exp.role + exp.company} className="cv-card cv-exp-item">
                                    <div className="cv-exp-head">
                                        <div>
                                            <h3 className="cv-exp-role">{exp.role}</h3>
                                            <p className="cv-exp-company">{exp.company}</p>
                                        </div>
                                        <span className="cv-pill">{exp.period}</span>
                                    </div>
                                    <ul className="cv-exp-details">
                                        {(exp.details || []).map((detail) => (
                                            <li key={detail}>{detail}</li>
                                        ))}
                                    </ul>
                                </article>
                            ))}
                        </section>

                        <section className="cv-section">
                            <h2 className="cv-section-title">Éducation</h2>
                            {education.filter((item) => !item.hideOnCv).map((item, i) => (
                                <article key={item.title + i} className="cv-edu-item">
                                    <div className="cv-edu-head">
                                        <h3 className="cv-edu-title">{item.title}</h3>
                                        <span className="cv-pill cv-pill-soft">{TYPE_LABELS[item.type] || item.type}</span>
                                    </div>
                                    <p className="cv-edu-school">{item.school}</p>
                                    <p className="cv-edu-meta">
                                        <span className="cv-period">{item.period}</span>
                                        {item.highlight && (
                                            <span className="cv-highlight-pill">{item.highlight}</span>
                                        )}
                                    </p>
                                </article>
                            ))}
                        </section>
                    </div>

                    {/* Colonne latérale */}
                    <div className="cv-col cv-col-side">
                        <section className="cv-section">
                            <h2 className="cv-section-title">Savoir-être</h2>
                            <ul className="cv-skills">
                                {(cv.skills || []).map((skill) => (
                                    <li key={skill.title} className="cv-skill">
                                        <span className="cv-pill cv-pill-accent">{skill.title}</span>
                                        <span className="cv-skill-desc">{skill.desc}</span>
                                    </li>
                                ))}
                            </ul>
                        </section>

                        <section className="cv-section">
                            <h2 className="cv-section-title">Langues</h2>
                            <ul className="cv-lang-list">
                                {(cv.languages || []).map((lang) => {
                                    const { name, level } = splitLevel(lang);
                                    return (
                                        <li key={lang} className="cv-lang">
                                            <span className="cv-lang-name">{name}</span>
                                            {level && <span className="cv-pill cv-pill-soft">{level}</span>}
                                        </li>
                                    );
                                })}
                            </ul>
                        </section>

                        <section className="cv-section">
                            <h2 className="cv-section-title">Centres d'intérêt</h2>
                            <div className="cv-pills">
                                {(cv.interests || []).map((interest) => (
                                    <span key={interest} className="cv-pill">{interest}</span>
                                ))}
                            </div>
                        </section>

                        <section className="cv-section">
                            <h2 className="cv-section-title">Activités</h2>
                            {(cv.activities || []).map((activity) => (
                                <div key={activity.title} className="cv-card cv-activity">
                                    <p className="cv-activity-title">{activity.title}</p>
                                    <p className="cv-period">{activity.period}</p>
                                </div>
                            ))}
                        </section>
                    </div>
                </div>

            </main>
        </div>
    );
}

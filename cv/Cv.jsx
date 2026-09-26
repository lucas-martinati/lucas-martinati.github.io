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

// "Français — natif" → nom + pastille de niveau.
function splitLevel(label) {
    const parts = String(label).split('—').map((s) => s.trim());
    if (parts.length >= 2) return { name: parts[0], level: parts.slice(1).join(' — ') };
    return { name: label, level: null };
}

export default function Cv({ developer = {}, education = [], skills = [], cv = {} }) {
    const photoSrc = cv.photo && !cv.photo.startsWith('http') ? `../${cv.photo}` : cv.photo;
    const phoneHref = cv.phone ? `tel:+33${cv.phone.replace(/\D/g, '').replace(/^0/, '')}` : null;
    const pdfFile = `CV-${developer.name.replace(/\s+/g, '-')}.pdf`;

    return (
        <div className="cv-page">
            {/* Barre d'actions — écran uniquement, masquée à l'impression */}
            <div className="cv-toolbar no-print">
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
                        <img src={photoSrc} alt={`Photo de ${developer.name}`} className="cv-photo" />
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
                                <p className="cv-tech-label">{cat.title}</p>
                                <div className="cv-pills">
                                    {(cat.tags || []).map((tag) => (
                                        <span key={tag} className="cv-pill cv-pill-accent">{tag}</span>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                <div className="cv-columns">
                    {/* Colonne principale */}
                    <div className="cv-col cv-col-main">
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
                            <h2 className="cv-section-title">Centres d'intérêts</h2>
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

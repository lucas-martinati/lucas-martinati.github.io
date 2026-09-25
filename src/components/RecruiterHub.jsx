import { BriefcaseIcon, MailIcon, LinkedinIcon, CopyIcon, SparklesIcon } from './Icons';

export default function RecruiterHub({ developer = {}, onShowToast }) {
    const recruitment = developer.recruitment || {};
    const strengths = recruitment.strengths || [];

    const handleCopyEmail = async () => {
        const email = developer.email || 'lucasm54800@gmail.com';
        try {
            await navigator.clipboard.writeText(email);
            if (onShowToast) onShowToast('Email copié dans le presse-papier !', 'success');
        } catch {
            if (onShowToast) onShowToast(`Email : ${email}`, 'info');
        }
    };

    const linkedinUrl = developer.linkedin || 'https://www.linkedin.com/in/lucas-martinati-7452bb3b0/';

    return (
        <section className="recruiter-hub" id="recruiter">
            <div className="recruiter-container">
                {/* Header */}
                <div className="recruiter-header">
                    <div className="recruiter-badge">
                        <BriefcaseIcon size={15} />
                        <span>{recruitment.badge || "Espace Recrutement & Alternance"}</span>
                    </div>
                    <h2 className="section-title">Pourquoi me recruter ?</h2>
                    <p className="recruiter-subtitle">
                        À la recherche d'un profil jeune, rigoureux et déjà capable de transformer des idées en solutions concrètes déployées ?
                        Voici ce que j'apporte à vos projets dès le premier jour.
                    </p>
                </div>

                {/* 4 Pillars of Value */}
                <div className="recruiter-strengths-grid">
                    {strengths.map((item, idx) => (
                        <div key={idx} className="recruiter-strength-card">
                            <div className="strength-icon-wrap">
                                <span className="strength-icon">{item.icon}</span>
                            </div>
                            <h3 className="strength-title">{item.title}</h3>
                            <p className="strength-desc">{item.desc}</p>
                        </div>
                    ))}
                </div>

                {/* Alternance Dashboard Card */}
                <div className="recruiter-dashboard-card">
                    <div className="dashboard-grid">
                        {/* Left specs */}
                        <div className="dashboard-specs">
                            <div className="dashboard-specs-header">
                                <div className="specs-indicator"></div>
                                <h3>Fiche Synthétique — Recherche d'Alternance</h3>
                            </div>

                            <div className="specs-table">
                                <div className="spec-row">
                                    <span className="spec-label">Diplôme visé :</span>
                                    <span className="spec-value">{recruitment.degree || "BUT Informatique (Bac+3) ➔ Diplôme d'Ingénieur (Bac+5)"}</span>
                                </div>
                                <div className="spec-row">
                                    <span className="spec-label">Établissement :</span>
                                    <span className="spec-value">{recruitment.school || "IUT Nancy-Charlemagne (Université de Lorraine) ➔ Télécom Nancy"}</span>
                                </div>
                                <div className="spec-row">
                                    <span className="spec-label">Type de contrat :</span>
                                    <span className="spec-value highlight-green">{recruitment.contract || "Apprentissage / Professionnalisation"}</span>
                                </div>
                                <div className="spec-row">
                                    <span className="spec-label">Période cible :</span>
                                    <span className="spec-value">{recruitment.period || "2027 - 2028 (1 an en BUT 3) • Poursuite visée en école d'ingénieurs (Télécom Nancy)"}</span>
                                </div>
                                <div className="spec-row">
                                    <span className="spec-label">Localisation :</span>
                                    <span className="spec-value">{recruitment.location || "Nancy / Grand Est / Télétravail"}</span>
                                </div>
                                <div className="spec-row">
                                    <span className="spec-label">Stack de prédilection :</span>
                                    <span className="spec-value">{recruitment.stack || "React, Next.js, TypeScript, Python, Linux, Bash"}</span>
                                </div>
                            </div>
                        </div>

                        {/* Right Quick Action Panel */}
                        <div className="dashboard-actions-panel">
                            <div className="panel-inner">
                                <div className="panel-badge">
                                    <SparklesIcon size={14} />
                                    <span>Échangeons sur vos besoins</span>
                                </div>
                                <h4 className="panel-title">Un projet ou une opportunité ?</h4>
                                <p className="panel-text">
                                    Je suis prêt à vous présenter mes réalisations, mon code source et discuter de la valeur que je peux apporter à votre équipe.
                                </p>

                                <div className="panel-cta-stack">
                                    <a
                                        href={`mailto:${developer.email || 'lucasm54800@gmail.com'}?subject=Opportunit%C3%A9%20Alternance%20BUT%20Informatique%20-%20Lucas%20Martinati`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="btn-primary panel-btn"
                                    >
                                        <MailIcon size={18} />
                                        <span>Me proposer une opportunité</span>
                                    </a>

                                    <div className="panel-sub-buttons">
                                        <button
                                            type="button"
                                            className="btn-secondary panel-btn-half"
                                            onClick={handleCopyEmail}
                                            title="Copier l'adresse email"
                                        >
                                            <CopyIcon size={16} />
                                            <span>Copier l'email</span>
                                        </button>

                                        <a
                                            href={linkedinUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="btn-secondary panel-btn-half"
                                        >
                                            <LinkedinIcon size={16} />
                                            <span>LinkedIn</span>
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

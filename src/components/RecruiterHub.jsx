import useClipboard from '../utils/useClipboard';
import { BriefcaseIcon, MailIcon, LinkedinIcon, CopyIcon, CheckIcon, SparklesIcon } from './Icons';

export default function RecruiterHub({ developer = {}, onShowToast }) {
    const recruitment = developer.recruitment || {};
    const strengths = recruitment.strengths || [];
    const { copied, copy } = useClipboard();

    const handleCopyEmail = async () => {
        const email = developer.email;
        if (!email) return;
        const ok = await copy(email);
        if (onShowToast) {
            onShowToast(ok ? 'Email copié dans le presse-papiers !' : `Email : ${email}`, ok ? 'success' : 'info');
        }
    };

    const linkedinUrl = developer.linkedin;

    return (
        <section className="recruiter-hub" id="recruiter">
            <div className="recruiter-container">
                {/* Header */}
                <div className="recruiter-header">
                    <div className="recruiter-badge">
                        <BriefcaseIcon size={15} />
                        <span>{recruitment.badge}</span>
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
                            <div className="strength-icon-wrap" aria-hidden="true">
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
                                    <span className="spec-value">{recruitment.degree}</span>
                                </div>
                                <div className="spec-row">
                                    <span className="spec-label">Établissement :</span>
                                    <span className="spec-value">{recruitment.school}</span>
                                </div>
                                <div className="spec-row">
                                    <span className="spec-label">Type de contrat :</span>
                                    <span className="spec-value highlight-green">{recruitment.contract}</span>
                                </div>
                                <div className="spec-row">
                                    <span className="spec-label">Période cible :</span>
                                    <span className="spec-value">{recruitment.period}</span>
                                </div>
                                <div className="spec-row">
                                    <span className="spec-label">Localisation :</span>
                                    <span className="spec-value">{recruitment.location}</span>
                                </div>
                                {recruitment.rhythm && (
                                    <div className="spec-row">
                                        <span className="spec-label">Rythme :</span>
                                        <span className="spec-value">{recruitment.rhythm}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Right Quick Action Panel */}
                        <div className="dashboard-actions-panel">
                            <div className="panel-inner">
                                <div className="panel-badge">
                                    <SparklesIcon size={14} />
                                    <span>Échangeons sur vos besoins</span>
                                </div>
                                <h3 className="panel-title">Un projet ou une opportunité ?</h3>
                                <p className="panel-text">
                                    Je suis prêt à vous présenter mes réalisations, mon code source et discuter de la valeur que je peux apporter à votre équipe.
                                </p>

                                <div className="panel-cta-stack">
                                    <a
                                        href={`mailto:${developer.email}?subject=${encodeURIComponent(`Opportunité Alternance BUT Informatique - ${developer.name}`)}`}
                                        className="btn-primary panel-btn"
                                    >
                                        <MailIcon size={18} />
                                        <span>Me proposer une opportunité</span>
                                    </a>

                                    <div className="panel-sub-buttons">
                                        <button
                                            type="button"
                                            className="btn-secondary panel-btn-half js-only"
                                            onClick={handleCopyEmail}
                                            title="Copier l'adresse email"
                                        >
                                            {copied ? <CheckIcon size={16} /> : <CopyIcon size={16} />}
                                            <span>{copied ? 'Copié !' : "Copier l'email"}</span>
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

                                    <a
                                        href="cv/"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="btn-secondary panel-btn"
                                        aria-label="Voir mon CV (nouvel onglet)"
                                    >
                                        <span aria-hidden="true">📄</span>
                                        <span>Voir mon CV</span>
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

import { useState } from 'react';
import { GithubIcon, LinkedinIcon, MailIcon, ExternalLinkIcon, CopyIcon, CheckIcon, ArrowUpIcon } from './Icons';

export default function Footer({ developer = {} }) {
    const [copied, setCopied] = useState(false);
    const isSeeking = developer.recruitment?.enabled ?? developer.recruitment?.seeking;

    const handleCopyEmail = async () => {
        try {
            await navigator.clipboard.writeText(developer.email);
            setCopied(true);
            setTimeout(() => setCopied(false), 2500);
        } catch {
            // fallback
            const input = document.createElement('input');
            input.value = developer.email;
            document.body.appendChild(input);
            input.select();
            document.execCommand('copy');
            document.body.removeChild(input);
            setCopied(true);
            setTimeout(() => setCopied(false), 2500);
        }
    };

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <footer className="site-footer" id="contact">
            <div className="contact-container">
                <div className="contact-header">
                    <div className="contact-badge">
                        <span className="pulse-dot"></span>
                        <span>Collaborons ensemble</span>
                    </div>
                    <h2 className="section-title">Restons en contact</h2>
                    <p className="contact-subtitle">
                        {isSeeking
                            ? "À la recherche d'une alternance, d'un stage ou envie d'échanger autour d'un projet technologique ? N'hésitez pas à me joindre sur mes réseaux ou par email."
                            : "Envie d'échanger autour d'un projet technologique, d'une collaboration open-source ou simplement discuter tech ? N'hésitez pas à me joindre sur mes réseaux ou par email."}
                    </p>
                </div>

                <div className="contact-grid">
                    {/* GitHub Card */}
                    <a
                        href={developer.github}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="contact-card github-card"
                    >
                        <div className="card-top">
                            <div className="card-icon-wrap">
                                <GithubIcon size={26} />
                            </div>
                            <span className="card-arrow">
                                <ExternalLinkIcon size={18} />
                            </span>
                        </div>
                        <div className="card-info">
                            <span className="card-tag">Code & Projets</span>
                            <h3 className="card-title">GitHub</h3>
                            <p className="card-desc">
                                Explorez mes dépôts, mes outils open-source et l'historique de mes commits.
                            </p>
                            <span className="card-link-text">
                                {developer.github.replace(/^https?:\/\//, '')}
                            </span>
                        </div>
                    </a>

                    {/* LinkedIn Card */}
                    <a
                        href={developer.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="contact-card linkedin-card"
                    >
                        <div className="card-top">
                            <div className="card-icon-wrap">
                                <LinkedinIcon size={26} />
                            </div>
                            <span className="card-arrow">
                                <ExternalLinkIcon size={18} />
                            </span>
                        </div>
                        <div className="card-info">
                            <span className="card-tag">Réseau Professionnel</span>
                            <h3 className="card-title">LinkedIn</h3>
                            <p className="card-desc">
                                Retrouvez mon parcours, mes recommandations et échangeons sur mes disponibilités.
                            </p>
                            <span className="card-link-text">{developer.name}</span>
                        </div>
                    </a>

                    {/* Email Card */}
                    <div className="contact-card email-card">
                        <div className="card-top">
                            <div className="card-icon-wrap">
                                <MailIcon size={26} />
                            </div>
                            <button
                                type="button"
                                className={`copy-btn ${copied ? 'copied' : ''}`}
                                onClick={handleCopyEmail}
                                title={copied ? 'Email copié dans le presse-papier !' : "Copier l'adresse email"}
                                aria-label="Copier l'adresse email"
                            >
                                {copied ? <CheckIcon size={16} /> : <CopyIcon size={16} />}
                                <span>{copied ? 'Copié !' : 'Copier'}</span>
                            </button>
                        </div>
                        <div className="card-info">
                            <span className="card-tag">Message direct</span>
                            <h3 className="card-title">Email</h3>
                            <p className="card-desc">
                                Disponible pour répondre rapidement à vos questions et opportunités d'emploi.
                            </p>
                            <a
                                href={`mailto:${developer.email}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="card-link-text email-action-link"
                            >
                                {developer.email}
                            </a>
                        </div>
                    </div>
                </div>

                <div className="footer-bottom">
                    <div className="footer-left">
                        <span className="footer-logo">{developer.initials}{developer.brandSuffix}</span>
                        <span className="footer-divider">•</span>
                        <span className="footer-copy">
                            Conçu &amp; développé par <strong>{developer.name}</strong>
                        </span>
                    </div>

                    <div className="footer-right">
                        <button
                            type="button"
                            className="back-to-top-btn"
                            onClick={scrollToTop}
                            aria-label="Retourner en haut de la page"
                        >
                            <span>Haut de page</span>
                            <ArrowUpIcon size={16} />
                        </button>
                    </div>
                </div>
            </div>
        </footer>
    );
}

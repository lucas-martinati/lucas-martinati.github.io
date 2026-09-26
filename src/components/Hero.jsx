import { useState, useEffect, useMemo } from 'react';
import { GithubIcon, LinkedinIcon, MailIcon, ArrowRightIcon, BriefcaseIcon } from './Icons';
import { getComputedMetrics } from '../utils/metrics';

export default function Hero({ developer = {}, projects = [], education = [] }) {
    const [roleIndex, setRoleIndex] = useState(0);
    const [fadeState, setFadeState] = useState('fade-in');

    const roles = developer.roles;

    const recruitment = developer.recruitment || {};
    const isSeeking = recruitment.enabled ?? recruitment.seeking;

    const metrics = useMemo(() => {
        return getComputedMetrics({ developer, projects, education });
    }, [developer, projects, education]);

    useEffect(() => {
        const interval = setInterval(() => {
            setFadeState('fade-out');
            setTimeout(() => {
                setRoleIndex((prev) => (prev + 1) % roles.length);
                setFadeState('fade-in');
            }, 300);
        }, 3200);

        return () => clearInterval(interval);
    }, [roles.length]);

    const handleScrollTo = (e, id) => {
        e.preventDefault();
        const el = document.getElementById(id);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
    };

    const githubUrl = developer.github;
    const linkedinUrl = developer.linkedin;
    const emailUrl = `mailto:${developer.email}`;

    return (
        <section className="hero">
            <div className="hero-content">
                {/* Live Availability Status */}
                <a
                    href={isSeeking ? "#recruiter" : "#contact"}
                    className={`hero-badge ${!isSeeking ? 'hero-badge-passive' : ''}`}
                    onClick={(e) => handleScrollTo(e, isSeeking ? 'recruiter' : 'contact')}
                    title={isSeeking ? "En savoir plus sur mes recherches d'alternance" : "Collaborons ensemble"}
                >
                    <span className={`status-indicator ${!isSeeking ? 'status-passive' : ''}`}></span>
                    <span>
                        {isSeeking
                            ? recruitment.badge
                            : recruitment.passiveBadge}
                    </span>
                </a>

                {/* Hero Title */}
                <h1 className="hero-title">{developer.name}</h1>

                {/* Dynamic Role Switcher */}
                <div className="hero-role-wrapper">
                    <span className="hero-role-prefix">Je suis&nbsp;</span>
                    <span className={`hero-role-dynamic ${fadeState}`}>
                        {roles[roleIndex]}
                    </span>
                </div>

                <p className="hero-tagline">
                    Concepteur d'applications web modernes, d'extensions de navigateurs/éditeurs et d'outils d'automatisation système.
                    Rigoureux, autonome et animé par la passion de créer.
                </p>

                {/* CTA Buttons */}
                <div className="hero-cta-group">
                    <a
                        href="#projects"
                        className="btn-primary"
                        onClick={(e) => handleScrollTo(e, 'projects')}
                    >
                        <span>Voir mes réalisations</span>
                        <ArrowRightIcon size={18} />
                    </a>

                    {isSeeking ? (
                        <a
                            href="#recruiter"
                            className="btn-secondary btn-recruiter"
                            onClick={(e) => handleScrollTo(e, 'recruiter')}
                        >
                            <BriefcaseIcon size={18} />
                            <span>Espace Recruteur</span>
                        </a>
                    ) : (
                        <a
                            href="#contact"
                            className="btn-secondary"
                            onClick={(e) => handleScrollTo(e, 'contact')}
                        >
                            <MailIcon size={18} />
                            <span>Me Contacter</span>
                        </a>
                    )}
                </div>

                {/* Social Quick Circles */}
                <div className="hero-social-minimal">
                    {githubUrl && (
                        <a
                            href={githubUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hero-social-circle github-circle"
                            aria-label={`GitHub de ${developer.name}`}
                            title="GitHub"
                        >
                            <GithubIcon size={18} />
                        </a>
                    )}

                    {linkedinUrl && (
                        <a
                            href={linkedinUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hero-social-circle linkedin-circle"
                            aria-label={`LinkedIn de ${developer.name}`}
                            title="LinkedIn"
                        >
                            <LinkedinIcon size={18} />
                        </a>
                    )}

                    {emailUrl && (
                        <a
                            href={emailUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hero-social-circle email-circle"
                            aria-label={`Envoyer un email à ${developer.name}`}
                            title="Email"
                        >
                            <MailIcon size={18} />
                        </a>
                    )}
                </div>

                {/* Key Metrics Row */}
                <div className="hero-metrics-row">
                    {metrics.map((m, idx) => (
                        <div key={idx} className="hero-metric-item">
                            <div className="metric-number">{m.value}</div>
                            <div className="metric-label">{m.label}</div>
                            <div className="metric-sub">{m.sub}</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Scroll Indicator */}
            <a
                href="#about"
                className="scroll-indicator"
                aria-label="Faire défiler vers le contenu"
                onClick={(e) => handleScrollTo(e, 'about')}
            >
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            </a>
        </section>
    );
}

import { useState, useEffect, useMemo } from 'react';
import { GithubIcon, LinkedinIcon, MailIcon } from './Icons';

const NAV_ITEMS = [
    { id: 'about', label: 'À propos' },
    { id: 'projects', label: 'Projets', mobileBadge: '16+' },
    { id: 'recruiter', label: 'Recrutement', mobileLabel: '🎯 Espace Recruteur', isRecruiter: true, requireSeeking: true },
    { id: 'education', label: 'Parcours', mobileLabel: 'Parcours & Diplômes' },
    { id: 'contact', label: 'Contact', mobileLabel: 'Contact & Réseaux' }
];

export default function Navbar({ developer = {} }) {
    const [activeSection, setActiveSection] = useState('');
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const isSeeking = developer.recruitment?.enabled ?? developer.recruitment?.seeking;

    const navItems = useMemo(() => {
        return NAV_ITEMS.filter((item) => !item.requireSeeking || isSeeking);
    }, [isSeeking]);

    useEffect(() => {
        const sections = navItems.map((item) => item.id);

        const handleScroll = () => {
            if (window.scrollY < 200) {
                setActiveSection('');
                return;
            }

            const isBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 60;
            if (isBottom) {
                setActiveSection('contact');
                return;
            }

            let current = '';
            for (const id of sections) {
                const el = document.getElementById(id);
                if (el) {
                    const rect = el.getBoundingClientRect();
                    if (rect.top <= 260 && rect.bottom >= 120) {
                        current = id;
                    }
                }
            }
            setActiveSection(current);
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        handleScroll();
        return () => window.removeEventListener('scroll', handleScroll);
    }, [navItems]);

    const handleClick = (e, targetId) => {
        e.preventDefault();
        setMobileMenuOpen(false);
        const el = document.getElementById(targetId);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
    };

    // Lock body scroll when mobile menu is open
    useEffect(() => {
        if (!mobileMenuOpen) return;
        document.body.style.overflow = 'hidden';
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') setMobileMenuOpen(false);
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => {
            document.body.style.overflow = '';
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [mobileMenuOpen]);

    const githubUrl = developer.github;
    const linkedinUrl = developer.linkedin;
    const emailUrl = `mailto:${developer.email}`;

    return (
        <>
            <header>
                <nav>
                <a
                    href="#"
                    className="logo"
                    onClick={(e) => {
                        e.preventDefault();
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                >
                    <span className="logo-accent">{developer.initials}</span>{developer.brandSuffix}
                </a>

                {/* Desktop Nav Links */}
                <ul className="nav-links">
                    {navItems.map((item) => (
                        <li key={item.id}>
                            <a
                                href={`#${item.id}`}
                                className={`${item.isRecruiter ? 'nav-recruiter-link' : ''} ${activeSection === item.id ? 'active' : ''}`}
                                onClick={(e) => handleClick(e, item.id)}
                            >
                                {item.isRecruiter && <span className="nav-pulse-dot"></span>}
                                {item.label}
                            </a>
                        </li>
                    ))}
                </ul>

                {/* Desktop Nav Controls (hidden on mobile) */}
                <div className="nav-desktop-actions">
                    {githubUrl && (
                        <a
                            href={githubUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="nav-icon-link"
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
                            className="nav-icon-link"
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
                            className="nav-icon-link"
                            aria-label={`Envoyer un email à ${developer.name}`}
                            title="Email"
                        >
                            <MailIcon size={18} />
                        </a>
                    )}
                </div>

                {/* Mobile Header Controls (visible only on mobile) */}
                <div className="nav-mobile-controls">
                    <button
                        type="button"
                        className="mobile-nav-toggle"
                        onClick={() => {
                            setMobileMenuOpen(!mobileMenuOpen);
                        }}
                        aria-label="Menu de navigation"
                        aria-expanded={mobileMenuOpen}
                    >
                        <span className={`bar ${mobileMenuOpen ? 'open' : ''}`}></span>
                        <span className={`bar ${mobileMenuOpen ? 'open' : ''}`}></span>
                        <span className={`bar ${mobileMenuOpen ? 'open' : ''}`}></span>
                    </button>
                </div>
            </nav>
        </header>

        {/* Mobile Nav Overlay & Drawer (rendered outside header so containing block is true viewport) */}
        {mobileMenuOpen && (
            <div className="mobile-nav-container">
                <div className="mobile-nav-backdrop" onClick={() => setMobileMenuOpen(false)} />
                <div className="mobile-nav-menu" role="dialog" aria-modal="true" aria-label="Menu de navigation mobile">
                    <div className="mobile-nav-links">
                        {navItems.map((item) => (
                            <a
                                key={item.id}
                                href={`#${item.id}`}
                                className={`mobile-nav-link ${item.isRecruiter ? 'recruiter' : ''} ${activeSection === item.id ? 'active' : ''}`}
                                onClick={(e) => handleClick(e, item.id)}
                            >
                                <span>{item.mobileLabel || item.label}</span>
                                {item.mobileBadge ? (
                                    <span className="mobile-link-pill">{item.mobileBadge}</span>
                                ) : (
                                    <span className="mobile-link-arrow">→</span>
                                )}
                            </a>
                        ))}
                    </div>

                    <div className="mobile-nav-divider" />

                    {/* Social Icons row */}
                    <div className="mobile-socials-grid">
                        {githubUrl && (
                            <a
                                href={githubUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="mobile-social-tile"
                            >
                                <GithubIcon size={20} />
                                <span>GitHub</span>
                            </a>
                        )}
                        {linkedinUrl && (
                            <a
                                href={linkedinUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="mobile-social-tile"
                            >
                                <LinkedinIcon size={20} />
                                <span>LinkedIn</span>
                            </a>
                        )}
                        {emailUrl && (
                            <a
                                href={emailUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="mobile-social-tile"
                            >
                                <MailIcon size={20} />
                                <span>Email</span>
                            </a>
                        )}
                    </div>
                </div>
            </div>
        )}
    </>
    );
}

import { useState, useEffect, useMemo } from 'react';
import useDialog from '../utils/useDialog';
import { GithubIcon, LinkedinIcon, MailIcon, CvIcon } from './Icons';

const NAV_ITEMS = [
    { id: 'projects', label: 'Projets' },
    { id: 'about', label: 'À propos' },
    { id: 'recruiter', label: 'Recrutement', mobileLabel: '🎯 Espace Recruteur', isRecruiter: true, requireSeeking: true },
    { id: 'education', label: 'Parcours', mobileLabel: 'Parcours & Diplômes' },
    { id: 'contact', label: 'Contact', mobileLabel: 'Contact & Réseaux' }
];

export default function Navbar({ developer = {}, projectCount = 0 }) {
    const [activeSection, setActiveSection] = useState('');
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const dialogRef = useDialog(mobileMenuOpen);

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

        let frame = 0;
        const scheduleScroll = () => {
            if (!frame) frame = requestAnimationFrame(() => { frame = 0; handleScroll(); });
        };
        window.addEventListener('scroll', scheduleScroll, { passive: true });
        handleScroll();
        return () => {
            window.removeEventListener('scroll', scheduleScroll);
            cancelAnimationFrame(frame);
        };
    }, [navItems]);

    const handleClick = () => setMobileMenuOpen(false);

    useEffect(() => {
        const breakpoint = window.matchMedia('(min-width: 861px)');
        const closeOnDesktop = () => { if (breakpoint.matches) setMobileMenuOpen(false); };
        breakpoint.addEventListener('change', closeOnDesktop);
        return () => breakpoint.removeEventListener('change', closeOnDesktop);
    }, []);

    const githubUrl = developer.github;
    const linkedinUrl = developer.linkedin;
    const emailUrl = `mailto:${developer.email}`;

    return (
        <>
            <header>
                <nav aria-label="Navigation principale">
                <a
                    href="#top"
                    className="logo"

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
                                onClick={handleClick}
                                aria-current={activeSection === item.id ? 'location' : undefined}
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
                    <a
                        href="cv/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="nav-icon-link nav-cv-link"
                        aria-label={`CV de ${developer.name}`}
                        title="Voir mon CV"
                    >
                        <CvIcon size={18} />
                    </a>
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
                        aria-controls="mobile-navigation"
                        aria-haspopup="dialog"
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
            <dialog ref={dialogRef} id="mobile-navigation" className="mobile-nav-container" aria-label="Navigation mobile"
                onCancel={(event) => { event.preventDefault(); setMobileMenuOpen(false); }}>
                <div className="mobile-nav-backdrop" onClick={() => setMobileMenuOpen(false)} />
                <div className="mobile-nav-menu">
                    <button type="button" className="mobile-menu-close" autoFocus onClick={() => setMobileMenuOpen(false)} aria-label="Fermer le menu">Fermer <span aria-hidden="true">×</span></button>
                    <div className="mobile-nav-links">
                        {navItems.map((item) => (
                            <a
                                key={item.id}
                                href={`#${item.id}`}
                                className={`mobile-nav-link ${item.isRecruiter ? 'recruiter' : ''} ${activeSection === item.id ? 'active' : ''}`}
                                onClick={handleClick}
                                aria-current={activeSection === item.id ? 'location' : undefined}
                            >
                                <span>{item.mobileLabel || item.label}</span>
                                {item.id === 'projects' ? (
                                    <span className="mobile-link-pill">{projectCount}</span>
                                ) : (
                                    <span className="mobile-link-arrow">→</span>
                                )}
                            </a>
                        ))}
                    </div>

                    <div className="mobile-nav-divider" />

                    <a
                        href="cv/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mobile-nav-link recruiter"
                        aria-label={`CV de ${developer.name}`}
                    >
                        <span>📄 Mon CV</span>
                        <span className="mobile-link-arrow">→</span>
                    </a>

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
            </dialog>
        )}
    </>
    );
}

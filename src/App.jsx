import { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import data from './data/portfolio.js';
import AnimatedBackground from './components/AnimatedBackground';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import CodeBio from './components/CodeBio';
import SkillCard from './components/SkillCard';
import ProjectCard from './components/ProjectCard';
import ProjectModal from './components/ProjectModal';
import RecruiterHub from './components/RecruiterHub';
import EducationCard from './components/EducationCard';
import LanguageCard from './components/LanguageCard';
import Footer from './components/Footer';
import ScrollReveal from './components/ScrollReveal';
import Toast from './components/Toast';
import { SearchIcon, SparklesIcon, GraduationCapIcon, UserIcon, GithubIcon } from './components/Icons';

import { GITHUB_ORG_URL } from './config/site';
import { getProjectCategory, getProjectOrigin, getProjectSlug, matchesSearch } from './utils/projects';

const INITIAL_VISIBLE_PROJECTS = 9;

export default function App() {
    const [activeOrigin, setActiveOrigin] = useState('all'); // 'all' | 'personal' | 'iut'
    const [activeCategory, setActiveCategory] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [showAllProjects, setShowAllProjects] = useState(true); // SSR prerenders all cards for SEO & no-JS
    const [selectedProject, setSelectedProject] = useState(null);
    const [toast, setToast] = useState(null);
    const [theme, setTheme] = useState('dark');

    const toastTimerRef = useRef(null);
    const searchInputRef = useRef(null);
    const urlSyncedRef = useRef(false);

    // Sync saved theme & collapse default project grid after hydration (no SSR mismatch)
    useEffect(() => {
        const current = document.documentElement.dataset.theme === 'light' ? 'light' : 'dark';
        setTheme(current);
        setShowAllProjects(false);
    }, []);

    const toggleTheme = useCallback(() => {
        setTheme((prev) => {
            const next = prev === 'dark' ? 'light' : 'dark';
            if (next === 'light') {
                document.documentElement.dataset.theme = 'light';
            } else {
                delete document.documentElement.dataset.theme;
            }
            const meta = document.querySelector('meta[name="theme-color"]');
            if (meta) meta.setAttribute('content', next === 'light' ? '#faf8f4' : '#0c0f13');
            try {
                localStorage.setItem('portfolio-theme', next);
            } catch {
                // Ignore storage errors in private browsing
            }
            return next;
        });
    }, []);

    // Toast helper with timer race-condition guard
    const showToast = useCallback((message, type = 'info') => {
        if (toastTimerRef.current) {
            clearTimeout(toastTimerRef.current);
        }
        setToast({ message, type });
        toastTimerRef.current = setTimeout(() => {
            setToast(null);
            toastTimerRef.current = null;
        }, 3200);
    }, []);

    // Cleanup toast timer on unmount
    useEffect(() => {
        return () => {
            if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
        };
    }, []);

    // Open project modal from shareable URL (?project=slug) & sync history navigation
    useEffect(() => {
        const syncFromUrl = () => {
            const slug = new URLSearchParams(window.location.search).get('project');
            if (!slug) {
                setSelectedProject(null);
                return;
            }
            const found = data.projects.find((p) => getProjectSlug(p) === slug);
            setSelectedProject(found || null);
        };
        syncFromUrl();
        urlSyncedRef.current = true;
        window.addEventListener('popstate', syncFromUrl);
        return () => window.removeEventListener('popstate', syncFromUrl);
    }, []);

    // Reflect open project modal in URL query string without polluting history stack
    const handleSelectProject = useCallback((proj) => {
        setSelectedProject(proj);
        if (!urlSyncedRef.current || typeof window === 'undefined') return;
        const params = new URLSearchParams(window.location.search);
        const nextSlug = proj ? getProjectSlug(proj) : null;
        if (nextSlug) {
            params.set('project', nextSlug);
        } else {
            params.delete('project');
        }
        const query = params.toString();
        const nextUrl = `${window.location.pathname}${query ? `?${query}` : ''}${window.location.hash}`;
        if (nextUrl !== `${window.location.pathname}${window.location.search}${window.location.hash}`) {
            window.history.replaceState(null, '', nextUrl);
        }
    }, []);

    const handleCloseModal = useCallback(() => {
        handleSelectProject(null);
    }, [handleSelectProject]);

    // Quick keyboard shortcut ('/' or Ctrl/Cmd+K) to focus project search
    useEffect(() => {
        const handleGlobalKeyDown = (e) => {
            if (document.querySelector('dialog[open]')) return;
            const isInput = /INPUT|TEXTAREA|SELECT/.test(e.target?.tagName || '') || e.target?.isContentEditable;
            const isSlash = e.key === '/' && !e.ctrlKey && !e.metaKey && !e.altKey;
            const isCmdK = (e.ctrlKey || e.metaKey) && !e.altKey && e.key.toLowerCase() === 'k';
            if ((isSlash && !isInput) || isCmdK) {
                e.preventDefault();
                const input = searchInputRef.current;
                if (input) {
                    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
                    input.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'center' });
                    input.focus({ preventScroll: true });
                }
            }
        };
        window.addEventListener('keydown', handleGlobalKeyDown);
        return () => window.removeEventListener('keydown', handleGlobalKeyDown);
    }, []);

    const searchResults = useMemo(() => data.projects.filter((project) => matchesSearch(project, searchQuery)), [searchQuery]);
    const originCounts = useMemo(() => {
        const result = { all: searchResults.length, personal: 0, iut: 0 };
        searchResults.forEach((project) => {
            const origin = getProjectOrigin(project);
            if (origin === 'iut') result.iut++;
            else result.personal++;
        });
        return result;
    }, [searchResults]);

    const originResults = useMemo(() => searchResults.filter((project) => {
        if (activeOrigin === 'all') return true;
        return getProjectOrigin(project) === activeOrigin;
    }), [activeOrigin, searchResults]);

    const counts = useMemo(() => {
        const result = { all: originResults.length, featured: 0, web: 0, extension: 0, system: 0 };
        originResults.forEach((project) => {
            if (project.featured) result.featured++;
            result[getProjectCategory(project)]++;
        });
        return result;
    }, [originResults]);

    const isSeeking = data.developer?.recruitment?.enabled ?? data.developer?.recruitment?.seeking;

    const filteredProjects = useMemo(() => originResults.filter((project) => {
        if (activeCategory === 'all') return true;
        if (activeCategory === 'featured') return Boolean(project.featured);
        return getProjectCategory(project) === activeCategory;
    }), [activeCategory, originResults]);

    const handleOriginClick = (origin) => {
        setActiveOrigin(origin);
    };

    const handleCategoryClick = (cat) => {
        setActiveCategory(cat);
    };

    const handleTagSelect = useCallback((tag) => {
        handleSelectProject(null);
        setActiveOrigin('all');
        setActiveCategory('all');
        setSearchQuery(tag);
        showToast(`Projets filtrés par « ${tag} »`, 'info');
        requestAnimationFrame(() => {
            const input = searchInputRef.current;
            if (input) {
                const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
                input.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'center' });
                input.focus({ preventScroll: true });
            }
        });
    }, [handleSelectProject, showToast]);

    const hasActiveFilters = Boolean(searchQuery.trim() || activeCategory !== 'all' || activeOrigin !== 'all');
    const isCollapsed = !hasActiveFilters && !showAllProjects && filteredProjects.length > INITIAL_VISIBLE_PROJECTS;
    const visibleProjects = isCollapsed
        ? filteredProjects.slice(0, INITIAL_VISIBLE_PROJECTS)
        : filteredProjects;
    const remainingProjectsCount = filteredProjects.length - visibleProjects.length;

    return (
        <>
            <a className="skip-link" href="#main-content">Aller au contenu</a>
            <AnimatedBackground />

            {/* Navbar */}
            <Navbar
                developer={data.developer}
                projectCount={data.projects.length}
                theme={theme}
                onToggleTheme={toggleTheme}
            />

            <main id="main-content" tabIndex={-1}>
            {/* Hero Section */}
            <Hero
                developer={data.developer}
                projects={data.projects}
                education={data.education}
            />

            {/* Section Projets */}
            <section className="projects" id="projects">
                <div className="section-header">
                    <div className="section-header-main">
                        <div className="section-badge-center">
                            <span className="section-index" aria-hidden="true">01</span>
                            <span>Réalisations</span>
                        </div>
                        <h2 className="section-title">Mes Projets</h2>
                    </div>
                    <p className="projects-subtitle">
                        Sélection de {data.projects.length} réalisations — projets personnels et SAÉ menées à l'IUT Nancy-Charlemagne (BUT Informatique).
                    </p>
                </div>

                {/* Search Bar, Origin Switcher & Category Filters Bar */}
                <div className="projects-controls-wrap js-only">
                    <div className="projects-controls-top">
                        {/* Origin Switcher : Projets personnels vs Formation IUT Nancy-Charlemagne */}
                        <div className="project-origin-tabs" role="group" aria-label="Filtrer par contexte de réalisation">
                            <button
                                type="button"
                                className={`origin-btn ${activeOrigin === 'all' ? 'active' : ''}`}
                                onClick={() => handleOriginClick('all')}
                                aria-pressed={activeOrigin === 'all'}
                            >
                                <span>Tout voir</span>
                                <span className="origin-count">{originCounts.all}</span>
                            </button>
                            <button
                                type="button"
                                className={`origin-btn origin-btn-personal ${activeOrigin === 'personal' ? 'active' : ''}`}
                                onClick={() => handleOriginClick('personal')}
                                aria-pressed={activeOrigin === 'personal'}
                            >
                                <UserIcon size={15} />
                                <span>Personnels</span>
                                <span className="origin-count">{originCounts.personal}</span>
                            </button>
                            <button
                                type="button"
                                className={`origin-btn origin-btn-iut ${activeOrigin === 'iut' ? 'active' : ''}`}
                                onClick={() => handleOriginClick('iut')}
                                aria-pressed={activeOrigin === 'iut'}
                            >
                                <GraduationCapIcon size={16} />
                                <span>IUT Nancy-Charlemagne</span>
                                <span className="origin-count">{originCounts.iut}</span>
                            </button>
                        </div>

                        {/* Live Search Input */}
                        <div className="project-search-bar">
                            <SearchIcon size={17} className="search-icon-svg" />
                            <input
                                ref={searchInputRef}
                                type="search"
                                placeholder="Rechercher un projet, une techno…"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="project-search-input"
                                aria-label="Rechercher un projet"
                                aria-controls="project-results"
                            />
                            {searchQuery ? (
                                <button
                                    type="button"
                                    className="search-clear-btn"
                                    onClick={() => {
                                        setSearchQuery('');
                                    }}
                                    aria-label="Effacer la recherche"
                                >
                                    &times;
                                </button>
                            ) : (
                                <kbd className="search-shortcut-hint" aria-hidden="true" title="Appuyez sur / pour rechercher">/</kbd>
                            )}
                        </div>
                    </div>

                    {/* Filtres de catégories */}
                    <div className="project-filters-row">
                        <span className="filter-axis-label" aria-hidden="true">Catégorie</span>
                        <div className="project-filters" role="group" aria-label="Filtrer les projets par catégorie">
                            <button
                                type="button"
                                className={`filter-btn ${activeCategory === 'all' ? 'active' : ''}`}
                                onClick={() => handleCategoryClick('all')}
                                aria-pressed={activeCategory === 'all'}
                            >
                                <span>Toutes</span>
                                <span className="filter-count">{counts.all}</span>
                            </button>
                            <button
                                type="button"
                                className={`filter-btn filter-btn-featured ${activeCategory === 'featured' ? 'active' : ''}`}
                                onClick={() => handleCategoryClick('featured')}
                                aria-pressed={activeCategory === 'featured'}
                            >
                                <SparklesIcon size={14} />
                                <span>Coups de cœur</span>
                                <span className="filter-count">{counts.featured}</span>
                            </button>
                            <button
                                type="button"
                                className={`filter-btn ${activeCategory === 'web' ? 'active' : ''}`}
                                onClick={() => handleCategoryClick('web')}
                                aria-pressed={activeCategory === 'web'}
                            >
                                <span>Web &amp; Full-Stack</span>
                                <span className="filter-count">{counts.web}</span>
                            </button>
                            <button
                                type="button"
                                className={`filter-btn ${activeCategory === 'extension' ? 'active' : ''}`}
                                onClick={() => handleCategoryClick('extension')}
                                aria-pressed={activeCategory === 'extension'}
                            >
                                <span>Extensions</span>
                                <span className="filter-count">{counts.extension}</span>
                            </button>
                            <button
                                type="button"
                                className={`filter-btn ${activeCategory === 'system' ? 'active' : ''}`}
                                onClick={() => handleCategoryClick('system')}
                                aria-pressed={activeCategory === 'system'}
                            >
                                <span>Système &amp; Logiciel</span>
                                <span className="filter-count">{counts.system}</span>
                            </button>
                        </div>
                    </div>
                </div>

                {activeOrigin === 'iut' && (
                    <div className="iut-context-banner js-only">
                        <div className="iut-context-text">
                            <div className="iut-context-title">
                                <GraduationCapIcon size={18} />
                                <span>Formation universitaire — BUT Informatique (IUT Nancy-Charlemagne)</span>
                            </div>
                            <p>
                                SAÉ et mini-projets académiques réalisés dans le cadre du BUT Informatique à l'Université de Lorraine.
                            </p>
                        </div>
                        <a
                            href={GITHUB_ORG_URL}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="iut-org-link"
                        >
                            <GithubIcon size={16} />
                            <span>Organisation GitHub</span>
                        </a>
                    </div>
                )}

                <div className="project-results-summary js-only">
                    <p role="status" aria-live="polite" aria-atomic="true">
                        {isCollapsed
                            ? `${visibleProjects.length} projets récents affichés sur ${filteredProjects.length}`
                            : `${filteredProjects.length} projet${filteredProjects.length > 1 ? 's' : ''}${hasActiveFilters ? ` sur ${data.projects.length}` : ' à explorer'}`
                        }
                    </p>
                    {hasActiveFilters ? (
                        <button type="button" className="reset-filters" onClick={() => { setSearchQuery(''); setActiveOrigin('all'); setActiveCategory('all'); }}>
                            Réinitialiser les filtres
                        </button>
                    ) : isCollapsed ? (
                        <button type="button" className="reset-filters" onClick={() => setShowAllProjects(true)}>
                            Tout afficher ({filteredProjects.length})
                        </button>
                    ) : filteredProjects.length > INITIAL_VISIBLE_PROJECTS ? (
                        <button type="button" className="reset-filters" onClick={() => setShowAllProjects(false)}>
                            Réduire à {INITIAL_VISIBLE_PROJECTS}
                        </button>
                    ) : null}
                </div>
                <div id="project-results">
                {/* Projects Grid or Empty State */}
                {visibleProjects.length > 0 ? (
                    <>
                        <div className="projects-grid">
                            {visibleProjects.map((project, i) => (
                                <ScrollReveal key={project.title} delay={(i % 3) * 0.08}>
                                    <ProjectCard
                                        project={project}
                                        index={i}
                                        onOpenModal={handleSelectProject}
                                    />
                                </ScrollReveal>
                            ))}
                        </div>
                        {!hasActiveFilters && filteredProjects.length > INITIAL_VISIBLE_PROJECTS && (
                            <div className="projects-expand-wrap js-only">
                                {isCollapsed ? (
                                    <button
                                        type="button"
                                        className="btn-secondary projects-expand-btn"
                                        onClick={() => setShowAllProjects(true)}
                                    >
                                        <span>Voir les {remainingProjectsCount} autres projets</span>
                                        <span className="projects-expand-count">{filteredProjects.length} au total</span>
                                    </button>
                                ) : (
                                    <button
                                        type="button"
                                        className="btn-secondary projects-expand-btn"
                                        onClick={() => {
                                            setShowAllProjects(false);
                                            const section = document.getElementById('projects');
                                            if (section) {
                                                const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
                                                section.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'start' });
                                            }
                                        }}
                                    >
                                        <span>Réduire aux {INITIAL_VISIBLE_PROJECTS} projets récents</span>
                                    </button>
                                )}
                            </div>
                        )}
                    </>
                ) : (
                    <div className="projects-empty-state">
                        <div className="empty-emoji" aria-hidden="true">🔍</div>
                        <h3>Aucun projet ne correspond à votre recherche</h3>
                        <p>Essayez avec d'autres termes comme "React", "Java", "PHP" ou réinitialisez les filtres.</p>
                        <button
                            type="button"
                            className="btn-secondary"
                            onClick={() => {
                                setActiveOrigin('all');
                                setActiveCategory('all');
                                setSearchQuery('');
                            }}
                        >
                            Réinitialiser la recherche
                        </button>
                    </div>
                )}
                </div>
            </section>

            {/* Section À propos */}
            <section className="about" id="about">
                <div className="section-header">
                    <div className="section-header-main">
                        <div className="section-badge-center">
                            <span className="section-index" aria-hidden="true">02</span>
                            <span>Profil &amp; Compétences</span>
                        </div>
                        <h2 className="section-title">À propos de moi</h2>
                    </div>
                    <p className="section-lead">
                        Double culture web et système Linux : j'aime comprendre ce qui tourne sous le capot et concevoir des outils rapides, propres et durables.
                    </p>
                </div>

                <ScrollReveal>
                    <CodeBio
                        developer={data.developer}
                        projects={data.projects}
                        education={data.education}
                        skills={data.skills}
                    />
                </ScrollReveal>

                <div className="skills-container">
                    {data.skills.map((skill, i) => (
                        <ScrollReveal key={skill.title} delay={i * 0.06}>
                            <SkillCard skill={skill} />
                        </ScrollReveal>
                    ))}
                </div>
            </section>

            {/* Section Recruteur Hub (optionnelle via data.json) */}
            {isSeeking && (
                <ScrollReveal>
                    <RecruiterHub
                        developer={data.developer}
                        onShowToast={showToast}
                    />
                </ScrollReveal>
            )}

            {/* Parcours */}
            <section className="education" id="education">
                <div className="section-header">
                    <div className="section-header-main">
                        <div className="section-badge-center">
                            <span className="section-index" aria-hidden="true">{isSeeking ? '04' : '03'}</span>
                            <span>Diplômes &amp; Certifications</span>
                        </div>
                        <h2 className="section-title">Mon Parcours</h2>
                    </div>
                </div>
                <div className="education-timeline">
                    {data.education.map((item, i) => (
                        <ScrollReveal key={item.title + i} delay={i * 0.06}>
                            <EducationCard item={item} />
                        </ScrollReveal>
                    ))}
                </div>
            </section>

            {/* Langues */}
            <section className="languages" id="languages">
                <div className="section-header">
                    <div className="section-header-main">
                        <div className="section-badge-center">
                            <span className="section-index" aria-hidden="true">{isSeeking ? '05' : '04'}</span>
                            <span>Langues</span>
                        </div>
                        <h2 className="section-title">Compétences Linguistiques</h2>
                    </div>
                </div>
                <div className="languages-container">
                    {data.languages.map((lang, i) => (
                        <ScrollReveal key={lang.name} delay={i * 0.08}>
                            <LanguageCard language={lang} />
                        </ScrollReveal>
                    ))}
                </div>
            </section>

            </main>

            {/* Contact & Réseaux */}
            <ScrollReveal>
                <Footer developer={data.developer} />
            </ScrollReveal>

            {/* Project Details Modal */}
            <ProjectModal
                project={selectedProject}
                allProjects={filteredProjects.length > 0 ? filteredProjects : data.projects}
                onSelectProject={handleSelectProject}
                onTagSelect={handleTagSelect}
                onClose={handleCloseModal}
            />

            {/* Notification Toast */}
            <Toast toast={toast} onClose={() => setToast(null)} />
        </>
    );
}

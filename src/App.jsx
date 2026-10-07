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
import { SearchIcon, SparklesIcon } from './components/Icons';

import { getProjectCategory, matchesSearch } from './utils/projects';

export default function App() {
    const [activeCategory, setActiveCategory] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedProject, setSelectedProject] = useState(null);
    const [toast, setToast] = useState(null);

    const toastTimerRef = useRef(null);

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

    const searchResults = useMemo(() => data.projects.filter((project) => matchesSearch(project, searchQuery)), [searchQuery]);
    const counts = useMemo(() => {
        const result = { all: searchResults.length, web: 0, extension: 0, system: 0 };
        searchResults.forEach((project) => result[getProjectCategory(project)]++);
        return result;
    }, [searchResults]);

    const isSeeking = data.developer?.recruitment?.enabled ?? data.developer?.recruitment?.seeking;

    const filteredProjects = useMemo(() => searchResults.filter((project) =>
        activeCategory === 'all' || getProjectCategory(project) === activeCategory
    ), [activeCategory, searchResults]);

    const handleCategoryClick = (cat) => {
        setActiveCategory(cat);
    };

    return (
        <>
            <a className="skip-link" href="#main-content">Aller au contenu</a>
            <AnimatedBackground />

            {/* Navbar */}
            <Navbar
                developer={data.developer}
                projectCount={data.projects.length}
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
                <div className="section-badge-center">
                    <span>Portfolio Réalisations</span>
                </div>
                <h2 className="section-title">Mes Projets</h2>
                <p className="projects-subtitle">
                    Découvrez une sélection de {data.projects.length} projets concrets : applications web, extensions de navigateurs, outils système et défis algorithmiques.
                </p>

                {/* Search Bar & Category Filters Bar */}
                <div className="projects-controls-wrap js-only">
                    {/* Live Search Input */}
                    <div className="project-search-bar">
                        <SearchIcon size={18} className="search-icon-svg" />
                        <input
                            type="search"
                            placeholder="Un projet, une technologie…"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="project-search-input"
                            aria-label="Rechercher un projet"
                            aria-controls="project-results"
                        />
                        {searchQuery && (
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
                        )}
                    </div>

                    {/* Filtres de catégories */}
                    <div className="project-filters" role="group" aria-label="Filtrer les projets par catégorie">
                        <button
                            type="button"
                            className={`filter-btn ${activeCategory === 'all' ? 'active' : ''}`}
                            onClick={() => handleCategoryClick('all')}
                            aria-pressed={activeCategory === 'all'}
                        >
                            <span>Tous</span>
                            <span className="filter-count">{counts.all}</span>
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
                            <span>Système &amp; Scripts</span>
                            <span className="filter-count">{counts.system}</span>
                        </button>
                    </div>
                </div>

                <div className="project-results-summary js-only">
                    <p role="status" aria-live="polite" aria-atomic="true">
                        {filteredProjects.length} projet{filteredProjects.length > 1 ? 's' : ''}
                        {searchQuery.trim() || activeCategory !== 'all' ? ` sur ${data.projects.length}` : ' à explorer'}
                    </p>
                    {(searchQuery || activeCategory !== 'all') && (
                        <button type="button" className="reset-filters" onClick={() => { setSearchQuery(''); setActiveCategory('all'); }}>
                            Tout afficher
                        </button>
                    )}
                </div>
                <div id="project-results">
                {/* Projects Grid or Empty State */}
                {filteredProjects.length > 0 ? (
                    <div className="projects-grid">
                        {filteredProjects.map((project, i) => (
                            <ScrollReveal key={project.title} delay={(i % 3) * 0.08}>
                                <ProjectCard
                                    project={project}
                                    index={i}
                                    onOpenModal={(proj) => setSelectedProject(proj)}
                                />
                            </ScrollReveal>
                        ))}
                    </div>
                ) : (
                    <div className="projects-empty-state">
                        <div className="empty-emoji">🔍</div>
                        <h3>Aucun projet ne correspond à votre recherche</h3>
                        <p>Essayez avec d'autres termes comme "React", "Python", "Vite" ou réinitialisez les filtres.</p>
                        <button
                            type="button"
                            className="btn-secondary"
                            onClick={() => {
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
                <div className="section-badge-center">
                    <SparklesIcon size={14} />
                    <span>Profil &amp; Vision</span>
                </div>
                <h2 className="section-title">À propos de moi</h2>

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
                        <ScrollReveal key={skill.title} delay={i * 0.08}>
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
                <div className="section-badge-center">
                    <span>Diplômes &amp; Réussites</span>
                </div>
                <h2 className="section-title">Mon Parcours</h2>
                <div className="education-timeline">
                    {data.education.map((item, i) => (
                        <ScrollReveal key={item.title + i} delay={i * 0.08}>
                            <EducationCard item={item} />
                        </ScrollReveal>
                    ))}
                </div>
            </section>

            {/* Langues */}
            <section className="languages" id="languages">
                <div className="section-badge-center">
                    <span>Langues</span>
                </div>
                <h2 className="section-title">Compétences Linguistiques</h2>
                <div className="languages-container">
                    {data.languages.map((lang, i) => (
                        <ScrollReveal key={lang.name} delay={i * 0.12}>
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
                allProjects={filteredProjects}
                onSelectProject={(proj) => setSelectedProject(proj)}
                onClose={() => setSelectedProject(null)}
            />

            {/* Notification Toast */}
            <Toast toast={toast} onClose={() => setToast(null)} />
        </>
    );
}

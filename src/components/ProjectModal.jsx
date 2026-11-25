import { useEffect, useCallback, useState, useRef } from 'react';
import {
    CloseIcon,
    ExternalLinkIcon,
    GithubIcon,
    ArrowLeftIcon,
    ArrowRightIcon,
    SparklesIcon,
    CopyIcon,
    CheckIcon,
    GraduationCapIcon,
    UserIcon,
    ZapIcon,
    MaximizeIcon,
    FilterIcon
} from './Icons';
import useDialog from '../utils/useDialog';
import useClipboard from '../utils/useClipboard';
import { getProjectCategory, getProjectOrigin } from '../utils/projects';
import ResponsiveImage from './ResponsiveImage';

const CATEGORY_LABELS = {
    extension: 'Extension',
    system: 'Système & Logiciel',
    web: 'Web & Full-Stack'
};

function formatDisplayUrl(href) {
    if (!href) return '';
    try {
        const parsed = new URL(href);
        const cleanPath = parsed.pathname.replace(/\/$/, '');
        if (parsed.hostname === 'github.com') {
            return `github.com${cleanPath}`;
        }
        return cleanPath && cleanPath.length <= 26
            ? `${parsed.hostname}${cleanPath}`
            : parsed.hostname;
    } catch {
        return href;
    }
}

export default function ProjectModal({ project, allProjects = [], onSelectProject, onTagSelect, onClose }) {
    const dialogRef = useDialog(Boolean(project));
    const { copied, copyError, copy, reset } = useClipboard();
    const [zoomOpen, setZoomOpen] = useState(false);

    const scrollAreaRef = useRef(null);
    const previewTriggerRef = useRef(null);
    const lightboxCloseRef = useRef(null);
    const wasZoomOpenRef = useRef(false);
    const touchStartRef = useRef(null);

    useEffect(() => {
        if (scrollAreaRef.current) {
            scrollAreaRef.current.scrollTop = 0;
        }
        reset();
        setZoomOpen(false);
    }, [project, reset]);

    useEffect(() => {
        if (zoomOpen) {
            wasZoomOpenRef.current = true;
            lightboxCloseRef.current?.focus({ preventScroll: true });
        } else if (wasZoomOpenRef.current) {
            wasZoomOpenRef.current = false;
            previewTriggerRef.current?.focus({ preventScroll: true });
        }
    }, [zoomOpen]);

    const currentIndex = project
        ? allProjects.findIndex((p) => p.title === project.title)
        : -1;
    const hasPrev = currentIndex > 0;
    const hasNext = currentIndex !== -1 && currentIndex < allProjects.length - 1;
    const prevProject = hasPrev ? allProjects[currentIndex - 1] : null;
    const nextProject = hasNext ? allProjects[currentIndex + 1] : null;

    const goToPrev = useCallback(() => {
        if (hasPrev) {
            onSelectProject(allProjects[currentIndex - 1]);
        }
    }, [hasPrev, currentIndex, allProjects, onSelectProject]);

    const goToNext = useCallback(() => {
        if (hasNext) {
            onSelectProject(allProjects[currentIndex + 1]);
        }
    }, [hasNext, currentIndex, allProjects, onSelectProject]);

    // Keyboard navigation (Left / Right)
    useEffect(() => {
        if (!project) return;

        const handleKeyDown = (e) => {
            if (zoomOpen) return;
            if (e.altKey || e.ctrlKey || e.metaKey || /INPUT|TEXTAREA|SELECT/.test(e.target.tagName)) return;
            if (e.key === 'ArrowRight') {
                e.preventDefault();
                goToNext();
            } else if (e.key === 'ArrowLeft') {
                e.preventDefault();
                goToPrev();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [project, zoomOpen, goToNext, goToPrev]);

    if (!project) return null;

    const handleOverlayClick = (e) => {
        if (e.target === e.currentTarget) {
            if (zoomOpen) {
                setZoomOpen(false);
            } else {
                onClose();
            }
        }
    };

    const handleTouchStart = (e) => {
        if (zoomOpen || e.touches.length !== 1) return;
        touchStartRef.current = {
            x: e.touches[0].clientX,
            y: e.touches[0].clientY
        };
    };

    const handleTouchEnd = (e) => {
        if (!touchStartRef.current || zoomOpen) return;
        const touch = e.changedTouches[0];
        const dx = touch.clientX - touchStartRef.current.x;
        const dy = touch.clientY - touchStartRef.current.y;
        touchStartRef.current = null;
        if (Math.abs(dx) > 68 && Math.abs(dx) > Math.abs(dy) * 1.6) {
            if (dx < 0) goToNext();
            else goToPrev();
        }
    };

    const hasImage = Boolean(project.imageUrl);
    const categoryLabel = CATEGORY_LABELS[getProjectCategory(project)];
    const isIut = getProjectOrigin(project) === 'iut';
    const linkHref = project.link?.href;
    const displayUrl = formatDisplayUrl(linkHref);

    return (
        <dialog
            ref={dialogRef}
            className="modal-overlay"
            onClick={handleOverlayClick}
            aria-labelledby="project-modal-title"
            onCancel={(event) => {
                event.preventDefault();
                if (zoomOpen) {
                    setZoomOpen(false);
                } else {
                    onClose();
                }
            }}
        >
            <div className="modal-card">
                {/* Sticky Top Bar — always accessible */}
                <div className="modal-topbar">
                    <div className="modal-topbar-info">
                        {currentIndex >= 0 && (
                            <span className="modal-counter">
                                {currentIndex + 1} / {allProjects.length}
                            </span>
                        )}
                        <span className="modal-topbar-sep" aria-hidden="true">·</span>
                        <span className="modal-category-tag">{categoryLabel}</span>
                        {project.featured && (
                            <span className="modal-featured-badge">
                                <SparklesIcon size={13} />
                                <span>Coup de cœur</span>
                            </span>
                        )}
                    </div>

                    <div className="modal-topbar-actions">
                        <span className="modal-kbd-hints" aria-hidden="true">
                            <kbd>←</kbd>
                            <kbd>→</kbd>
                            <span>naviguer</span>
                        </span>
                        <button
                            type="button"
                            className="modal-close-btn"
                            autoFocus
                            onClick={onClose}
                            aria-label="Fermer la fenêtre de détails"
                            title="Fermer (Échap)"
                        >
                            <CloseIcon size={18} />
                        </button>
                    </div>
                </div>

                {/* Scrollable Body (2-column showcase on desktop, natural vertical stack on mobile) */}
                <div
                    ref={scrollAreaRef}
                    className="modal-scroll-area"
                    onTouchStart={handleTouchStart}
                    onTouchEnd={handleTouchEnd}
                >
                    <div className="modal-body-layout">
                        {/* Details Column (first in DOM for screen readers & heading hierarchy; right column on desktop) */}
                        <div className="modal-col-details">
                            <div className="modal-header-block">
                                <div className="modal-meta">
                                    <span className="modal-year">{project.year}</span>
                                    <span className={`project-status ${project.status?.className}`}>
                                        {project.status?.label}
                                    </span>
                                    <span className={`modal-origin-tag ${isIut ? 'is-iut' : 'is-personal'}`}>
                                        {isIut ? <GraduationCapIcon size={13} /> : <UserIcon size={13} />}
                                        <span>{isIut ? 'IUT Nancy-Charlemagne' : 'Projet personnel'}</span>
                                    </span>
                                </div>

                                <h2 className="modal-title" id="project-modal-title" aria-live="polite">
                                    {project.title}
                                </h2>
                                <p className="modal-description">{project.description}</p>
                            </div>

                            <div className="modal-insights-block">
                                {project.highlights && (
                                    <div className="modal-section-box highlight-box">
                                        <div className="modal-box-header">
                                            <span className="modal-box-icon" aria-hidden="true">
                                                <SparklesIcon size={15} />
                                            </span>
                                            <h3>Points forts &amp; valeur ajoutée</h3>
                                        </div>
                                        <p>{project.highlights}</p>
                                    </div>
                                )}

                                {project.challenges && (
                                    <div className="modal-section-box challenge-box">
                                        <div className="modal-box-header">
                                            <span className="modal-box-icon" aria-hidden="true">
                                                <ZapIcon size={15} />
                                            </span>
                                            <h3>Défis techniques relevés</h3>
                                        </div>
                                        <p>{project.challenges}</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Visual & Tech Stack Column (left column on desktop) */}
                        <div className="modal-col-media">
                            <div className="modal-visual-block">
                                {hasImage ? (
                                    <button
                                        ref={previewTriggerRef}
                                        type="button"
                                        className="modal-preview-stage"
                                        onClick={() => setZoomOpen(true)}
                                        aria-label={`Agrandir l'aperçu de ${project.title}`}
                                        title="Cliquer pour agrandir l'aperçu"
                                    >
                                        <ResponsiveImage
                                            src={project.imageUrl}
                                            alt={`Aperçu de ${project.title}`}
                                            className="modal-cover-img"
                                            sizes="(max-width: 900px) 100vw, 520px"
                                        />
                                        <span className="modal-zoom-pill" aria-hidden="true">
                                            <MaximizeIcon size={13} />
                                            <span>Agrandir</span>
                                        </span>
                                    </button>
                                ) : (
                                    <div className="modal-preview-stage is-placeholder">
                                        <span className="modal-emoji" aria-hidden="true">{project.emoji}</span>
                                    </div>
                                )}
                            </div>

                            {project.tags?.length > 0 && (
                                <div className="modal-stack-block">
                                    <div className="modal-stack-header">
                                        <h3 className="modal-stack-title">Stack technique</h3>
                                        <span className="modal-stack-hint">
                                            <FilterIcon size={12} />
                                            <span>Cliquer pour filtrer</span>
                                        </span>
                                    </div>
                                    <div className="modal-tags">
                                        {project.tags.map((tag) => (
                                            <button
                                                key={tag}
                                                type="button"
                                                className="tag tag-interactive"
                                                onClick={() => onTagSelect?.(tag)}
                                                title={`Filtrer les projets utilisant ${tag}`}
                                            >
                                                {tag}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Sticky Footer — Primary CTA, Copy Project URL, and Contextual Prev/Next Navigation */}
                <div className="modal-footer">
                    <div className="modal-links">
                        {linkHref && (
                            <>
                                <a
                                    href={linkHref}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="btn-primary modal-action-btn"
                                    title={displayUrl}
                                >
                                    {linkHref.includes('github.com') ? (
                                        <GithubIcon size={17} />
                                    ) : (
                                        <ExternalLinkIcon size={17} />
                                    )}
                                    <span>{project.link.text}</span>
                                </a>

                                <button
                                    type="button"
                                    className={`btn-secondary modal-copy-url-btn ${copied ? 'copied' : ''}`}
                                    onClick={() => copy(linkHref)}
                                    title={`Copier l'URL : ${linkHref}`}
                                    aria-label={`Copier l'URL de ${project.title}`}
                                >
                                    {copied ? <CheckIcon size={15} /> : <CopyIcon size={15} />}
                                    <span aria-live="polite">
                                        {copied ? 'URL copiée !' : copyError ? 'Copie impossible' : "Copier l'URL"}
                                    </span>
                                </button>
                            </>
                        )}
                    </div>

                    <div className="modal-nav-controls">
                        <button
                            type="button"
                            className="modal-nav-btn modal-nav-prev"
                            disabled={!hasPrev}
                            onClick={goToPrev}
                            title={prevProject ? `Précédent : ${prevProject.title} (Flèche Gauche)` : 'Premier projet'}
                            aria-label={prevProject ? `Projet précédent : ${prevProject.title}` : 'Projet précédent indisponible'}
                        >
                            <ArrowLeftIcon size={16} />
                            <span className="modal-nav-text">
                                <span className="modal-nav-dir">Précédent</span>
                                {prevProject && <span className="modal-nav-name">{prevProject.title}</span>}
                            </span>
                        </button>

                        <button
                            type="button"
                            className="modal-nav-btn modal-nav-next"
                            disabled={!hasNext}
                            onClick={goToNext}
                            title={nextProject ? `Suivant : ${nextProject.title} (Flèche Droite)` : 'Dernier projet'}
                            aria-label={nextProject ? `Projet suivant : ${nextProject.title}` : 'Projet suivant indisponible'}
                        >
                            <span className="modal-nav-text">
                                <span className="modal-nav-dir">Suivant</span>
                                {nextProject && <span className="modal-nav-name">{nextProject.title}</span>}
                            </span>
                            <ArrowRightIcon size={16} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Full-viewport Image Lightbox Overlay */}
            {zoomOpen && hasImage && (
                <div
                    className="modal-lightbox"
                    role="region"
                    aria-label={`Aperçu agrandi de ${project.title}`}
                    onClick={(e) => {
                        if (e.target === e.currentTarget) setZoomOpen(false);
                    }}
                >
                    <div className="modal-lightbox-bar">
                        <span className="modal-lightbox-caption">{project.title}</span>
                        <button
                            ref={lightboxCloseRef}
                            type="button"
                            className="modal-lightbox-close"
                            onClick={() => setZoomOpen(false)}
                            aria-label="Fermer l'aperçu agrandi"
                        >
                            <CloseIcon size={18} />
                            <span>Fermer</span>
                        </button>
                    </div>
                    <div
                        className="modal-lightbox-stage"
                        onClick={(e) => {
                            if (e.target === e.currentTarget) setZoomOpen(false);
                        }}
                    >
                        <ResponsiveImage
                            src={project.imageUrl}
                            alt={`Aperçu agrandi de ${project.title}`}
                            className="modal-lightbox-img"
                            sizes="94vw"
                        />
                    </div>
                </div>
            )}
        </dialog>
    );
}

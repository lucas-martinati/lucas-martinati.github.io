import { SparklesIcon, ExternalLinkIcon, GithubIcon } from './Icons';

export default function ProjectCard({ project, index, onOpenModal }) {
    const hasImage = !!project.imageUrl;
    const linkHref = project.link?.href;

    // Vibrant gradients cycle
    const gradients = [
        ['#3b82f6', '#8b5cf6'],
        ['#8b5cf6', '#ec4899'],
        ['#06b6d4', '#10b981'],
        ['#10b981', '#f97316'],
        ['#ec4899', '#3b82f6'],
        ['#f97316', '#ec4899'],
        ['#3b82f6', '#06b6d4'],
        ['#8b5cf6', '#3b82f6'],
        ['#06b6d4', '#10b981'],
        ['#10b981', '#f97316']
    ];
    const [c1, c2] = gradients[index % gradients.length];

    const handleCardClick = (e) => {
        // If clicking on interactive elements directly, let them handle it
        if (e.target.closest('a') || e.target.closest('button')) return;
        if (onOpenModal) onOpenModal(project);
    };

    return (
        <article
            className={`project-card ${project.featured ? 'is-featured' : ''}`}
            onClick={handleCardClick}
        >
            {/* Featured Badge */}
            {project.featured && (
                <div className="card-featured-pill">
                    <SparklesIcon size={12} />
                    <span>Coup de cœur</span>
                </div>
            )}

            {/* Image / Emoji banner */}
            <div
                className={`project-banner${hasImage ? ' has-cover' : ''}`}
                style={!hasImage ? { background: `linear-gradient(135deg, ${c1}, ${c2})` } : undefined}
            >
                {hasImage ? (
                    <img src={project.imageUrl} alt={project.title} className="project-cover" loading="lazy" />
                ) : (
                    <span className="project-emoji">{project.emoji}</span>
                )}
            </div>

            {/* Content */}
            <div className="project-body">
                <div className="project-meta">
                    <span className="project-year">{project.year}</span>
                    <span className={`project-status ${project.status?.className}`}>
                        {project.status?.label}
                    </span>
                </div>

                <h3 className="project-title">{project.title}</h3>
                <p className="project-description">{project.description}</p>

                <div className="project-footer">
                    <div className="project-tags">
                        {project.tags?.slice(0, 4).map((tag) => (
                            <span key={tag} className="tag">{tag}</span>
                        ))}
                        {project.tags && project.tags.length > 4 && (
                            <span className="tag tag-more">+{project.tags.length - 4}</span>
                        )}
                    </div>

                    <div className="project-actions-row">
                        <button
                            type="button"
                            className="card-quick-btn"
                            onClick={(e) => {
                                e.stopPropagation();
                                if (onOpenModal) onOpenModal(project);
                            }}
                        >
                            Fiche détaillée
                        </button>

                        {linkHref && (
                            <a
                                href={linkHref}
                                className="project-link"
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={(e) => {
                                    e.stopPropagation();
                                }}
                            >
                                <span>{project.link.text}</span>
                                {linkHref.includes('github.com') ? (
                                    <GithubIcon size={14} />
                                ) : (
                                    <ExternalLinkIcon size={14} />
                                )}
                            </a>
                        )}
                    </div>
                </div>
            </div>
        </article>
    );
}

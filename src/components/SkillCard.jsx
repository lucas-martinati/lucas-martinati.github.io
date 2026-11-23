export default function SkillCard({ skill }) {
    return (
        <div className="skill-card">
            <div className="skill-header">
                <div className="skill-icon" aria-hidden="true">{skill.icon}</div>
                <h3 className="skill-title">{skill.title}</h3>
            </div>
            <p className="skill-description">{skill.description}</p>
            <div className="skill-tags">
                {(skill.tags || []).map((tag) => (
                    <span key={tag} className="skill-tag">{tag}</span>
                ))}
                {(skill.discovering || []).map((tag) => (
                    <span key={tag} className="skill-tag skill-tag-discovering" title="En montée en compétence (projets pratiques)">{tag}</span>
                ))}
            </div>
            {(skill.discovering || []).length > 0 && (
                <p className="skill-discovery-note">En montée en compétence</p>
            )}
        </div>
    );
}

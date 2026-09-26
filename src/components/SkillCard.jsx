export default function SkillCard({ skill }) {
    return (
        <div className="skill-card">
            <div className="skill-header">
                <div className="skill-icon">{skill.icon}</div>
                <div className="skill-title">{skill.title}</div>
            </div>
            <p className="skill-description">{skill.description}</p>
            <div className="skill-tags">
                {(skill.tags || []).map((tag) => (
                    <span key={tag} className="skill-tag">{tag}</span>
                ))}
                {(skill.discovering || []).map((tag) => (
                    <span key={tag} className="skill-tag skill-tag-discovering" title="En découverte (vu en vibe-coding, non maîtrisé)">{tag}</span>
                ))}
            </div>
            {(skill.discovering || []).length > 0 && (
                <p className="skill-discovery-note">En découverte — pas (encore) maîtrisé</p>
            )}
        </div>
    );
}

export default function EducationCard({ item }) {
    const typeColors = {
        education: { bg: 'var(--accent-teal-dim)', border: 'var(--accent-teal-border)', text: 'var(--accent-teal)', label: 'Formation' },
        work: { bg: 'var(--accent-amber-dim)', border: 'var(--accent-amber-border)', text: 'var(--accent-amber)', label: 'Expérience' },
        certification: { bg: 'var(--accent-sky-dim)', border: 'var(--accent-sky-border)', text: 'var(--accent-sky)', label: 'Certification' },
    };

    const typeStyle = typeColors[item.type] || typeColors.education;

    return (
        <div className={`education-item education-type-${item.type || 'education'}`}>
            <div className="education-card">
                <div className="education-card-header">
                    <div className="education-icon" style={{ background: typeStyle.bg, borderColor: typeStyle.border }} aria-hidden="true">
                        {item.icon}
                    </div>
                    <div className="education-header-text">
                        <div className="education-meta">
                            <span className="education-period">{item.period}</span>
                            <span className="education-type-badge" style={{ background: typeStyle.bg, color: typeStyle.text, borderColor: typeStyle.border }}>
                                {typeStyle.label}
                            </span>
                        </div>
                        <h3 className="education-title">{item.title}</h3>
                        {item.highlight && (
                            <span className="education-highlight" style={{ color: typeStyle.text }}>
                                {item.highlight}
                            </span>
                        )}
                    </div>
                </div>
                <p className="education-school">{item.school}</p>
            </div>
        </div>
    );
}

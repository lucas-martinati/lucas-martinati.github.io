export default function EducationCard({ item }) {
    const typeColors = {
        education: { bg: 'rgba(59, 130, 246, 0.12)', border: 'rgba(59, 130, 246, 0.25)', text: '#3b82f6', label: 'Formation' },
        work: { bg: 'rgba(249, 115, 22, 0.12)', border: 'rgba(249, 115, 22, 0.25)', text: '#f97316', label: 'Expérience' },
        certification: { bg: 'rgba(16, 185, 129, 0.12)', border: 'rgba(16, 185, 129, 0.25)', text: '#10b981', label: 'Certification' },
    };

    const typeStyle = typeColors[item.type];

    return (
        <div className={`education-item education-type-${item.type}`}>
            <div className="education-card">
                <div className="education-card-header">
                    <div className="education-icon" style={{ background: typeStyle.bg, borderColor: typeStyle.border }}>
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

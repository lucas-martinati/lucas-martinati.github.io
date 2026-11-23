export default function LanguageCard({ language }) {
    return (
        <div className="language-card">
            <div className="language-icon" aria-hidden="true">{language.icon}</div>
            <div className="language-info">
                <h3 className="language-name">{language.name}</h3>
                <p className="language-level">{language.level}</p>
            </div>
        </div>
    );
}

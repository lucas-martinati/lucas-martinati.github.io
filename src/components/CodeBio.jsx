import { useState, useMemo, useEffect } from 'react';
import { CopyIcon, CheckIcon } from './Icons';
import { getComputedMetrics } from '../utils/metrics';

export default function CodeBio({ developer = {}, projects = [], education = [], skills = [] }) {
    const [activeTab, setActiveTab] = useState('js'); // 'js' | 'json' | 'sh'
    const [copied, setCopied] = useState(false);

    const metrics = useMemo(() => {
        return getComputedMetrics({ developer, projects, education });
    }, [developer, projects, education]);

    const projectsCount = metrics[0]?.value;
    const extensionsCount = metrics[1]?.value;
    const pixScore = metrics[2]?.value;
    const bacMention = metrics[3]?.value;

    const isSeeking = developer.recruitment?.enabled ?? developer.recruitment?.seeking;
    const targetText = isSeeking
        ? developer.recruitment?.badge
        : developer.recruitment?.passiveBadge;
    const statusText = isSeeking
        ? developer.availability
        : 'En poste';

    const githubSlug = developer.github.replace(/https?:\/\/github\.com\/?/, '').replace(/\/$/, '');
    const linkedinSlug = developer.linkedin.replace(/https?:\/\/(www\.)?linkedin\.com\/in\/?/, '').replace(/\/$/, '');

    // Aperçu volontairement court : les 6 premières de data.json.
    // (Réordonner developer.skills dans data.json pour choisir lesquelles.)
    const topSkills = (developer.skills || []).slice(0, 6);

    // Clé JSON dérivée du titre de catégorie : "Développement Web" → "developpementWeb".
    const slugKey = (title) =>
        String(title || '')
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-zA-Z0-9]+/g, ' ')
            .trim()
            .split(' ')
            .map((word, i) => (i === 0 ? word.toLowerCase() : word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()))
            .join('');

    // Objet de l'onglet stack.json : stack technique uniquement, construit
    // depuis data.skills (tags maîtrisés, catégories non masquées), avec la
    // découverte regroupée — aucune techno en dur ici.
    const stackJsonObj = useMemo(() => {
        const obj = {};
        (skills || []).forEach((cat) => {
            if (cat.hideFromStack) return;
            obj[slugKey(cat.title)] = [...(cat.tags || [])];
        });
        const discovering = [...new Set((skills || []).flatMap((cat) => cat.discovering || []))];
        if (discovering.length > 0) obj.discovering = discovering;
        return obj;
    }, [skills]);

    const renderJsonValue = (value) => {
        if (Array.isArray(value)) {
            return (
                <>
                    {'['}
                    {value.map((v, j) => (
                        <span key={`${v}-${j}`}>
                            <span className="string">"{v}"</span>
                            {j < value.length - 1 ? ', ' : ''}
                        </span>
                    ))}
                    {']'}
                </>
            );
        }
        return <span className="string">"{value}"</span>;
    };

    useEffect(() => {
        if (!isSeeking && activeTab === 'sh') {
            setActiveTab('js');
        }
    }, [isSeeking, activeTab]);

    const getRawContent = () => {
        if (activeTab === 'js' || (!isSeeking && activeTab === 'sh')) {
            return `const developer = {
  name: '${developer.name}',
  status: '${developer.status}',
  passion: '${developer.passion}',
  skills: [${topSkills.map((s) => `'${s}'`).join(', ')}],
  mindset: '${developer.mindset}',
  currentFocus: '${developer.currentFocus}',
  availability: ${developer.availability},
  email: '${developer.email}',
  github: '${githubSlug}',
  linkedin: '${linkedinSlug}'
};

// ${developer.comment}`;
        }

        if (activeTab === 'json') {
            return JSON.stringify(stackJsonObj, null, 2);
        }

        return `#!/usr/bin/env bash
# Script d'embauche de ${developer.name}
set -e

echo "Initialisation du profil candidat..."
CANDIDATE="${developer.name}"
TARGET="${targetText}"
STATUS="${developer.availability ? 'Disponible pour Alternance' : 'En poste'}"

echo "Vérification des atouts..."
# [✓] ${extensionsCount} extensions publiées sur stores officiels (Chrome & VS Code)
# [✓] ${projectsCount} projets conçus et déployés
# [✓] ${bacMention} & ${pixScore} Score PIX

echo "Contact direct :"
echo "mailto:${developer.email}"
echo "Statut : Prêt à intégrer votre équipe !"`;
    };

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(getRawContent());
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const pad = (n) => String(n).padStart(2, '0');

    return (
        <div className="code-bio">
            {/* Header with Mac dots + File Tabs */}
            <div className="code-header">
                <div className="code-dots">
                    <div className="dot red"></div>
                    <div className="dot yellow"></div>
                    <div className="dot green"></div>
                </div>

                {/* File Tabs */}
                <div className="code-tabs">
                    <button
                        type="button"
                        className={`code-tab ${activeTab === 'js' ? 'active' : ''}`}
                        onClick={() => {
                            setActiveTab('js');
                        }}
                    >
                        <span className="tab-dot js-dot"></span>
                        <span>lucas.js</span>
                    </button>

                    <button
                        type="button"
                        className={`code-tab ${activeTab === 'json' ? 'active' : ''}`}
                        onClick={() => {
                            setActiveTab('json');
                        }}
                    >
                        <span className="tab-dot json-dot"></span>
                        <span>stack.json</span>
                    </button>

                    {isSeeking && (
                        <button
                            type="button"
                            className={`code-tab ${activeTab === 'sh' ? 'active' : ''}`}
                            onClick={() => {
                                setActiveTab('sh');
                            }}
                        >
                            <span className="tab-dot sh-dot"></span>
                            <span>hire-me.sh</span>
                        </button>
                    )}
                </div>

                {/* Copy Button */}
                <button
                    type="button"
                    className={`code-copy-btn ${copied ? 'copied' : ''}`}
                    onClick={handleCopy}
                    aria-label="Copier le code source de l'onglet"
                    title="Copier le code"
                >
                    {copied ? <CheckIcon size={14} /> : <CopyIcon size={14} />}
                    <span>{copied ? 'Copié !' : 'Copier'}</span>
                </button>
            </div>

            {/* Code Content */}
            <div className="code-content">
                {activeTab === 'js' && (
                    <div className="code-lines">
                        <div className="code-line"><span className="line-number">{pad(1)}</span><span className="keyword">const</span>{' '}<span className="property">developer</span>{' '}= &#123;</div>
                        <div className="code-line"><span className="line-number">{pad(2)}</span>&nbsp;&nbsp;<span className="property">name</span>: <span className="string">'{developer.name}'</span>,</div>
                        <div className="code-line"><span className="line-number">{pad(3)}</span>&nbsp;&nbsp;<span className="property">status</span>: <span className="string">'{developer.status}'</span>,</div>
                        <div className="code-line"><span className="line-number">{pad(4)}</span>&nbsp;&nbsp;<span className="property">passion</span>: <span className="string">'{developer.passion}'</span>,</div>
                        <div className="code-line"><span className="line-number">{pad(5)}</span>&nbsp;&nbsp;<span className="property">skills</span>: [{topSkills.map((s, j) => (
                            <span key={s}><span className="string">'{s}'</span>{j < topSkills.length - 1 ? ', ' : ''}</span>
                        ))}],</div>
                        <div className="code-line"><span className="line-number">{pad(6)}</span>&nbsp;&nbsp;<span className="property">mindset</span>: <span className="string">'{developer.mindset}'</span>,</div>
                        <div className="code-line"><span className="line-number">{pad(7)}</span>&nbsp;&nbsp;<span className="property">currentFocus</span>: <span className="string">'{developer.currentFocus}'</span>,</div>
                        <div className="code-line"><span className="line-number">{pad(8)}</span>&nbsp;&nbsp;<span className="property">availability</span>: <span className="value">true</span>,</div>
                        <div className="code-line"><span className="line-number">{pad(9)}</span>&nbsp;&nbsp;<span className="property">email</span>: <span className="string">'{developer.email}'</span>,</div>
                        <div className="code-line"><span className="line-number">{pad(10)}</span>&nbsp;&nbsp;<span className="property">github</span>: <span className="string">'{githubSlug}'</span>,</div>
                        <div className="code-line"><span className="line-number">{pad(11)}</span>&nbsp;&nbsp;<span className="property">linkedin</span>: <span className="string">'{linkedinSlug}'</span></div>
                        <div className="code-line"><span className="line-number">{pad(12)}</span>&#125;;</div>
                        <div className="code-line"><span className="line-number">{pad(13)}</span></div>
                        <div className="code-line"><span className="line-number">{pad(14)}</span><span className="comment">// {developer.comment}</span></div>
                    </div>
                )}

                {activeTab === 'json' && (
                    <div className="code-lines">
                        <div className="code-line"><span className="line-number">{pad(1)}</span>&#123;</div>
                        {Object.entries(stackJsonObj).map(([key, value], i, entries) => (
                            <div key={key} className="code-line">
                                <span className="line-number">{pad(i + 2)}</span>&nbsp;&nbsp;<span className="property">"{key}"</span>: {renderJsonValue(value)}{i < entries.length - 1 ? ',' : ''}
                            </div>
                        ))}
                        <div className="code-line"><span className="line-number">{pad(Object.keys(stackJsonObj).length + 2)}</span>&#125;</div>
                    </div>
                )}

                {isSeeking && activeTab === 'sh' && (
                    <div className="code-lines">
                        <div className="code-line"><span className="line-number">{pad(1)}</span><span className="comment">#!/usr/bin/env bash</span></div>
                        <div className="code-line"><span className="line-number">{pad(2)}</span><span className="keyword">echo</span> <span className="string">"Initialisation du recrutement..."</span></div>
                        <div className="code-line"><span className="line-number">{pad(3)}</span><span className="property">CANDIDAT</span>=<span className="string">"{developer.name}"</span></div>
                        <div className="code-line"><span className="line-number">{pad(4)}</span><span className="property">STATUT</span>=<span className="string">"{statusText}"</span></div>
                        <div className="code-line"><span className="line-number">{pad(5)}</span><span className="property">CIBLE</span>=<span className="string">"{targetText}"</span></div>
                        <div className="code-line"><span className="line-number">{pad(6)}</span><span className="keyword">echo</span> <span className="string">"Vérification des atouts..."</span></div>
                        <div className="code-line"><span className="line-number">{pad(7)}</span><span className="comment"># [✓] {extensionsCount} extensions publiées sur stores</span></div>
                        <div className="code-line"><span className="line-number">{pad(8)}</span><span className="comment"># [✓] {projectsCount} projets développés avec rigueur</span></div>
                        <div className="code-line"><span className="line-number">{pad(9)}</span><span className="comment"># [✓] {bacMention} &amp; Score {pixScore} PIX</span></div>
                        <div className="code-line"><span className="line-number">{pad(10)}</span><span className="keyword">echo</span> <span className="string">"Prêt à collaborer !"</span></div>
                    </div>
                )}
            </div>
        </div>
    );
}

import { useState, useMemo, useEffect } from 'react';
import { CopyIcon, CheckIcon } from './Icons';
import { getComputedMetrics } from '../utils/metrics';

export default function CodeBio({ developer = {}, projects = [], education = [] }) {
    const [activeTab, setActiveTab] = useState('js'); // 'js' | 'json' | 'sh'
    const [copied, setCopied] = useState(false);

    const metrics = useMemo(() => {
        return getComputedMetrics({ developer, projects, education });
    }, [developer, projects, education]);

    const projectsCount = metrics[0]?.value || (projects.length ? String(projects.length) : '16');
    const extensionsCount = metrics[1]?.value || '3';
    const pixScore = metrics[2]?.value || '583';
    const bacMention = metrics[3]?.value || 'Mention Bien';

    const isSeeking = developer.recruitment?.enabled ?? developer.recruitment?.seeking ?? true;
    const targetText = isSeeking
        ? (developer.recruitment?.badge || "Alternance ciblée 2027-2028 (BUT 3) & Cycle Ingénieur")
        : (developer.recruitment?.passiveBadge || "Actuellement en poste • Projets & Collaborations");
    const statusText = isSeeking
        ? (developer.availability ? 'Disponible pour Alternance' : 'En poste')
        : 'En poste';

    const githubSlug = developer.github ? developer.github.replace(/https?:\/\/github\.com\/?/, '').replace(/\/$/, '') : 'lucas-martinati';
    const linkedinSlug = developer.linkedin ? developer.linkedin.replace(/https?:\/\/(www\.)?linkedin\.com\/in\/?/, '').replace(/\/$/, '') : 'lucas-martinati';

    useEffect(() => {
        if (!isSeeking && activeTab === 'sh') {
            setActiveTab('js');
        }
    }, [isSeeking, activeTab]);

    const getRawContent = () => {
        if (activeTab === 'js' || (!isSeeking && activeTab === 'sh')) {
            return `const developer = {
  name: '${developer.name || 'Lucas Martinati'}',
  status: '${developer.status || 'Étudiant en BUT Informatique'}',
  passion: '${developer.passion || "Évoluer dans le domaine de l'informatique"}',
  skills: [${(developer.skills || []).map((s) => `'${s}'`).join(', ')}],
  mindset: '${developer.mindset || 'Organisé, rigoureux et proactif'}',
  currentFocus: '${developer.currentFocus || 'BUT Informatique — IUT Nancy-Charlemagne'}',
  availability: ${developer.availability ?? true},
  email: '${developer.email || 'lucasm54800@gmail.com'}',
  github: '${githubSlug}',
  linkedin: '${linkedinSlug}'
};

// ${developer.comment || 'Prêt à collaborer sur des projets innovants !'}`;
        }

        if (activeTab === 'json') {
            return JSON.stringify(
                {
                    frontend: ['React 19', 'Next.js 15', 'TypeScript', 'Tailwind CSS', 'Vite'],
                    mobileAndExtensions: ['Capacitor', 'Chrome Extensions (MV3)', 'VSCode Extensions'],
                    backendAndCloud: ['Firebase', 'RESTful APIs', 'Serverless Functions'],
                    systemAndDevops: ['Linux (Ubuntu/GNOME)', 'Bash Scripts', 'Systemd Services', 'Git/GitHub'],
                    target: targetText,
                    strengths: ['Autonomie', 'Esprit produit', 'Rigueur mathématique', 'Proactivité']
                },
                null,
                2
            );
        }

        return `#!/usr/bin/env bash
# Script d'embauche de ${developer.name || 'Lucas Martinati'}
set -e

echo "Initialisation du profil candidat..."
CANDIDATE="${developer.name || 'Lucas Martinati'}"
TARGET="${targetText}"
STATUS="${developer.availability ? 'Disponible pour Alternance' : 'En poste'}"

echo "Vérification des atouts..."
# [✓] ${extensionsCount} extensions publiées sur stores officiels (Chrome & VS Code)
# [✓] ${projectsCount} projets conçus et déployés
# [✓] ${bacMention} & ${pixScore} Score PIX

echo "Contact direct :"
echo "mailto:${developer.email || 'lucasm54800@gmail.com'}"
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
                        <div className="code-line"><span className="line-number">{pad(2)}</span>&nbsp;&nbsp;<span className="property">name</span>: <span className="string">'{developer.name || 'Lucas Martinati'}'</span>,</div>
                        <div className="code-line"><span className="line-number">{pad(3)}</span>&nbsp;&nbsp;<span className="property">status</span>: <span className="string">'{developer.status || 'Étudiant en BUT Informatique'}'</span>,</div>
                        <div className="code-line"><span className="line-number">{pad(4)}</span>&nbsp;&nbsp;<span className="property">passion</span>: <span className="string">'{developer.passion || "Évoluer dans le domaine de l'informatique"}'</span>,</div>
                        <div className="code-line"><span className="line-number">{pad(5)}</span>&nbsp;&nbsp;<span className="property">skills</span>: [<span className="string">'React'</span>, <span className="string">'Next.js'</span>, <span className="string">'TypeScript'</span>, <span className="string">'Python'</span>, <span className="string">'Bash'</span>, <span className="string">'Linux'</span>],</div>
                        <div className="code-line"><span className="line-number">{pad(6)}</span>&nbsp;&nbsp;<span className="property">mindset</span>: <span className="string">'{developer.mindset || 'Organisé, rigoureux et proactif'}'</span>,</div>
                        <div className="code-line"><span className="line-number">{pad(7)}</span>&nbsp;&nbsp;<span className="property">currentFocus</span>: <span className="string">'{developer.currentFocus || 'BUT Informatique — IUT Nancy'}'</span>,</div>
                        <div className="code-line"><span className="line-number">{pad(8)}</span>&nbsp;&nbsp;<span className="property">availability</span>: <span className="value">true</span>,</div>
                        <div className="code-line"><span className="line-number">{pad(9)}</span>&nbsp;&nbsp;<span className="property">email</span>: <span className="string">'{developer.email || 'lucasm54800@gmail.com'}'</span>,</div>
                        <div className="code-line"><span className="line-number">{pad(10)}</span>&nbsp;&nbsp;<span className="property">github</span>: <span className="string">'{githubSlug}'</span>,</div>
                        <div className="code-line"><span className="line-number">{pad(11)}</span>&nbsp;&nbsp;<span className="property">linkedin</span>: <span className="string">'{linkedinSlug}'</span></div>
                        <div className="code-line"><span className="line-number">{pad(12)}</span>&#125;;</div>
                        <div className="code-line"><span className="line-number">{pad(13)}</span></div>
                        <div className="code-line"><span className="line-number">{pad(14)}</span><span className="comment">// {developer.comment || 'Prêt à collaborer sur des projets innovants !'}</span></div>
                    </div>
                )}

                {activeTab === 'json' && (
                    <div className="code-lines">
                        <div className="code-line"><span className="line-number">{pad(1)}</span>&#123;</div>
                        <div className="code-line"><span className="line-number">{pad(2)}</span>&nbsp;&nbsp;<span className="property">"frontend"</span>: [<span className="string">"React 19"</span>, <span className="string">"Next.js"</span>, <span className="string">"TypeScript"</span>, <span className="string">"Vite"</span>],</div>
                        <div className="code-line"><span className="line-number">{pad(3)}</span>&nbsp;&nbsp;<span className="property">"extensionsAndMobile"</span>: [<span className="string">"Capacitor"</span>, <span className="string">"Chrome Web Store"</span>, <span className="string">"VSCode Marketplace"</span>],</div>
                        <div className="code-line"><span className="line-number">{pad(4)}</span>&nbsp;&nbsp;<span className="property">"backendAndCloud"</span>: [<span className="string">"Firebase"</span>, <span className="string">"REST APIs"</span>, <span className="string">"Serverless"</span>],</div>
                        <div className="code-line"><span className="line-number">{pad(5)}</span>&nbsp;&nbsp;<span className="property">"systemAndDevOps"</span>: [<span className="string">"Linux Ubuntu"</span>, <span className="string">"Bash"</span>, <span className="string">"Systemd"</span>, <span className="string">"Git"</span>],</div>
                        <div className="code-line"><span className="line-number">{pad(6)}</span>&nbsp;&nbsp;<span className="property">"target"</span>: <span className="string">"{targetText}"</span></div>
                        <div className="code-line"><span className="line-number">{pad(7)}</span>&#125;</div>
                    </div>
                )}

                {isSeeking && activeTab === 'sh' && (
                    <div className="code-lines">
                        <div className="code-line"><span className="line-number">{pad(1)}</span><span className="comment">#!/usr/bin/env bash</span></div>
                        <div className="code-line"><span className="line-number">{pad(2)}</span><span className="keyword">echo</span> <span className="string">"Initialisation du recrutement..."</span></div>
                        <div className="code-line"><span className="line-number">{pad(3)}</span><span className="property">CANDIDAT</span>=<span className="string">"{developer.name || 'Lucas Martinati'}"</span></div>
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

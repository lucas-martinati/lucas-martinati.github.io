import React from 'react';
import ReactDOM from 'react-dom/client';
// Identité + éducation partagées du portfolio, contenu CV local à ce dossier.
import portfolio from '../src/data/portfolio.js';
import cvData from './cv-data.json';
import Cv from './Cv.jsx';
import './cv.css';

const app = (
    <React.StrictMode>
        <Cv developer={portfolio.developer} education={portfolio.education} skills={portfolio.skills} projects={portfolio.projects} cv={cvData} />
    </React.StrictMode>
);

const container = document.getElementById('cv-root');
if (container.hasChildNodes()) {
    ReactDOM.hydrateRoot(container, app);
} else {
    ReactDOM.createRoot(container).render(app);
}

import React from 'react';
import ReactDOM from 'react-dom/client';
// Identité + éducation partagées du portfolio, contenu CV local à ce dossier.
import portfolio from '../src/data/portfolio.js';
import cvData from './cv-data.json';
import Cv from './Cv.jsx';
import './cv.css';

ReactDOM.createRoot(document.getElementById('cv-root')).render(
    <React.StrictMode>
        <Cv developer={portfolio.developer} education={portfolio.education} skills={portfolio.skills} cv={cvData} />
    </React.StrictMode>
);

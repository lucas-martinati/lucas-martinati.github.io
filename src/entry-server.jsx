import React from 'react';
import { renderToString } from 'react-dom/server';
import App from './App.jsx';
import Cv from '../cv/Cv.jsx';
import portfolio from './data/portfolio.js';
import cvData from '../cv/cv-data.json';

export function render() {
    return {
        main: renderToString(<App />),
        cv: renderToString(<Cv developer={portfolio.developer} education={portfolio.education} skills={portfolio.skills} cv={cvData} />),
    };
}

# Portfolio de Lucas Martinati

Site statique React/Vite, hébergeable sur GitHub Pages. Le build génère le HTML complet du portfolio et du CV ; React active ensuite la recherche, les filtres et les dialogues. Aucun serveur applicatif n'est nécessaire en production.

## Développement et publication

Node.js 22 ou supérieur recommandé.

```sh
npm ci
npm run dev
```

```sh
npm run build        # Images WebP + assets + HTML statique dans dist/
npm run preview      # Vérifier le résultat de production
npm run cv:pdf       # Reconstruire le site et régénérer le PDF A4
npm run deploy       # Reconstruire le site et le PDF, puis publier sur gh-pages
```

`npm run deploy` publie réellement le site. `npm run build` reste local. La génération du PDF et les tests navigateur utilisent Chrome via Puppeteer.

## Modifier le contenu

- `src/config/site.js` : identité, coordonnées, URL canonique et métadonnées.
- `src/data/data.json` : projets, compétences, parcours et recrutement.
- `cv/cv-data.json` : contenu propre au CV.
- `public/img/` : captures originales ; conserver ces fichiers comme sources.

`npm run images` produit des WebP en 480, 960 et 1 440 pixels, sans agrandir les originaux. Les variantes de `public/img/optimized/` et le manifeste `src/data/images.json` sont générés automatiquement avant `dev` et `build`, et ignorés par Git. Relancer cette commande après avoir ajouté ou remplacé une capture pendant le développement.

Les polices Inter, Fira Code et Lexend sont servies localement depuis les paquets Fontsource (licence OFL incluse dans chaque paquet). Aucune requête Google Fonts n'est nécessaire.

## Vérifications

```sh
npm test
npm run build
npm run test:browser
```

Les tests navigateur lancent leur propre serveur de prévisualisation et vérifient la recherche, les filtres, les dialogues, le retour du focus, les ancres, les largeurs de 320 à 1 440 pixels, le CV, l'absence d'erreurs JavaScript et le contenu sans JavaScript. Ils exécutent aussi des audits axe sur la page principale, une fiche projet, le menu mobile et le CV. Les captures sont enregistrées dans le dossier temporaire système `portfolio-checks`.

Les audits automatiques couvrent les règles testables d'accessibilité ; ils ne remplacent pas une évaluation manuelle complète. Les performances réelles restent à mesurer sur l'hébergement et les appareils des visiteurs.

Le sitemap et `robots.txt` sont générés à partir de `SITE_URL`. Les liens de section utilisent les ancres natives pour conserver l'historique, les liens directs et les préférences de mouvement réduit.

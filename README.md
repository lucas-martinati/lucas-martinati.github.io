# Portfolio de Lucas Martinati

Site statique React/Vite, hébergeable sur GitHub Pages. Le build génère le HTML complet du portfolio et du CV ; React active ensuite la recherche, les filtres et les dialogues du portfolio. Le CV de production ne charge aucun JavaScript. Aucun serveur applicatif n'est nécessaire en production.

## Développement et publication

Node.js 22.19 ou supérieur recommandé (requis pour Lighthouse).

```sh
npm ci
npm run dev
```

```sh
npm run build        # Images AVIF/WebP + assets + HTML statique dans dist/
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

`npm run images` produit des WebP en 160, 320, 480, 800 et 1 440 pixels, limités à la largeur de l'original. Les cartes disposent aussi de vignettes AVIF avec repli WebP en 320, 480, 672, 800 et 1 080 pixels, au format 16:10, sans recadrer les captures. Les fiches détaillées utilisent les images complètes. Les variantes de `public/img/optimized/` et le manifeste `src/data/images.json` sont générés automatiquement avant `dev` et `build`, et ignorés par Git. Les anciennes variantes sont supprimées ; les originaux sont conservés. Relancer cette commande après avoir ajouté ou remplacé une capture pendant le développement.

Les polices Inter, Fira Code et Lexend sont servies localement depuis les paquets Fontsource (licence OFL incluse dans chaque paquet). Aucune requête Google Fonts n'est nécessaire. Les styles sont intégrés au HTML de production et la police principale est préchargée pour réduire les requêtes bloquantes. Le JavaScript du portfolio utilise une priorité réseau basse pour laisser charger le contenu visible en premier ([Fetch Priority API](https://web.dev/articles/fetch-priority)).

## Vérifications

```sh
npm test
npm run build
npm run test:browser
npm run audit:lighthouse                         # Mobile : accueil, projets, CV
npm run audit:lighthouse -- local reports/desktop desktop
npm run audit:lighthouse -- https://lucas-martinati.github.io/ reports/live
```

Les tests navigateur lancent leur propre serveur de prévisualisation et vérifient la recherche, les filtres, les dialogues, le retour du focus, les ancres, les largeurs de 320 à 1 440 pixels, le CV, l'absence d'erreurs JavaScript et le contenu sans JavaScript. Ils exécutent aussi des audits axe sur la page principale, une fiche projet, le menu mobile et le CV. Les captures sont enregistrées dans le dossier temporaire système `portfolio-checks`.

Les rapports Lighthouse HTML et JSON sont enregistrés dans `reports/` (ignoré par Git). Chaque page est auditée avec un nouveau profil Chrome sans extensions et les réglages Lighthouse standards. Le serveur local utilise le dernier build : lancer `npm run build` avant l'audit. Pour comparer des résultats, conserver le même appareil et les mêmes réglages ; les extensions peuvent fortement fausser les scores.

Pour un audit manuel dans les outils du navigateur, lancer `npm run build`, puis `npm run preview` et ouvrir l'URL indiquée (port 4173 par défaut). Le port 5173 correspond généralement à `npm run dev` : il charge les outils de développement, des modules non regroupés et React en mode développement, et ne représente pas le site publié. Voir [les différences entre développement et production dans Vite 6](https://v6.vite.dev/guide/why).

Si Lighthouse indique `NO_FCP`, l'audit a échoué à mesurer le premier affichage : aucun score de performance exploitable n'a été obtenu. Relancer sur la prévisualisation de production avec l'onglet au premier plan, dans une fenêtre privée sans extensions autorisées. Un avertissement IndexedDB signale des données locales susceptibles d'influencer l'audit, sans prouver qu'elles causent l'échec. La commande `npm run audit:lighthouse` permet également de vérifier le build dans un profil Chrome neuf.

Les audits automatiques couvrent les règles testables d'accessibilité ; ils ne remplacent pas une évaluation manuelle complète. Les performances réelles restent à mesurer sur l'hébergement et les appareils des visiteurs. La durée du cache HTTP est imposée par GitHub Pages ; le dépôt ne peut pas modifier ces en-têtes.

Le sitemap et `robots.txt` sont générés à partir de `SITE_URL`. Les liens de section utilisent les ancres natives pour conserver l'historique, les liens directs et les préférences de mouvement réduit.

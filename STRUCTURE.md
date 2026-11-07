# Carnet de fléchettes — structure

- `index.html` : page, liens vers le manifeste et les icônes
- `style.css` : toute l'apparence (partie « Look v2 » à la fin)
- `i18n.js` : textes FR/EN (langue du téléphone)
- `app.js` : logique (parties, exercices, cible, stats, historique)
- `manifest.webmanifest` + `icons/` : installation sur l'écran d'accueil
- `sw.js` : fonctionnement hors ligne (réseau d'abord, copie locale en secours)

## Publier (gratuit, HTTPS obligatoire pour l'installation)
- Netlify : glisser le dossier sur app.netlify.com/drop
- ou GitHub Pages : déposer les fichiers dans un dépôt, puis Settings > Pages

## Tester chez soi
`python3 -m http.server` dans le dossier, puis http://localhost:8000

## Données
Stockées dans le navigateur du téléphone (localStorage) : clés `dk_hist`, `dk_dout`, `dk_in`, `dk_goal`.
Changer d'adresse (domaine) = repartir de zéro : garder la même adresse.

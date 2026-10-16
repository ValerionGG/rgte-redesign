# RGTE — 10 propositions de refonte

Concepts de refonte complète de [rgte.eu](https://www.rgte.eu) (RGTE · R.G. Technologies, vitrines réfrigérées sur mesure, Puget-sur-Argens). **Ce n'est pas le site officiel** : chaque page porte la mention « Proposition de refonte — concept, non officiel », et les pages sont en `noindex`.

**Site en ligne :** https://valeriongg.github.io/rgte-redesign/

| # | Direction | Esprit |
|---|---|---|
| 1 | Vitrine | La haute joaillerie de la pâtisserie — galerie sombre, lumière de musée |
| 2 | Minéral | La matière : pierre acrylique blanche, granit, verre |
| 3 | Atelier | L'univers de l'artisan : farine, bois, kraft |
| 4 | Cryo | La science du froid : la température en héroïne |
| 5 | Rouge | La marque amplifiée : affiche suisse, rouge RGTE |
| 6 | Studio | Composez votre linéaire : le site devient configurateur |
| 7 | Maison | Haute pâtisserie parisienne : pastels et filets d'or |
| 8 | Cacao | Chocolat, cuivre et brillance |
| 9 | Plan | Le bureau d'études : du plan technique au rendu |
| 10 | Halles | Treize métiers, une couleur par secteur |

Chaque direction comprend 6 pages interactives : Accueil, Lignes d'agencement, Module Gourmandise (configurateur longueur / température / finition), Secteurs, Réalisations, Showroom & contact. Les formulaires n'envoient rien.

## Structure

- `a/project/`, `b/project/` — sources des deux canvas Design (propositions 1–5 et 6–10), `*.dc.html` + `canvas.json`.
- `docs/` — site statique publié par GitHub Pages (généré par `node build.mjs`).
- `docs/dc.js` — mini-runtime autonome pour le format `.dc.html`, rendu par Preact (`docs/vendor/preact.min.js`, MIT).
- `assets/` — photos d'illustration (Unsplash).
- `BRIEF.md` — brief commun (contenus réels de rgte.eu, règles).

Contenus repris de rgte.eu ; les informations manquantes sont des marqueurs visibles ([PRIX], [HORAIRES]…).

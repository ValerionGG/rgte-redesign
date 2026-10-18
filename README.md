# RGTE — 10 propositions de refonte

Concepts de refonte complète de [rgte.eu](https://www.rgte.eu) (RGTE · R.G. Technologies, vitrines réfrigérées sur mesure, Puget-sur-Argens). **Ce n'est pas le site officiel** : chaque page porte la mention « Proposition de refonte — concept, non officiel », et les pages sont en `noindex`.

**Site en ligne :** https://valeriongg.github.io/rgte-redesign/ (tour 1) · **Tour 2 :** https://valeriongg.github.io/rgte-redesign/v2/ · **Tour 3 :** https://valeriongg.github.io/rgte-redesign/v3/

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

## Tour 2 — 5 propositions recentrées sur le produit (`v2/`)

Retour client : le tour 1 était trop éloigné du sujet (univers des clients plutôt que du fabricant). Le tour 2 garde l'identité RGTE, met les vitrines en héros (rendus SVG `assets/v2/`) et fait de l'accueil une landing orientée plan 3D / devis.

| # | Direction | Esprit |
|---|---|---|
| 1 | Showroom | Le showroom en ligne — évolution directe du site actuel |
| 2 | Fabricant | Le fabricant du froid sur mesure — vitrine annotée, fiches techniques |
| 3 | Métiers | Votre métier, vos vitrines — recommandation par métier |
| 4 | Gamme | Le catalogue pro — recherche, filtres, comparateur |
| 5 | Projet 3D | Votre agencement dessiné et offert — demande de plan 3D dans le héros |

3 pages par direction : Accueil (landing), Lignes d'agencement (45 modules), Module Gourmandise. Sources : `v2/project/*.dc.html`, cadrage : `v2/BRIEF-v2.md`, kit : `v2/kit/vitrines.html`.

## Tour 3 — 5 sites complets en vraies photos (`v3/`)

Retour client sur le tour 2 : rendus dessinés « pas beaux », pages pas assez abouties. Le tour 3 utilise uniquement des photos réelles : rendus 3D RGTE détourés (`assets/photos/produits/`), photos des réalisations publiées sur rgte.eu (`assets/photos/realisations/`) et ambiances Unsplash (`assets/photos/ambiance/`). Inspirations : IFI, CIAM, Orion, Dribbble, Behance, Pinterest.

| # | Direction | Esprit |
|---|---|---|
| 1 | Éditorial | La vitrine, objet de design |
| 2 | Fabricant | Conçu, fabriqué, installé |
| 3 | Catalogue | L'équipement pro des métiers de bouche |
| 4 | Configurateur | Composez votre comptoir |
| 5 | Réalisations | 14 boutiques, une signature |

6 pages par direction (Accueil, Lignes, Module Gourmandise, Secteurs, Réalisations, Contact). Cadrage : `v3/BRIEF-v3.md`.

# RGTE — Tour 2 : 5 propositions recentrées (landing + produits)

À lire AVEC `../BRIEF.md` (contenus réels, règles du format `.dc.html` — toutes restent obligatoires, sauf mention contraire ci-dessous).

## Pourquoi un tour 2 — ce qui n'allait pas au tour 1
Le client a jugé les 10 premières propositions **hors sujet**. Diagnostic :
- Elles mettaient en scène l'univers des **clients de RGTE** (pâtisserie parisienne pastel, chocolat/cuivre, farine/kraft, halles colorées, joaillerie) au lieu de **RGTE lui-même** : un **fabricant B2B de vitrines réfrigérées sur mesure**.
- Les **produits** (lignes, modules, vitrines) étaient relégués en listes de texte ; les héros étaient des photos de croissants et de macarons.
- Les pages d'accueil étaient de longs récits de marque (≈ 10 000 px) au lieu d'une **landing qui convertit** (devis, plan 3D offert, appel au numéro vert, visite du showroom).
- L'identité RGTE (rouge, typo grotesque géométrique type Brandon, photos produits sur fond gris) était souvent abandonnée.

## Principes non négociables du tour 2
1. **Le produit est le héros.** Au-dessus de la ligne de flottaison : une **vitrine RGTE** (rendu SVG du kit), la promesse « Agencement de vitrines réfrigérées sur mesure », et 2 CTA : **Plan 3D offert** (principal) + **0 800 95 13 13** (appel gratuit). Pas de photo de pâtisserie en héros.
2. **Identité RGTE conservée et modernisée** : rouge **#D42A20** (accent, CTA), blanc, gris « fond studio » des photos produit (#ECEBE8 / #E9E8E5), graphite #1C1C1E. Typo : grotesque géométrique proche de Brandon Grotesque (Jost, Outfit, Figtree, Archivo, Barlow, Manrope, Red Hat Display… selon la direction). **Interdits** : pastels, or, cuivre, kraft, serif décoratives de pâtisserie, palettes multicolores par secteur, Inter/Roboto/Arial/Fraunces.
3. **Landing qui convertit** : hauteur cible **4 500 – 6 500 px** à 1440 px. Sections attendues (ordre libre selon la direction) : héros produit → les 5 lignes (avec visuels produits) → produit vedette Gourmandise (prix 5 800 € HT dès 101 cm) → secteurs (13, compacts, `id="secteurs"`) → réalisations (4–6 en vedette, photos de boutiques autorisées ICI en contexte, `id="realisations"`) → méthode étude → plan 3D → fabrication → installation (sans délais inventés) → matières → showroom Puget-sur-Argens + formulaire court de demande (`id="contact"`) → footer. CTA récurrents (au moins 3 sur la page) et header collant avec CTA.
4. **Les produits partout** : chaque module/ligne affiché avec son **visuel SVG** (fichiers du kit), son nom, sa ligne, sa plage de température quand elle est connue, et un lien vers la fiche. Prix : uniquement « 5 800 € HT » pour Gourmandise 101 cm ; ailleurs « Sur devis ».
5. **B2B, sobre, expert** : ton d'un fabricant français (bureau d'études et show-room dans le Var), vocabulaire métier (froid ventilé/statique, groupe logé, bacs gastronormes, plaques 600×400). Aucune statistique inventée.

## Kit de rendus produits (fichiers SVG, à utiliser via `<img>`)
`assets/v2/vitrine-<nom>.svg` — viewBox 480×320, fond transparent, ombre portée incluse. Les poser sur un fond gris studio (#ECEBE8, #E9E8E5) ou blanc, ou graphite pour une direction sombre.
| fichier | représente | à utiliser pour |
|---|---|---|
| `vitrine-gourmandise.svg` | Gourmandise / Centrale (Stone), piliers + plan pierre blanche, vitrages coulissants | Gourmandise, Centrale, Vision* |
| `vitrine-plane.svg` | Plane (Stone), exposition à hauteur du plan, vitrage bas, façade verre sérigraphié | Plane, Vision, Surface plane, Gourmandise variante |
| `vitrine-panorama.svg` | grand volume vitré, étagères | Panorama, Panoramique, Murale self-service, Argent/Olympe (murales) |
| `vitrine-saladette.svg` | bacs gastronormes + pare-haleine | Saladette, Bar à salades, Topping, Pizza, Nepal (snack) |
| `vitrine-bainmarie.svg` | bacs + vapeur, afficheur +65° | Chaud bain-marie, Chaud (plaque chaude), Vitrine chauffante sèche |
| `vitrine-caisse.svg` | comptoir caisse + tablette PMR | Comptoir caisse, Comptoir bar, Caisse et vitrine neutre, Arrière neutre, Vitrine neutre |
| `vitrine-cube.svg` | façade bois mélaminé à moulures, plan granit, vitrage droit à étagères (Basique) | Cube, Pastry Show, Amandine, Vitrine rétro, Statique, Basse |
| `vitrine-legno.svg` | Plane façade bois mélaminé (Legno) | tous les modules Legno réfrigérés |
| `vitrine-poissonnerie.svg` | cuve inclinée sur glace, afficheur −1° | Poissonnerie, Hanoi |
| `vitrine-industry.svg` | vitre bombée, façade laquée graphite | Ligne Industry (Olympe, Nepal, Aramis, Rubis, Argentine, Hanoi, Loire, Argent, Sugar, Hawaii, 4 faces vitrées) |
| `vitrine-encastrable.svg` | cuve brute grise « à habiller » | Ligne Encastrable (cuve froid ventilé / statique) |

Configurateur de longueur (page Module) : faire varier la **largeur** de l'image (ex. `style="{{ cfg.imgStyle }}"` avec `width:` = longueur/222 × 100 %, min 46 %) sur un socle avec une **cote** dessinée (trait + flèches + « 146 cm ») qui suit. Tu peux aussi superposer des éléments HTML/SVG inline (callouts, hotspots, cotes, plan vu de dessus) — c'est encouragé.

## Pages à livrer par direction (3) — dossier `v2/project/`
`<Dir>-Accueil.dc.html` (landing), `<Dir>-Lignes.dc.html` (catalogue des 5 lignes et de TOUS les modules du brief), `<Dir>-Module.dc.html` (fiche Gourmandise + configurateur, comme le brief d'origine).
- Nav : `Lignes d'agencement` → `<Dir>-Lignes.dc.html` · `Secteurs` → `<Dir>-Accueil.dc.html#secteurs` · `Réalisations` → `<Dir>-Accueil.dc.html#realisations` · `Showroom & contact` → `<Dir>-Accueil.dc.html#contact`. Logo RGTE → `<Dir>-Accueil.dc.html`. Lien discret « Toutes les propositions » → `Main.dc.html`.
- Sur la landing, les ancres internes sont `href="#secteurs"` etc.
- Footer complet + « Proposition de refonte (tour 2) — concept, non officiel ».
- `<title>` : `RGTE · <Direction> — Accueil` / `— Lignes d'agencement` / `— Module Gourmandise`.
- Hauteurs : Accueil 4 500–6 500 px, Lignes ≤ 5 500 px, Module ≤ 5 000 px. Renseigner `$preview.height` en conséquence.
- Mobile (390 px) impeccable : aucune barre de défilement horizontale.

## Les 5 directions (une par agent)
1. **Showroom** — « Le showroom en ligne ». Évolution directe du site actuel : blanc + gris studio, rouge en accent, **Jost** (la plus proche de Brandon). Héros : grande vitrine sur fond gris studio, sélecteur des 5 lignes qui change la vitrine affichée (fondu + légende ligne/matériaux), puce prix « Gourmandise dès 5 800 € HT ». Ensuite des « podiums » produits (fonds studio, lumière douce) pour chaque ligne. Catalogue = salle d'exposition par ligne, onglets. Module = fiche produit type e-commerce premium (galerie : vue face / détail / cote).
2. **Fabricant** — « Le fabricant du froid sur mesure ». Graphite #1C1C1E + blanc cassé + rouge ; **Archivo** (+ Archivo Narrow pour titres) et **IBM Plex Mono** pour les données. Héros sombre : vitrine Gourmandise **annotée** avec hotspots interactifs (froid ventilé, groupe logé, vitrages coulissants des 2 côtés, pierre acrylique, dégivrage automatique, ré-évaporation des condensats, contrôle électronique) — survol/clic = fiche. Ton d'industriel : bureau d'études, fabrication, installation. Catalogue = tableau comparatif des lignes + grille de modules avec specs. Module = fiche technique très lisible, configurateur à droite (sticky).
3. **Métiers** — « Votre métier, vos vitrines ». Blanc + rouge + gris, **Figtree**. Héros : « Vous êtes… » + 13 métiers en chips ; le choix change la vitrine conseillée (SVG), la plage de température et la liste des modules conseillés, avec CTA « Plan 3D offert pour ma [boulangerie] ». Tout le site s'organise par métier, mais le produit reste au centre (pas de photos de produits alimentaires en héros, pas de couleur par secteur). Catalogue = filtres métier × ligne. Module = fiche avec bloc « Idéal pour : pâtisserie (+2/+8), chocolat (+14/+18) ».
4. **Gamme** — « Le catalogue pro ». Esprit fabricant d'équipement professionnel / catalogue B2B : **Barlow** + **Barlow Condensed**, blanc, gris, rouge, filets fins. Landing : héros compact (vitrine + promesse + recherche « Je cherche une vitrine pour… ») puis la **grille produits** apparaît très tôt (≤ 900 px) avec filtres (ligne, usage, température) et **comparateur** (cocher 2–3 modules → bandeau de comparaison). Catalogue = vue liste/grille + filtres complets. Module = fiche produit pro (référence, options, tableau de specs, documents [FICHE PDF] en marqueur).
5. **Projet 3D** — « Votre agencement, dessiné et offert ». Conversion d'abord : **Manrope**, blanc, gris clair, rouge, traits techniques fins. Héros en 2 colonnes : à gauche, un **comptoir composé** de 3 modules (SVG du kit côte à côte : vitrine + saladette/plane + caisse) qui bascule en **vue de dessus** (plan coté dessiné en SVG inline) via un toggle « Face / Plan » ; à droite, une **demande de plan 3D en 3 étapes** (métier → longueur du local → coordonnées) fonctionnelle en state. Les produits sont présentés comme « les modules de votre plan ». Catalogue = modules + bouton « Ajouter à mon plan » (compteur dans le header). Module = fiche + « Ajouter à mon plan 3D ».

## Auto-vérification (OBLIGATOIRE avant de répondre)
1. `cd /home/claude/rgte-redesign && node build.mjs` (génère `docs/v2/<Dir>-*.html`).
2. Captures : `python3 /home/claude/tools/shot.py file:///home/claude/rgte-redesign/docs/v2/<Dir>-Accueil.html /tmp/claude-0/-home-claude/a03178b4-5b0e-5353-8411-102744ad2e62/scratchpad/<dir>-accueil.png 1440` puis la même chose à **390** de large. Le script affiche la hauteur, la largeur de défilement (doit être = largeur de la fenêtre) et les erreurs console (doit être vide).
3. Regarder les captures (outil Read sur le .png) et corriger : textes coupés, débordements, chevauchements, images manquantes, contraste, vides. Tester au moins une interaction en state en relisant la logique.
4. NE PAS modifier les fichiers des autres directions, ni `build.mjs`, ni `a/`, `b/`, `assets/`. NE PAS faire de commit ni de push. NE PAS publier.

## Réponse attendue
Liste des 3 fichiers, hauteur mesurée à 1440 px de chaque page, résultat 390 px (scrollWidth OK ?), 1 ligne sur le moment-signature, et tout point non résolu.

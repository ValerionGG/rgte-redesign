# RGTE — Tour 3 : 5 propositions abouties, en vraies photos

À lire AVEC `../BRIEF.md` : contenus réels de RGTE et règles du format `.dc.html`. Ces règles restent obligatoires, sauf exceptions indiquées ici.

## Retour du client sur le tour 2 (à corriger absolument)
- **« Pas beau »** : les vitrines dessinées en SVG font maquette, pas site de fabricant. → **Tour 3 = 100 % photo réelle.** Les SVG du kit v2 sont **interdits**. Le SVG inline reste autorisé pour les icônes, les cotes, les plans techniques et les cartes.
- Les pages doivent être **plus développées, plus modernes, mieux finies**, au niveau des meilleurs sites vus sur Dribbble, Behance et Pinterest (références plus bas).
- Le recentrage du tour 2 reste valable :
  - RGTE est un **fabricant B2B de vitrines réfrigérées sur mesure** ;
  - le produit est le héros ;
  - landing qui convertit (Plan 3D offert, 0 800 95 13 13, showroom) ;
  - identité RGTE : rouge **#D42A20** en accent, grotesque, fond gris studio.
- Aucun univers « pâtisserie pastel », chocolat-cuivre ou kraft. Les photos de produits alimentaires ne sont pas le héros : on montre des **vitrines et des boutiques équipées**.

## La bibliothèque photo (NOUVEAU, tout est local — `assets/photos/...`)
Planches visuelles à regarder **avant de commencer** (outil Read sur les .jpg) : `v3/kit/planche-produits.jpg`, `v3/kit/planche-realisations.jpg`, `v3/kit/planche-ambiance.jpg`. Liste complète avec dimensions : `v3/kit/catalogue-photos.md`.

1. **`produits/`** : 51 visuels produits RGTE **détourés** (webp transparent), issus des rendus 3D et des photos du site rgte.eu.
   - Nom = ligne-module. Exemples : `stone-gourmandise`, `stone-centrale`, `stone-plane`, `stone-vision`, `stone-saladette`, `stone-bainmarie`, `stone-caisse`, `stone-poissonnerie`, `basique-pastry-show`, `basique-cube`, `basique-saladette`, `legno-ventilee`, `legno-statique`, `legno-caisse`, `legno-bar`, `legno-arriere`, `encastrable-ventile`, `industry-rubis`, `industry-loire`, `industry-aramis`, `industry-hanoi`, `industry-hawaii`, `industry-olympe`, `industry-argent`, `industry-sugar`, `industry-nepal`, `industry-argentine`, `industry-4faces`.
   - Le suffixe `-222`, `-224`, etc. désigne la version la plus longue du module.
   - Beaucoup de rendus montrent **2 vues** du module (face client + face service) côte à côte.
   - À poser sur un fond studio (#ECEBE8, #E9E8E5, blanc, graphite) avec une ombre portée douce, par exemple une ellipse floue en CSS sous le produit. C'est le **packshot** officiel.
   - `stone-gourmandise-photo` est une vraie photo de la Gourmandise, non détourée.
2. **`realisations/`** : 81 **vraies photos de boutiques équipées par RGTE**.
   - **Résolution variable** : beaucoup font 695×450. Pour les grands formats (héros plein écran, bannières), privilégier les fichiers ≥ 1200 px de large (voir le catalogue) ; les petits vont dans des vignettes et des grilles.
   - Correspondance avec les 14 réalisations du brief :
     1. Pâtisserie Paris 4e → `stone-patisserie-paris`
     2. Bar à salades (13) → `stone-saladbar-sud`, `-2`, `stone-saladbar-plan` (3D)
     3. Chocolatier Gap & Grenoble → `stone-chocolatier-gap`, `-2`, `-3`, `stone-chocolatier-boutique`
     4. Sandwicherie Chamonix → `basique-chamonix`, `-2`, `-3`, `-4`
     5. Bar à olives Nice → `stone-olives-alziari`, `-2`, `stone-olives-trous`, `-2`, `stone-olives-service`
     6. Bar à yogourt glacé → `stone-yogurt-annecy`, `stone-yogurt-1`, `-2`, `stone-yogurt-toppings`, `stone-yogurt-ladefense`
     7. Boulangerie pâtisserie La Réunion → `stone-reunion`, `-2`, `-3`
     8. Boulangerie (33) → `legno-boulangerie-large`, `stone-boulangerie-2`
     9. Pizza Paris → `stone-pizza`
     10. Pâtissier chocolatier (69) → `stone-patissier-chocolatier`, `-2`, `-3`
     11. Traiteur asiatique Marseille → `stone-dakao`, `-2` … `-5`
     12. Bar à couscous Isère → `stone-couscous`
     13. Traiteur poissonnier (92) → `stone-pointier`, `-2`, `stone-poissonnier-plan` (3D)
     14. Canet Nice → `stone-canet`, `-2`, `-3`, `stone-canet-facade`
   - Autres photos d'installations, utiles pour les lignes et les secteurs :
     - Legno : `legno-cafe-bar` (5184 px, très bien), `legno-boulangerie-comptoir`, `legno-coffee-shop`, `legno-cafe-vitrine`, `legno-pizza`…
     - Basique : `basique-nouveau-magasin` (5184 px), `basique-cube-salon`, `basique-hoops`…
     - Stone : `stone-gourmandiz`, `stone-centrale-chocolat`, `stone-plane-chocolats`, `stone-saladette-photo`…
   - Ces photos montrent les enseignes des clients (Dakao, Alziari, Canet…). C'est normal : ce sont les réalisations publiées par RGTE.
3. **`ambiance/`** : 57 photos **Unsplash** (licence libre, 1800 px, haute qualité) pour les ambiances, les bannières et les fonds de secteurs. Exemples :
   - vitrines et boutiques : `vitrine-noire-studio`, `vitrine-nuit-lineaire`, `boutique-vitrines-longues`, `boulangerie-bois-moderne`, `traiteur-moderne`, `halle-comptoirs`, `comptoir-blanc` ;
   - secteurs : `poissonnerie-etal`, `vitrine-fromages`, `glaces-bacs`, `saladette-bacs` ;
   - matières : `matiere-pierre-blanche`, `matiere-marbre`, `comptoir-pierre-sombre`, `niches-bois-led`.

   À utiliser **en complément** des photos RGTE, jamais à leur place, pour illustrer une réalisation précise. Ajouter dans le footer : « Photos d'ambiance : Unsplash ».

Chemins : `<img src="assets/photos/produits/stone-gourmandise.webp">`, ou `url(assets/photos/...)` dans une règle `<helmet><style>`. Toujours `object-fit` + `alt` descriptif. `loading="lazy"` sauf au-dessus de la ligne de flottaison.

## Références d'inspiration (recherche faite sur Dribbble, Behance, Pinterest et sites de fabricants)
- **IFI (ifi.it), fabricant italien de vitrines et d'agencement de bars et pâtisseries.** Mise en page éditoriale et aérée, grandes photos d'ambiance en splits asymétriques, blocs de couleur pleins à côté de la photo, navigation minimale, typographie fine.
- **CIAM (ciamweb.it), vitrines réfrigérées design.** Héros plein écran avec la vitrine dans un décor, titre géant superposé, produits présentés comme des objets de design, recherche dans le header.
- **Pinterest « refrigerated display case »** (Tortuga par CIAM, NEXT par Orion) : la vitrine en **packshot studio** sur fond sombre ou gris, éclairée, avec un nom de modèle énorme. Fiches type « Upright display chiller » : produit, 3–4 bénéfices pictos, CTA.
- **Dribbble « industrial manufacturer website »** (« Design. Fabricate. Install. », « Precision manufacturing ») : photo d'usine ou de chantier pleine largeur, titre fort, bandeau de logos et de chiffres, process numéroté, cartes services.
- **Dribbble « kitchen equipment website »** (Chef's Essentials, Orix Creative) : grands titres condensés en capitales, packshots sur fond beige ou gris, grilles produits denses mais respirantes, alternance photo d'usage et packshot, mélange de fond clair et de bandes sombres.
- **Dribbble « premium furniture product page »** (M-001, Moonair, Woodella) : fiche produit éditoriale, référence produit stylée, galerie, options de finition en pastilles, accordéons de caractéristiques, produits associés.

Le niveau visé est celui de ces sites :
- grilles asymétriques, grandes respirations, typographie très maîtrisée (échelle nette, interlignage serré pour les titres) ;
- micro-interactions soignées : hover zoom photo, curseurs, transitions, révélations au scroll en CSS (`animation-timeline: view()` avec repli acceptable, ou keyframes à l'entrée) ;
- **pas de cartes génériques arrondies avec ombre partout**.

## Pages à livrer par direction (6) — dossier `v3/project/`, préfixe `<Dir>-`
`Accueil`, `Lignes` (5 lignes + **tous** les modules avec packshot détouré), `Module` (fiche Gourmandise + configurateur), `Secteurs` (13), `Realisations` (14, avec les vraies photos, filtres, vue détail en galerie), `Contact` (showroom Puget-sur-Argens, devis / plan 3D, carte stylisée).
- Contenus, champs de formulaire, interactivité minimale par page : comme dans `../BRIEF.md`.
- **Plus développé que le tour 2.** Page Module :
  - galerie multi-vues (packshot 101 cm, packshot 222 cm, photo réelle `stone-gourmandise-photo`, photo en situation) ;
  - configurateur ;
  - specs ;
  - « Vu dans ces réalisations », avec les photos des réalisations Stone.

  Page Réalisations : vraie galerie de cas, avec lightbox en state (photo agrandie, précédent/suivant) et modules utilisés en packshots.
- Nav (toutes pages) : Lignes d'agencement · Secteurs · Réalisations · Showroom & contact → `<Dir>-Lignes.dc.html` … ; logo → Accueil ; « Toutes les propositions » → `Main.dc.html`.
- Header collant avec « Plan 3D offert » et 0 800 95 13 13. Footer complet avec « Proposition de refonte (tour 3) — concept, non officiel » et « Photos : RGTE (rgte.eu) · ambiances Unsplash ».
- Hauteurs indicatives à 1440 px : Accueil 5 000–8 000 px ; autres pages ≤ 7 000 px. `$preview.height` cohérent.
- Mobile (390 px) impeccable : aucune barre de défilement horizontale, nav repliée en menu.

## Les 5 directions (une par agent)
1. **Éditorial** — « La vitrine, objet de design ». Inspirée d'IFI et de CIAM.
   - Fond blanc cassé et gris pierre, rouge RGTE ponctuel. Typo : **Urbanist** (ou Jost) en très grand et fin pour les titres, **Hanken Grotesk** pour le texte.
   - Héros plein écran sur une vraie réalisation haute résolution (`legno-cafe-bar` ou `basique-nouveau-magasin`), titre géant superposé, packshot détouré qui « sort » du cadre.
   - Splits photo / aplat de couleur, collections horizontales des 5 lignes en packshots sur socle, réalisations en mosaïque éditoriale.
2. **Fabricant** — « Conçu, fabriqué, installé ». Inspirée des sites d'industriels de Dribbble et du NEXT d'Orion.
   - Graphite #141416 et blanc, rouge RGTE vif. Typo : **Archivo** (axe largeur, titres étendus en capitales) + **JetBrains Mono** pour les données.
   - Héros sombre : packshot Gourmandise éclairé comme en studio (halo, reflet au sol), nom de modèle géant derrière, specs clés en mono.
   - Bandes photo pleine largeur des réalisations en noir et blanc qui passent en couleur au survol. Process en 4 étapes avec photos (plan 3D `stone-saladbar-plan` / `stone-poissonnier-plan` → fabrication → installation → boutique finie). Fiches techniques exemplaires.
3. **Catalogue** — « L'équipement pro des métiers de bouche ». Inspirée de Chef's Essentials et d'Orix (Dribbble kitchen equipment).
   - Fond beige-gris #EFEDE8 et blanc, bandes noires, rouge RGTE. Typo : **Barlow Condensed** (titres capitales géants) + **Barlow**.
   - Landing très produit :
     - méga-menu avec vignettes packshot ;
     - héros en split (titre géant + mosaïque de packshots + photo d'usage) ;
     - grille produits filtrable dès le 2e écran ;
     - « best-sellers » en carrousel ;
     - bandeau de photos réelles ;
     - quick-view (panneau latéral en state).
   - Comparateur sur la page Lignes.
4. **Configurateur** — « Composez votre comptoir ». Inspirée des configurateurs de mobilier premium.
   - Blanc et gris très clair, rouge RGTE. Typo : **Plus Jakarta Sans**.
   - Héros : un **comptoir composé de vrais packshots détourés** alignés sur un sol studio (ex. `stone-caisse` + `stone-gourmandise` + `stone-plane`). On ajoute ou retire des modules et on change de ligne : les packshots changent (Stone / Basique / Legno), avec la longueur totale et un récapitulatif « Mon projet » qui mène au plan 3D offert.
   - Chaque page garde ce « panier projet » (compteur dans le header).
   - Les réalisations servent de preuves : « Ce comptoir chez Canet, Nice ».
5. **Réalisations** — « 14 boutiques, une signature ». Inspirée des portfolios d'agences sur Behance.
   - Noir et blanc, typographie forte, rouge RGTE. Typo : **Schibsted Grotesk** (ou Familjen Grotesk).
   - Le site entre par la **preuve** : héros en diaporama plein écran des plus belles réalisations (Canet, Alziari, Yogurt Factory, Dakao, Gap…), avec nom, lieu et ligne utilisée.
   - Chaque réalisation est une étude de cas (photos, modules utilisés en packshots cliquables vers la fiche, ligne, secteur).
   - Les lignes et les modules sont présentés depuis les réalisations (« utilisé dans 6 projets »). C'est une landing tout aussi orientée devis.

## Qualité — check-list avant de rendre
- Aucun visuel SVG de vitrine. Toutes les vitrines sont des **photos ou packshots réels** du dossier `assets/photos`.
- Pas d'image étirée ou pixelisée. Pas de petite image (695 px) en plein écran au-delà de ~1000 px de large : utiliser un fichier plus grand ou un cadrage plus petit.
- Contraste du texte sur photo : voile en dégradé ou aplat sous le texte.
- Toutes les interactions fonctionnent en state. Formulaires : validation puis « prototype — rien n'est envoyé ».
- Pas de statistique inventée. Faits disponibles : 5 lignes, 13 secteurs, 14 réalisations, longueurs, températures, 5 800 € HT, plan 3D offert, numéro vert. Le reste en marqueurs [..].

## Auto-vérification (OBLIGATOIRE)
1. `cd /home/claude/rgte-redesign && node build.mjs` génère `docs/v3/<Dir>-*.html`.
2. Captures pour CHAQUE page, à 1440 et 390 px : `python3 /home/claude/tools/shot.py file:///home/claude/rgte-redesign/docs/v3/<Dir>-<Page>.html /tmp/claude-0/-home-claude/a03178b4-5b0e-5353-8411-102744ad2e62/scratchpad/v3-<dir>-<page>.png 1440`. Le script affiche la hauteur, la largeur de défilement et les erreurs ; l'échec de Google Fonts est normal ici.
   - Des polices locales peuvent aider aux captures : `~/.fonts`, `~/.local/share/fonts`, `npm i @fontsource/...` hors du dépôt.
3. Regarder les captures (Read) et **corriger tout ce qui n'est pas au niveau** : photos mal cadrées, textes illisibles, vides, débordements, alignements.
4. Ne modifier QUE tes 6 fichiers. Pas de commit, pas de push, pas de publication. Ne pas toucher `build.mjs`, `assets/`, `a/`, `b/`, `v2/`.

## Réponse attendue
Les 6 fichiers avec leur hauteur à 1440 px, le résultat à 390 px, le moment-signature en une ligne, les photos clés utilisées, et les points non résolus.

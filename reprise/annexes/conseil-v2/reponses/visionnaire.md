## Réponse

### Verdict
Le moteur est large et propre (≈ 120 contrôles, 8/8 tests verts, CLI solide). Mais SEO 360 s'arrête au diagnostic, qui peut mentir : sans HTML lu, il affiche 100/100 « Excellent ». Il liste les problèmes sans corriger, vérifier ni suivre.
**UX 60/100 · Efficacité 45/100.** Le gisement : boucler diagnostiquer → corriger → vérifier → prouver, pour une TPE, en français et gratuitement.

### Constats (les plus importants d'abord)
1. **Score fantôme.** En mode « PageSpeed seul » (PSI en 429, rien lu) : **100/100 · A, « Excellent socle », 0 correction**. Proxy public en échec : **87/100** malgré « Page inaccessible » (vu dans l'interface avec Playwright). Une catégorie sans contrôle vaut 100 (`audit.js:418-429`, `app.js:177`).
2. **Corriger reste ton problème.** 7 constats sur 45 ont un code prêt (16 %, CLI). Le reste n'est que consigne (« Ajoutez les balises Open Graph »). La meta proposée est un gabarit à trous (`audit.js:171`) ; l'alt d'exemple parle de « vitrine réfrigérée » pour une boulangerie (`audit.js:196`).
3. **Ni vérification ni suivi.** Un seul rapport est gardé (`app.js:101`). Les coches du plan, indexées par position (`app.js:254-263`), se décalent au prochain audit. Trois listes déconnectées : 45 corrections, 49 cases de plan, 107 de checklists. Citations IA : « test manuel » (`plan.js:48`).
4. **Benchmark faussé.** Concurrents audités sans crawl (`app.js:96`), toi avec (`audit.js:352`) : une page de 4 mots « vous devance en Contenu & on-page (58 contre 22) ».
5. **Texte mal extrait.** Des liens adjacents collés donnent les sujets « accueilnos · gâteauxancienne » (`html.js:34` ignore `a` et `span`).
6. **Surcharge.** 9 champs avant « Analyser » (`index.html:37-49`). À 390 px, 7 onglets sur 10 sont hors écran (`app.css:26-27`). Guide (6 314 px de haut) et Étude de marché (5 452 px) : matière pour toi, pas pour la boulangère.
7. **Partage faible.** Le PDF n'imprime que l'onglet courant, slogan en tête (`app.css:180`) : 5 pages pour la synthèse. Ni lien, ni marque blanche.
8. **Budget sans décision.** Le taux de leads qui signent est figé à 25 % (`ads.js:67`). Boulangerie d'exemple : coût par conversion de 5 à 28 € pour un seuil de 45 € × 25 % = 11 €, et l'écran affiche « ROAS 0,4 – 2,1 » sans conclure.

### Améliorations priorisées
| # | Amélioration | Impact | Effort | Où / comment |
|---|---|---|---|---|
| 1 | Score selon la couverture | 5 | 1 | `audit.js:418` : catégorie « non évaluée » si sa source manque ; couverture = somme des poids `CATEGORIES` évalués, aucune note sous 60 % ; bandeau « analyse incomplète » (`app.js:177`). |
| 2 | Verdict budget | 4 | 1 | `ads.js` : seuil = valeur × taux de signature modifiable. Verdict : rentable, test plafonné (arrêt si le coût dépasse le seuil après 50 clics) ou SEO local d'abord. |
| 3 | Justesse | 3 | 1 | `html.js:34` : ajouter `a`, `span`, `img` ; crawl en `scope:'site'`, exclu du comparatif (`audit.js:361`). |
| 4 | « Revérifier » + historique | 5 | 2 | Relance et comparaison par id (corrigés / restants / nouveaux), série score-couverture en localStorage, export (`app.js:78-108`). |
| 5 | Un statut par `issue.id` | 4 | 2 | Partagé par Corrections, Plan et Checklists (`app.js:238-263`). |
| 6 | 10 → 5 onglets | 4 | 2 | Diagnostic · Plan · Contenus · Budget · Suivi ; l'accueil ne demande que l'URL, le secteur et la ville (`index.html:41-50`). |
| 7 | Bouton-favori « Auditer cette page » | 4 | 2 | `window.open` + `postMessage` du HTML : ni proxy public, ni copier-coller du code source. |
| 8 | Lien et rapport client | 4 | 2 | `#r=` + JSON compressé (`CompressionStream`) : ≈ 5 200 caractères pour 45 constats (mesuré), sans serveur ; logo d'agence. |
| 9 | Correctif pré-rempli partout | 5 | 3 | `engine/fixes.js` : titre tiré du H1 et de la marque (« Pâtisserie artisanale à Lyon \| Maison Test »), meta extraite, JSON-LD avec l'adresse et les `sameAs` détectés, robots.txt, llms.txt. |
| 10 | Rédaction IA avec ta clé | 4 | 3 | `engine/ai.js` : `fetch` vers l'API Claude (en-tête `anthropic-dangerous-direct-browser-access: true`) ; chaque texte est revalidé par l'audit. |
| 11 | Panel IA mensuel | 4 | 3 | 20 questions avec l'outil `web_search_20260209` (10 $ les 1 000 recherches, plus les jetons) : part des réponses qui te citent (`plan.js:48`). |

### Objectif meilleur
**Cible : devenir l'outil qui ferme la boucle pour une TPE, de l'URL au correctif publié et prouvé, en français, sans compte ni serveur, à 0 € (plus quelques centimes d'IA sur ta clé).** Semrush (139,95 $) et Ahrefs (129 $) vendent des données, Haloscan (59 €) des mots-clés, Peec (89 €) et Otterly (29 $ pour 15 questions) une surveillance « peu actionnable » (`competitors.json`). La boucle correctif → vérification est un manque relevé dans `github-oss.json`.

Indicateurs (faux site, 3 sites réels via la CLI, 5 dirigeants) :
- 0 note sous 60 % de couverture (aujourd'hui : 100/100 sans rien lire) ;
- au moins 80 % des constats avec un correctif prêt à coller (16 % aujourd'hui) ;
- moins de 15 minutes entre l'URL et le premier correctif publié puis revérifié ;
- chaque mois : score à couverture égale, constats fermés, part des 20 questions IA qui te citent ;
- rapport client en 1 clic.

Les 3 étapes :
1. **Fiable (≈ 2 jours)** : #1, #2, #3, #5 et les gains rapides.
2. **Corriger et vérifier (≈ 2 semaines)** : #4, #6, #7, #9. La Synthèse devient « Ce mois-ci : 3 correctifs, 1 contenu, 1 décision budget ».
3. **IA, suivi, partage (≈ 3 semaines)** : #8, #10, #11, avec la courbe mensuelle dans « Suivi ».

On retire : l'Étude de marché, le Guide et les Checklists passent dans une page « Ressources ». Le tableau des 19 robots devient une ligne dépliable, les indicateurs PageSpeed vides sont masqués, et il n'y a plus de proxy public par défaut.

### Gains rapides (< 1 h)
- Aucune note si `!ctx.page`, avec un message clair (`audit.js:418`, `app.js:177`).
- `html.js:34` : ajouter `a`, `span`, `img`, plus un test.
- `app.css:180` : masquer `.hero h1`, `.lede` et `.progress` à l'impression.
- `app.css:26` : onglets sur deux lignes sous 560 px.
- `audit.js:196` : alt d'exemple tiré du secteur.
- Afficher le seuil de rentabilité dans l'onglet Budget.

## Hypothèses
- Un dirigeant non expert ne collera pas de code source : bouton-favori ou CLI.
- Une partie des utilisateurs fournira sa clé IA ; sans clé, tout reste utilisable.
- Une réponse d'API avec recherche web n'est pas celle de ChatGPT grand public : le panel est indicatif et doit afficher sa méthode.

## Faiblesses connues
- Aucun site réel ni utilisateur testé (réseau bloqué) ; délais estimés.
- [À VÉRIFIER] : CORS d'OpenAI et de Mistral, bouton-favori face aux CSP, coût d'un panel.
- Historique en localStorage, perdu si le navigateur est vidé (d'où l'export).
- Hashtags, ASO et GitHub peu audités.

## Confiance
Constats : élevée (reproduits dans l'interface et dans Node, avec fichier:ligne). Plan : moyenne à élevée. Délais : moyenne.

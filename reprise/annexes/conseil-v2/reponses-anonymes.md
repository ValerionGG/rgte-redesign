# Réponse A

> Note du secrétariat : cette réponse fait 1314 mots (limite demandée : 1 100). Ne récompensez pas la longueur.

## Réponse

### Verdict
Le socle est sérieux : une page locale bien optimisée obtient 99/100, un Next.js SSR est reconnu, les seuils CWV et les robots IA sont justes. Mais la note donne A quand rien n'est lu ou que la page est désindexée. Le plan repousse le local à J+90, et mots-clés, hashtags et budget sont des gabarits sans données. **UX 60/100, efficacité 45/100.**

### Constats (preuves : /tmp/claude-0/-home-user-rgte-redesign/137803cc-e0f1-5e43-837f-1ccac4c64755/scratchpad/conseil/travail/preuves-pages-pieges/)
1. **La note ment quand la collecte échoue ou que la page est bloquée.** Interface réelle, proxy « Aucun », PageSpeed en 429 (quota sans clé, observé ici) : « 100/100 · A… Rien de bloquant 🎉 » avec 0 mot lu (capture-psi-seul.png). Proxy KO : 93/A malgré « Page inaccessible » (capture-proxy-ko.png). « Site en construction » (4 mots) : 86/A. noindex : 94/A. `content="none"` : 99/A. `Disallow: /` : 85/A. Canonical vers la préprod : 99/A. SPA vide : 78/B, avec un GEO à 96. Cause : `finalize()` (audit.js:422-429) calcule 100 − Σ pénalités ; une catégorie sans contrôle vaut 100, et la vitesse « estimée » compte pour 17 %.
2. **Faux positifs et faux négatifs vérifiés.**
   - **Robots et indexation.** `none` est ignoré (audit.js:90), alors que Google l'assimile à noindex, nofollow. « * bloqué, Googlebot autorisé » produit « interdit tout le site » (audit.js:144), et un vrai blocage est compté deux fois.
   - **Schémas.** « Pas de schéma LocalBusiness » s'affiche sur Plumber, ExerciseGym, Attorney, AutoDealer et CafeOrCoffeeShop (audit.js:317), y compris des types que l'outil recommande lui-même (sectors.js:107, 116, 170). OnlineStore est jugé « sans adresse » (audit.js:454). Les microdonnées sont ignorées (html.js:162). `Manufacturer` (sectors.js:28) n'existe pas dans schema.org.
   - **Liens et contact.** Un logo `<a><img alt></a>` est vu comme « lien sans texte » (html.js:191), donc sur presque tous les sites. Le téléphone « +33 4 78… » n'est pas reconnu (audit.js:313).
   - **Contenu.** Auteur et date ne sont jamais signalés si le texte contient « par exemple » (`/par [A-Z]/i`, audit.js:287). `hreflang="en-uk"` est accepté (audit.js:108), alors que le code pays est GB.
   - **Fichiers non lus.** Un status 0 devient « Sitemap introuvable » et « Pas de llms.txt » (audit.js:152, 280). llms.txt est pénalisé alors que l'étude du projet le juge sans effet (benchmarks.json:74).
3. **Le plan ne fait pas monter vite.** Sur la fixture, semaine 1 = « Robots IA bloqués : PerplexityBot », Open Graph, Mentions légales. HTTPS, liens cassés et titres dupliqués arrivent à 30 jours, la fiche Google à 90 jours. Cause : plan.js:209-214 range local et IA à J+90 ; le tri suit gravité puis effort, jamais le gain (audit.js:431-432).
4. **Le budget pub ne tient pas.** RGTE à 1 000 €/mois avec un client à 12 000 € : ROAS de 35 à 118 (25 % de signature par défaut, ads.js:67). LinkedIn reçoit 438 €/mois puis est jugé insuffisant, alors que benchmarks.json:89 fixe 1 500 à 3 000 €. E-commerce à 3 000 € : de 32 à 711 ventes (×22, extrêmes cumulés, ads.js:105-106). Pour une app, l'outil propose « Performance Max / Shopping » (ads.js:39) au lieu des campagnes App, et oublie Apple Ads. Aucun plafond de demande : à 20 000 €/mois, 2 971 à 4 457 clics Search sur une niche.
5. **Mots-clés et hashtags sortent de gabarits.** « pâtisserie lyon Lyon », « … vs », « … définition », « vitrine réfrigérée sur mesure sur mesure », « devis prix », et « ouvert dimanche » pour un fabricant national (keywords.js:117-144). Côté hashtags : « #vitrinerefrigereemesure » (hashtags.js:63), aucun mot-clé sur Instagram (hashtags.js:7), #artisanat pour une app, #paris_patisserie à Bordeaux, #meilleurouvrierdefrance (titre d'État, risque de pratique trompeuse). Aucun volume de recherche.
6. **Manques face à un audit pro** : Search Console (positions 4–20), fiche Google, cohérence sitemap/canonical/noindex, retours hreflang, liens vers redirections, écart de contenu concurrents.

### Améliorations priorisées
| # | Amélioration | Impact | Effort | Où / comment |
|---|---|---|---|---|
| 1 | Note honnête : catégorie non mesurée = « n/a » hors moyenne ; pas de note sans HTML lu ; plafond 30 si noindex/none, Googlebot bloqué, 4xx/5xx, coquille JS, canonical externe ; plafond 60 sous 150 mots | 5 | 2 | audit.js `finalize()` ; app.js:177/183 « Audit incomplet » |
| 2 | Corriger le constat 2 et figer les pages pièges en tests | 5 | 2 | lignes citées ; pages.mjs → seo/test/fixtures/pieges/ |
| 3 | Import Search Console (CSV ou collage) : requêtes en position 4–20, gain = impressions × écart de CTR → 10 pages à retravailler | 5 | 3 | nouveau engine/gsc.js ; en tête du Plan |
| 4 | Plan trié par gain (`impact` métier par contrôle) ; voie « Conformité » (mentions, CMP, CGV) hors score SEO ; local dès la semaine 1 | 5 | 2 | audit.js `add()` ; plan.js:209-214 |
| 5 | Budget : minimum viable par canal, sinon réallocation ; estimation centrale ±35 % ; marge et taux de signature (B2B 10 %) → CPA max rentable ; plafond = volume × CTR ; campagnes App et Apple Ads | 5 | 3 | ads.js:64-122, MIX:33-41 |
| 6 | Suggestions Google d'abord, gabarits filtrés ; mot-clé sur Instagram, phrase entière | 4 | 2 | keywords.js:117-144 ; hashtags.js:7/63/76 |
| 7 | Crawl : URL du sitemap en 404, 301, noindex ou canonicalisées ailleurs ; liens vers des redirections ; retours hreflang | 4 | 3 | collect.js:171-201 ; `crawlFindings` |
| 8 | Fiche Google en déclaratif (catégorie, avis, note, réponses, photos) intégrée au score local | 4 | 2 | checklists.js, audit.js |
| 9 | Écart de contenu : termes présents chez au moins 2 concurrents et absents chez toi | 3 | 2 | index.js `competitorSummary` |

### Objectif meilleur
Le seul outil gratuit qui dit à une TPE française quoi faire **cette semaine** pour gagner des clients, chiffré en euros, à partir de ses données réelles, sans jamais noter ce qu'il n'a pas mesuré. Cibles : aucun « A » sur les pages pièges, au moins 95 % de constats exacts sur 30 sites français relus, un budget à fourchette ≤ ×2 avec le CPA max rentable, et avec Search Console, 10 actions classées par clics gagnables.
1. **Fiabiliser (semaine 1)** : améliorations 1 et 2.
2. **Brancher les données réelles (semaines 2–3)** : 3, 8 et 6.
3. **Décider en euros (semaine 4)** : 4 et 5, puis un suivi GEO (15 questions générées, une case « cité », un taux mensuel).

### Gains rapides (moins d'une heure)
- Robots : `/(^|[\s,])(noindex|none)([\s,]|$)/` (audit.js:90-91).
- Téléphone : `/(?:\+33\s?(?:\(0\))?\s?|\b0)[1-9](?:[\s.-]?\d{2}){4}/` (audit.js:313, 5 formats testés).
- Retirer `/i` sur « par [A-Z] » (audit.js:287).
- Ajouter l'alt de l'`<img>` au texte du `<a>` parent (html.js).
- Classer llms.txt, Bing et les status 0 en « non vérifié » (audit.js:152, 280, 288).
- Afficher « Audit incomplet » si `!report.ctx?.page` (app.js:177/183).
- Retirer #paris_patisserie, #meilleurouvrierdefrance et `Manufacturer`.
- Écarter LinkedIn sous 1 500 €/mois (ads.js).

## Hypothèses
Pages pièges synthétiques (fetcher virtuel simulant https, en-têtes, redirections : harness.mjs) ; PageSpeed simulé pour le site lent ; 429 et captures réels. Règles vérifiées par recherche web secondaire (developers.google.com injoignable) : `none` = noindex, nofollow ; hreflang suit ISO 639-1 + ISO 3166-1 alpha-2 ; les installations d'app passent par les campagnes App (support.google.com/google-ads/answer/6309967) ; Apple Ads remplace Search Ads depuis le 14/04/2025. CPL B2B industriel en France ≈ 80–250 € [À VÉRIFIER] ; colonnes du CSV Search Console en français [À VÉRIFIER].

## Faiblesses connues
Aucun vrai site audité (réseau bloqué) ; UX jugée sous l'angle décision seulement ; Concurrents, ASO et GitHub peu testés ; corpus de 30 sites annotés à constituer.

## Confiance
Élevée sur les constats 1 à 5, reproduits par script (sortie-*.txt, captures). Moyenne à élevée sur l'ordre des améliorations. Moyenne sur les ordres de grandeur publicitaires.


---

# Réponse B

## Réponse

### Verdict
UX **55/100** · Efficacité **45/100**. L'interface est propre (jetons, thème sombre, rien ne déborde à 390 px), mais la promesse casse dès que la collecte échoue : elle affiche alors **100/100 « Excellent socle »**. L'en-tête masque le haut des 10 onglets, trois listes de tâches se concurrencent, la navigation est à plat. Le moteur est riche ; il manque « quoi faire cette semaine », dit honnêtement, puis la preuve du progrès.

### Constats
1. **Note fausse quand rien n'est lu.** Site https en mode « Aucun » sans HTML, PageSpeed indisponible : **100/100 A, 0 correction**. Proxy en panne : **93/100 A**, avec « Page inaccessible » en critique (`travail/ux/ghost.mjs`). Dans le navigateur : 87/100, anneau vert (`etat-B-proxy-down-final.png`). Cause : une catégorie sans donnée vaut 100 (`audit.js:420-429`). Or `psi.js:2` prévient : sans clé, les 429 sont « fréquents ».
2. **L'en-tête collant masque le titre de chacun des 10 onglets** après `go()` (`app.js:128`), et selon l'onglet le sous-titre et les boutons Exporter/JSON/Imprimer : section à 0 px, en-tête de 59 px. Testé : `html{scroll-padding-top:72px}` corrige (titre à 72 px).
3. **Erreur effacée.** Dépôt GitHub injoignable : « Erreur : Failed to fetch » est remplacé en moins d'1 s par « Analyse en cours… N s », sans fin (`setInterval` non nettoyé dans le `catch`, `app.js:91,105`). Les étapes du moteur ne sont pas branchées (pas d'`onProgress`, `app.js:95`) : seul un compteur s'affiche.
4. **Focus perdu.** Cocher une tâche ou un filtre renvoie le focus sur `<body>` (re-rendu complet, `app.js:246,263,386`). Coches stockées par position (`s.id + j`, `app.js:258`) : après un nouvel audit, elles passent sur d'autres tâches.
5. **Priorisation.** La seule critique (HTTPS) tombe en « 30 jours », derrière 10 « gains rapides » (`plan.js:6` : effort ≤ 1). Trois listes sans lien : 45 corrections, 49 tâches de plan, 107 cases de checklists.
6. **Architecture.** 10 onglets à plat ; sur mobile, 8 sont coupés ou hors écran, barre de défilement masquée (`app.css:26-27`). « Étude de marché » est l'étude concurrentielle de SEO 360, où il se note lui-même (`app.js:390`) : hors sujet pour un boulanger. Le formulaire de 8 champs reste au-dessus des résultats (≈630 px sur ordinateur, ≈1 230 px sur mobile).
7. **Budget.** L'outil ne dit pas combien mettre : 1 000 € pré-remplis (`index.html:47`), calcul inverse (`b.needed`) derrière un champ secondaire, jargon (tCPA, Advantage+), identifiants bruts `google_search` (`app.js:344`), tableau de 8 colonnes sur mobile.
8. **WCAG 2.2 AA** (`contrast.txt`) : pastilles Important 3,86:1, Moyen 3,35:1, Faible 4,23:1, OK 4,48:1 ; filtres inactifs 1,65 à 1,9:1 ; « prioritaire » 2,49:1 ; **Analyser** en thème sombre 2,72:1. Impact et effort sont lus « impact · effort », sans valeur (`aria-label` sur un `span`, `app.js:20`).
9. **Crédibilité.** Sujets détectés « accueilnos », « gâteauxancienne » (mots collés entre deux `<a>`, `html.js:71-74`) ; correctif « à coller » réduit à un gabarit (`audit.js:171`) ; secteur par défaut Restaurant (`app.js:30`) ; PDF limité à l'onglet courant, ouvert par le slogan (`app.css:180`) ; recharger ou « Retour » perd le rapport (`app.js:128,436`).

### Améliorations priorisées
| # | Amélioration | Impact | Effort | Où / comment |
|---|---|---|---|---|
| 1 | Note honnête : catégorie sans donnée « non évaluée », exclue du global ; sans HTML, bandeau « Audit incomplet » et 3 solutions (autre proxy, coller le code, CLI) à la place de la note | 5 | 2 | `audit.js:420` (`evaluated:false`), `app.js:165-192` |
| 2 | `scroll-padding-top:72px` | 4 | 1 | `app.css:15` |
| 3 | `clearInterval` dans `finally`, `onProgress` (étapes 1/4…), bouton « Analyse… », erreurs en français avec une action | 4 | 1 | `app.js:88-107` |
| 4 | « Cette semaine » : critiques d'abord, 5 actions maximum, avec durée et qui s'en charge (toi ou ton webmaster), en tête de Synthèse | 5 | 2 | `plan.js:6-9`, `app.js:183` |
| 5 | Une seule liste « À faire » : statut par `issue.id`, Plan affiché comme vue de cette liste, checklists pré-cochées, mise à jour sans re-rendu | 4 | 3 | `app.js:238-263,378-386` |
| 6 | 5 onglets : Synthèse, À faire, Mots-clés et réseaux, Budget, Concurrents. Étude de marché en pied de page, formulaire replié une fois le rapport affiché | 4 | 2 | `app.js:22-25`, `index.html:31-72` |
| 7 | Budget inversé : clients voulus + valeur d'un client → budget conseillé et coût par client maximal ; repères repliés, cartes sur mobile | 4 | 2 | `app.js:312-345` |
| 8 | Prêt à coller : title, meta, OG et llms.txt pré-remplis et modifiables, avec compteur et aperçu Google | 4 | 3 | `audit.js:171`, `app.js:240` |
| 9 | Contrastes (#c2410c, #946200, #536173, #166534, #0f766e), texte sombre sur le bouton principal en thème sombre, filtres inactifs en contour, `role="img"` sur `.meter` | 3 | 1 | `app.css:4,11-12,53,83,137`, `app.js:20` |
| 10 | Rapport restauré au démarrage, `pushState`/`popstate`, historique des notes | 3 | 2 | `app.js:112,128,436` |
| 11 | PDF client : couverture, Synthèse et À faire ensemble, sans le slogan | 3 | 2 | `app.css:179-185`, `app.js:153` |
| 12 | Espaces entre éléments inline ; secteur par défaut « Autre » | 3 | 1 | `html.js:71-74`, `app.js:30` |

Après chaque modification : `node build.mjs` (copie vers `docs/seo/`).

### Objectif meilleur
« En 60 s, tes 3 actions de la semaine, rédigées et prêtes à coller ; à J+30, la preuve du progrès. » Critères :
- jamais de note sans données, taux de couverture affiché ;
- 3 clics au plus de l'URL au correctif copié ;
- zéro échec WCAG 2.2 AA ;
- comparaison entre deux audits (résolus, nouveaux, ±points), comme Semrush ou Ahrefs entre deux crawls, mais gratuite et en français.

Étapes :
1. **Semaine 1, fiabilité** : #1, #2, #3, #9, #12.
2. **Semaines 2-3, accompagnement** : #4 à #8.
3. **Semaine 4, suivi** : #10 (écart entre audits par `issue.id`), #11, relance à J+30.

### Gains rapides (moins d'une heure)
- #2, #3 et les couleurs de #9.
- `role="img"` sur `.meter`.
- `p.id` remplacé par le libellé ; en-tête « MESURE, » des Concurrents corrigé (`app.js:368`).
- Bandeau « Audit incomplet » si `!r.ctx.page`.
- Dernier rapport mémorisé aussi à l'import (`app.js:112`) ; « Rapport importé : undefined » corrigé.

## Hypothèses
- Cible non experte, souvent sur mobile, qui décroche au premier jargon.
- Proxys publics et PageSpeed sans clé échouent souvent [À VÉRIFIER : réseau bloqué ici, pannes simulées avec `page.route`].

## Faiblesses connues
- Pas de vrai lecteur d'écran (arbre d'accessibilité Playwright seulement) ni d'utilisateurs réels.
- Efforts estimés à l'œil ; pertinence des mots-clés et hashtags laissée à l'expertise SEO.

## Confiance
Élevée sur les constats 1 à 4, 6 et 8 (mesurés ; scripts et captures dans `travail/ux/`). Moyenne sur les notes /100 et l'ordre des priorités.


---

# Réponse C

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


---

# Réponse D

> Note du secrétariat : cette réponse fait 1185 mots (limite demandée : 1 100). Ne récompensez pas la longueur.

## Réponse

### Verdict
Moteur riche (≈ 120 contrôles), mais dans le navigateur **la note ment dès qu'une donnée manque** : proxy en panne → 93/100 « A, excellent socle » sans une ligne de HTML lue. Taper `rgte.fr` lance un audit d'appli Android ; un panier moyen de 45 € rend « Analyser » muet. Priorité : une couche de vérité avant toute nouvelle fonction.
**UX : 45/100 · Efficacité réelle : 40/100.**

### Constats (tous rejoués en local)
1. **Pas de données = bonne note.** Score = 100 − pénalités, aucun état « non vérifié » (`audit.js:418-429`).
   - Proxy public injoignable + PageSpeed 429 (fréquent sans clé) → **93/100 · A** alors que la carte dit « HTML non lu » (capture).
   - Proxy « Aucun » sans HTML collé → **100/100 · A**, « Rien de bloquant 🎉 ».
   - Deux erreurs passagères du proxy → **65 → 70 (C → B)** : les problèmes robots.txt disparaissent, une page valide devient « lien cassé » (`collect.js:96`).
   - Concurrents non lus → 100 partout, « concurrent-a.fr vous devance en Contenu (100 contre 52) » (`app.js:358-366`).
   - Vous : crawl 8 ; concurrents : crawl 0 (`app.js:96`) → même site noté 58 contre 64.
2. **Domaine sans https mal routé** (`index.js:27-31`, `appstore.js:18`) : `rgte.fr`, `www.rgte.fr` → « Application » → audit ASO de la page 404 de Google Play → 93/100 A. `monsite.fr/contact` → « Dépôt GitHub ».
3. **Bouton muet** : `step="10"` / `step="50"` (`index.html:47-48`). Panier 45 € ou budget 1 230 € → formulaire invalide, rien ne se passe. Le rapport d'exemple importé (panier 45) bloque les analyses suivantes, valeur mémorisée.
4. **Erreurs avalées, attentes infinies.** L'erreur est écrasée en < 1 s par le compteur (`clearInterval` hors `finally`, `app.js:91-106`) : « Analyse en cours… 9 s » après un crash. Aucun délai côté proxy (`app.js:49-75`) : « en cours… 60 s », bouton grisé. CLI : délai de 20 s limité aux en-têtes (`cli.mjs:55,64`) → bloquée > 70 s par un serveur lent.
5. **Faux constats.**
   - Pare-feu qui refuse l'UA « SEO360 » (Googlebot passe) : la page d'erreur est auditée → « pas de viewport », « title absent » (`collect.js:11`).
   - Site ISO-8859-1 → « P�tisserie » (CLI `res.text()`, `worker.js:36`) → « mot-clé absent : titre, H1, description ».
   - URL avec `%E9` → crash `URIError` (`audit.js:213`).
   - `</h2>` au lieu de `</h1>` → H1 de 1 274 caractères ; 4 000 `<a>` non fermés (172 Ko) → 5,4 s de calcul, croissance quadratique (`html.js:56-61`).
6. **Sécurité.**
   - XSS par rapport importé : `counts.critique = "<img onerror=…>"` s'exécute et lit `seo360:form`, **jeton GitHub et clé PageSpeed compris** (en clair, `app.js:39`, origine `valeriongg.github.io` partagée). Non échappés : `app.js:20,125,159,178,181,369,373`.
   - Worker : proxy ouvert (`'*'`, ni Origin ni jeton vérifiés ; CORS n'arrête pas curl), filtre SSRF contourné par `0.0.0.0` et par redirection non revérifiée (`worker.js:17,26`), exception non gérée → 500 sans CORS (`:23`).
7. **Chiffres faussement précis.** E-commerce à 3 000 € : « ≈ 151 conversions » pour une fourchette 32–711 (×22). Boulangerie à 30 000 €/mois : « pour 3 000 conv. : ≈ 36 283 € », sans plafond de volume local (`ads.js:86-90`). Le robots.txt modèle bloque `/compteurs-…`, `/recherche-et-developpement` (`robots.js:74-95`).
8. **Plan d'action corrompu** : cases indexées par position (`app.js:254-263`). Coché « JSON-LD invalide », description corrigée, relance → la coche passe sur « Open Graph manquantes ».
9. **Tests** : 8 tests verts, aucun sur ces cas.

### Améliorations priorisées
| # | Amélioration | Impact | Effort | Où / comment |
|---|---|---|---|---|
| 1 | Couverture + « non vérifié » | 5 | 2 | `finalize()` : score sur contrôles exécutés, `coverage` par catégorie ; pas de note si page non lue ou couverture < 70 % ; concurrent en erreur = « non comparable » |
| 2 | Routage de la saisie | 5 | 1 | supprimer le paquet nu (`appstore.js:18`) ; `owner/repo` seulement si owner sans point (`index.js:29`) |
| 3 | Formulaire | 4 | 1 | `step="any"` ; invalidité expliquée dans `#progress` |
| 4 | Délais et erreurs | 4 | 1 | `AbortController` 20 s/requête, 120 s au total ; `clearInterval` en `finally` ; CLI : délai jusqu'à la fin du corps, 5 Mo max |
| 5 | Collecte honnête | 4 | 2 | 401/403/429/503 → « robot bloqué », pas d'audit on-page ; `TextDecoder(charset)` ; erreur de collecte ≠ lien cassé ; même crawl pour tous |
| 6 | Sécurité interface | 4 | 1 | CSP en `<meta>` (testée : XSS bloqué, 0 violation sur 8 onglets) ; `Number()` + version vérifiée à l'import (`app.js:110`) ; `esc()` partout ; jetons non stockés |
| 7 | Durcir le Worker | 3 | 1 | 403 sans Origin connue ou jeton `?k=` ; revérifier l'hôte à chaque saut ; bloquer 0.0.0.0/8, 172.16/12, IPv6 privées ; `try/catch` |
| 8 | Budget honnête | 4 | 3 | fourchette d'abord ; champ « recherches/mois » (Keyword Planner) qui plafonne les clics |
| 9 | Plan par identifiant | 3 | 1 | clé `étape:issue.id` (`plan.js:38`, `app.js:254`) |
| 10 | robots.txt et Bing | 3 | 1 | modèle « à adapter » sans Disallow génériques ; Bing en info (`audit.js:288`) |
| 11 | Tests de non-régression | 3 | 2 | un test par constat ci-dessus |

### Objectif meilleur
**« Aucune note sans preuve. »** La meilleure plateforme pour une TPE est celle où chaque chiffre se vérifie : chaque constat porte sa preuve (extrait HTML, statut, en-tête) et sa source ; la note affiche sa couverture ; deux analyses du même site restent à ±2 points ; un ré-audit annonce « 3 corrigés, 1 nouveau, 58 → 66 ».
1. Semaine 1 : couche de vérité (actions 1 à 4 et 6).
2. Semaines 2-3 : collecte fiable (5, 7, 9) + écran « non vérifié : comment le vérifier ».
3. Mois 2 : 30 sites FR réels figés en fixtures ; en CI, taux de faux positifs < 5 %, reproductibilité, durée p90 ; budget plafonné par le volume.

### Gains rapides (< 1 h)
`step="any"` ; `detectKind` + tests ; `clearInterval` en `finally` + `AbortController` ; `global: null` si `!ctx.page` ; CSP ; jetons hors de `persist()` ; `try` sur `decodeURIComponent` ; plan par `id` ; Origin + `try/catch` du Worker.

## Hypothèses
- AllOrigins, CodeTabs et PageSpeed simulés par Playwright (réseau bloqué) : vrais statuts, quotas et encodages [À VÉRIFIER].
- Worker exécuté tel quel sous Node ; Cloudflare filtre sans doute les IP privées [À VÉRIFIER] : le risque principal reste le proxy ouvert.
- Mesuré : crawl 8 + 5 concurrents = 39 requêtes proxy et 6 PageSpeed simultanés.

## Faiblesses connues
Aucun site réel audité : taux réel de faux positifs inconnu. Données sectorielles, hashtags et benchmarks non vérifiés ; mobile non testé. Cas quadratique rare.

## Confiance
Haute sur les constats 1 à 8 (reproduits par script, sorties et captures conservées) ; moyenne sur les notes et l'impact/effort.


---

# Réponse E

## Réponse

### Verdict
**UX 45/100, efficacité 40/100.** Interface propre et rapide ; quand le moteur lit vraiment le site, il trouve les bons problèmes (45 constats via la CLI). Mais par défaut, il peut afficher « A, Excellent socle » pour un site jamais lu. Le « quoi faire lundi » est noyé dans 12 200 mots, et le budget ne dit jamais si c'est rentable. Priorité : un score fiable, puis 3 actions et un montant.

### Constats
1. **Si la collecte échoue, le score est faux et rassurant.** Par défaut (AllOrigins ; PageSpeed sans clé, 429) : `patisserie-exemple.fr` obtient **93/100 · A**. Le faux site obtient 87/A avec « Pages explorées 0 » et 6 catégories à 100. Pour ce même site : 87 (échec), 66 (HTML collé), 56 (CLI). Cause : le score part de 100 et retire des pénalités, donc une catégorie non contrôlée vaut 100 (`audit.js:418-429`). L'erreur, en anglais (« Quota exceeded… »), est hors écran (−160 px sur mobile) car `go()` fait défiler vers les résultats (`app.js:128`). Captures `mobile-08-apres-analyser.png` et `desktop-03-defaut-synthese.png`.
2. **Le budget ne tranche pas.** Pâtisserie, 1 500 €/mois, panier 45 € : « ≈ 124 conversions, ≈ 12 €, ROAS 0,4 – 2,1 ». Au milieu de la fourchette, 1 € de pub rapporte 0,93 € de chiffre d'affaires avant marge, sans alerte. Le taux de signature de 25 % est codé en dur (`ads.js:67`) et la marge n'est jamais demandée. Le budget est pré-rempli à 1 000 € (`index.html:47`), donc le plan conseille toujours la pub (`index.js:74`, `plan.js:20`). Cas RGTE à 1 000 € (contrat à 8 000 €) : de 12 à 40 demandes, ROAS de 23 à 79. L'export Markdown garde 1 500 € quand l'écran affiche 300 € (`report.js:56` contre `app.js:315`).
3. **Le plan « Cette semaine » n'est pas faisable par un dirigeant.** 12 tâches (JSON-LD, Open Graph, canonical, gzip…) sans qui, durée ni coût. Le seul point critique (HTTPS) est repoussé à « 30 jours » (`plan.js:6` exige un effort ≤ 1), alors que la Synthèse le met n°1. La fiche Google est en dernière ligne. Au moins 56 termes techniques sur les 10 onglets, aucun glossaire. Une pâtisserie se voit proposer `alt="vitrine réfrigérée en verre bombé 1,20 m"` (`audit.js:196,205`).
4. **Des erreurs visibles qui ruinent la confiance.**
   - « Sujets détectés : accueilnos · gâteauxancienne » : textes des liens collés sans espace (`html.js:59,197`).
   - Mots-clés « pâtisserie lyon Lyon », « quel pâtisserie lyon » (`keywords.js:6,8,27`).
   - #Lyon passe avant #PatisserieLyon (`hashtags.js:69-71`) ; #paris_patisserie proposé à Lyon (`sectors.js:22`).
   - Une page concurrente de 4 mots « vous devance en Contenu & on-page (58 contre 22) ».
   - En HTML collé, « Sitemap XML introuvable ou vide » alors qu'il existe : statut 0 lu comme une absence (`audit.js:152`).
5. **On ne peut ni garder ni partager son travail.** Un rapport importé disparaît au rechargement (pas de `store.set('last')`, `app.js:110-113`). « Imprimer » ne sort que l'onglet ouvert, sous le slogan (`app.css:180`). Sur mobile, 3 onglets sur 10 visibles, sans défilement apparent (`app.css:26-27`).

### Améliorations priorisées
| # | Amélioration | Impact | Effort | Où / comment |
|---|---|---|---|---|
| 1 | Pas de score sans mesure | 5 | 2 | `audit.js` `finalize` : catégorie sans contrôle → `score:null` (« non mesuré ») ; pas de score global si `!ctx.page` ; Contenu plafonné à 40 sous 150 mots. `app.js` `synthese()` : bandeau « Analyse incomplète » + boutons « Coller le HTML », « Voir un exemple ». |
| 2 | Carte « Vos 3 actions cette semaine » en tête de la Synthèse | 5 | 2 | `plan.js` : points critiques toujours inclus ; table par `id` → qui (vous/webmaster/hébergeur), durée, coût ; bouton « Copier le message pour mon prestataire ». |
| 3 | Verdict budget en une phrase | 5 | 2 | `ads.js` `planBudget` : `verdict` (valeur × marge × taux de signature contre CPA prudent) ; `recommended` = 10 clics/jour × CPC haut si budget vide ; champs marge et taux ; export = budget affiché. |
| 4 | Mode simple par défaut | 4 | 3 | `TABS` (`app.js:22`) : Priorités, Budget, Réseaux + interrupteur « Expert » ; `GLOSSARY` en `<abbr title>` ; formulaire replié après analyse ; dégradé sur les onglets mobiles. |
| 5 | Données réelles sans backend | 5 | 3 | `engine/gsc.js` : import de l'export Search Console (format [À VÉRIFIER]) ; les pages en position 4–15 deviennent les gains rapides ; remplit « Aujourd'hui » des KPI. |
| 6 | Partage et mots-clés réels | 3 | 1 | `app.js:153` : imprimer les 4 onglets clés ; `googleSuggest` lancé après l'analyse. |

### Objectif meilleur
**En 2 minutes et sans jargon : 3 actions, qui les fait, leur coût et un montant de pub justifié. Puis, chaque mois, la preuve que ça monte.** Critères : aucun score sous 80 % de contrôles mesurés ; première action visible sans défiler sur mobile ; aucun sigle inexpliqué en mode simple ; un verdict budget pour les 28 secteurs.
1. **Semaine 1, fiabilité** : #1, gains rapides, #6.
2. **Semaines 2–3, décision** : #2, #3, #4.
3. **Mois 2, preuve et fidélité** : #5, historique local des audits (« +12 pts, 6/9 faites »), rappel `.ics` à 30 jours, liens pré-remplis `?url=&secteur=` pour les agences.

### Gains rapides
- `app.js:112` : `store.set('last', S.report)`.
- `html.js` : ajouter `' '` à la fermeture des balises en ligne.
- `hashtags.js:69-71` : « métier + ville » avant « ville ».
- `keywords.js` : ne pas répéter la ville ; « quelle ».
- `sectors.js:22` : retirer `paris_patisserie` et `meilleurouvrierdefrance`.
- `plan.js:6` : ajouter `i.sev === 'critique' ||`.
- `audit.js:152,278` : statut 0 = inconnu.
- `index.html` : secteur à choisir (aujourd'hui « Restaurant » par défaut), budget vide.
- `app.css:180` : masquer `.hero` à l'impression.

## Hypothèses
- La cible n'utilisera pas la CLI.
- Échecs proxy/PageSpeed fréquents en vrai (l'interface l'admet sans clé) ; AllOrigins [À VÉRIFIER].
- Panier de 45 € et contrat de 8 000 € : valeurs d'illustration.

## Faiblesses connues
- Réseau externe bloqué : ni vrai site, ni vraie réponse PageSpeed, ni suggestions Google ; durée réelle non mesurée.
- Modes App et GitHub non testés ; CPC français non vérifiés ; notes /100 au jugement.

## Confiance
Haute sur les constats, reproduits en 1366 et 390 px. Preuves (captures, textes, PDF, calculs) dans le dossier de travail, rejouables via `parcours.js`, `parcours2.js`, `budget-cas.mjs`. Moyenne sur les efforts estimés.

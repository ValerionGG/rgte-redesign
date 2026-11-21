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

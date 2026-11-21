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

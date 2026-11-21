## Réponse

Preuves : `T = /tmp/claude-0/-home-user-rgte-redesign/137803cc-e0f1-5e43-837f-1ccac4c64755/scratchpad/conseil-v3/preuves/D/` (captures/, mesures/, scripts/ rejouables avec `node`).

### 1. Note : ≈ 70/100

| Critère (poids) | /10 | Justification |
|---|---:|---|
| Honnêteté (20) | 7 | Pas de note sans mesure. Mais « Analyse terminée » s'affiche en vert à 0 % mesuré, et « tout reste dans votre navigateur » est faux : par défaut, la page passe par des proxys publics (index.html:38, 64). |
| Recommandations (25) | 7 | 3 actions avec qui et durée, correctifs, message au prestataire. Mais l'export Markdown est cassé. |
| Parcours (20) | 6 | Bon à 1366 px. À 390 px, les actions sont sous l'écran et les erreurs invisibles. |
| Multicanal (15) | 8 | Google, local, IA, 10 réseaux, pub, outils, calendrier. |
| Robustesse (10) | 7 | Aucune erreur JavaScript sur 8 configurations, rien ne déborde à 320 px. Messages bruts. |
| Différenciation (10) | 8 | Gratuit, sans compte, en français, transparent sur ce qui est mesuré. |

Total pondéré : 70,5.

### 2. Les 8 problèmes

1. **Mobile : l'essentiel est sous l'écran** (élevée). À 390 × 844 px, « Vos 3 actions » commence à y = 840, après 5 boutons d'export. « Voir les correctifs » est à y = 1 354. Seuls 2 onglets sur 6 sont visibles. Preuves : `captures/complet-390-light-synthese-ecran1.jpg`, `mesures/captures.json`.
2. **Messages d'état faux ou illisibles** (élevée). À 390 px, « Analyser » sans adresse affiche l'erreur à y = 909, hors écran, et le champ n'a pas `aria-invalid` (`captures/erreur-vide-390.jpg`). Si la page n'est pas lue, « Analyse terminée » s'affiche en vert (app.js:168) au-dessus de « Audit incomplet ». Sur claude.ai, l'utilisateur voit l'erreur brute « Failed to fetch ». Un toast de 87 caractères disparaît en 1,8 s (app.js:260).
3. **Impasse sur téléphone** (élevée). Si la page n'est pas lue, les 3 recours proposés sont impossibles sur mobile : bouton-favori « sur ordinateur », clic droit, ligne de commande. Preuves : `captures/analyse-non-lue-390-ecran.jpg`, app.js:96.
4. **Page claude.ai : le bouton principal mène à une erreur** (élevée). « Analyser » reste actif. « Voir un exemple », le seul chemin qui marche, n'est qu'un lien à y = 991, sous l'écran. L'aide vante encore le bouton-favori, inutilisable ici. L'information est affichée en rouge (`.cap`). Preuve : `captures/claudeai-390-light-accueil.jpg`.
5. **Export Markdown cassé à l'affichage** (élevée). Rendu par pandoc (GFM), l'export de l'exemple contient 33 titres de niveau 1, dont « User-agent: GPTBot ». Le code sort de ses blocs. Cause : report.js:46-47 n'indente que la première ligne. Sur claude.ai, c'est le seul export disponible. Preuve : `mesures/exemple-rendu.html`.
6. **Surcharge, et « cette semaine » a trois sens** (moyenne). Selon l'écran, il s'agit de 3 actions (Synthèse), de 9 points (À faire, où l'action n° 1 arrive 8e) ou de 6 outils. Parmi ces outils : le pixel Meta, pour une boulangerie dont le verdict pub est « pas rentable ». En ligne de commande, `outils --secteur boulangerie --local` sort 3 580 mots. Mots-clés & réseaux : 1 112 mots, 9,2 écrans à 390 px, et les hashtags n'arrivent qu'après 2 cartes d'import vides. Boîte à outils : 31 cartes fermées identiques, raison cachée dedans.
7. **Accessibilité AA et clavier** (moyenne). Bordures des champs à 1,29:1 en clair et 1,38:1 en sombre, pour 3:1 requis (critère 1.4.11, app.css:3). Pastille « 10 » à 2,24:1 en sombre (app.css:35). L'étiquette du champ d'adresse est invisible. Le niveau des hashtags n'est codé que par la couleur (app.css:251). Au clavier, le premier Tab saute « Aller au contenu » à cause de `scrollIntoView` (app.js:219, prouvé en le neutralisant). Les 43 sigles du glossaire prennent le focus : le 10e constat n'arrive qu'après 45 arrêts. Le texte en thème clair passe partout (0 échec sur 923 éléments).
8. **Textes ambigus et surfaces incohérentes** (moyenne). On lit « Choisis d'après l'audit » (app.js:513). Haloscan et Make sont marqués « Offre gratuite » sous « payants », et Ahrefs Webmaster Tools est dit gratuit avec le prix de l'offre Starter. Le tableau Concurrents a deux colonnes « Vitesse », et « vous » y vaut 73 contre 66 en Synthèse. « Étude de marché » désigne une étude des outils SEO. La description proposée contient « au beurre AOP, à. ». Le plan est en 30/60/90 jours (seo-360) mais en S1-2/S3-4/M2/M3 (plan-croissance-360). L'exploration couvre 8 pages en web, 15 en ligne de commande.

### 3. Les 8 améliorations prioritaires

1. **Réparer l'export Markdown** : impact fort, effort 1 h. Indenter chaque ligne du code. Test : un seul titre de niveau 1.
2. **Synthèse mobile** : impact fort, effort ½ jour. Sous 560 px : les 3 actions d'abord, les exports dans un menu, « Voir les correctifs » toujours visible.
3. **Erreurs lisibles** : impact fort, effort ½ jour. Message sous le champ (`aria-invalid`), avertissement sous 60 % mesuré, erreurs traduites, toast de 6 s.
4. **claude.ai sans impasse** : impact fort, effort ½ jour. « Voir un exemple » devient le bouton principal. « Analyser » n'est actif qu'avec du code collé. Favori, proxy et clés sont masqués.
5. **Un seul « cette semaine »** : impact fort, effort 1 jour. Les mêmes 3 actions en tête d'À faire, un outil par semaine, des outils groupés par objectif, les imports vides repliés.
6. **Recours mobile** : impact fort, effort 2 à 3 jours. Un bouton « M'envoyer le lien sur ordinateur » (`navigator.share`), puis une lecture côté serveur, annoncée comme telle.
7. **Passe accessibilité et clavier** : impact moyen, effort 1 jour. Bordures à 3:1 au moins, étiquette visible, niveau écrit en toutes lettres, cibles de 24 px, glossaire hors Tab, `scrollLeft` au lieu de `scrollIntoView`.
8. **Microcopie et lexique commun** : impact moyen, effort 1 jour. « Sélection faite d'après… », prix sur une ligne, en-têtes complets, exemples adaptés au secteur, même plan sur toutes les surfaces.

### 4. Benchmark

| Outil | Accueil → 1re analyse → tableau de bord | Fait mieux | SEO 360 fait mieux |
|---|---|---|---|
| Semrush | Compte, projet, score Site Health, conseils Copilot en tête du tableau de bord | Audits planifiés, « Why / How to fix » | Sans compte, correctifs tirés de la page |
| SE Ranking | Audit lancé à la création du projet, points à gagner par catégorie, revérification | Priorités chiffrées | Budget, local et réseaux réunis |
| Ubersuggest | Un champ, environ 3 recherches par jour (10 avec Google), volume, difficulté, CPC | Volumes immédiats | Pas de quota, plan d'action |
| Seobility | Une adresse, sans inscription, tâches classées | Page lue par leurs serveurs, sans proxy | Part mesurée affichée, plusieurs canaux |
| Metricool | Réseaux connectés, calendrier, meilleures heures calculées sur vos abonnés | Données de votre audience | SEO, IA, budget |

Sources : [Semrush KB](https://www.semrush.com/kb/1184-audit-your-website), [Copilot](https://www.semrush.com/news/299521-get-ai-powered-seo-alerts-and-recommendations-with-semrush-copilot/), [SE Ranking](https://help.seranking.com/hc/en-us/articles/18560929519772-Overview-Tab-Interactive-Guide), [Ubersuggest](https://marketingagency.sg/ubersuggest-tutorial), [offres](https://www.temperstack.com/plans/ubersuggest/), [Seobility](https://www.seobility.net/en/seocheck), [Metricool](https://metricool.com/metricool-vs-buffer/).

## Hypothèses

- Utilisateur visé : un dirigeant de TPE, souvent sur téléphone. Cas testés : l'exemple (boulangerie à Lyon) et le site local du port 8766.
- Chromium seul (Playwright 1.63). La page claude.ai est simulée sans iframe : le presse-papiers réel est [À VÉRIFIER].
- Réseau bloqué : les durées mesurées ne valent pas en production.

## Faiblesses connues

- Ni utilisateurs réels, ni lecteur d'écran, ni Safari. Contrastes calculés sur fonds unis.
- Markdown vérifié avec pandoc seulement. Rendu sur GitHub [À VÉRIFIER].
- Pages concurrentes non ouvertes (WebFetch bloqué) : benchmark tiré d'extraits de recherche et d'avis tiers (Ubersuggest, Metricool).

## Confiance

Moyenne : les constats sont reproduits par scripts, mais aucun test n'a été fait avec de vrais utilisateurs.

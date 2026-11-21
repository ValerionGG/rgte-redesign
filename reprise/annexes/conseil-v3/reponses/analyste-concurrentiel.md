## Réponse

Preuves, scripts (`ui/lien.cjs`, `ui/explore2.cjs`) et commandes (`preuves-commandes.txt`) : `/tmp/claude-0/-home-user-rgte-redesign/137803cc-e0f1-5e43-837f-1ccac4c64755/scratchpad/conseil-v3/travail/analyste-concurrentiel/`. Recherche web du 5/11/2026.

### 1. Note : 64/100 (14 + 16,25 + 10 + 11,25 + 6,5 + 6)

| Critère (poids) | /10 | Justification |
|---|---:|---|
| Honnêteté (20) | 7 | « Non mesuré » fiable ; étude de marché intégrée déjà fausse (problème 8). |
| Recommandations (25) | 6,5 | Correctifs, verdict pub, boîte à outils sans équivalent ; mots-clés, concurrents et local sans données. |
| Parcours (20) | 5 | Exemple en 1,6 s, rien ne déborde à 390 px ; un lien seul échoue sur claude.ai, ailleurs il dépend de proxys publics. |
| Couverture (15) | 7,5 | Largeur unique, mais rien n'est branché. |
| Robustesse (10) | 6,5 | 34 tests sur 35 (plugin désynchronisé) ; liens publics vers une page absente. |
| Différenciation (10) | 6 | Seul outil TPE français avec verdict pub et droit français ; invisible. |

### 2. Les 8 problèmes face au marché

1. **Introuvable et non installable.** API GitHub (5/11) : `valeriongg/rgte-redesign` a 0 étoile, ni licence ni topic, et se décrit « RGTE — 10 propositions de refonte ». Pages publie `main` (dernier déploiement le 18/10), qui n'a ni `seo/`, ni `docs/seo/`, ni `.claude-plugin/marketplace.json`. L'URL du README, de `plugin.json` et de 5 skills, et la commande d'installation ne mènent donc à rien [À VÉRIFIER en direct].
2. **Un lien ne suffit pas.** `ui/lien.cjs` : sur la page claude.ai, « l'analyse en direct est bloquée » (`app.js:31`). Sur la version complète, l'adresse part chez api.allorigins.win et api.codetabs.com, sinon « Audit incomplet ». Le bouton-favori ne marche que sur ordinateur (README:243). Semrush, Ahrefs et Ubersuggest explorent depuis leurs serveurs.
3. **Concurrents à fournir soi-même.** `app.js:622` : sans liste, l'onglet reste vide ; seules les pages d'accueil sont comparées. Aucun concurrent organique, écart de mots-clés ou pack local n'est détecté.
4. **Le local ne lit pas la fiche Google.** `plan.js:32` ajoute « Fiche Google Business Profile… » à toute activité locale, sans mesure. Le site de test obtient 90/100 en local, note et avis inconnus. Semrush Local : 30 $/mois par établissement, avec grille Maps et agent IA de fiche.
5. **Pas de demande réelle.** `keywords.js:6-9` produit des gabarits sans volume (« boulangerie promo », « combien coûte boulangerie ») ; le niveau des hashtags est « attendu, pas mesuré » (README:242). Haloscan donne des volumes français, même en gratuit.
6. **IA diagnostiquée, pas mesurée.** `geo-visibilite-ia/SKILL.md:51-60` : protocole manuel. Otterly (29 $), Peec (~70-85 €) et Ubersuggest (depuis septembre 2025) mesurent les vraies réponses.
7. **Aucun suivi automatique.** Historique dans le navigateur (`app.js:38`, `:183`), Search Console en ZIP manuel, pas d'alerte. Ahrefs Webmaster Tools explore gratuitement un site vérifié.
8. **Étude déjà fausse.** `competitors.json` (3/11) : SE Ranking « 65 $/mois (Essential) » (l. 104), plan retiré (Core : 129 $) ; Ubersuggest `geo_ia: 0` (l. 187) ; Haloscan « Agency 79 € » (l. 457) contre 179 € dans `outils.json:837` ; Metricool `local: 0` (l. 892) alors qu'il publie sur la fiche Google. SEO 360 est absent de sa propre grille.

### 3. Les 8 améliorations prioritaires (★ = avantage décisif)

1. ★ **Benchmark local automatique.** Impact très fort, effort 3 à 5 j. Interroger Places API avec la clé de l'utilisateur (Text Search Pro : 5 000 requêtes gratuites par mois, facturation à activer). « Secteur + ville » donne le top 10 (note, avis, catégorie, horaires, site) et les écarts ; `--concurrents` se remplit seul ; l'action « fiche Google » devient mesurée.
2. ★ **Panel IA mensuel en français.** Impact fort, effort 3 à 5 j. Poser par API les questions de `geo-visibilite-ia` à ChatGPT, Perplexity et Gemini (clés de l'utilisateur) ; part de voix face aux concurrents du n° 1, en JSON daté.
3. ★ **Suivi hebdomadaire.** Impact fort, effort 2 à 4 j. Action GitHub ou tâche planifiée : `cli.mjs --avant` et API Search Console ; alerte si un critique apparaît ou si les clics baissent de 20 % ; historique en fichier.
4. **Publier pour de vrai.** Impact fort, effort < 1 j. Fusion sur `main`, LICENSE MIT, topics, release 3.0.0, essai de `marketplace add`, dépôt dédié, annuaires de skills.
5. **Un lien qui marche.** Impact fort, effort 1 j. `seo/proxy/worker.js` déployé par défaut, proxys publics en secours ; sur claude.ai, un bouton vers la version complète.
6. **Brancher les offres gratuites.** Impact moyen, effort < 1 j. Import CSV de Keyword Planner, Haloscan, Ubersuggest (volumes) et Metricool (posts) ; masquer les idées sans demande.
7. **Concurrents trouvés par les skills.** Impact moyen, effort < 1 j. Sans liste, `benchmark-concurrents` et `plan-croissance-360` cherchent « secteur ville » et gardent 3 à 5 sites hors annuaires ; lien Google Maps prérempli dans l'onglet vide.
8. **Étude juste et testée.** Impact moyen, effort < 1 j. Fiches corrigées, une seule source de prix, ligne SEO 360, test de cohérence des deux JSON, `node seo/plugin.mjs`.

### 4. Benchmark (hors taxes, consulté le 5/11/2026)

| Concurrent | Entrée 2026 (source) | Forts (+) et faibles pour une TPE (−) | SEO 360 mieux / moins bien |
|---|---|---|---|
| Semrush (Adobe) | SEO 139,95 $, One 199 $, Local 30 $ ([PricingSaaS](https://pricingsaas.com/news/article/semrush-restructures-seo-plans-4-tiers-guru-to-pro-hike-ai-visibility-bundled), [Dupple](https://dupple.com/learn/best-local-seo-tools)) | + données FR, positions, grille Maps ; − plans refondus en 2026, Reddit hostile selon PricingSaaS [À VÉRIFIER] | mieux : correctifs, verdict pub, 0 € ; moins bien : aucune donnée |
| Ahrefs | Starter 29 $, Lite 129 $, Webmaster Tools gratuit ([TechRadar](https://www.techradar.com/reviews/ahrefs)) | + liens, exploration gratuite, MCP ; − crédits, Brand Radar dès 199 $ | mieux : plan TPE ; moins bien : suivi, index |
| SE Ranking | Core 129 $ ([Zutrix](https://zutrix.com/guides/se-ranking-pricing)) | + français, marque blanche ; − plus d'offre à 65 $, pas de plan gratuit | mieux : 0 € ; moins bien : positions |
| Haloscan | gratuit limité, 59 €, Agency 179 € ([Formalive](https://www.formalive.fr/haloscan-avis/)) | + mots-clés français ; − ni audit, ni local, ni IA | mieux : tout sauf les volumes |
| Ubersuggest | 29 $ ou 290 $ à vie ([PPC Land](https://ppc.land/ubersuggest-launches-comprehensive-ai-search-tracking-with-competitive-intelligence-tools/), [G2](https://www.g2.com/products/ubersuggest)) | + simple, français, suivi IA ; − données jugées imprécises (G2 4,2/5) | mieux : correctifs ; moins bien : volumes |
| Metricool | gratuit, ~18-25 $ ([Upload-Post 17/09](https://www.upload-post.com/metricool-pricing/)) | + publication, statistiques, fiche Google ; − pas de SEO | mieux : stratégie ; moins bien : ne publie rien |
| Otterly / Peec | 29 $ ; ~70-85 € [À VÉRIFIER] ([Otterly](https://help.otterly.ai/pricing-of-otterlyai), [Rework](https://resources.rework.com/tools/aeo-ai-visibility/best-peec-ai-alternatives)) | + mesure des réponses IA ; − surveillent sans corriger | mieux : dit quoi corriger ; moins bien : ne mesure pas |
| claude-seo | gratuit, MIT ([Star History 2/11](https://www.star-history.com/agricidaniel/claude-seo)) | + ~26 000 étoiles, 19 sous-agents ; − anglais, ~4 700 jetons | mieux : français, TPE, ~3 000 jetons ; moins bien : notoriété |
| marketingskills | gratuit, MIT (`ETUDE-CONCURRENTIELLE.md:169`) | + ~59 000 étoiles, 53 skills ; − anglais, cadre américain, ~16 100 jetons | mieux : mesure, droit français ; moins bien : étendue |

**Choisir SEO 360** : TPE française à 0 € qui veut savoir quoi faire lundi (correctifs, verdict pub, droit), via Claude Code ou la CLI. **Choisir un concurrent** pour les volumes (Haloscan), le suivi (Ahrefs), la fiche Google (Semrush Local, Metricool) ou la mesure IA (Otterly). Les trois ★ couvriraient ce que Semrush facture ~229 $/mois (One + Local).

## Hypothèses
- Prix tirés de comparatifs 2026, parfois contradictoires.
- TPE type : un établissement, moins de 50 € par mois d'outils, sans développeur.
- Page publique en 404 : déduite de l'API GitHub.
- Note plus sévère sur le parcours et la différenciation ; elle ne se compare pas au 71/100 de la v2, obtenu sur une autre grille.

## Faiblesses connues
- Sites éditeurs et Reddit inaccessibles d'ici : aucun fil lu directement, aucun concurrent testé en réel ; ChatGPT et Gemini, alternatives gratuites probables, non évalués.
- Notes sur 10 : jugement d'un seul analyste.

## Confiance
Moyenne : constats sur SEO 360 reproduits par commandes et API ; prix des concurrents issus de sources secondaires.

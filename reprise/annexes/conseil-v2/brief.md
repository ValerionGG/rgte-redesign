# Brief du conseil — Audit UX & efficacité de « SEO 360 »

## La demande (en une phrase)
Auditer la plateforme SEO 360 (UX et efficacité réelle), trouver mieux, et fixer un objectif plus ambitieux, avec des améliorations concrètes et priorisées, implémentables dans ce code.

## Livrable attendu de chaque expert
Un audit + plan d'amélioration (pas un plan d'audit : l'audit lui-même), destiné au développeur qui va l'implémenter juste après, et in fine à Nadir (entrepreneur français, propriétaire du projet). Français, tutoiement, pas de remplissage.

## Le besoin d'origine de Nadir (traduit fidèlement)
« Crée-moi des skills et une plateforme de développement SEO avec les meilleurs hashtags pour tous les réseaux sociaux, pour le référencement naturel, organique, payant, absolument tout ce qu'il faut savoir. Je rentre un site ou une application et ça me dit tout ce que je dois faire, tout ce que je dois corriger pour monter rapidement, les budgets que je dois utiliser, etc. Tu dois créer la meilleure plateforme qui soit, utiliser des agents de recherche pour référencer GitHub, faire une étude concurrentielle et un benchmarking. »
Nouvelle demande : « Atteins un objectif meilleur, fais auditer ta solution en termes d'UX et d'efficacité, et trouve mieux. »

## Utilisateurs cibles
- Nadir et des dirigeants de TPE/PME françaises non experts (artisan, commerce, fabricant B2B comme RGTE — vitrines réfrigérées sur mesure —, restaurant, e-commerçant, éditeur d'app).
- Secondairement : freelances / agences SEO qui veulent un rapport à montrer à un client.

## Ce qui existe (à auditer)
Dépôt : /home/user/rgte-redesign (branche claude/seo-platform-hashtags-benchmark-fo1g2d). Tout est dans `seo/` :
- `seo/index.html`, `seo/app.css`, `seo/app.js` : interface web (vanilla JS, modules ES, sans build, sans dépendance), 10 onglets : Synthèse, Corrections, Plan d'action, Mots-clés, Hashtags, Budget pub, Concurrents, Checklists, Étude de marché, Guide 2026. Publiée sur GitHub Pages via `docs/seo/` (copie générée par `node build.mjs`).
- `seo/engine/*.js` : moteur partagé navigateur + Node (html.js extraction, collect.js collecte+crawl, audit.js ~120 contrôles et scores, robots.js, psi.js PageSpeed Insights, plan.js, keywords.js, hashtags.js, ads.js budget, github.js, appstore.js ASO, checklists.js, report.js export Markdown, index.js orchestration).
- `seo/cli.mjs` : CLI Node (audit complet : en-têtes, redirections, crawl) → rapport .md + .json importable dans l'interface.
- `seo/data/sectors.js` (28 secteurs), `seo/data/research/*.json` (études du 03/11/2026 : 35 outils concurrents, 50 projets GitHub, benchmarks pub/réseaux/SEO).
- `.claude/skills/*/SKILL.md` : 9 skills Claude Code.
- `seo/README.md`, `seo/ETUDE-CONCURRENTIELLE.md`, tests `seo/test/engine.test.mjs`.

## Contraintes techniques (faits, pas des opinions)
- Site 100 % statique (GitHub Pages) : pas de backend. Le navigateur ne peut pas lire le HTML d'un autre domaine (CORS) : l'interface utilise PageSpeed Insights (API Google ouverte au navigateur), un proxy public (AllOrigins/CodeTabs), un proxy perso optionnel (`seo/proxy/worker.js`, Cloudflare) ou du HTML collé. La CLI Node n'a pas cette limite.
- Pas de dépendance npm, pas d'étape de build souhaitée (on peut en discuter si le gain est énorme).
- Interface en français.

## Comment tester toi-même (environnement)
- ⚠️ AUDIT EN LECTURE SEULE : ne modifie AUCUN fichier du dépôt, ne fais ni commit ni push. Travaille uniquement dans ton dossier `…/scratchpad/conseil/travail/<ton-id>/`.
- Le réseau externe est bloqué (sites tiers en 403, PageSpeed en 429) : impossible d'auditer un vrai site. Utilise :
  - le faux site de test : `cd /home/user/rgte-redesign/seo/test/fixtures/site && python3 -m http.server <PORT_SITE> --bind 127.0.0.1` ;
  - l'interface : `cd /home/user/rgte-redesign/docs && python3 -m http.server <PORT_UI> --bind 127.0.0.1` puis http://127.0.0.1:<PORT_UI>/seo/ ;
  - un rapport d'exemple à importer dans l'interface (champ « Importer un rapport de la CLI », dans « Concurrents, collecte et options avancées ») : `/tmp/claude-0/-home-user-rgte-redesign/137803cc-e0f1-5e43-837f-1ccac4c64755/scratchpad/conseil/exemple-rapport.json` ;
  - le mode « HTML collé » (proxy « Aucun » + coller un code source) ;
  - la CLI : `NO_PROXY=127.0.0.1 node seo/cli.mjs http://127.0.0.1:<PORT_SITE>/ --secteur boulangerie --ville Lyon --mot-cle "pâtisserie lyon" --no-psi --crawl 5 --sortie <ton dossier>` ;
  - Playwright + Chromium sont installés : `require('playwright')` depuis n'importe quel dossier, `chromium.launch()` sans option. Captures pour toi : deviceScaleFactor 1. Lance le script Node depuis ton dossier de travail avec `NO_PROXY=127.0.0.1`.
  - Tests : `NO_PROXY=127.0.0.1 node --test seo/test/engine.test.mjs`.
- Utilise des ports uniques (indiqués dans ta mission) pour ne pas gêner les autres experts.

## Grille de notation (critère : poids)
- Justesse des constats (preuves vérifiables : fichier:ligne, capture, sortie de commande ; zéro erreur de fait) : 25
- Impact des améliorations (gain réel pour l'utilisateur : comprendre, agir, « monter vite », décider du budget) : 25
- Faisabilité et précision d'implémentation (actionnable dans CE code, sans backend, avec l'endroit à modifier) : 20
- Ambition crédible (l'« objectif meilleur » : ce qui ferait de SEO 360 la meilleure plateforme pour sa cible) : 15
- Priorisation et clarté (ordre impact/effort, lisible en 5 minutes) : 15

## Format de sortie demandé à chaque expert (dans le fichier de réponse)
## Réponse
### Verdict (5 lignes max, avec une note /100 de l'état actuel pour UX et pour efficacité)
### Constats (les plus importants d'abord ; chacun avec sa preuve)
### Améliorations priorisées (tableau : # · amélioration · impact 1-5 · effort 1-5 · où dans le code / comment)
### Objectif meilleur (la cible ambitieuse et crédible, et les 3 étapes pour y aller)
### Gains rapides (ce qu'on fait en moins d'une heure)
## Hypothèses
## Faiblesses connues
## Confiance

# Brief du conseil — audit de SEO 360 v3 (5 novembre 2026)

## La demande

Nadir, dirigeant francophone, veut « la meilleure plateforme qui soit » pour qu'une TPE ou une PME française :
- soit première sur Google ;
- perce sur TikTok, Instagram et les autres réseaux ;
- reçoive à partir d'un simple lien un plan complet : toutes les améliorations gratuites et payantes, les meilleurs outils avec leurs guides d'installation, et un benchmark de la concurrence.

Il demande d'auditer la plateforme SEO 360 et la dernière réponse de Claude, de se noter sur 100 et d'améliorer jusqu'à approcher 100.

Cette dernière réponse :
- a mis la plateforme en ligne en page privée claude.ai, en mode démonstration ;
- a fourni un paquet à déposer sur son serveur ;
- a ajouté une boîte à outils et le skill plan-croissance-360 ;
- a présenté les packs de skills tiers (claude-seo, etc.), relus mais pas installés : le contrôle de sécurité de la session a refusé l'installation sans accord explicite.

Un premier conseil a noté la v1 à 31/100 et la v2 à 71/100 : voir `seo/AUDIT-CONSEIL.md`. L'objectif est de faire mieux que la v3 actuelle, preuves à l'appui.

## Ce qu'est SEO 360 v3 (dépôt `/home/user/rgte-redesign`, branche `claude/seo-platform-hashtags-benchmark-fo1g2d`)

**Interface web statique** (`seo/index.html`, `seo/app.js`, `seo/engine/*.js`, construite dans `docs/seo/` par `node build.mjs`), en 6 onglets : Synthèse, À faire, Mots-clés & réseaux, Budget, Concurrents, Ressources.
- Audit d'un site, d'une application (App Store / Play) ou d'un dépôt GitHub.
- Note honnête : « non mesuré » quand rien n'est lu, et des plafonds.
- 3 actions de la semaine et correctifs prêts à coller.
- Import Search Console (ZIP complet) : part de marque, comparaison de deux périodes, chute datée et rapprochée des mises à jour Google, liens.
- Citabilité IA par bloc, robots IA en 3 niveaux, Content-Signal.
- Budget pub avec verdict de rentabilité, contrôle avant dépense et ROAS d'équilibre.
- Hashtags par réseau avec leur niveau (niche, moyen, large).
- Calendrier français calculé.
- Boîte à outils : 51 outils, gratuits d'abord, avec guides et prix datés.
- Statut « fait (déclaré) » ou « encore détecté », dérive après refonte, bouton-favori, lien de partage, PDF.

**Ligne de commande** (`node seo/cli.mjs --aide`) : audit `<url>` (`--avant`, `--veille`), puis les sous-commandes `gsc`, `calendrier`, `budget`, `hashtags`, `outils`, `veille` (Agent Reach).

**21 skills Claude Code** (`.claude/skills/*/SKILL.md`), dont `seo-360` (point d'entrée) et `plan-croissance-360` (lien → plan multicanal).
- Plugin `plugins/seo360`, 63 évaluations au format `claude plugin eval`.
- Packs tiers relus : `.claude/skills/plan-croissance-360/references/packs-complementaires.md`.

**Données et documentation** :
- études datées dans `seo/data/research/*.json` (benchmarks, concurrents, open source, outils) ;
- `seo/README.md` et `seo/ETUDE-CONCURRENTIELLE.md`.

## Où tester (tout est local, en lecture seule)

- **Version complète** : http://127.0.0.1:8810/seo/. Playwright est installé : `const { chromium } = require('playwright')`, `chromium.launch()` sans options. Tester en 1366 et 390 px. Bouton « Voir un exemple ».
- **Version « page claude.ai »**, qui simule les restrictions réelles (aucune connexion externe) : http://127.0.0.1:8820/. La vraie page publiée, https://claude.ai/artifact/6qeKMCsVCp3BW6kLSDt1xk, n'est pas joignable depuis ce conteneur.
- **Site de test local** : http://127.0.0.1:8766/ (fichiers `seo/test/fixtures/site/`). Exemple : `NO_PROXY=127.0.0.1 no_proxy=127.0.0.1 node seo/cli.mjs http://127.0.0.1:8766/ --secteur boulangerie --ville Lyon --no-psi --crawl 5 --sortie <ton dossier>`.
- **Exports Search Console de test** : `seo/test/fixtures/gsc-complet.zip`, `gsc-precedent.zip`, `liens.zip`.
- **Tests** : `NO_PROXY=127.0.0.1 node --test seo/test/engine.test.mjs` (35 tests).

## Contraintes

- Le réseau du conteneur bloque presque tout Internet : GitHub et 127.0.0.1 passent, PageSpeed est en quota dépassé. La recherche web (WebSearch) fonctionne.
- Ne modifie AUCUN fichier du dépôt et ne lance pas `git`. Travaille dans ton propre sous-dossier de `/tmp/claude-0/-home-user-rgte-redesign/137803cc-e0f1-5e43-837f-1ccac4c64755/scratchpad/conseil-v3/travail/<ta-perspective>/`.
- N'exécute jamais de code téléchargé.
- Écris en français, phrases simples, sans remplissage. Chaque constat a une preuve reproductible : commande, `fichier:ligne`, capture ou mesure.

## Grille de la plateforme (pour noter SEO 360 sur 100)

| Critère | Poids |
|---|---:|
| Honnêteté et exactitude des mesures et des faits | 20 |
| Valeur des recommandations (actionnables, correctifs, outils, plan) | 25 |
| Parcours et expérience (clarté, mobile, accessibilité, temps jusqu'à la 1re action) | 20 |
| Couverture multicanal (Google, local, IA, réseaux, pub, outils) | 15 |
| Robustesse et sécurité | 10 |
| Différenciation face aux concurrents | 10 |

## Grille des relecteurs (pour noter les audits sur 100)

| Critère | Poids |
|---|---:|
| Justesse et preuves (constats reproduits, pas d'erreur de fait) | 30 |
| Impact des améliorations proposées pour une TPE | 25 |
| Priorisation et faisabilité | 20 |
| Qualité du benchmark concurrentiel | 15 |
| Clarté | 10 |

## Perspectives (une par expert)

1. **Utilisateur final** : dirigeant de TPE non technicien (boulangerie à Lyon, artisan, e-commerce débutant). Est-ce compréhensible, rapide, utile lundi matin ?
2. **Expert métier SEO/SEA/GEO** : consultant senior. Les constats sont-ils justes, les faux positifs absents, les priorités et les outils les bons ?
3. **Avocat du diable** : ce qui casse, ce qui ment ou survend, les risques (sécurité, données, juridique, promesses), la robustesse.
4. **Analyste concurrentiel** : SEO 360 face à Semrush, Ahrefs, SE Ranking, Haloscan, Ubersuggest, Metricool, Otterly, claude-seo, marketingskills… Où gagne-t-il, où perd-il, qu'est-ce qui manque pour être n°1 ?
5. **Designer produit** : parcours, hiérarchie, mobile, accessibilité, microcopie, cohérence entre l'interface, la CLI, les skills et la page claude.ai.

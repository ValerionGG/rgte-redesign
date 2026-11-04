---
name: seo-360
description: Étude SEO 360 complète d'un site web, d'une application (App Store / Google Play) ou d'un dépôt GitHub — tout ce qu'il faut corriger (technique, contenu, vitesse, IA/GEO, local, RGPD), plan d'action 30/60/90 jours, mots-clés, hashtags par réseau, budget publicitaire et benchmark concurrents. À utiliser dès que l'utilisateur donne une URL, une app ou un repo et demande un audit, un référencement, « ce qu'il faut corriger », « comment monter vite » ou une stratégie SEO/SEA/social.
---

# SEO 360 — étude complète

Outil : `seo/cli.mjs` (Node ≥ 18, sans dépendance). Interface web : `seo/index.html` (publiée sur GitHub Pages dans `docs/seo/`).

## 1. Cadrer (une seule question si l'info manque)
Recueillir ou déduire : URL/app/repo, **secteur** (liste : `node seo/cli.mjs --aide`), mot-clé principal, ville (si local), marque, objectif (`leads`, `ventes`, `notoriete`, `telechargements`, `trafic`), budget pub mensuel, valeur d'un client, 2–5 concurrents. Sans réponse, choisir des valeurs raisonnables et le dire.

## 2. Lancer l'analyse
```bash
node seo/cli.mjs <cible> --secteur <id> --mot-cle "<mot-clé>" --ville <ville> --marque "<marque>" \
  --objectif leads --valeur 300 --marge 40 --crawl 20 --concurrents a.fr,b.fr --sortie rapports-seo
```
- Sans `--budget`, le budget de départ conseillé est calculé (minimum viable du canal principal).
- PageSpeed : variable `PSI_KEY` ou `--psi-key` (sans clé, quota faible → `--no-psi` si 429).
- Données réelles : `--cpc <€>` (CPC Keyword Planner) et `--volume <recherches/mois>` affinent le budget.
- Sortie : `rapports-seo/<slug>.md` (synthèse, 3 actions, correctifs prêts à coller) et `.json` (importable dans l'interface).
- Si le site refuse le robot (403, page de défi) ou si le réseau sortant est bloqué : le rapport le dit (`result.incomplete`). Proposer le **bouton-favori** de l'interface (onglet Ressources : il lit la page depuis le site de l'utilisateur, sans proxy), le code source collé, ou une autre machine.

## Règle d'or : pas de note sans mesure
`result.global` vaut `null` quand la page n'a pas été lue (`result.incomplete` explique pourquoi) ; `result.coverage` donne la part des contrôles mesurés ; `result.caps` liste les plafonds appliqués (noindex, Google bloqué, canonical externe, page vide). Ne jamais présenter une note quand `global` est `null`.

## 3. Lire le JSON, pas seulement le Markdown
`result.issues` (triés gravité → priorité, `scope: 'site'` = issu du crawl), `result.scores` (`score: null` = non mesuré), `result.meta` (CMS, traceurs, CMP, robots IA, schema, réseaux, téléphone, adresse), `ctx.psi`, `ctx.crawl`, `plan.week` (3 actions avec `who` et `time`), `budget.verdict`, `hashtags`, `keywords`, `competitors` (comparés sur la page d'accueil, mêmes conditions).
Correctifs prêts à coller : `import { buildFixes } from './seo/engine/fixes.js'` → `buildFixes(report)[issue.id]` (titre, description, JSON-LD avec les coordonnées détectées, robots.txt, config Apache/Nginx…).

## 4. Livrer (format attendu)
1. **Verdict en 3 lignes** : score /100, les 3 freins majeurs, le potentiel.
2. **Top 10 corrections** : pour chacune *quoi*, *pourquoi (impact business)*, *comment* (code prêt à coller si dispo dans `issue.code`), effort.
3. **Plan 30/60/90 jours** (depuis `plan.steps`), chaque tâche avec qui (vous / webmaster / hébergeur) et combien de temps.
4. **Accélérer vite** : les 3 actions de la semaine (`plan.week`) + le verdict publicité (`budget.verdict` : rentable / à tester / pas rentable, avec le coût maximal rentable par client).
5. **Données réelles** : si l'utilisateur a Search Console, lui faire importer l'export ZIP dans l'interface (onglet Mots-clés & réseaux) : requêtes en positions 4–20 chiffrées en clics gagnables.
6. **Hashtags** par réseau prioritaire (copier-coller) + 1 modèle de légende.
7. **Concurrents** : ce qu'ils font mieux, sujets qu'ils traitent et pas vous.
8. **KPI** et prochaine passe d'audit : l'interface compare deux audits d'une même adresse (points corrigés, nouveaux, évolution de la note).

## Règles
- Ne jamais inventer de volumes de recherche ou de positions : renvoyer vers Search Console / Keyword Planner, ou lancer `googleSuggest` (suggestions réelles, intégré à la CLI).
- Les budgets sont des **ordres de grandeur** (benchmarks WordStream/LocaliQ 2026 US ajustés FR, voir `seo/data/research/benchmarks.json`) : le préciser.
- Vérifier chaque correction proposée avec une nouvelle exécution de la CLI (boucle problème → correctif → vérification).
- Skills spécialisés : `seo-audit-technique`, `geo-visibilite-ia`, `seo-local`, `hashtags-reseaux`, `budget-publicite`, `benchmark-concurrents`, `aso-application`, `github-seo`.

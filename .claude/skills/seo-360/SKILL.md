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
  --objectif leads --budget 1500 --valeur 300 --crawl 20 --concurrents a.fr,b.fr --sortie rapports-seo
```
- PageSpeed : variable `PSI_KEY` ou `--psi-key` (sans clé, quota faible → `--no-psi` si 429).
- Sortie : `rapports-seo/<slug>.md` (rapport) et `.json` (données, importables dans l'interface).
- Si le réseau sortant est bloqué (proxy, 403) : le dire, proposer l'interface web (l'utilisateur la lance depuis son navigateur) ou demander le code source HTML.

## 3. Lire le JSON, pas seulement le Markdown
`result.issues` (triés gravité → priorité), `result.scores`, `result.meta` (CMS, traceurs, CMP, robots IA, schema, réseaux), `ctx.psi` (Core Web Vitals réels), `ctx.crawl` (pages, liens cassés), `budget`, `hashtags`, `keywords`, `competitors`.

## 4. Livrer (format attendu)
1. **Verdict en 3 lignes** : score /100, les 3 freins majeurs, le potentiel.
2. **Top 10 corrections** : pour chacune *quoi*, *pourquoi (impact business)*, *comment* (code prêt à coller si dispo dans `issue.code`), effort.
3. **Plan 30/60/90 jours** (depuis `plan.steps`) adapté au contexte.
4. **Accélérer vite** : quick wins de la semaine + campagne pub de démarrage (canaux, €/jour, CPA attendu, alertes d'apprentissage).
5. **Hashtags** par réseau prioritaire (copier-coller) + 1 modèle de légende.
6. **Concurrents** : ce qu'ils font mieux, comment les dépasser.
7. **KPI** à suivre et date de la prochaine passe d'audit.

## Règles
- Ne jamais inventer de volumes de recherche ou de positions : renvoyer vers Search Console / Keyword Planner, ou lancer `googleSuggest` (suggestions réelles, intégré à la CLI).
- Les budgets sont des **ordres de grandeur** (benchmarks WordStream/LocaliQ 2026 US ajustés FR, voir `seo/data/research/benchmarks.json`) : le préciser.
- Vérifier chaque correction proposée avec une nouvelle exécution de la CLI (boucle problème → correctif → vérification).
- Skills spécialisés : `seo-audit-technique`, `geo-visibilite-ia`, `seo-local`, `hashtags-reseaux`, `budget-publicite`, `benchmark-concurrents`, `aso-application`, `github-seo`.

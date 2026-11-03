# SEO 360 — tout ce qu’il faut corriger, en une analyse

Entrez **un site, une application (App Store / Google Play) ou un dépôt GitHub** : SEO 360 liste tout ce qu’il faut corriger, par priorité, avec le correctif. Il donne aussi le plan d’action, les mots-clés, les hashtags par réseau, le budget publicitaire et un benchmark de vos concurrents.

- **Interface web** : `seo/index.html`, publiée sur https://valeriongg.github.io/rgte-redesign/seo/
- **CLI** (audit complet : en-têtes, redirections, crawl) : `node seo/cli.mjs <cible>`
- **Skills Claude Code** : `.claude/skills/` (9 skills, voir plus bas)
- **Étude concurrentielle & benchmark** : [`ETUDE-CONCURRENTIELLE.md`](ETUDE-CONCURRENTIELLE.md)

Aucune dépendance : Node ≥ 18 et un navigateur récent suffisent.

## Ce qui est analysé

| Module | Contrôles |
|---|---|
| Indexation & technique | statut HTTP, HTTPS, redirections (chaînes, 302, http→https, www), noindex / X-Robots-Tag, robots.txt (blocages, sitemap, CSS/JS), sitemap XML (lastmod, domaine), canonical, hreflang, lang, viewport, charset, doctype, URL |
| Contenu & on-page | titre, meta description, H1, hiérarchie Hn, volume de texte, rendu JavaScript, images (alt, noms), maillage interne, ancres, mot-clé cible (titre, H1, description, URL, intro, sur-optimisation), sujets détectés |
| Vitesse | Core Web Vitals réels (CrUX : LCP, INP, CLS), scores et opportunités Lighthouse via PageSpeed Insights, TTFB, compression, cache, scripts tiers, ressources bloquantes, lazy-loading, image LCP, formats d’image, façades vidéo |
| Données structurées | JSON-LD (validité), types schema.org conseillés par secteur, propriétés requises (Product, LocalBusiness, Article, Organization…), BreadcrumbList, modèle prêt à coller |
| Visibilité IA (GEO) | 19 robots moteurs/IA (OAI-SearchBot, PerplexityBot, Claude-SearchBot, GPTBot, Google-Extended…), Bingbot, llms.txt, questions en intertitres, faits chiffrés, auteur/date, sameAs, Bing Webmaster, page À propos |
| Social & marque | Open Graph, Twitter Card, liens vers les réseaux, favicon, apple-touch-icon |
| SEO local | téléphone cliquable, NAP, LocalBusiness, horaires, lien fiche Google, ville dans titres |
| Mesure, RGPD, accessibilité | outils de mesure et pixels, bandeau cookies (CMP), Consent Mode, mentions légales / confidentialité / CGV, labels, boutons, landmarks, contenu mixte, HSTS |
| Crawl multi-pages | titres et descriptions dupliqués, pages sans H1, pages minces, liens internes cassés, pages lentes, noindex |
| Application (ASO) | nom, mot-clé, description, captures, notes et avis, mises à jour, langues (iOS via iTunes Lookup ; Android via la fiche Play) |
| Dépôt GitHub | description, topics, homepage, README (titre, visuel, installation, usage, badges), licence, fichiers communautaires, releases, activité |

Et en plus de l’audit :
- **Plan d’action** : gains rapides de la semaine, puis 30, 60 et 90 jours, avec les indicateurs à suivre.
- **Mots-clés** classés par intention (transactionnelle, locale, commerciale, informationnelle), suggestions Google en temps réel et liens vers les outils de volume.
- **Hashtags** pour 10 réseaux selon les limites 2026 (Instagram : 5 au maximum, Threads : 1, etc.), avec une réserve à faire tourner, un modèle de légende, les créneaux et la liste des hashtags à bannir.
- **Budget publicitaire** : répartition entre les canaux, clics, conversions, CPA et ROAS estimés, budget nécessaire pour un objectif, minimums et phases d’apprentissage, montée en charge, part SEO / SEA.
- **Benchmark concurrents** : la même grille appliquée à 5 concurrents au plus, et la liste de ce qu’ils font mieux que vous.
- **Étude de marché** : 35 outils commerciaux, 50 projets open-source, une SWOT et le positionnement proposé.

## CLI

```bash
node seo/cli.mjs https://www.exemple.fr \
  --secteur equipement-pro --mot-cle "vitrine réfrigérée" --ville "Puget-sur-Argens" --marque RGTE \
  --objectif leads --budget 1500 --valeur 4000 --crawl 30 \
  --concurrents concurrent1.fr,concurrent2.fr
# → rapports-seo/www-exemple-fr.md + .json (le JSON s’importe dans l’interface)

node seo/cli.mjs https://apps.apple.com/fr/app/<nom>/id<ID> --mot-cle "recettes"
node seo/cli.mjs owner/repo
node seo/cli.mjs --aide
```

Variables d’environnement : `PSI_KEY` (clé PageSpeed Insights gratuite, fortement conseillée) et `GITHUB_TOKEN`.

## Interface web : comment elle lit les sites

Un navigateur ne peut pas lire le HTML d’un autre site (CORS). L’interface :
1. lance **PageSpeed Insights** (API de Google, ouverte au navigateur) : Core Web Vitals, Lighthouse, capture mobile ;
2. lit le HTML via un **proxy** au choix : AllOrigins, CodeTabs (proxys publics), **votre propre proxy** (`seo/proxy/worker.js`, Cloudflare Workers gratuit, qui renvoie aussi en-têtes et redirections), ou le **code source collé** ;
3. GitHub et App Store sont lus directement (API publiques).

Pour l’audit le plus complet, utilisez la CLI puis importez le `.json` dans l’interface.

## Skills Claude Code (`.claude/skills/`)

| Skill | Usage |
|---|---|
| `seo-360` | étude complète : audit, plan, mots-clés, hashtags, budget, concurrents |
| `seo-audit-technique` | diagnostic technique / on-page approfondi avec correctifs |
| `geo-visibilite-ia` | être cité par ChatGPT, Perplexity, Claude, Gemini, AI Overviews |
| `seo-local` | fiche Google, avis, NAP, pages ville |
| `hashtags-reseaux` | hashtags et légendes par réseau (règles 2026) |
| `budget-publicite` | budget et répartition Google / Meta / TikTok / LinkedIn… |
| `benchmark-concurrents` | concurrents, marché, SWOT, positionnement |
| `aso-application` | App Store / Google Play |
| `github-seo` | référencement d’un dépôt GitHub |

Pour les utiliser dans un autre projet, copiez le dossier `.claude/skills/<nom>` dans `~/.claude/skills/` (et le dossier `seo/` pour les outils). Sur claude.ai, chaque dossier zippé peut s’importer comme skill.

## Structure

```
seo/
  index.html, app.css, app.js   interface (modules ES, sans build)
  cli.mjs                       ligne de commande
  engine/                       moteur partagé navigateur + Node
    html.js        extraction HTML sans dépendance
    collect.js     page, robots.txt, sitemap, llms.txt, variantes, crawl
    audit.js       ~120 contrôles, scores, modèles de code
    robots.js      robots.txt (RFC 9309) + 19 robots moteurs/IA
    psi.js         PageSpeed Insights (CrUX + Lighthouse)
    plan.js        plan 30/60/90 + KPI
    keywords.js    intentions, suggestions Google
    hashtags.js    hashtags par réseau
    ads.js         budget publicitaire
    github.js      audit de dépôt
    appstore.js    ASO iOS / Android
    checklists.js  10 checklists + guide 2026
    report.js      export Markdown
  data/
    sectors.js     27 secteurs : mots-clés, schema, hashtags FR/EN, réseaux
    research/      études du 03/11/2026 (JSON source + modules JS) ; node seo/data/sync.mjs
  proxy/worker.js  proxy CORS optionnel (Cloudflare)
  test/            node --test seo/test/engine.test.mjs
```

`node build.mjs` copie l’interface, le moteur et les données dans `docs/seo/` (GitHub Pages).

## Limites (honnêtes)

- Pas de base de backlinks, de volumes de recherche ni de suivi de positions propriétaires : SEO 360 s’appuie sur Search Console, Keyword Planner et les suggestions Google. Les suites payantes restent utiles pour ces besoins (voir l’étude).
- Les budgets sont des ordres de grandeur issus de benchmarks publics (souvent US). Recalez-les sur vos comptes après 2 à 4 semaines.
- Les proxys publics sont parfois lents ou indisponibles. Votre propre proxy, ou la CLI, est plus fiable.

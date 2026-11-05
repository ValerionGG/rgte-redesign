# SEO 360 — tout ce qu’il faut corriger, en une analyse

Entrez **un site, une application (App Store / Google Play) ou un dépôt GitHub** : SEO 360 liste tout ce qu’il faut corriger, par priorité, avec le correctif. Il donne aussi le plan d’action, les mots-clés, les hashtags par réseau, le budget publicitaire et un benchmark de vos concurrents.

- **Interface web** : `seo/index.html`, publiée sur https://valeriongg.github.io/rgte-redesign/seo/
- **CLI** (audit complet : en-têtes, redirections, crawl) : `node seo/cli.mjs <cible>`
- **Skills Claude Code** : `.claude/skills/` (9 skills, voir plus bas)
- **Étude concurrentielle & benchmark** : [`ETUDE-CONCURRENTIELLE.md`](ETUDE-CONCURRENTIELLE.md)

Aucune dépendance : Node ≥ 18 et un navigateur récent suffisent.

## Version 2 : ce que l’audit du conseil a changé

Cinq experts indépendants (dirigeant de PME, designer produit, consultant SEO/SEA, avocat du diable, visionnaire) ont audité la v1, puis cinq relecteurs ont noté leurs audits à l’aveugle (détail : [`AUDIT-CONSEIL.md`](AUDIT-CONSEIL.md)). Résultat :

- **Aucune note sans mesure.** Une catégorie non mesurée affiche « non mesuré » ; sans la page lue, pas de note globale mais « audit incomplet » et 3 solutions. Plafonds quand un blocage annule tout (noindex, Google bloqué, canonical vers un autre domaine, page vide ou coquille JavaScript). La v1 pouvait afficher 93/100 « A » pour un site jamais lu.
- **Vos 3 actions cette semaine**, chacune avec qui s’en charge (vous, webmaster, hébergeur), combien de temps, et **le correctif prêt à coller**, construit avec les données de la page (titre, description, JSON-LD avec votre téléphone, adresse et réseaux, robots.txt, config Apache/Nginx…). Bouton « Copier le message pour mon prestataire ».
- **Verdict publicitaire en une phrase** : rentable / à tester / pas rentable, à partir de la valeur d’un client, de votre marge et du taux de signature. Budget conseillé si vous n’en avez pas, minimum viable par canal, estimation centrale ±35 % (au lieu de fourchettes ×22), votre CPC réel et le volume de recherche en option, campagnes App et Apple Ads pour les applications.
- **Le bouton-favori « Auditer cette page »** : lu depuis votre propre site, il récupère le HTML réel, les en-têtes, robots.txt, le sitemap, jusqu’à 15 pages et le rendu après JavaScript, sans proxy ni serveur tiers. Il mesure exactement la part du texte qui n’existe qu’après JavaScript.
- **Vos vraies données** : import de l’export Search Console (le ZIP tel quel) → requêtes en positions 4–20 chiffrées en clics gagnables.
- **La preuve du progrès** : chaque nouvel audit d’une même adresse affiche les points corrigés, les nouveaux et l’évolution de la note. Statuts « fait » par constat, partagés entre la liste À faire et le plan.
- **Partager et imprimer** : lien de partage sans serveur (rapport compressé dans l’adresse), rapport PDF complet (synthèse, à faire, budget).
- **Plus simple** : 6 onglets au lieu de 10, formulaire réduit à 3 champs, glossaire au survol de chaque sigle, rapport d’exemple en un clic, contrastes WCAG AA.
- **Plus fiable et plus sûr** : `rgte.fr` n’est plus pris pour une application, délais et erreurs visibles, pare-feu détectés, encodages ISO-8859-1, faux positifs corrigés (sous-types LocalBusiness, logo cliquable, +33, `en-uk`, `none`…), rapports importés vérifiés + politique de sécurité (CSP), jetons gardés pour la session seulement, proxy Cloudflare restreint et protégé contre le SSRF. 24 tests, dont les « pages pièges » des experts et la boucle « corriger puis revérifier ». Critique finale à l’aveugle : v1 ≈ 31/100, v2 ≈ 71/100, puis une boucle de correction.

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

## Veille sociale avec Agent Reach

[Agent Reach](https://github.com/Panniantong/Agent-Reach) (MIT, ≈ 109 000 étoiles) donne à un agent IA un accès en lecture seule à Reddit, YouTube, X, GitHub, LinkedIn, Instagram et au web. SEO 360 s’en sert pour mesurer la **demande réelle** :

```bash
node seo/cli.mjs veille "pâtisserie lyon" --sources reddit,youtube,web --marque "Maison Exemple" --requetes "gâteau anniversaire lyon"
```

Le rapport contient :
- les **vraies questions** des internautes, classées par engagement (pour la FAQ et les intertitres) ;
- les **hashtags réellement utilisés**, avec leur nombre de publications ;
- les expressions qui reviennent, les publications qui marchent et les mentions de votre marque.

Le `.json` s’importe dans l’onglet Mots-clés & réseaux : les hashtags vus dans au moins 2 publications deviennent prioritaires dans les sélections par réseau.

Les règles d’Agent Reach sont respectées : lecture seule, l’utilisateur se connecte lui-même, et pas de relance en boucle sur « connexion requise » ou « limite atteinte ».

Installation, **depuis GitHub uniquement** (le paquet PyPI homonyme n’est pas ce projet) :

```bash
uv tool install https://github.com/Panniantong/Agent-Reach/archive/refs/tags/v1.6.0.zip
agent-reach setup
```

Le skill `veille-sociale` guide Claude Code de bout en bout.

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

Un navigateur ne peut pas lire le HTML d’un autre site (CORS). Par ordre de préférence :
1. **le bouton-favori** (onglet Ressources) : exécuté sur votre site, il lit tout sans intermédiaire et l’envoie à SEO 360 (si le site l’empêche, il télécharge un fichier à importer) ;
2. **la ligne de commande** : audit le plus complet (exploration, redirections, en-têtes), puis import du `.json` ;
3. **le code source collé** ;
4. **un proxy** : par défaut les proxys publics AllOrigins puis CodeTabs (l’adresse analysée transite par eux), ou **votre propre proxy** (`seo/proxy/worker.js`, Cloudflare Workers gratuit, restreint à vos pages).

PageSpeed Insights (API Google ouverte au navigateur) mesure la vitesse réelle dans tous les cas ; GitHub et l’App Store sont lus par leurs API publiques.

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
| `veille-sociale` | demande réelle via Agent Reach : questions Reddit/YouTube, hashtags observés, mentions |

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
    fixes.js       correctifs prêts à coller construits avec la page
    gsc.js         import Search Console (CSV ou ZIP) et clics gagnables
    bookmarklet.js bouton-favori « Auditer cette page »
    share.js       lien de partage compressé (sans serveur)
    glossary.js    glossaire des sigles
    decode.js      décodage des encodages (UTF-8, ISO-8859-1…)
    report.js      export Markdown
  data/
    sectors.js     28 secteurs : mots-clés, schema, hashtags FR/EN, réseaux
    exemple.js     rapport fictif de démonstration (node seo/test/make-exemple.mjs)
    research/      études du 03/11/2026 (JSON source + modules JS) ; node seo/data/sync.mjs
  proxy/worker.js  proxy CORS optionnel (Cloudflare)
  test/            NO_PROXY=127.0.0.1 node --test seo/test/engine.test.mjs (24 tests, pages pièges)
```

`node build.mjs` copie l’interface, le moteur et les données dans `docs/seo/` (GitHub Pages).

## Limites (honnêtes)

- Pas de base de backlinks, de volumes de recherche ni de suivi de positions propriétaires : SEO 360 s’appuie sur Search Console (import), Keyword Planner (CPC et volume saisis) et les suggestions Google. Les suites payantes restent utiles pour ces besoins (voir l’étude).
- Popularité des hashtags : aucune source gratuite fiable ; chaque hashtag renvoie vers sa page sur le réseau pour la vérifier.
- Le bouton-favori fonctionne sur ordinateur ; certains sites très protégés peuvent le bloquer (la CLI reste la solution).
- Les budgets sont des ordres de grandeur issus de benchmarks publics (souvent US). Recalez-les sur vos comptes après 2 à 4 semaines.
- Les proxys publics sont parfois lents ou indisponibles. Votre propre proxy, ou la CLI, est plus fiable.

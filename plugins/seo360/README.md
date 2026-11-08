# SEO 360 — plugin Claude Code

Pack de 21 skills en français pour les TPE, PME, artisans, commerces et freelances : audit SEO complet, SEO local et fiche Google, visibilité dans les IA (GEO), diagnostic Search Console, rédaction, réseaux sociaux et hashtags, budget publicitaire, conformité marketing française et calendrier des temps forts. La ligne de commande SEO 360 est embarquée : les skills l'utilisent pour mesurer au lieu de deviner.

## Installation

Deux commandes dans Claude Code :

```
/plugin marketplace add ValerionGG/rgte-redesign
/plugin install seo360@seo360-fr
```

Node 18 ou plus est nécessaire pour les commandes (aucune dépendance à installer).

## Premier usage

Dites « voici mon entreprise » : le skill `contexte-entreprise` crée `.claude/contexte-entreprise.md` (activité, ville, concurrents, budget, valeur d'un client). Tous les autres skills le lisent avant de poser une question.

## Les skills

- **aso-application** — ASO des applications iOS et Android : audit de la fiche App Store ou Google Play (titre, sous-titre, mots-clés, captures, notes), 3 options par champ avec leur longueur, ASO saisonnier, Custom Product Pages, In-App Event
- **avis-clients-reputation** — Avis clients et e-réputation d'un commerce, artisan, restaurant ou cabinet : obtenir plus d'avis sans enfreindre les règles (QR code, SMS après la prestation), répondre aux avis positifs, négatifs ou injurieux, traiter l
- **benchmark-concurrents** — Étude concurrentielle SEO, réseaux et publicité : même grille d'audit pour vous et vos concurrents, tableau noté sur 10, leurs pubs actives (bibliothèques Meta, Google, LinkedIn, TikTok), ce qu'ils font mieux, SWOT et 3 
- **budget-publicite** — Budget publicitaire rentable (Google Ads, Meta, TikTok, LinkedIn, YouTube, Microsoft…) : verdict rentable, à tester ou pas rentable, CPA maximal, ROAS d'équilibre, 3 scénarios, minimums et apprentissage, montée en charge
- **calendrier-marketing-fr** — Calendrier marketing français de l'année, dates calculées (Pâques, fête des mères, soldes, Black Friday, fériés, ponts, Alsace-Moselle) et temps forts du secteur, avec rétroplanning contenu J-30, pub J-14, posts J-7 et h
- **conformite-marketing-fr** — Conformité du marketing au droit français, avec sources officielles datées : allégations, influence (loi du 9 juin 2023), prix barrés (règle des 30 jours), soldes, avis en ligne, prospection par e-mail, SMS et téléphone 
- **contenu-seo-redaction** — Rédaction SEO qui se classe et que les IA citent : brief (intention, type de page dominant, vraies questions, ce que le top 3 ne couvre pas), gabarits (page service, page ville, comparatif, guide, FAQ), écriture « répons
- **contenus-reseaux-video** — Contenus réseaux sociaux d'une TPE à partir de sa matière réelle : accroches vidéo en lot, scripts minutés de Reels, TikTok et Shorts à filmer au téléphone, légendes, carrousels, posts LinkedIn sans tics d'IA, paquet You
- **contexte-entreprise** — Crée et tient à jour .claude/contexte-entreprise.md, la fiche que tous les skills SEO 360 lisent avant de poser une question : activité, offres et prix, secteur, ville, clients, concurrents, preuves, ton, outils, objecti
- **conversion-site** — Transforme les visites en appels, devis ou ventes : grille de conversion de la page (promesse visible, preuves, objections, appel à l'action), contact sur mobile (téléphone cliquable, formulaire court), cohérence annonce
- **diagnostic-baisse-trafic** — Diagnostic d'une baisse de trafic ou de clics Google en 5 couches : vraie baisse ou problème de mesure, localisation (pages, marque ou non, appareils), positions et CTR (réponses IA), technique (noindex, robots.txt, redi
- **geo-visibilite-ia** — Visibilité dans les IA (GEO) : être cité par ChatGPT, Perplexity, Claude, Gemini, Copilot et Google AI Overviews / AI Mode. Robots IA en 3 niveaux, Content-Signal, Bing et IndexNow, blocs citables à réécrire, entité de m
- **github-seo** — Référencement d'un dépôt GitHub : description, topics, README, image d'aperçu, GitHub Pages, licence, SECURITY.md, CITATION.cff, releases, diffusion (listes awesome, Show HN, Reddit) et mesure (requêtes suivies, trafic a
- **hashtags-reseaux** — Hashtags et légendes par réseau (Instagram, TikTok, LinkedIn, YouTube, X, Facebook, Pinterest, Threads, Bluesky, Snapchat) selon le secteur, la ville et la marque, avec les règles 2026 (5 au maximum sur Instagram), un ni
- **netlinking-mentions-locales** — Liens et mentions gratuits et propres : audit de l'export « Liens » de Search Console (sites référents, ancres, liens perdus), sources françaises (annuaires de qualité, CCI, CMA, fédérations, fournisseurs, presse locale,
- **plan-croissance-360** — Plan de croissance complet à partir d'un lien (site, application, dépôt GitHub, ou profil Instagram, TikTok, LinkedIn, YouTube avec vos statistiques exportées) : audit mesuré du site ou de l'app, toutes les améliorations
- **seo-360** — Point d'entrée du pack : étude SEO complète d'un site, d'une application ou d'un dépôt GitHub. Verdict d'abord, corrections (technique, contenu, vitesse, IA, local, RGPD) avec correctifs prêts à coller et niveau de confi
- **seo-audit-technique** — Audit SEO technique approfondi (indexation, robots.txt, sitemap, canonical, hreflang, redirections, Core Web Vitals, rendu JavaScript, données structurées) avec correctifs en code et recettes par CMS ; mode refonte et mi
- **seo-local** — SEO local et fiche Google Business Profile des commerces, artisans, restaurants et cabinets : catégories, photos, services, NAP, pages ville, LocalBusiness, annuaires, Apple Plans, Bing Places, entreprises sans vitrine, 
- **suivi-performance-mensuel** — Suivi et rapport mensuel SEO, local, IA et pub : référence datée, indicateurs par objectif (contacts, appels et itinéraires de la fiche Google, avis, clics hors marque, positions 4-20, coût par contact), cadence, actions
- **veille-sociale** — Demande réelle avec Agent Reach, en lecture seule (Reddit, YouTube et sous-titres, web, GitHub ; X expérimental) : vraies questions des internautes, hashtags vraiment employés, expressions récurrentes, publications hors 

## Commandes embarquées

Dans le plugin, les skills appellent `node "${CLAUDE_SKILL_DIR}/../../seo/cli.mjs"` : audit (`<url>`, `--avant` après une refonte), `gsc` (export Search Console), `veille` (Agent Reach), `calendrier`, `budget`, `hashtags`. L'interface web est en ligne : https://valeriongg.github.io/rgte-redesign/seo/

## Données et confidentialité

Tout tourne sur votre machine : les exports Search Console et les rapports ne sont envoyés nulle part. Les audits lisent les pages publiques du site analysé. Agent Reach (veille sociale) est en lecture seule et ne se connecte jamais à votre place.

## Évaluations

`claude plugin eval plugins/seo360` lance les 63 cas du dossier `evals/` (2 cas qui doivent déclencher chaque skill, 1 cas voisin qui ne doit pas), avec et sans le plugin.

Généré par `node seo/plugin.mjs` depuis `.claude/skills` (version 3.0.0) : ne modifiez pas les fichiers de ce dossier à la main, sauf `evals/`.

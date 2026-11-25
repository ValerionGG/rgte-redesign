# REPRISE — tout pour reprendre sur un autre PC

> **Pour Claude (Claude Code, Cowork ou le chat)** : lis ce fichier en entier avant de faire quoi que ce soit, puis `reprise/ECHANGES.md` si tu as besoin du détail d'une discussion. Tout ce qui a été fait, décidé et laissé en suspens est ici.
>
> **Pour Nadir** : ce fichier résume trois semaines de travail (3 → 21 novembre 2026). Les échanges complets sont dans [ECHANGES.md](ECHANGES.md).

Dernière mise à jour : **24/11/2026**. État du code : branche `main` de `ValerionGG/rgte-redesign`, après la PR #9 (version 3.12 de SEO 360, plugin 3.4.0, dossier `reprise/`).

---

## 1. Reprendre en 5 minutes sur un autre PC

```bash
# 1. Récupérer le dépôt (tout le code, les skills, le plugin, la plateforme, ce dossier de reprise)
git clone https://github.com/ValerionGG/rgte-redesign.git
cd rgte-redesign

# 2. Vérifier que tout marche (Node 18 ou plus, aucune dépendance à installer)
NO_PROXY=127.0.0.1 node --test seo/test/engine.test.mjs      # attendu : 51 tests, 0 échec

# 3. Lancer une analyse
node seo/cli.mjs rgte.eu --crawl 15                           # audit SEO complet → rapports-seo/
node seo/cli.mjs presence rgte.eu --concurrents ocf.fr,pousstronic.pro   # présence en ligne
```

Ensuite, ouvre **Claude Code** dans ce dossier : les 21 skills de `.claude/skills/` se chargent tout seuls, et le fichier `CLAUDE.md` à la racine renvoie ici.

**Clés facultatives** (ne jamais les écrire dans le dépôt) :
| Variable | À quoi elle sert | Où l'obtenir |
|---|---|---|
| `PSI_KEY` | mesurer la vitesse (PageSpeed) : sans clé, le quota gratuit partagé est presque toujours épuisé | https://developers.google.com/speed/docs/insights/v5/get-started#APIKey (gratuit, 2 min) |
| `JINA_API_KEY` | lecture de secours des sites quand le réseau bloque (VPN, entreprise, centre de données) | https://jina.ai/reader/ (gratuit) |
| `GITHUB_TOKEN` | auditer des dépôts GitHub au-delà de 60 requêtes/heure | réglages GitHub › Developer settings |

**Installer SEO 360 partout (Claude, Cowork, Claude Code)** : dans l'application Claude, *Personnaliser › Plugins › Ajouter une marketplace*, saisir `ValerionGG/rgte-redesign`, puis installer `seo360` (et, si besoin, les packs tiers relus : voir §6). En ligne de commande : `/plugin marketplace add ValerionGG/rgte-redesign` puis `/plugin install seo360@seo360-fr`.

---

## 2. Les liens à garder

| Quoi | Lien |
|---|---|
| Dépôt (tout est là) | https://github.com/ValerionGG/rgte-redesign |
| **Plateforme SEO 360 en ligne** | https://valeriongg.github.io/rgte-redesign/seo/ |
| **SEO 360 sur Dokploy** (branche `recherche-enrichissement`, toutes les sources 1 à 9) | https://seo360.217-160-124-232.nip.io/seo/ — projet « SEO 360 », application « site » sur https://dokploy.m3.games (réglages : `deploy/dokploy/README.md`) |
| Lien d'analyse direct | `https://valeriongg.github.io/rgte-redesign/seo/#analyser=rgte.eu` |
| Page SEO 360 sur claude.ai (privée, version 10) | https://claude.ai/artifact/6qeKMCsVCp3BW6kLSDt1xk |
| Les 10 maquettes de refonte RGTE (galerie) | https://valeriongg.github.io/rgte-redesign/ |
| Chantier SEO RaceLink (autre dépôt, branche `seo`) | https://github.com/ValerionGG/racelink-veille/tree/seo |
| Session Claude Code d'origine | https://claude.ai/code/session_017gAFbzdSUwRA8YnkLWk7NU |

---

## 3. Ce que contient le dépôt

| Dossier ou fichier | Contenu |
|---|---|
| `a/`, `b/`, `v2/`, `v3/`, `docs/*.html`, `BRIEF.md` | Les **10 propositions de refonte du site RGTE** (Vitrine, Minéral, Atelier, Cryo, Rouge, Studio, Maison, Cacao, Plan, Halles), 6 pages chacune, en `noindex` (maquettes). Brief et contenus réels dans `BRIEF.md`. |
| `seo/` | **SEO 360** : moteur d'audit (`engine/`), ligne de commande (`cli.mjs` et sous-commandes), interface web (`index.html`, `app.js`, `app.css`), données datées (`data/`), tests (`test/`), proxy Cloudflare facultatif (`proxy/`). |
| `seo/README.md` | Mode d'emploi détaillé de la plateforme et de la ligne de commande. |
| `seo/ETUDE-CONCURRENTIELLE.md` | Étude du marché des outils SEO, des projets open source, des skills d'agent, et le benchmark « profil de présence » (§5 ter). |
| `seo/AUDIT-CONSEIL.md`, `seo/PRIVACY.md`, `seo/SECURITY.md` | Conseil d'agents v1→v2, confidentialité (qui reçoit quoi), sécurité. |
| `.claude/skills/` | **21 skills** en français (source). |
| `plugins/seo360/` | Le plugin généré (skills + moteur embarqué + 63 évaluations). Ne pas modifier à la main : `node seo/plugin.mjs`. |
| `.claude-plugin/marketplace.json` | Le catalogue `seo360-fr` : SEO 360 + 12 packs tiers relus, épinglés au commit relu. |
| `docs/seo/` | La plateforme publiée (générée par `node build.mjs`). |
| `reprise/` | **Ce dossier** : ce fichier, les échanges, les annexes (conseils d'agents, rapports RGTE, recherches). |

### Les 21 skills

`seo-360` (point d'entrée) · `plan-croissance-360` · `seo-audit-technique` · `diagnostic-baisse-trafic` · `seo-local` · `avis-clients-reputation` · `conversion-site` · `contenu-seo-redaction` · `netlinking-mentions-locales` · `geo-visibilite-ia` · `veille-sociale` · `hashtags-reseaux` · `contenus-reseaux-video` · `calendrier-marketing-fr` · `budget-publicite` · `conformite-marketing-fr` · `benchmark-concurrents` · `aso-application` · `github-seo` · `suivi-performance-mensuel` · `contexte-entreprise`.

### La ligne de commande

```bash
node seo/cli.mjs <site | lien App Store/Play | owner/repo> [--secteur id] [--mot-cle "…"] [--ville X] [--marque X] [--crawl 15] [--concurrents a,b] [--avant ancien.json] [--html page.html] [--robots robots.txt] [--lecture auto|direct|jina]
node seo/cli.mjs presence <site> [--marque X] [--concurrents a,b] [--avant ancien-presence.json]
node seo/cli.mjs gsc export.zip [--avant export-precedent.zip] --marque X
node seo/cli.mjs fiche --store apple|play --nom … --sous-titre … --mots-cles … [--marques "f1,motogp"]
node seo/cli.mjs veille "<sujet>" | calendrier [année] | budget … | hashtags … | outils [--rapport x.json]
node seo/cli.mjs --aide
```

### Construire et publier

```bash
node build.mjs                 # régénère docs/ (galerie + plateforme)
node seo/plugin.mjs            # régénère plugins/seo360 et le catalogue
node seo/artifact.mjs <dossier>   # prépare la version claude.ai de la plateforme
claude plugin validate .       # valide le catalogue
```

GitHub Pages publie la branche `main` (dossier `docs/`) en 1 à 2 minutes après chaque fusion.

---

## 4. L'histoire du projet, demande par demande

| Date | Ce que Nadir a demandé | Ce qui a été fait |
|---|---|---|
| 03/11 | Des skills et une plateforme SEO : hashtags pour tous les réseaux, référencement naturel et payant, budgets, « je rentre un site ou une app et ça me dit tout ce que je dois corriger » ; Agent Reach, étude concurrentielle, benchmark. | Moteur d'audit sans dépendance, plateforme web, premiers skills, recherche concurrentielle. |
| 03/11 | « Atteins un objectif meilleur, audite ta solution en UX et efficacité. » | **Conseil d'agents v1→v2** : 5 experts, relecture à l'aveugle, ≈ 31/100 → ≈ 71/100 (`seo/AUDIT-CONSEIL.md`). |
| 05/11 | « Continue et améliore, cherche des skills GitHub sur Agent Reach, Reddit, GitHub. » | 58 dépôts étudiés, packs tiers relus commit par commit, skills réécrits et intégrés. |
| 05/11 | Donner un lien (site, app) → toutes les améliorations payantes ou non, les meilleurs outils avec guides d'installation, être premier sur Google, TikTok, Instagram : un plan exceptionnel. Chercher Claude SEO et tous les skills possibles. | Skill `plan-croissance-360`, boîte à outils datée (51 outils, guides pas à pas), Search Console complet, calendrier français, contrôle avant dépense pub. L'installation automatique des packs tiers a été refusée par le contrôle de sécurité de la session. |
| 05/11 | Mettre la plateforme en ligne, l'auditer avec plusieurs agents qui se notent sur 100 jusqu'à approcher 100, avec benchmark. | Mise en ligne GitHub Pages ; **conseil v3** (5 experts + 5 relecteurs + critique indépendant : ancienne version 52,5 → nouvelle 73/100). |
| 05/11 | « Continue d'améliorer pour qu'on puisse tout en temps réel. » | Page claude.ai en temps réel : Claude dans la page, synchronisation, téléchargements. |
| 06/11 | « Améliore l'UI et l'UX, sois créatif, inspire-toi de Pinterest, Dribbble, Behance. » | Refonte « tableau d'épingles » : polices auto-hébergées, thèmes clair/sombre, bento, barre d'onglets mobile, « Épingler » et « Mon tableau ». |
| 08/11 | « Je veux mieux et une plateforme fonctionnelle en ligne. » | Premier test réel : 111 s et mauvais secteur (2 services de lecture en panne). Corrigé : 12 s, robots.txt lu, secteur B2B reconnu (PR #2, #3). |
| 08/11 | Les résultats et propositions ne plaisent pas : garder ça en local pour Claude Code, Cowork et Claude ; installer tous les skills et plugins vérifiés. | Les skills font maintenant faire **l'analyse par Claude** (lecture du site, vraies recherches, vrais concurrents, réécritures exactes, test de spécificité). Catalogue unique installable depuis l'app Claude (PR #4). |
| 12/11 | « On doit tout améliorer : design, résultat, conseil, outil. » | Diagnostic en clair, description proposée sans trous, 3 actions équilibrées, sitemap incomplet détecté, clé Jina (PR #5). |
| 12/11 | Intégrer les conseils et skills de la session « audit SEO RaceLink » et tout installer. | Leçons RaceLink dans les skills, 3 nouveaux contrôles (liens vers un site de test, og:url sur un autre domaine, boutons Télécharger sans store), contrôle des fiches de stores en octets, correction d'un faux positif qui plafonnait à tort des notes à 40 (PR #6). |
| 17/11 | « Continue. » | Onglet « À faire » allégé (PR #7). |
| 17/11 | Un outil de profiling qui trouve les réseaux, les apps, absolument tout ; un benchmark et une étude concurrentielle pour faire mieux. | **Profil de présence** : 47 plateformes, SIREN croisé avec le registre, bloc sameAs, matrice « qui est où », benchmark de 12 outils (PR #8). |
| 21/11 | Tout mettre sur GitHub avec un fichier qui contient absolument tout, pour reprendre sur un autre PC. | Ce dossier `reprise/` (PR #9). |
| 24/11 | « Relance en ligne et en local. » | En ligne : publication du 21/11 réussie, la page répond 200. En local sur le PC Windows (`D:\Claude\SEO\rgte-redesign`) : serveur sur http://localhost:8000/seo/, audit de rgte.eu à **71/100** (15 pages). 8 tests sur 51 échouaient sous Windows (chemins `/D:/…`, fins de ligne CRLF) : corrigé par `fileURLToPath` et un `.gitattributes`. |
| 24/11 | La plateforme est « trop faible et pauvre en propositions » : chercher skills, outils et dépôts GitHub pour l'enrichir ; installer Agent Reach. | Liste priorisée `annexes/recherches/enrichissement-plateforme-2026-11-24.md` : 9 sources gratuites testées depuis le PC (YouTube, Amazon, DuckDuckGo, Google Tendances, hashtags Mastodon, Wayback, Common Crawl…), 6 dépôts d'inspiration, 3 packs à relire. Agent Reach 1.6.1 installé depuis GitHub (programme seulement : `agent-reach setup` reste à lancer par Nadir). |
| 24/11 | « Brancher les sources. » | Nouveau module `seo/engine/demande.js` : **demande réelle** tirée des autocomplétions Google, YouTube, Amazon.fr et DuckDuckGo sur 39 variantes (questions, a…z), fusionnées avec leurs sources ; recherches d'autres pays et voisines mises à part ; tendances Google du jour (France). Sur « vitrine réfrigérée » : 275 idées, 57 confirmées par 2 sources ou plus, 3 vraies questions, en 2,4 s. Commande `node seo/cli.mjs demande "<mot>"`, intégrée à l'audit (`--sans-demande` pour l'éviter), au rapport Markdown et à l'onglet « Mots-clés & réseaux » (le navigateur n'interroge que Google et YouTube). 55 tests sur 55. |
| 24/11 | « Continue » (source 6). | Nouveau module `seo/engine/mastodon.js` : **hashtags réellement employés**, lus sur l'API publique de Mastodon (sans clé) ; comptés en comptes distincts, robots exclus, cooccurrences limitées aux publications en français de moins de 2 ans. Ils passent en tête des réseaux (2 sur Instagram et TikTok), marqués « observé (N comptes) ». Boulangerie : #croissant 55 comptes, #painaulevain 16, avec #levain, #boulangerie, #petitdejeuner. RGTE : #surmesure 28 comptes ; #vitrinerefrigeree, #agencementmagasin, #fabricantfrancais : 0 publication. Dans l'audit, `hashtags`, le rapport et l'onglet (lecture directe depuis le navigateur). 58 tests sur 58. |
| 24/11 | « Continue » (sources 7 à 9). | Nouveau module `seo/engine/empreinte.js` : pour vous et chaque concurrent, **régies publicitaires** (pixels dans la page et dans le conteneur Google Tag Manager, avec preuve), **historique Wayback** (âge, mois archivés, titre d’accueil au fil des ans), **pages vues par Common Crawl** (dernier index, seconde tentative si le serveur sature). Constats comparatifs uniquement à partir de faits mesurés. RGTE contre OCF et Pousstronic : RGTE a un pixel Google Ads (AW-986852039, vérifié dans le code), les deux autres aucun ; OCF archivé depuis 1998, RGTE depuis 2019, Pousstronic depuis 2025 ; Common Crawl : 102 pages OCF, RGTE et Pousstronic absents de l’index de novembre. Dans l’audit (`--sans-empreinte`), le rapport et l’onglet Concurrents ; la mémoire locale garde désormais demande, Mastodon et empreinte après un rechargement. 61 tests sur 61. |
| 25/11 | « Remets en ligne le tout avec le Dokploy. » | Nouveau projet **SEO 360** (application « site ») sur le Dokploy partagé de M3, sans toucher aux autres projets : dépôt public, branche `recherche-enrichissement`, `deploy/dokploy/Dockerfile` (nginx sert `docs/`), domaine https://seo360.217-160-124-232.nip.io en HTTPS (Let's Encrypt). Vérifié : galerie et `/seo/` en 200, nouveaux modules servis, demande réelle et Mastodon fonctionnent en ligne. GitHub Pages (`main`) inchangé. |

### Les PR fusionnées

| PR | Version | Contenu |
|---|---|---|
| #2 | 3.6 | Plateforme en ligne, 21 skills, plugin, temps réel claude.ai, refonte visuelle |
| #3 | 3.7 | Lecture fiable en ligne (Jina en course, services en panne écartés), secteur B2B |
| #4 | 3.8 | Analyse menée par Claude, catalogue des packs relus |
| #5 | 3.9 | Diagnostic en clair, conseils sans trous, actions équilibrées |
| #6 | 3.10 | Leçons du chantier RaceLink, contrôle des fiches de stores |
| #7 | 3.11 | Onglet « À faire » allégé |
| #8 | 3.12 | Profil de présence et benchmark |

---

## 5. Décisions prises (et pourquoi)

| Décision | Raison |
|---|---|
| **Rien d'inventé** : pas de note sans mesure, pas de volume, position, prix ou compte sans source ; sinon « non vérifié ». | Règle de base de Nadir sur tous les projets. |
| Le moteur **mesure**, Claude **analyse** (skills `seo-360` et `plan-croissance-360`, étape « analyse experte » et « test de spécificité »). | Les propositions générées par des règles ont déçu Nadir. |
| Lecture des pages en ligne : AllOrigins, CodeTabs et Jina Reader en course ; un service en panne est écarté pour toute l'analyse. | AllOrigins et CodeTabs sont en panne depuis début novembre ; Jina lit vite et donne le vrai code HTTP. |
| Packs tiers **épinglés au commit relu** dans le catalogue, jamais installés automatiquement par Claude. | Une mise à jour d'un auteur tiers ne doit pas arriver sans relecture ; le contrôle de sécurité refuse l'installation de code externe. |
| Les noms `claude-*` sont réservés : les packs s'appellent `audit-seo-avance` (claude-seo), `audit-publicite` (claude-ads), `blog-seo` (claude-blog). | Règle de `claude plugin validate`. |
| Chaque fusion dans `main` est demandée à Nadir (question « Je fusionne ? »). | `main` publie le site en ligne. |
| Français, tutoiement, phrases courtes, tableaux, termes techniques expliqués. | Préférences de Nadir. |
| Dépôt RaceLink : **jamais** toucher à `main` (chaque push publie des posts sur les réseaux) ; travailler seulement sur la branche `seo`. | Consigne du `CLAUDE.md` de racelink-veille. |

---

## 6. Packs tiers relus (catalogue `seo360-fr`)

Relus le 05/11/2026, licence MIT, épinglés au commit relu. Détail, coûts en jetons et précautions : `.claude/skills/plan-croissance-360/references/packs-complementaires.md`.

| Nom à installer | Projet d'origine | Commit relu | Quand |
|---|---|---|---|
| `audit-seo-avance` | AgriciDaniel/claude-seo | 6be93f4 | audit SEO approfondi |
| `audit-publicite` | AgriciDaniel/claude-ads | fc3908e | si publicité |
| `web-quality-skills` | addyosmani/web-quality-skills | afa8da9 | vitesse, accessibilité |
| `instagram-skills`, `linkedin-skills` | sergebulaev | 550d3cf, 8f8bc4b | selon les réseaux |
| `social-media-research-skills` | ScrapeCreators | 64ba7b4 | demande une clé payante |
| `youtube` | AgriciDaniel/claude-youtube | 84c3fa6 | chaîne YouTube (clé API YouTube) |
| `aso-skills`, `blog-seo`, `local-seo-skills`, `last30days`, `marketing-skills` | divers | voir le fichier | seulement si besoin (lourds) |

Précautions : connexion Google de claude-seo trop large (préférer un compte de service en lecture seule), pied de page publicitaire à retirer, pas d'extensions Bing/Ahrefs ; pas de service Appeeky pour aso-skills.

---

## 7. Ce qu'on sait de RGTE (www.rgte.eu)

| Point | État mesuré | Source |
|---|---|---|
| Activité | fabricant et agenceur de vitrines réfrigérées sur mesure pour métiers de bouche ; bureau d'études et show-room à Puget-sur-Argens (83480) ; tél. 0 800 95 13 13 | site, `BRIEF.md` |
| Note SEO 360 | 73/100 avec exploration du site (82 sur la page d'accueil seule) | audit du 12/11 |
| Juridique | « Mentions légales », « Conditions de vente », « Gestion des cookies » écrits sans lien ; Google Analytics sans bandeau de consentement ; pas de politique de confidentialité ; **aucun SIREN affiché** | audits du 08 et 12/11 |
| Google | pas de meta description ; titre sans la marque ; **sitemap : 1 page listée pour au moins 85 sur le site** ; favicon cassé (`https://www.rgte.euimg/favicon.ico`) | audits |
| Présence en ligne | **0 plateforme reliée depuis le site** (ni réseau, ni fiche Google) ; concurrent ocf.fr : 4 ; pousstronic.pro : 3 | profil de présence du 17/11 |
| Registre | « R G T E », SIREN 501609507, 83480 Puget-sur-Argens, active (reconnue par le code postal : **à confirmer** avant de l'afficher) | recherche-entreprises.api.gouv.fr |
| Concurrents repérés (non vérifiés à la main) | OCF (Sigournais, 85), La Vitrine Française (Saint-Agathon, 22), TECMAG / EVEMA (Vitré, 35), FMA Concept (Saint-Étienne, 42), Pousstronic (Montady, 34) | `annexes/recherches/benchmark-outils-presence-2026-11-17.md` |
| Refonte | les 10 maquettes sont rendues en JavaScript (≈ 2 mots dans le HTML) : la proposition retenue devra être exportée en **HTML statique** avant de remplacer rgte.eu | revue du 08/11 |

Rapports complets : `annexes/rgte/`.

---

## 8. Ce qui reste à faire

| # | Quoi | Qui | Note |
|---|---|---|---|
| 1 | Installer `seo360` (et les packs utiles) depuis l'app Claude › Personnaliser › Plugins | Nadir | 2 min ; sert ensuite dans Cowork, le chat et Claude Code |
| 2 | Créer une clé PageSpeed et la mettre dans `PSI_KEY` | Nadir | sans elle, la vitesse n'est presque jamais mesurée |
| 3 | RGTE : liens « Mentions légales », CGV et cookies, bandeau de consentement, SIREN, meta description, sitemap complet, lien vers les réseaux et la fiche Google | webmaster RGTE | correctifs prêts dans l'onglet « À faire » de la plateforme |
| 4 | Choisir une des 10 maquettes et l'exporter en HTML statique | Nadir + dev | avant toute mise en ligne de la refonte |
| 5 | Choisir une licence pour le dépôt | Nadir | aucune pour l'instant |
| 6 | Alléger les onglets « Mots-clés & réseaux » et « Budget » | Claude | proposé, pas encore fait |
| 7 | Analyse complète d'un site par Claude avec la nouvelle méthode (rgte.eu ou le lien testé par Nadir) | Claude | proposé ; le lien testé le 08/11 n'a jamais été donné |
| 8 | Fiabilité de lecture permanente : déployer le proxy Cloudflare (`seo/proxy/`) | Nadir | facultatif |
| 9 | Vérifier à la main que chaque profil social renvoie bien au site | Claude dans le navigateur | les réseaux refusent la lecture automatique |
| 10 | Lancer `agent-reach setup` (installe le skill officiel pour Claude Code) | Nadir | le contrôle de sécurité de la session l'a refusé à Claude le 24/11 |
| 11 | Sources gratuites : **faites** le 24/11 pour les sources 1 à 9 (YouTube, Amazon, DuckDuckGo, variantes, tendances). **Faites** aussi : hashtags observés sur Mastodon (source 6) et empreinte marketing des concurrents (sources 7 à 9). **Reste** : la relecture des 3 packs de la priorité 3, seulement si Nadir le veut | Claude | voir `annexes/recherches/enrichissement-plateforme-2026-11-24.md` §5 |

---

## 9. Environnement de la session cloud (si on reprend dans Claude Code sur le web)

- Environnement « Environnement Cloud par défaut » : réseau limité, hôtes autorisés ajoutés avec l'accord de Nadir : `valeriongg.github.io`, `api.allorigins.win`, `api.codetabs.com`, `r.jina.ai`, `suggestqueries.google.com`, `recherche-entreprises.api.gouv.fr`, `itunes.apple.com`.
- Depuis un centre de données, Jina refuse parfois sans clé (401) et Apple répond 403 : sur un PC personnel, ces limites n'existent pas.
- Une session cloud ne garde pas les plugins installés : passer par l'app Claude (le compte), qui les synchronise.

---

## 10. Les annexes de ce dossier

| Fichier | Contenu |
|---|---|
| [ECHANGES.md](ECHANGES.md) | Tous les messages de Nadir, ses réponses aux questions (décisions), toutes les réponses de Claude, les résumés automatiques |
| `annexes/conseil-v2/` | Conseil d'agents v1→v2 : brief, réponses des 5 experts, relectures notées, scores, verdict du critique |
| `annexes/conseil-v3/` | Conseil v3 : briefs, réponses anonymisées, relectures, scores, rapport et verdict du critique indépendant |
| `annexes/rgte/` | Audit SEO 360 de rgte.eu (08/11) et profil de présence RGTE contre 5 concurrents (17/11), en Markdown et JSON |
| `annexes/recherches/` | Benchmark des outils de présence (17/11), notes et catalogue des skills GitHub étudiés, liste priorisée pour enrichir la plateforme (24/11) |
| `outils/export_echanges.py` | Le script qui a produit `ECHANGES.md` à partir de l'historique de Claude Code |

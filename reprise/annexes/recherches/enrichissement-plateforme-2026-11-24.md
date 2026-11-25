# Enrichir SEO 360 : sources, skills et dépôts (24/11/2026)

**Le problème** : Nadir trouve la plateforme `/seo/` trop faible et pauvre en propositions. En lisant le moteur, on voit pourquoi : les hashtags sont générés par des règles (secteur, ville, marque) sans aucune donnée d'usage réel, et les mots-clés ne viennent que des suggestions Google. Les propositions se ressemblent donc d'un site à l'autre.

**La piste retenue** : nourrir les propositions avec de **vraies données gratuites**, puis seulement ensuite ajouter des packs. Tout ce qui suit a été vérifié le 24/11/2026 depuis le PC de Nadir (code HTTP mesuré) ou sur l'API GitHub (étoiles, licence, dates). Ce qui n'a pas été testé est marqué « non testé ».

---

## 1. Priorité 1 : données gratuites, sans clé, à brancher dans le moteur

Ces sources s'intègrent au moteur actuel sans dépendance (un simple `fetch`).

| # | Source | Ce que ça apporte à la plateforme | Test du 24/11 | Effort |
|---|---|---|---|---|
| 1 | Autocomplétion **YouTube** (`suggestqueries.google.com`, `ds=yt`) | ce que les gens tapent sur YouTube, pour les titres et hashtags vidéo | 200, 3 suggestions pour « vitrine refrigeree » | faible |
| 2 | Autocomplétion **Amazon.fr** (`completion.amazon.fr`) | intentions d'achat (« à poser », « sur mesure »), utile e-commerce et fiches produit | 200, 10 suggestions | faible |
| 3 | Autocomplétion **DuckDuckGo** (`duckduckgo.com/ac`) | deuxième source web pour confirmer une suggestion Google | 200, 8 suggestions | faible |
| 4 | Variantes automatiques des suggestions : « mot + a…z », « comment / pourquoi / prix / près de » | 10 à 30 fois plus d'idées, et de vraies questions pour la FAQ | dépend des sources 1-3 | faible |
| 5 | **Google Tendances** du jour, France (`trends.google.com/trending/rss?geo=FR`) | sujets qui montent aujourd'hui, à relier au calendrier marketing et à la veille | 200, flux RSS de 23 Ko | faible |
| 6 | **Hashtags réellement employés** sur Mastodon (`/api/v1/timelines/tag/<tag>`) | hashtags qui reviennent avec le tag de départ (cooccurrence), donc des hashtags observés et non inventés | 200, publications du 22/11 | moyen |
| 7 | **Historique Wayback Machine** (`web.archive.org/cdx`) | âge du site, dates des refontes, anciens titres des concurrents (leur repositionnement dans le temps) | 200 (rgte.eu archivé depuis 2018) | moyen |
| 8 | **Pixels publicitaires des concurrents** (Meta, Google Ads, TikTok, LinkedIn, y compris dans le conteneur Google Tag Manager) | « ce concurrent achète de la pub sur Meta et Google, pas sur TikTok » : le benchmark gagne une colonne publicité | le moteur détecte déjà GTM et Meta sur le site audité, pas encore chez les concurrents | moyen |
| 9 | **Common Crawl** (`index.commoncrawl.org`) | nombre de pages d'un concurrent vues par un robot public, sans clé | 200 (index de novembre 2026) | moyen |

**Ce qui ne marche pas en automatique (testé)** :

| Source | Résultat | Ce qu'on fait à la place |
|---|---|---|
| Recherche Bluesky publique | 403 | via Agent Reach ou à la main |
| Reddit (JSON public) | 403 « Blocked » | Agent Reach avec connexion (`agent-reach add reddit`) |
| Bibliothèque publicitaire Meta | page à défi anti-robot | Claude l'ouvre dans le navigateur, ou le MCP payant ci-dessous |
| TikTok Creative Center (hashtags tendance) | redirection, lecture automatique refusée | Claude l'ouvre dans le navigateur |
| Autocomplétion Bing | 204, réponse vide | abandonné |
| Classement Tranco | 200 mais vide pour ocf.fr | inutile pour les PME |

---

## 2. Priorité 2 : idées à reprendre des dépôts récents

Étoiles relevées le 24/11/2026 sur l'API GitHub. Ces dépôts servent d'**inspiration** : on réécrit l'idée dans notre moteur, on n'intègre pas leur code.

| Dépôt | ★ | Licence | Idée à prendre | Prudence |
|---|---:|---|---|---|
| [dansugc/reverse-engineer-marketing](https://github.com/dansugc/reverse-engineer-marketing) | 1 088 | MIT | « Un lien → toute la machine marketing » : pixels, GTM, sitemaps, position face aux robots d'IA, historique Wayback, stores. Chaque fait cite sa preuve. C'est exactement le benchmark concurrent qu'il nous manque (sources 7 et 8). | créé le 18/10 avec un seul envoi de code : vérifier le code avant toute utilisation ; ses parties payantes passent par ScrapeCreators |
| [Auriti-Labs/geo-optimizer-skill](https://github.com/Auriti-Labs/geo-optimizer-skill) | 1 377 | MIT | Score « prêt pour les IA » en 9 catégories, 27 robots d'IA vérifiés, générateur et vérificateur de `llms.txt` | à comparer à notre onglet IA (88/100 sur rgte.eu) avant de dupliquer |
| [jdevalk/specification.website](https://github.com/jdevalk/specification.website) | 927 | non déclarée | Spécification d'un site bien fait (HTML, accessibilité, sécurité, SEO, agents), par le fondateur de Yoast : une bonne base pour vérifier qu'il ne manque aucun contrôle | licence floue : lire, ne pas copier |
| [everyinfra/seo-skills](https://github.com/everyinfra/seo-skills) | 560 | Apache-2.0 | Un dossier « marché français » écrit en octobre 2026, la règle « chaque affirmation a une source et une date de péremption », une porte qualité en intégration continue | s'installe par `curl … | bash` : ne pas lancer, lire seulement |
| [Shaivpidadi/trends-js](https://github.com/Shaivpidadi/trends-js) | 29 | MIT | Google Trends en JavaScript : sujets et requêtes associés, courbe d'intérêt (saisonnalité) | petit projet ; non testé |
| [eliasdabbas/advertools](https://github.com/eliasdabbas/advertools) | 1 508 | MIT | Référence Python pour robots.txt, sitemaps, SERP et analyse de mots | Python : inspiration seulement |

---

## 3. Priorité 3 : packs à relire pour le catalogue (Claude Code)

À ajouter au catalogue `seo360-fr` seulement après relecture et épinglage au commit, comme les 12 packs existants. Rien n'a été installé.

| Pack | ★ | Licence | Ce qu'il ajoute | Coût ou condition |
|---|---:|---|---|---|
| [nowork-studio/notfair-plugin](https://github.com/nowork-studio/notfair-plugin) | 4 307 | MIT | 45 skills : Google Ads, Meta Ads, LinkedIn Ads, TikTok Ads, GA4, Search Console, WordPress | utile seulement si on connecte les comptes pub et analytics |
| [TubeLabHQ/youtube-research-skills](https://github.com/TubeLabHQ/youtube-research-skills) | 329 | MIT | vidéos hors norme d'une niche, rapports de tendance, critique d'une chaîne | service TubeLab payant (crédits, dès le forfait Starter) |
| [proxy-intell/facebook-ads-library-mcp](https://github.com/proxy-intell/facebook-ads-library-mcp) | 332 | MIT | les pubs Meta en cours d'un concurrent, et ce qui a changé depuis la dernière fois | 20 crédits gratuits par jour, ou clé ScrapeCreators payante |

**Écartés** :

| Dépôt | Raison |
|---|---|
| Illyism/seo-skills (2 080 ★) | aucune licence : on ne peut pas le réutiliser |
| every-app/open-seo (28 764 ★), crawlseo/crawlseo (722 ★), AgriciDaniel/keywordpro (308 ★) | lourds à héberger (Docker, PostgreSQL) et les données de mots-clés passent par DataForSEO, payant. Ils seront utiles plus tard si Nadir veut des volumes de recherche réels : à lui de décider |
| Générateurs de hashtags GitHub | tous anciens ou minuscules (moins de 50 ★), aucun ne mesure l'usage réel |

---

## 4. Agent Reach

| Point | État |
|---|---|
| Source officielle | [Panniantong/Agent-Reach](https://github.com/Panniantong/Agent-Reach), MIT, 114 398 ★, mis à jour le 22/11/2026. Le paquet PyPI du même nom n'est **pas** ce projet. |
| Programme | **installé** le 24/11 avec `uv tool install` depuis la publication GitHub v1.6.1 (`C:\Users\APL TECH\.local\bin\agent-reach.exe`) |
| Skill pour Claude Code | **pas encore** : `agent-reach setup` a été bloqué par le contrôle de sécurité de la session (il modifie la configuration de toutes les IA du PC). Nadir doit le lancer lui-même, voir ci-dessous. |
| Canaux sans réglage | GitHub, web, V2EX (« non vérifiés » tant que `agent-reach check` n'a pas tourné) |
| Canaux à ajouter | YouTube (installe ffmpeg), Reddit, X, Instagram, Facebook, LinkedIn : connexion faite par Nadir, idéalement avec un compte secondaire |
| Ancienne copie | `C:\Users\APL TECH\.claude\skills\agent-reach` contenait une copie « migrée » par un autre outil (Hermes), qui ne correspond pas au skill officiel. `setup` la remplacera. |

Commandes à lancer par Nadir dans PowerShell :

```powershell
$env:PATH = "$HOME\.local\bin;$env:PATH"; agent-reach setup
```

Puis, pour garder la commande dans tous les terminaux : `uv tool update-shell`.

---

## 5. Ordre proposé

| Étape | Quoi | Pourquoi d'abord |
|---|---|---|
| 1 | Sources 1 à 5 dans l'onglet « Mots-clés & réseaux » | gain le plus visible pour un effort faible, gratuit |
| 2 | Hashtags observés (source 6) avec la mention « observé sur Mastodon » à côté des hashtags proposés | fin des hashtags purement inventés |
| 3 | Benchmark concurrent enrichi : pixels pub, historique Wayback, taille du site (sources 7 à 9) | répond à « faire mieux que les concurrents » avec des preuves |
| 4 | Relecture des 3 packs de la priorité 3 | seulement si Nadir le veut |

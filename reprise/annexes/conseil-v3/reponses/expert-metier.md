## Réponse

Tests : CLI, 5 pages pièges servies en local (ports 8901-8905, dossier `/tmp/claude-0/-home-user-rgte-redesign/137803cc-e0f1-5e43-837f-1ccac4c64755/scratchpad/conseil-v3/travail/expert-metier/pieges`), interface en 1366 et 390 px, 7 moteurs, 5 skills (dont seo-360 et plan-croissance-360), 19 recherches web.

### 1. Note : 71/100

| Critère (poids) | Note | Justification |
|---|---:|---|
| Honnêteté, exactitude (20) | 7 | 7 faits datés vérifiés, tous exacts ; mais faux positifs sur les installations que l'outil conseille. |
| Recommandations (25) | 6,5 | Correctifs et contrôle avant dépense solides ; achat de liens, budget e-commerce faux. |
| Parcours (20) | 7 | 3 actions claires, pas de défilement horizontal à 390 px ; peu testé ici. |
| Multicanal (15) | 8 | Google, local, IA, 12 régies, réseaux, 51 outils ; ni volumes, ni positions, ni liens. |
| Robustesse (10) | 6,5 | 34 tests sur 35 (`plugins/seo360/seo/engine/outils.js` sans `shortPrice`) ; détection par regex fragile. |
| Différenciation (10) | 8 | CNIL et LCEN, robots IA en 3 niveaux, Content-Signal, note honnête, gratuit. |

### 2. Les 8 problèmes

1. **Critique : l'outil pénalise ses propres correctifs.** GA4 et pixels sont cherchés par regex (`seo/engine/audit.js:30-33`). Le guide tarteaucitron fait remplacer le code par `tarteaucitron.user.gtagUa` (`seo/data/research/outils.json:491`). Piège t1 : « Aucun outil de mesure d'audience détecté » dans les 3 actions, GA4 et GTM conseillés (balise en double), verdict pub suspendu. Le guide Consent Mode propose GTM (`outils.json:104`). Piège t2 (GTM seul) : « ✗ Consent Mode v2… obligatoire (CNIL) » (`seo/engine/ads.js:167` : `/Tag/` capte GTM), alors que l'audit donne 100 en RGPD.
2. **Élevée : faux positifs locaux.** La microdata est ignorée (`seo/engine/html.js:231`). Piège t3 (Bakery en microdata) : « Pas de schéma LocalBusiness » dans les 3 actions, plus 3 constats faux. Piège t5 (plombier sans local, `areaServed`) : « Adresse (NAP) introuvable » dans les 3 actions, « types conseillés absents » alors que Plumber est un sous-type. Le skill seo-local (§3) dit l'inverse.
3. **Élevée : achat de liens recommandé.** Onglet Budget, carte « Et le SEO ? » : « 80 à 400 € par lien de qualité, 2 à 5 par mois » (`ads.js:235`, vu en 1366 et 390 px). Contraire aux règles anti-spam de Google et au pack (`.claude/skills/netlinking-mentions-locales/SKILL.md:20`).
4. **Élevée : budget e-commerce faux.** `node seo/cli.mjs budget --secteur ecommerce --objectif ventes --valeur 60` : budget conseillé 1 500 € = minimums PMax + Meta (`ads.js:96`), puis la répartition 750/750 écarte PMax (`ads.js:101-108`). Résultat : 100 % Meta, contre le skill budget-publicite. « Rentable : 106 ventes » suppose un ROAS de 4,2 (conversion Meta 2 à 9 %, `benchmarks.json:40`) ; médiane Triple Whale 2024 : 2,04. Les hypothèses par défaut (marge, signature) ne sont pas affichées.
5. **Élevée (GEO) : `nosnippet` et `max-snippet:0` ignorés.** Ils retirent la page des AI Overviews et d'AI Mode, lancés en France le 22/07/2026. Piège t4 : « 100 Visibilité IA ». Le code le sait (`seo/engine/robots.js:58`) sans le vérifier. Erreur voisine : bloquer ChatGPT-User « empêche » la lecture (`audit.js:153`) ; OpenAI écrit que robots.txt « peut ne pas s'appliquer ».
6. **Moyenne : priorités mal pondérées.** Mêmes poids pour tous les secteurs : local 6 %, social 7 %, vitesse 17 % (`audit.js:8-17`), alors que l'étude interne dit que les Core Web Vitals servent surtout à départager. Site de test : « PerplexityBot » passe avant GA4 et le pixel Meta déposés sans consentement, renvoyés à 30 jours (`seo/engine/plan.js:16` ignore le risque légal). Boulangerie sans pub : pixels Meta et TikTok avec API serveur « cette semaine » (`seo/engine/outils.js:62-63`).
7. **Moyenne : gains Search Console surestimés.** Courbe de CTR sans réponses IA (`seo/engine/gsc.js:5-11`). `node seo/cli.mjs gsc seo/test/fixtures/gsc-complet.zip` : « +94 clics/mois » en réécrivant le titre d'une requête en position 2,2 à 0,8 % de CTR, signe probable d'un bloc IA ou local. « Une page par service et par ville » (`gsc.js:359`) sans garde-fou anti-pages satellites.
8. **Moyenne : mots-clés non vérifiés.** L'échec des suggestions Google est passé sous silence (`seo/cli.mjs:139`). Restent des gabarits (« boulangerie comparatif », « combien coûte boulangerie »), et le plan dit « attribuer UNE page à chacun » (`plan.js:36`).

### 3. Les 8 améliorations

| # | Amélioration | Impact | Effort | Comment |
|---|---|---|---|---|
| 1 | Reconnaître CMP et GTM | Fort | 3 h | Motifs tarteaucitron (`gtagUa`, `job.push`), Axeptio, Didomi, Cookiebot ; GTM seul = « ? » ; pièges t1-t2 en tests. |
| 2 | Retirer le prix par lien | Fort | 15 min | « Liens gagnés : 0 € ; lien payé = `rel="sponsored"` » ; test qui interdit « € par lien ». |
| 3 | Contrôle des extraits | Fort (GEO) | 2 h | `nosnippet`, `max-snippet`, `data-nosnippet`, X-Robots-Tag en critique IA ; corriger ChatGPT-User. |
| 4 | Budget : minimums puis répartition | Fort | ½ jour | Shopping/PMax d'abord en e-commerce ; achat Meta 0,8-2,5 % ; hypothèses affichées ; sans `--marge`, au mieux « à tester ». |
| 5 | Microdata, sous-types, sans vitrine | Fort (local) | 1 jour | Lire `microdataTypes` ; table des sous-types schema.org ; `areaServed` sans adresse = valide. |
| 6 | Poids par profil, risque légal | Moyen | 1 jour | Profil local : 25 % local, 3 % social, 10 % vitesse ; CNIL et LCEN prioritaires ; pixels seulement si le canal est financé. |
| 7 | Opportunités réalistes | Moyen | 1 jour | Courbe avec réponses IA, fourchettes, alerte « vérifiez la page de résultats » ; signaler « suggestions indisponibles ». |
| 8 | Corpus de 30 sites français | Crédibilité | 3-5 jours | Taux de faux positifs publié par contrôle (WordPress, Wix, PrestaShop, artisans). |

### 4. Benchmark

| Outil, prix vu le 05/11/2026 | Fait mieux | SEO 360 fait mieux |
|---|---|---|
| Semrush Pro : 139,95 $/mois | Volumes FR, positions, liens, pubs concurrentes | Gratuit, rentabilité pub, droit français |
| SE Ranking Essential : 55-65 $/mois [À VÉRIFIER] | Suivi local par ville | 3 actions pour non-technicien |
| Haloscan Starter : 59 €/mois [À VÉRIFIER] | Mots-clés du marché français | Local, pub, IA, réseaux |
| Ahrefs Webmaster Tools : gratuit | Index de liens, audit complet | Robots IA, Content-Signal |
| Screaming Frog : 500 URL gratuites, 199 £/an | Crawl complet, rendu JS, microdata, `nosnippet` | Priorités et correctifs expliqués |
| Otterly.AI Lite : 29 $/mois, 15 requêtes | Mesure réelle des citations IA | Causes : robots, blocs citables |

Exactitude : les suites ont des données de marché (volumes estimés, positions, liens) ; SEO 360 lit la page et l'export Search Console. Sources : seo.com/blog/semrush-pricing, journaldugeek.com/seo/outils/se-ranking/prix, screamingfrog.co.uk/seo-spider/pricing, help.otterly.ai/pricing-of-otterlyai, triplewhale.com/blog/whats-a-good-roas, developers.google.com/search/docs/appearance/ai-features, developers.openai.com/docs/gptbot, blogdumoderateur.com/google-deploie-ai-overviews-ai-mode-france.

## Hypothèses

- tarteaucitron, les CMP chargées par GTM, la microdata et les artisans sans vitrine sont fréquents chez les TPE françaises (part non mesurée).
- Les médianes Meta de Triple Whale, surtout américaines, valent à peu près pour une TPE française.

## Faiblesses connues

- PageSpeed, Google et les réseaux sont bloqués ici : vitesse, suggestions et niveaux de hashtags non testés (« #patissier — niche » me semble faux [À VÉRIFIER]).
- Prix SE Ranking et Haloscan non confirmés sur une page officielle.
- Parcours peu exploré (autre perspective).

## Confiance

Haute : chaque constat est reproduit par une commande ou une page piège, et les faits datés ont été vérifiés par recherche web.

## Réponse

### Verdict
Le socle est sérieux : une page locale bien optimisée obtient 99/100, un Next.js SSR est reconnu, les seuils CWV et les robots IA sont justes. Mais la note donne A quand rien n'est lu ou que la page est désindexée. Le plan repousse le local à J+90, et mots-clés, hashtags et budget sont des gabarits sans données. **UX 60/100, efficacité 45/100.**

### Constats (preuves : /tmp/claude-0/-home-user-rgte-redesign/137803cc-e0f1-5e43-837f-1ccac4c64755/scratchpad/conseil/travail/preuves-pages-pieges/)
1. **La note ment quand la collecte échoue ou que la page est bloquée.** Interface réelle, proxy « Aucun », PageSpeed en 429 (quota sans clé, observé ici) : « 100/100 · A… Rien de bloquant 🎉 » avec 0 mot lu (capture-psi-seul.png). Proxy KO : 93/A malgré « Page inaccessible » (capture-proxy-ko.png). « Site en construction » (4 mots) : 86/A. noindex : 94/A. `content="none"` : 99/A. `Disallow: /` : 85/A. Canonical vers la préprod : 99/A. SPA vide : 78/B, avec un GEO à 96. Cause : `finalize()` (audit.js:422-429) calcule 100 − Σ pénalités ; une catégorie sans contrôle vaut 100, et la vitesse « estimée » compte pour 17 %.
2. **Faux positifs et faux négatifs vérifiés.**
   - **Robots et indexation.** `none` est ignoré (audit.js:90), alors que Google l'assimile à noindex, nofollow. « * bloqué, Googlebot autorisé » produit « interdit tout le site » (audit.js:144), et un vrai blocage est compté deux fois.
   - **Schémas.** « Pas de schéma LocalBusiness » s'affiche sur Plumber, ExerciseGym, Attorney, AutoDealer et CafeOrCoffeeShop (audit.js:317), y compris des types que l'outil recommande lui-même (sectors.js:107, 116, 170). OnlineStore est jugé « sans adresse » (audit.js:454). Les microdonnées sont ignorées (html.js:162). `Manufacturer` (sectors.js:28) n'existe pas dans schema.org.
   - **Liens et contact.** Un logo `<a><img alt></a>` est vu comme « lien sans texte » (html.js:191), donc sur presque tous les sites. Le téléphone « +33 4 78… » n'est pas reconnu (audit.js:313).
   - **Contenu.** Auteur et date ne sont jamais signalés si le texte contient « par exemple » (`/par [A-Z]/i`, audit.js:287). `hreflang="en-uk"` est accepté (audit.js:108), alors que le code pays est GB.
   - **Fichiers non lus.** Un status 0 devient « Sitemap introuvable » et « Pas de llms.txt » (audit.js:152, 280). llms.txt est pénalisé alors que l'étude du projet le juge sans effet (benchmarks.json:74).
3. **Le plan ne fait pas monter vite.** Sur la fixture, semaine 1 = « Robots IA bloqués : PerplexityBot », Open Graph, Mentions légales. HTTPS, liens cassés et titres dupliqués arrivent à 30 jours, la fiche Google à 90 jours. Cause : plan.js:209-214 range local et IA à J+90 ; le tri suit gravité puis effort, jamais le gain (audit.js:431-432).
4. **Le budget pub ne tient pas.** RGTE à 1 000 €/mois avec un client à 12 000 € : ROAS de 35 à 118 (25 % de signature par défaut, ads.js:67). LinkedIn reçoit 438 €/mois puis est jugé insuffisant, alors que benchmarks.json:89 fixe 1 500 à 3 000 €. E-commerce à 3 000 € : de 32 à 711 ventes (×22, extrêmes cumulés, ads.js:105-106). Pour une app, l'outil propose « Performance Max / Shopping » (ads.js:39) au lieu des campagnes App, et oublie Apple Ads. Aucun plafond de demande : à 20 000 €/mois, 2 971 à 4 457 clics Search sur une niche.
5. **Mots-clés et hashtags sortent de gabarits.** « pâtisserie lyon Lyon », « … vs », « … définition », « vitrine réfrigérée sur mesure sur mesure », « devis prix », et « ouvert dimanche » pour un fabricant national (keywords.js:117-144). Côté hashtags : « #vitrinerefrigereemesure » (hashtags.js:63), aucun mot-clé sur Instagram (hashtags.js:7), #artisanat pour une app, #paris_patisserie à Bordeaux, #meilleurouvrierdefrance (titre d'État, risque de pratique trompeuse). Aucun volume de recherche.
6. **Manques face à un audit pro** : Search Console (positions 4–20), fiche Google, cohérence sitemap/canonical/noindex, retours hreflang, liens vers redirections, écart de contenu concurrents.

### Améliorations priorisées
| # | Amélioration | Impact | Effort | Où / comment |
|---|---|---|---|---|
| 1 | Note honnête : catégorie non mesurée = « n/a » hors moyenne ; pas de note sans HTML lu ; plafond 30 si noindex/none, Googlebot bloqué, 4xx/5xx, coquille JS, canonical externe ; plafond 60 sous 150 mots | 5 | 2 | audit.js `finalize()` ; app.js:177/183 « Audit incomplet » |
| 2 | Corriger le constat 2 et figer les pages pièges en tests | 5 | 2 | lignes citées ; pages.mjs → seo/test/fixtures/pieges/ |
| 3 | Import Search Console (CSV ou collage) : requêtes en position 4–20, gain = impressions × écart de CTR → 10 pages à retravailler | 5 | 3 | nouveau engine/gsc.js ; en tête du Plan |
| 4 | Plan trié par gain (`impact` métier par contrôle) ; voie « Conformité » (mentions, CMP, CGV) hors score SEO ; local dès la semaine 1 | 5 | 2 | audit.js `add()` ; plan.js:209-214 |
| 5 | Budget : minimum viable par canal, sinon réallocation ; estimation centrale ±35 % ; marge et taux de signature (B2B 10 %) → CPA max rentable ; plafond = volume × CTR ; campagnes App et Apple Ads | 5 | 3 | ads.js:64-122, MIX:33-41 |
| 6 | Suggestions Google d'abord, gabarits filtrés ; mot-clé sur Instagram, phrase entière | 4 | 2 | keywords.js:117-144 ; hashtags.js:7/63/76 |
| 7 | Crawl : URL du sitemap en 404, 301, noindex ou canonicalisées ailleurs ; liens vers des redirections ; retours hreflang | 4 | 3 | collect.js:171-201 ; `crawlFindings` |
| 8 | Fiche Google en déclaratif (catégorie, avis, note, réponses, photos) intégrée au score local | 4 | 2 | checklists.js, audit.js |
| 9 | Écart de contenu : termes présents chez au moins 2 concurrents et absents chez toi | 3 | 2 | index.js `competitorSummary` |

### Objectif meilleur
Le seul outil gratuit qui dit à une TPE française quoi faire **cette semaine** pour gagner des clients, chiffré en euros, à partir de ses données réelles, sans jamais noter ce qu'il n'a pas mesuré. Cibles : aucun « A » sur les pages pièges, au moins 95 % de constats exacts sur 30 sites français relus, un budget à fourchette ≤ ×2 avec le CPA max rentable, et avec Search Console, 10 actions classées par clics gagnables.
1. **Fiabiliser (semaine 1)** : améliorations 1 et 2.
2. **Brancher les données réelles (semaines 2–3)** : 3, 8 et 6.
3. **Décider en euros (semaine 4)** : 4 et 5, puis un suivi GEO (15 questions générées, une case « cité », un taux mensuel).

### Gains rapides (moins d'une heure)
- Robots : `/(^|[\s,])(noindex|none)([\s,]|$)/` (audit.js:90-91).
- Téléphone : `/(?:\+33\s?(?:\(0\))?\s?|\b0)[1-9](?:[\s.-]?\d{2}){4}/` (audit.js:313, 5 formats testés).
- Retirer `/i` sur « par [A-Z] » (audit.js:287).
- Ajouter l'alt de l'`<img>` au texte du `<a>` parent (html.js).
- Classer llms.txt, Bing et les status 0 en « non vérifié » (audit.js:152, 280, 288).
- Afficher « Audit incomplet » si `!report.ctx?.page` (app.js:177/183).
- Retirer #paris_patisserie, #meilleurouvrierdefrance et `Manufacturer`.
- Écarter LinkedIn sous 1 500 €/mois (ads.js).

## Hypothèses
Pages pièges synthétiques (fetcher virtuel simulant https, en-têtes, redirections : harness.mjs) ; PageSpeed simulé pour le site lent ; 429 et captures réels. Règles vérifiées par recherche web secondaire (developers.google.com injoignable) : `none` = noindex, nofollow ; hreflang suit ISO 639-1 + ISO 3166-1 alpha-2 ; les installations d'app passent par les campagnes App (support.google.com/google-ads/answer/6309967) ; Apple Ads remplace Search Ads depuis le 14/04/2025. CPL B2B industriel en France ≈ 80–250 € [À VÉRIFIER] ; colonnes du CSV Search Console en français [À VÉRIFIER].

## Faiblesses connues
Aucun vrai site audité (réseau bloqué) ; UX jugée sous l'angle décision seulement ; Concurrents, ASO et GitHub peu testés ; corpus de 30 sites annotés à constituer.

## Confiance
Élevée sur les constats 1 à 5, reproduits par script (sortie-*.txt, captures). Moyenne à élevée sur l'ordre des améliorations. Moyenne sur les ordres de grandeur publicitaires.

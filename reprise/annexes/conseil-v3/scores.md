| Réponse | Perspective | Score /100 | Écart-type | Borda | Notes des relecteurs |
|---|---|---:|---:|---:|---|
| B | Utilisateur final (dirigeant de TPE) | 84.5 | 1.7 | 19 | 82, 83, 87, 85, 85 |
| C | Expert métier SEO/SEA/GEO | 83.7 | 1.7 | 15 | 85, 81, 86, 83, 85 |
| E | Analyste concurrentiel | 82.4 | 1.0 | 11 | 81, 82, 84, 82, 82 |
| D | Designer produit | 78.0 | 1.2 | 3 | 79, 77, 77, 80, 77 |
| A | Avocat du diable | 77.2 | 1.8 | 2 | 75, 80, 76, 76, 78 |

## À garder (par réponse, tous relecteurs)

### A (Avocat du diable) — 30 mentions
- Note honnête quand un contrôle bloquant n'est pas lu (code collé) : note « provisoire » plafonnée, « robots.txt non vérifié » en synthèse, couverture comptée par contrôle et non par catégorie, test « code collé + Disallow »
- Réparer le plugin : ajouter outils-cli.mjs à plugin.mjs, tester chaque sous-commande depuis plugins/seo360, autoriser Bash dans les évaluations (seul audit à avoir vu la panne réelle)
- Intégrité : recalculer la note à l'import avec « importé, non revérifié », exiger `e.origin === new URL(d.url).origin` pour le bouton-favori
- Lien de partage sans marge, taux de signature ni budget ; PRIVACY.md qui nomme chaque tiers ; LICENSE et SECURITY.md
- Correctifs sans danger : HSTS par paliers (max-age=300 sans includeSubDomains), redirection HTTPS compatible Cloudflare « Flexible » (X-Forwarded-Proto)
- Robustesse : compter les octets décompressés des ZIP, parcours JSON-LD itératif borné, validation de `input`
- Pas de verdict pub sur une marge inventée : « inconnu » ou hypothèses affichées
- Note « provisoire » plafonnée quand un contrôle bloquant (robots.txt, en-têtes) n'a pas été lu, avec le test « code collé + Disallow » : c'est le seul mode d'analyse de la page claude.ai.
- Plugin : ajouter outils-cli.mjs, tester chaque sous-commande depuis le plugin, autoriser Bash dans les 63 évaluations.
- HSTS par paliers (max-age=300 sans includeSubDomains) et variante X-Forwarded-Proto pour Cloudflare « Flexible » : seul audit à voir qu'un correctif « prêt à coller » peut casser un site.
- Recalculer la note à l'import (« importé, non revérifié ») et exiger e.origin === new URL(d.url).origin.
- Liste chiffrée des tiers contactés par défaut (22 requêtes), lien de partage sans marge ni budget, SECURITY.md et PRIVACY.md sur le modèle de claude-seo.
- Le test « code collé + Disallow: / » et sa règle : quand un contrôle bloquant n'a pas pu être lu, la note devient « provisoire » et plafonnée, et la couverture se compte par contrôle, pas par catégorie (B voit aussi le « 91 % » gonflé).
- Exiger `e.origin === new URL(d.url).origin` sur le message du bouton-favori, recalculer la note des rapports importés et afficher « importé, non revérifié ».
- Seul audit à voir que `outils` plante dans le plugin alors que plan-croissance-360 n'admet aucun autre prix : ajouter outils-cli.mjs, tester chaque sous-commande depuis le plugin, autoriser Bash dans les évaluations.
- Correctifs sans danger : HSTS par paliers (max-age=300) et variante X-Forwarded-Proto contre la boucle Cloudflare « Flexible ».
- Lien de partage sans données commerciales (marge, panier, budget) ; PRIVACY.md et SECURITY.md sur le modèle de claude-seo ; LICENSE avant de dire « open-source ».
- Les liens TikTok ou Instagram sont audités comme des sites : il faut les reconnaître et demander l'export des statistiques, ou corriger la promesse de plan-croissance-360.
- En code collé, le seul mode d'analyse de la page claude.ai, robots.txt n'est jamais lu et la note monte à 92/100 (A) pour un site bloqué. Correctif : note « provisoire » plafonnée, « non vérifié » visible, couverture comptée par contrôle, et le test « code collé + Disallow ».
- La panne du plugin que `--check` ne voit pas : outils-cli.mjs manque dans plugin.mjs:26, et les 63 évaluations, sans Bash, ne la détecteront jamais.
- Les correctifs « prêts à coller » dangereux : HSTS par paliers (max-age=300, sans includeSubDomains) et variante X-Forwarded-Proto pour Cloudflare « Flexible ».
- Confidentialité : nommer les tiers (AllOrigins, CodeTabs, PageSpeed, Google Suggest), retirer marge, budget et panier du lien de partage, ajouter LICENSE, SECURITY.md et PRIVACY.md.
- Recalculer la note à l'import et vérifier l'origine des messages du bouton-favori (`e.origin === new URL(d.url).origin`).
- Benchmark de méthode : Lighthouse ne devine pas une catégorie en erreur, Ahrefs calcule son Health Score sur les pages réellement lues.
- Piège robots.txt : en code collé, un site bloqué reçoit 92/100 A « Mesuré : 91 % » (CLI : 30/100 E) → note provisoire plafonnée quand un contrôle bloquant n'est pas lu, couverture comptée par contrôle, test « code collé + Disallow ».
- Plugin : la sous-commande `outils` plante alors que plan-croissance-360 n'autorise que ses prix ; ajouter outils-cli.mjs à plugin.mjs, tester chaque sous-commande depuis le plugin, Bash dans les évaluations.
- Promesses de confidentialité fausses et lien de partage qui contient marge, signature, budget et panier → nommer les tiers, partage sans données commerciales, LICENSE, SECURITY.md, PRIVACY.md.
- Correctifs qui peuvent casser un site : HSTS par paliers (max-age=300 sans includeSubDomains), variante X-Forwarded-Proto derrière Cloudflare « Flexible ».
- Liens TikTok et Instagram audités comme des sites alors que plan-croissance-360 promet un « audit mesuré » → reconnaître les profils et demander l'export des statistiques.
- Contrôle d'origine du bouton-favori : exiger e.origin === new URL(d.url).origin ; recalculer la note à l'import ; compter les octets décompressés ; parcours JSON-LD borné.

### B (Utilisateur final (dirigeant de TPE)) — 30 mentions
- Le scénario « lundi matin, un boulanger sur son téléphone » comme test d'acceptation
- Publier la version complète sur main, bouton « Analyser mon site » depuis claude.ai, essai réel de /plugin
- Lecture fiable par défaut avec le Worker existant (seo/proxy), proxys publics en secours
- « Qui » réaliste et « où coller » selon Wix, Shopify ou WordPress ; robots.txt et schémas confiés au webmaster
- Demander « Combien rapporte une commande ? » dans la carte Budget ; jamais de budget « conseillé » sans valeur client
- Une seule liste de 3 actions, même ordre et même note sur tous les écrans ; 3 outils par semaine au plus, filtrés par le verdict pub
- ChatGPT et Localo dans le benchmark : les vraies alternatives d'une TPE
- Le test du lundi matin : depuis la page claude.ai ou un téléphone, un boulanger ne peut pas auditer son site ; d'où l'amélioration n° 1 « publier la version complète et y renvoyer depuis claude.ai ».
- Jamais de budget « conseillé » sans valeur client : demander « Combien rapporte une commande ? » dans la carte Budget.
- « Qui » réaliste et « où coller » selon Wix, Shopify ou WordPress, en réutilisant la détection existante ; robots.txt et schémas confiés au webmaster.
- Benchmark qui compte ChatGPT Go et les outils Google gratuits comme vraies alternatives, et Localo pour des tâches faisables au téléphone.
- 3 outils par semaine au plus, filtrés selon le verdict pub (pas de pixel sans pub).
- Le constat « lundi, un boulanger ne peut pas auditer son site » et sa réponse : publier la version complète sur main et ajouter un bouton « Analyser mon site » sur la page claude.ai.
- Jamais de « budget conseillé » sans valeur client : demander « Combien rapporte une commande ? » dans la carte Budget (« Rien de bloquant » avec 6 « ? » est trompeur).
- Un « qui » réaliste et un « où coller » selon Wix, Shopify ou WordPress (réutiliser la détection du CMS) ; robots.txt et schémas confiés au « Webmaster ».
- Le benchmark face aux vraies alternatives d'une TPE : ChatGPT (Go 8 $), Search Console et fiche Google gratuites, Localo et ses tâches de la semaine faisables au téléphone.
- Au plus 3 outils par semaine, filtrés selon le verdict pub (pas de pixel sans publicité).
- Le scénario « lundi, un boulanger » : ni la page publiée ni un téléphone ne permettent d'auditer son propre site ; publier la version complète et y renvoyer depuis claude.ai passe avant tout le reste.
- Un « qui » réaliste et un « où coller » selon Wix, Shopify ou WordPress : un robots.txt de 28 lignes n'est pas une tâche « Vous, 15 min ».
- Jamais de budget « conseillé » sans valeur client : demander « Combien rapporte une commande ? » dans la carte Budget.
- Les chiffres contradictoires à unifier : 66 contre 73, « 3 actions » contre « 0/9 », la pastille « 10 » et « 0/48 », la carte Search Console (2 741 clics, 500 → 475, −40 %).
- « Aucune installation » est faux (il faut Node et le dépôt), et la ligne d'état conseille une clé PageSpeed hors sujet.
- Benchmark centré TPE : ChatGPT Go (8 $), Search Console et fiche Google, Localo (tâches faisables au téléphone) sont les vraies alternatives.
- Le test décisif : « lundi, un boulanger peut-il auditer son site ? » (page claude.ai bloquée, version complète absente de main, téléphone sans recours).
- « Qui » réaliste et « où coller » selon l'outil de site (Wix, Shopify, WordPress), en réutilisant la détection existante ; robots.txt et schémas confiés au webmaster.
- Jamais de budget « conseillé » sans valeur client : demander « Combien rapporte une commande ? » dans la carte Budget.
- Une seule liste de 3 actions et une seule note sur tous les écrans (66 contre 73 ; 3, 9, 10 et 48 tâches).
- Textes justes : description coupée en fin de phrase, libellé « Télécharger le fichier ZIP » corrigé, « lister ce qui a été lu au lieu du % », erreurs traduites.
- 3 outils par semaine au plus, filtrés par le verdict pub (pas de pixel Meta sans pub).
- Benchmark avec ChatGPT (Go, Plus), Search Console et fiche Google gratuits, et Localo (tâches faisables au téléphone) : les vraies alternatives d'une TPE.

### C (Expert métier SEO/SEA/GEO) — 34 mentions
- Méthode des pages pièges (tarteaucitron, GTM seul, microdata, nosnippet, artisan sans vitrine) transformées en tests de non-régression
- Reconnaître tarteaucitron (gtagUa, job.push), Axeptio, Didomi, Cookiebot ; GTM seul = « ? » et non « ✗ obligatoire (CNIL) »
- Retirer « 80 à 400 € par lien » ; lien payé = rel="sponsored" ; test qui interdit « € par lien »
- Contrôle nosnippet, max-snippet, data-nosnippet et X-Robots-Tag comme critique IA ; corriger la phrase sur ChatGPT-User
- Budget : minimums puis répartition, Shopping/PMax d'abord en e-commerce, conversion Meta réaliste, hypothèses affichées, au mieux « à tester » sans marge
- Lire microdataTypes, table des sous-types schema.org, areaServed sans adresse = valide
- Poids par profil (local 25 %) et risque légal CNIL en tête ; courbe de CTR avec réponses IA ; « suggestions indisponibles » signalé ; corpus de 30 sites français avec taux de faux positifs publié
- Les 5 pages pièges (tarteaucitron, GTM seul, microdata, nosnippet, artisan sans local), à verser telles quelles dans les tests.
- Retirer « 80 à 400 € par lien » (15 min) et ajouter un test qui interdit « € par lien ».
- Reconnaître tarteaucitron, Axeptio, Didomi, Cookiebot et GTM (GTM seul = « ? ») pour ne plus conseiller une balise en double.
- Contrôler nosnippet, max-snippet, data-nosnippet et X-Robots-Tag dans la visibilité IA (AI Overviews en France depuis le 22/07/2026), et corriger le texte sur ChatGPT-User.
- Budget : minimums puis répartition (Shopping/PMax d'abord en e-commerce), hypothèses affichées, « à tester » au mieux sans marge ; poids par profil (local 25 %) et risque légal dans le plan ; corpus de 30 sites français avec taux de faux positifs publié.
- Les 5 pages pièges (tarteaucitron, GTM seul, microdata, nosnippet, artisan sans vitrine), à garder comme tests de non-régression.
- Reconnaître les CMP (tarteaucitron `gtagUa` et `job.push`, Axeptio, Didomi, Cookiebot) ; GTM seul = « ? », pour ne plus pénaliser les correctifs que l'outil conseille lui-même.
- Supprimer « 80 à 400 € par lien de qualité » et ajouter un test qui interdit « € par lien » (seul audit à voir ce conseil contraire aux règles de Google).
- Traiter nosnippet, max-snippet, data-nosnippet et X-Robots-Tag comme des points critiques pour l'IA depuis l'arrivée d'AI Overviews en France (22/07/2026) ; ne plus dire que bloquer ChatGPT-User « empêche » la lecture.
- Budget : minimums d'abord, puis répartition (Shopping ou PMax en tête pour l'e-commerce), hypothèses affichées, et au mieux « à tester » sans marge.
- Microdata, table des sous-types schema.org et areaServed sans adresse admis ; poids par profil (local) ; risque CNIL et LCEN en tête des priorités.
- Corpus de 30 sites français, avec le taux de faux positifs publié pour chaque contrôle.
- Les faux positifs sur ce que SEO 360 conseille lui-même : tarteaucitron (`gtagUa`, `job.push`) non reconnu, GTM seul compté comme traceur sans consentement ; pièges t1 et t2 à ajouter aux tests.
- Microdata ignorée, sous-types schema.org (Plumber) et artisans sans vitrine (`areaServed`) : pour un artisan, une des 3 actions peut être fausse.
- Retirer « 80 à 400 € par lien de qualité » (ads.js:235), contraire au skill netlinking et aux règles anti-spam de Google, avec un test qui interdit « € par lien ».
- `nosnippet` et `max-snippet:0` ignorés alors qu'AI Overviews et AI Mode sont en France depuis le 22/07/2026 ; corriger aussi le « empêche » de ChatGPT-User.
- Budget e-commerce : 1 500 € conseillés pour PMax et Meta, puis 100 % Meta ; appliquer les minimums avant la répartition et afficher les hypothèses.
- Le risque légal d'abord : des traceurs déposés sans consentement (CNIL) ne doivent pas passer après PerplexityBot ; poids adaptés aux commerces locaux (local 25 %).
- Un corpus de 30 sites français pour publier un taux de faux positifs par contrôle.
- Pages pièges t1 à t5 : l'outil pénalise ses propres correctifs (tarteaucitron, GTM seul) → reconnaître tarteaucitron, Axeptio, Didomi, Cookiebot ; GTM seul = « ? » ; pièges ajoutés aux tests.
- Retirer « 80 à 400 € par lien » (contraire aux règles anti-spam de Google et au skill netlinking) et un test qui interdit « € par lien ».
- nosnippet, max-snippet, data-nosnippet et X-Robots-Tag en contrôle IA critique (AI Overviews et AI Mode en France depuis le 22/07/2026) ; corriger la phrase sur ChatGPT-User.
- Budget e-commerce : minimums par canal puis répartition (PMax ou Shopping d'abord), hypothèses affichées, sans --marge au mieux « à tester ».
- Microdata (microdataTypes déjà lu), sous-types schema.org (Plumber), artisan sans vitrine avec areaServed jugé valide.
- Poids par profil d'entreprise et risque légal dans la priorisation (traceurs sans consentement avant PerplexityBot).
- Opportunités Search Console réalistes (CTR avec réponses IA, fourchettes, garde-fou anti-pages satellites) ; signaler « suggestions indisponibles ».
- Corpus de 30 sites français et taux de faux positifs publié par contrôle.

### D (Designer produit) — 31 mentions
- Mesures mobiles chiffrées et Synthèse mobile : 3 actions d'abord, exports dans un menu, « Voir les correctifs » toujours visible
- Réparer l'export Markdown (indenter chaque ligne) avec le test « un seul titre de niveau 1 »
- Plus de « Analyse terminée » en vert sur un audit incomplet : avertissement sous 60 % mesuré, erreur sous le champ avec aria-invalid, erreurs traduites, toast de 6 s
- claude.ai : « Voir un exemple » en bouton principal, « Analyser » actif seulement avec du code collé, favori, proxy et clés masqués
- Recours mobile « M'envoyer le lien sur ordinateur » (navigator.share)
- Passe accessibilité mesurée : bordures à 3:1, étiquette visible, niveau des hashtags écrit, glossaire hors Tab, scrollLeft au lieu de scrollIntoView
- Lexique commun à toutes les surfaces (30/60/90 contre S1-2/S3-4/M2/M3, 8 contre 15 pages explorées)
- Sous 560 px : les 3 actions d'abord, les exports dans un menu, « Voir les correctifs » toujours visible (mesures y = 840 et y = 1 354).
- Export Markdown réparé en 1 h (indenter chaque ligne du code), avec le test « un seul titre de niveau 1 ».
- Page claude.ai : « Voir un exemple » en bouton principal, « Analyser » actif seulement avec du code collé, favori et proxy masqués.
- Passe accessibilité chiffrée : bordures à 3:1, aria-invalid, étiquette visible, niveau des hashtags écrit en toutes lettres, glossaire hors de l'ordre de tabulation.
- Recours mobile « M'envoyer le lien sur ordinateur » (navigator.share) et lexique commun (même plan sur toutes les surfaces).
- Réparer l'export Markdown (indenter chaque ligne du code) et le vérifier par un test « un seul titre de niveau 1 ».
- Sous 560 px : les 3 actions d'abord, les exports dans un menu, « Voir les correctifs » toujours visible.
- Jamais « Analyse terminée » en vert sous 60 % mesuré ; erreur sous le champ avec aria-invalid ; erreurs traduites ; toast affiché 6 s.
- Page claude.ai : « Voir un exemple » en bouton principal, « Analyser » actif seulement avec du code collé, favori, proxy et clés masqués.
- Un seul « cette semaine » sur tous les écrans, et « M'envoyer le lien sur ordinateur » (navigator.share) comme recours sur téléphone.
- Une passe d'accessibilité chiffrée (bordures de 1,29:1 à 3:1, niveau des hashtags écrit en toutes lettres, glossaire hors de l'ordre de tabulation, scrollLeft au lieu de scrollIntoView) et le même format de plan partout (30/60/90 jours ou S1-2/S3-4/M2/M3, pas les deux).
- Des mesures mobiles exactes (actions à y = 840, correctifs à y = 1 354, erreur à y = 909, 2 onglets visibles sur 6) et la refonte qui en découle : sous 560 px, les 3 actions d'abord, les exports dans un menu.
- L'export Markdown cassé (33 titres H1, dont « User-agent: GPTBot ») : correctif d'une heure, avec le test « un seul titre de niveau 1 » ; c'est le seul export sur claude.ai.
- « Analyse terminée » en vert au-dessus d'« Audit incomplet », toast de 1,8 s, erreur hors écran sans `aria-invalid` : avertir sous 60 % mesuré, afficher le message sous le champ.
- claude.ai sans impasse : « Voir un exemple » en bouton principal, « Analyser » actif seulement avec du code collé ; recours mobile par `navigator.share`.
- Une passe accessibilité chiffrée : bordures à 1,29:1, pastille à 2,24:1, `scrollIntoView` qui fait sauter « Aller au contenu », glossaire hors de l'ordre de tabulation.
- Microcopie et cohérence des prix : Ahrefs Webmaster Tools « gratuit » avec le prix de Starter, Haloscan et Make « Offre gratuite » sous « payants ».
- Mesures mobiles au pixel (actions à y = 840, correctifs à 1 354, erreur à 909 hors écran) → sous 560 px : les 3 actions d'abord, exports dans un menu.
- « Analyse terminée » en vert à 0 % mesuré → avertissement sous 60 % mesuré, message sous le champ avec aria-invalid, toast de 6 s.
- Page claude.ai sans impasse : « Voir un exemple » en bouton principal, « Analyser » actif seulement avec du code collé, favori et proxy masqués.
- Export Markdown réparé en 1 h (indenter chaque ligne du code) avec un test « un seul titre de niveau 1 ».
- Accessibilité chiffrée : bordures à 3:1, étiquette visible, niveau des hashtags écrit en toutes lettres, glossaire hors Tab.
- Recours mobile : bouton « M'envoyer le lien sur ordinateur » (navigator.share).
- Lexique commun à toutes les surfaces (30/60/90 jours contre S1-2/S3-4/M2/M3 ; 8 pages contre 15).

### E (Analyste concurrentiel) — 32 mentions
- Preuve par l'API GitHub que la page publique et l'installation du plugin ne mènent nulle part (main sans seo/, dernier déploiement le 18/10, 0 étoile, sans licence)
- ★ Benchmark local automatique via Places API (Text Search Pro, 5 000 appels gratuits par mois) qui remplit --concurrents et mesure l'action « fiche Google »
- ★ Panel IA mensuel (part de voix face aux concurrents) et ★ suivi hebdomadaire avec alertes (nouveau critique, clics -20 %)
- Importer les sources gratuites (Keyword Planner, Haloscan, Ubersuggest, Metricool) et masquer les idées sans demande
- Skills qui trouvent seuls 3 à 5 concurrents « secteur ville » quand la liste est vide
- Étude corrigée et testée : une seule source de prix, test de cohérence des deux JSON, ligne SEO 360 dans la grille
- Benchmark de marché complet avec open source et guide « Choisir SEO 360 / Choisir un concurrent »
- Le tableau de benchmark : 9 concurrents, prix 2026 sourcés ligne par ligne, et la règle « Choisir SEO 360 / Choisir un concurrent ».
- Benchmark local automatique par Places API (5 000 recherches Text Search Pro gratuites par mois) : top 10 « secteur + ville », écarts, --concurrents rempli seul.
- Publier pour de vrai : fusion sur main, LICENSE MIT, topics, release, essai de marketplace add, annuaires de skills.
- Corriger l'étude interne (SE Ranking, Ubersuggest, Haloscan 79 € contre 179 €, Metricool) avec une seule source de prix et un test de cohérence des deux JSON.
- Suivi hebdomadaire avec alerte (nouveau point critique, clics -20 %) et concurrents trouvés par les skills quand la liste est vide.
- Benchmark local automatique avec Places API (Text Search Pro, 5 000 requêtes gratuites par mois) : à partir de « secteur + ville », le top 10 (note, avis, catégorie, horaires, site) et les écarts. Les concurrents se remplissent seuls et l'action « fiche Google » devient mesurée.
- Sans liste de concurrents, les skills en cherchent 3 à 5 avec « secteur ville », et l'onglet vide propose un lien Google Maps prérempli (< 1 j).
- « Publier pour de vrai » : fusion sur main, LICENSE MIT, topics, release 3.0.0, essai de `marketplace add`.
- Le Worker seo/proxy par défaut, les proxys publics en secours ; import CSV de Keyword Planner, Haloscan, Ubersuggest et Metricool pour avoir de vraies données.
- Corriger l'étude (SE Ranking, Haloscan, Ubersuggest, Metricool) : une seule source de prix, un test de cohérence entre competitors.json et outils.json, et SEO 360 dans sa propre grille.
- Le tableau à 9 concurrents et le guide final « Choisir SEO 360 / choisir un concurrent ».
- La vérification de la publication réelle par l'API GitHub : 0 étoile, aucune licence, description « RGTE », main sans seo/ ni marketplace.json ; l'URL du README, de plugin.json et de 5 skills mène à une page absente.
- L'étude de marché intégrée déjà fausse : SE Ranking Essential retiré (Core à 129 $), Haloscan à 79 € contre 179 €, Ubersuggest et Metricool mal notés, SEO 360 absent de sa propre grille ; une seule source de prix et un test de cohérence.
- Les 3 ★ : benchmark local automatique (top 10 Maps avec notes et avis), panel IA mensuel en français, suivi hebdomadaire avec alerte ; c'est ce que Semrush facture environ 229 $ par mois.
- Le benchmark le plus complet : 9 concurrents, dont les skills open source (claude-seo, marketingskills), prix datés et sourcés, et la règle « Choisir SEO 360 / Choisir un concurrent ».
- Brancher les offres gratuites : importer les CSV de Keyword Planner, Haloscan, Ubersuggest et Metricool pour remplacer les gabarits de mots-clés sans volume.
- Faire trouver les concurrents par les skills quand l'utilisateur n'en donne pas (recherche « secteur ville »).
- État réel sur GitHub : 0 étoile, sans licence ni topic, Pages depuis main sans seo/ → « Publier pour de vrai » : fusion, LICENSE, topics, release 3.0.0, essai de marketplace add, annuaires de skills.
- Analyse des écarts face au marché : concurrents à fournir soi-même, local sans fiche Google, mots-clés sans demande réelle, IA non mesurée, aucun suivi.
- ★ Benchmark local automatique « secteur + ville » qui remplit --concurrents et mesure l'action « fiche Google ».
- Concurrents trouvés par les skills (3 à 5 sites hors annuaires) et lien Google Maps prérempli dans l'onglet vide.
- Import CSV des offres gratuites (Keyword Planner, Haloscan, Ubersuggest, Metricool) et masquage des idées sans demande.
- ★ Panel IA mensuel (part de voix en JSON daté) et ★ suivi hebdomadaire avec alerte (-20 % de clics, nouveau critique).
- Étude interne déjà fausse (SE Ranking, Haloscan 79 contre 179 €, Metricool) → une seule source de prix, test de cohérence des deux JSON, ligne SEO 360 dans sa propre grille.
- Benchmark de référence : 9 concurrents datés et sourcés, guide « Choisir SEO 360 / un concurrent », coût en jetons face à claude-seo et marketingskills.

## Erreurs signalées

### A
- Tableau : « Un site bloqué pour Google reçoit 92/100 A » sans préciser « en code collé », où robots.txt est illisible par construction ; la CLI et la version complète le lisent et donnent 30/100 E (vérifié)
- Gravité « Élevée » de la falsification de rapport discutable : tout rapport calculé côté navigateur se falsifie, ce que l'audit reconnaît pour Lighthouse Viewer (code vérifié, gravité non)
- Amélioration 4 « aucun proxy par défaut » non arbitrée : elle supprimerait l'analyse à partir d'un lien, que B et E veulent au contraire fiabiliser (affirmation de jugement, non testée)
- Agent Reach à 109 000 étoiles, marqué [À VÉRIFIER] : vérifié, c'est juste (109 179)
- Problème 2 classé « Élevée » : un faux rapport partagé reste un risque faible pour une TPE, et A note lui-même que le Lighthouse Viewer a la même limite. Gravité discutable ; faits vérifiés.
- Amélioration 4 « aucun proxy par défaut » : sans lecteur par défaut, l'analyse d'une adresse échoue pour la plupart des visiteurs ; tension avec le besoin d'un lien qui marche (B, E), non arbitrée. Raisonnement, non vérifiable.
- Bombe ZIP (2,4 Go, 21 s, onglet figé ~30 s) : non rejouée par moi ; seul le mécanisme (gsc.js:416, taille déclarée) est vérifié.
- « input.lang: de… les onglets Budget et Plan plantent » : non vérifié.
- « 50 % de marge et 25 % de signature, jamais affichés » : vrai pour la CLI, faux pour l'interface, dont l'onglet Budget affiche « Hypothèses utilisées : marge 50 %, 25 % des contacts signent » (docs/seo/app.js:592). VÉRIFIÉ.
- Amélioration 4, « aucun proxy par défaut » : sans le Worker comme remplaçant (ce que proposent B et E), elle casse encore plus le parcours « un simple lien ». L'arbitrage n'est pas traité.
- Le « Critique » du constat 1 ne vaut qu'en mode code collé (la CLI, elle, donne 30/100 E). Le constat est juste, mais le libellé généralise trop.
- Le benchmark décrit des règles de l'art (Lighthouse, Semrush, Ahrefs, claude-seo), pas des concurrents : ni prix ni positionnement pour une TPE.
- NON VÉRIFIÉ : « 22 requêtes », onglet figé ~30 s avec la bombe ZIP, plantage des onglets Budget et Plan avec input.lang « de ».
- Aucune erreur de fait trouvée sur 6 vérifications.
- « Aucun proxy par défaut » (amélioration 4) sans proposer le Worker : la version complète ne pourrait plus lire une page à partir d'un simple lien ; l'arbitrage entre confidentialité et usage n'est pas discuté (jugement, non testé en production).
- Les rapports falsifiables (gravité « Élevée »), la bombe ZIP et le JSON-LD à 5 000 niveaux (« Moyenne ») sont réels (vérifiés) mais peu probables chez une TPE ; ils prennent la place de blocages plus fréquents (publication, mobile).
- Étoiles d'Agent Reach (109 000) : non vérifiées ici (GitHub bloqué) ; A le signale lui-même.
- « Élevée : n'importe qui fabrique un rapport SEO 360 » : gravité surestimée ; le faux rapport ne trompe que qui fait confiance au lien, sans injection (0 sur 643 charges selon A), et A note lui-même que le Lighthouse Viewer fait pareil (code lu, vérifié).
- Amélioration 4 « aucun proxy par défaut » : le lien seul aboutirait toujours à « Audit incomplet » sur la version complète ; l'arbitrage avec le parcours n'est pas discuté (B et E proposent l'inverse : Worker par défaut).
- html.js:233 → la pile déborde à html.js:234 (vérifié, mineur).

### B
- « 350 €/mois conseillés à l'aveugle » exagéré : la sortie ajoute « Indiquez la valeur d'un client (et votre marge) pour savoir si c'est rentable » (vérifié)
- « 1re tâche à 959 px » non retrouvé : 875 px pour la 1re action, titre à 840 (vérifié ; conclusion inchangée)
- « 3 onglets sur 6 hors écran » : exact, mais le 3e est coupé et estompé, seuls 2 sont entièrement visibles (vérifié)
- ChatGPT Go à 8 $/mois et prix Localo : non vérifiés
- « aucune installation selon app.js:666, alors qu'il faut Node » : la même phrase dit « Node 18 ou plus » ; reproche un peu forcé (vérifié).
- « Des chiffres contradictoires » sur Search Console : -5 % compare deux périodes, -40 % mesure la chute journalière depuis le 28/09 ; la confusion est réelle, la contradiction non (vérifié dans le rapport).
- « 91 % des contrôles gonflé » : c'est surtout un libellé faux (part pondérée de catégories), pas forcément une surévaluation (vérifié, audit.js:488-491).
- « Cases de 20 × 20 px » et « 16 termes techniques en 345 mots » : non vérifiés.
- Aucune erreur de fait trouvée sur 12 constats rejoués.
- « 1re tâche à 959 px » : je mesure la première case à cocher à 984 px (élément mesuré différent ; écart mineur).
- Localo « ≈ 39 à 49 $/mois » : les sources donnent 39 $ par mois en annuel et jusqu'à 69 $ en mensuel. Un peu bas. VÉRIFIÉ par recherche web.
- NON VÉRIFIÉ : « 500 → 475 (-5 %) » sur la carte Search Console (la CLI ne donne que la « chute de 40 % »), « 10 054 mots », « 16 termes techniques ».
- « 350 € conseillés à l'aveugle » est un peu fort : la CLI ajoute « Indiquez la valeur d'un client (et votre marge) pour savoir si c'est rentable » (vérifié). Le reproche de fond (un budget chiffré et « Rien de bloquant » avec 6 « ? ») reste juste.
- ads.js:192 est cité pour « Pas rentable aujourd'hui », mais cette ligne est la branche « inconnu » qui affiche le budget conseillé (vérifié) : citation mal placée, sans conséquence.
- « Bouton « Télécharger le fichier ZIP » inexistant » : plausible (l'export CSV de Search Console produit un ZIP, d'après Google), mais le libellé réel n'a pas été vu.
- « 16 termes techniques en 345 mots » : non vérifié.
- « 350 € conseillés à l'aveugle » omet que la sortie ajoute « Indiquez la valeur d'un client (et votre marge) pour savoir si c'est rentable » (vérifié) : critique juste mais un peu forcée.
- « 1re tâche à 959 px » : 1re case mesurée à 984 px (vérifié, écart mineur).
- Prix ChatGPT Go 8 $ et Localo 39-49 $ : non vérifiés.

### C
- « SE Ranking Essential : 55-65 $/mois » périmé : Essential retiré en 2026, entrée à Core 129 $ (vérifié par recherche web ; signalé [À VÉRIFIER] par l'audit)
- « médiane Triple Whale 2024 : 2,04 » est la médiane tous canaux, pas celle de Meta (1,88 sur la période récente) : l'argument reste valable (vérifié)
- « Achat de liens recommandé » est une lecture : la carte chiffre « 80 à 400 € par lien » sans écrire « acheter » ; lecture raisonnable (vérifié)
- « #patissier — niche me semble faux » : non vérifié, ni par l'audit ni par moi
- « Médiane Triple Whale 2024 : 2,04 » : chiffre non retrouvé ; la page Triple Whale donne 1,88 pour Meta. L'argument (ROAS supposé de 4,2 trop optimiste) tient. Vérifié par recherche web.
- « SE Ranking Essential : 55-65 $/mois » : dépassé en 2026 (Essential retiré, Core 129 $) ; C l'avait marqué [À VÉRIFIER]. Vérifié par recherche web.
- « Site de test : PerplexityBot passe avant GA4 et le pixel Meta… renvoyés à 30 jours » : non vérifié ; dans l'exemple, les traceurs sans consentement sont bien dans « Cette semaine » (6e).
- Note Parcours 7/10 alors que C écrit « peu testé ici » : note peu étayée.
- « Les hypothèses par défaut (marge, signature) ne sont pas affichées » : vrai pour la CLI seulement ; l'interface les affiche (app.js:592). VÉRIFIÉ.
- « Médiane Triple Whale 2024 : 2,04 » est une médiane tous canaux confondus, pas Meta ; les Hypothèses la présentent à tort comme une « médiane Meta ». La médiane Meta, plus basse (≈ 1,86-1,88), renforce l'argument. VÉRIFIÉ par recherche web.
- SE Ranking « Essential : 55-65 $/mois » est dépassé : l'offre a été remplacée en 2026 par Core à 129 $. VÉRIFIÉ (C l'avait marqué [À VÉRIFIER]).
- « La microdata est ignorée (html.js:231) » : elle est détectée (html.js:178, microdataTypes) mais ignorée par le contrôle LocalBusiness. Formulation imprécise, conclusion juste. VÉRIFIÉ.
- « SE Ranking Essential : 55-65 $/mois » est périmé : l'offre a été remplacée par Core à 129 $/mois en 2026 (vérifié par recherche web ; E a raison).
- « Médiane Triple Whale 2024 : 2,04 » est une médiane tous canaux ; la médiane Meta est plus basse (≈ 1,86-1,88), ce qui renforce l'argument (vérifié).
- « #patissier — niche me semble faux » : intuition non vérifiée, signalée comme telle.
- Le parcours, le mobile et la publication ne sont pas examinés (C le reconnaît) : rien sur le blocage principal, la version complète absente de main.
- SE Ranking « Essential : 55-65 $/mois » : périmé, l'offre Essential est remplacée par Core à 129 $ en 2026 (vérifié par recherche web ; C l'avait marqué [À VÉRIFIER]).
- « médiane Triple Whale 2024 : 2,04 » : chiffre exact non retrouvé ; les sources secondaires donnent environ 2 (plausible, non vérifié).
- « achat de liens recommandé » : le texte dit « 80 à 400 € par lien de qualité » sans dire « achetez » ; lecture juste (contraire au skill netlinking) mais formulation forte.
- Poids proposés (25 % local, 3 % social, 10 % vitesse) non justifiés.

### D
- « après 5 boutons d'export » : 4 exports plus « Modifier / nouvelle analyse » (vérifié sur sa propre capture)
- Benchmark appuyé sur des sources secondaires (tutoriel d'agence, temperstack) et sans prix (non vérifié)
- Parcours clavier (45 arrêts) et pastille « 10 » à 2,24:1 en sombre : non rejoués
- « Seuls 2 onglets sur 6 sont visibles » à 390 px : je mesure 3 onglets entiers dans l'écran (le 3e estompé par le masque) ; approximatif (vérifié).
- « Sur claude.ai, c'est le seul export disponible » : la copie JSON existe aussi ; c'est le seul export lisible (vérifié).
- Amélioration n° 1 (export Markdown) en tête avec « impact fort » : surévaluée pour une TPE face au budget, aux faux positifs ou à la publication. Jugement.
- « 43 sigles du glossaire », « 1 112 mots, 9,2 écrans », « 31 cartes fermées » : non vérifiés.
- « Après 5 boutons d'export » : il y en a 4 (Rapport PDF, Copier le lien de partage, Markdown, JSON). VÉRIFIÉ.
- « Seuls 2 onglets sur 6 sont visibles » : dans la fenêtre, 3 onglets sont entiers (Synthèse, À faire, Mots-clés & réseaux, bord droit à 374 px). La mesure de D tient compte du conteneur et B compte 3 onglets hors écran : différence de méthode, pas d'erreur grave. VÉRIFIÉ.
- Le benchmark n'a pas de prix et repose sur des extraits et des avis tiers (D le reconnaît).
- NON VÉRIFIÉ : contraste de 2,24:1 de la pastille en thème sombre ; premier Tab qui saute « Aller au contenu ».
- « Après 5 boutons d'export » : il y a 4 exports et le bouton « Revérifier » (vérifié) ; simple détail.
- Ubersuggest « 10 recherches avec Google » ne repose que sur un tutoriel tiers et n'est pas corroboré (vérifié par recherche web).
- Benchmark presque sans prix et en partie de seconde main (D le signale).
- Rien sur la publication (version complète absente de main) ni sur la justesse SEO des constats de l'outil.
- « Réparer l'export Markdown : impact fort » en n° 1 : impact surestimé pour une TPE, alors que la version complète absente de main n'est pas traitée.
- Saut de « Aller au contenu » au premier Tab : non vérifié.
- Benchmark presque sans prix ; quotas Ubersuggest (3 recherches par jour, 10 avec Google) non vérifiés.

### E
- `app.js:31` : le message « l'analyse en direct est bloquée » est l.29 (vérifié)
- « Reddit hostile selon PricingSaaS » et « Peec ~70-85 € » : non vérifiés (signalés [À VÉRIFIER] par l'audit)
- Panel IA par API : les réponses obtenues par API, souvent sans recherche web, ne reflètent pas ce que voit l'utilisateur de ChatGPT ou Perplexity (doute de méthode, non vérifié)
- Places API « avec la clé de l'utilisateur » et Action GitHub supposent projet Google Cloud, facturation et GitHub, peu réalistes pour la TPE « sans développeur » de ses propres hypothèses (non vérifié)
- « l'analyse en direct est bloquée (app.js:31) » : la ligne est app.js:29 ; « historique (app.js:38) » : la ligne 38 stocke les clés en sessionStorage. Écarts mineurs (vérifiés).
- Les trois ★ supposent une clé Google Cloud avec facturation activée, trois clés d'API d'IA et une Action GitHub : faisabilité faible pour un dirigeant non technicien, coût récurrent non chiffré. Jugement.
- Classement : les ★ (3 à 5 jours) passent avant « Publier pour de vrai » (< 1 jour), qui conditionne tout le reste.
- « Ubersuggest… depuis septembre 2025 » et « Metricool… publie sur la fiche Google » : non vérifiés par moi ; « Peec ~70-85 € » marqué [À VÉRIFIER] par E.
- « app.js:31 » : le message « l'analyse en direct est bloquée » est à app.js:29. Décalage mineur. VÉRIFIÉ.
- Peec « ~70-85 € » : les sources donnent 95 $, soit 85-89 € par mois, pour l'offre Starter. Un peu bas, mais marqué [À VÉRIFIER]. VÉRIFIÉ par recherche web.
- Priorisation : « Publier pour de vrai » (< 1 j, prérequis de tout le reste) n'arrive qu'en 4e position. Les ★ demandent des clés API facturées (Places, OpenAI, Perplexity, Gemini) et une action GitHub, alors que l'hypothèse de E est une « TPE sans développeur ».
- NON VÉRIFIÉ : les tailles en jetons (claude-seo ~4 700, SEO 360 ~3 000, marketingskills ~16 100).
- Places API : le plafond de 5 000 requêtes gratuites est juste pour Text Search Pro, mais la note, le nombre d'avis, les horaires et le site relèvent du palier Enterprise (1 000 requêtes gratuites par mois, tarif plus élevé). Douteux : la page officielle était inaccessible ici.
- Les 3 ★ exigent une clé Google Cloud avec facturation activée et des clés API payantes (OpenAI, Perplexity, Gemini), alors que l'hypothèse est « TPE sans développeur, moins de 50 € par mois » : faisabilité surestimée (jugement).
- Lignes décalées : le texte « l'analyse en direct est bloquée » est en app.js:29 (pas :31), l'historique localStorage en app.js:36 (pas :38) (vérifié).
- Peec « ~70-85 € » : plutôt 85 à 89 € par mois, ou 95 $ sans engagement (recherche web ; E l'avait marqué à vérifier).
- « TPE française à 0 €… via Claude Code ou la CLI » : vrai pour l'interface et la CLI, pas pour les skills, qui supposent un abonnement Claude (non chiffré).
- Places API : « Text Search Pro : 5 000 requêtes gratuites » pour note, avis, horaires et site ; ces champs relèvent de Text Search Enterprise (1 000 gratuites par mois, 35 $ les 1 000) — vérifié dans la doc Google ; coût et quotas faux, impact faible pour une TPE.
- « app.js:31 » : le message de blocage est à app.js:28 (vérifié, mineur).
- « Les trois ★ couvriraient ce que Semrush facture ~229 $/mois » : surpromesse, ni base de mots-clés, ni liens, ni positions (douteux, non vérifiable).
- ★2 Panel IA par API : les réponses des API diffèrent de celles des applications grand public, et 3 clés API pour une TPE « sans développeur » (hypothèse de E) ne sont pas réalistes ; non discuté.
- Ubersuggest geo_ia 0 et Metricool local 0 présentés comme des erreurs : plausibles, non vérifiés par moi.

## Manques communs
- Aucun audit n'exécute les skills dans Claude Code ni les 63 évaluations : la qualité réelle du plan de plan-croissance-360, cœur de la demande « un lien, un plan complet », n'est jugée que sur le code et la CLI.
- Les réseaux sociaux (« percer sur TikTok, Instagram ») restent à peine audités : scripts vidéo, plan de publication, niveaux de hashtags et veille Agent Reach ne sont testés sur aucun cas.
- Personne ne chiffre la note visée après corrections ni ne fusionne les 40 améliorations en une feuille de route commune vers ~90/100, alors que Nadir demande d'approcher 100.
- Aucun test sur de vrais sites de TPE françaises ni avec de vrais dirigeants : faux positifs et temps jusqu'à la 1re action restent estimés (seul C propose un corpus).
- Vitesse et Core Web Vitals (17 % de la note) non vérifiés faute de PageSpeed : la justesse des constats et correctifs de vitesse reste inconnue.
- Calendrier calculé (soldes, fête des mères, ponts, Alsace-Moselle), exports CSV, .ics et PDF, canal e-mail promis par plan-croissance-360 : vérifiés par personne.
- Aucun ne traite l'entretien des données datées (prix, mises à jour Google) : qui les rafraîchit et à quel rythme ; E montre la dérive, pas le processus.
- Aucun audit n'a exécuté seo-360 ou plan-croissance-360 dans Claude Code à partir d'un lien pour juger le plan rendu, alors que c'est la promesse centrale faite à Nadir.
- La croissance sur les réseaux (scripts vidéo, plan de publication, choix des réseaux, qualité des hashtags) n'est évaluée par personne au-delà de remarques ponctuelles (lien TikTok non lu, « #patissier — niche » à vérifier).
- Personne n'a vérifié le calendrier français calculé (soldes, fériés, fête des mères, Alsace-Moselle) ni la liste datée des mises à jour Google qui sert à expliquer une chute Search Console.
- Aucun test sur Internet ouvert, sur la vraie page claude.ai ni avec un vrai dirigeant : le taux de lecture réel des proxys, le temps humain jusqu'au premier correctif et la compréhension restent inconnus.
- Aucun ne compare au coût de l'alternative réelle d'une TPE (freelance ou agence locale), ni aux solutions françaises de fiches locales (Partoo, Solocal).
- Aucun ne propose de processus de mise à jour des données datées (prix, robots IA, mises à jour Google) avec un responsable et une cadence, alors que l'étude du 3/11 est déjà fausse (E).
- Aucun audit ne regarde ce que sont devenues les recommandations du conseil v2 (seo/AUDIT-CONSEIL.md) : ni progrès ni régressions de la v3 ne sont mesurés.
- Aucun ne produit ni ne note un plan complet rédigé par plan-croissance-360 ou seo-360 à partir d'un lien, alors que c'est le livrable demandé par Nadir. Les 63 évaluations ne tournent pas.
- « Percer sur TikTok et Instagram » n'est jugé que par les hashtags et la lecture des liens. Personne n'évalue les scripts, les accroches, le plan de publication ni le référencement à l'intérieur de TikTok et d'Instagram.
- Aucun test sur de vrais sites de TPE françaises (Wix, Shopify, WordPress, PrestaShop, rendu JavaScript, CMP réelles), ni sur Safari iOS, alors que la cible est souvent sur iPhone. C propose ce corpus sans l'avoir constitué.
- Aucun ne propose de connecter les comptes du client par OAuth (Business Profile Performance API pour les appels et les itinéraires, Search Console API dans l'interface), ni n'en traite les conséquences RGPD.
- Aucun ne propose de garde-fou contre la péremption des données datées (prix, mises à jour Google, robots IA), comme une date affichée et une alerte au-delà de N mois, alors que E montre que l'étude du 3/11 est déjà fausse.
- Aucune règle générale de sécurité pour les correctifs « prêts à coller » (sauvegarde, préproduction, retour arrière) au-delà du cas HSTS relevé par A.
- Aucun audit n'a exécuté les skills de bout en bout dans Claude Code (plan-croissance-360 à partir d'un lien, contenus-reseaux-video, contenu-seo-redaction). La qualité du plan final et des contenus, cœur de la promesse « un lien, un plan complet », n'est donc pas jugée.
- Aucun ne valide les correctifs « prêts à coller » avec les validateurs officiels (test des résultats enrichis, validateur schema.org, rapport robots.txt de Search Console) ni ne les applique sur un vrai site Wix, Shopify ou WordPress.
- Aucun ne chiffre le coût réel de la voie Claude Code pour une TPE (abonnement Claude, jetons d'un plan complet) : le « gratuit » ne vaut que pour l'interface et la CLI.
- Aucun n'étalonne la note ni les gains annoncés sur des résultats réels (positions, appels, itinéraires avant et après sur des sites de TPE) ; le corpus proposé par C ne mesure que les faux positifs.
- Le volet « percer sur les réseaux » est à peine évalué : ni la qualité des scripts, des calendriers et des légendes produits, ni la comparaison avec les outils natifs gratuits (Meta Business Suite, TikTok Studio, CapCut, Canva).
- Aucun ne propose de processus de fraîcheur pour les données datées (prix, mises à jour Google, règles juridiques, robots IA) : qui les revérifie, à quelle fréquence, et quel avertissement quand une donnée vieillit.
- Tous les tests tournent sous Chromium : rien sur Safari iOS, alors que beaucoup de dirigeants de TPE sont sur iPhone, où le bouton-favori est le plus difficile à utiliser.
- Aucun audit n'a fait tourner un skill dans Claude Code de bout en bout (lien réel → seo-360 ou plan-croissance-360) ni jugé la qualité du plan 90 jours produit : les 21 skills sont lus, pas exécutés.
- Syntaxe d'installation : README:7 et :194 donnent `/plugin install seo360 --marketplace valeriongg/rgte-redesign`, forme non documentée ; la doc officielle et le README du plugin disent `/plugin marketplace add valeriongg/rgte-redesign` puis `/plugin install seo360@seo360-fr`. Personne ne le relève (E l'effleure avec « essai de marketplace add »).
- B et E veulent le Worker `seo/proxy` par défaut, mais personne ne l'audite : sans PROXY_KEY, le contrôle d'Origin se contourne hors navigateur, et une clé intégrée à une page publique serait visible ; un Worker partagé par tous les utilisateurs devient un proxy ouvert, avec le quota de l'offre gratuite (100 000 requêtes par jour).
- Le volet « percer sur TikTok et Instagram » est à peine traité : aucun audit n'évalue les skills contenus-reseaux-video et hashtags-reseaux ni ne propose de lire les vraies statistiques d'un compte (seuls A8 et E6 l'effleurent).
- Aucun ne propose de valider l'outil avec de vrais dirigeants et de vrais sites (pilote de 5 à 10 TPE : temps jusqu'à la 1re action, compréhension, résultats à 90 jours) ; seul C propose un corpus pour les faux positifs.
- Données datées (prix, robots IA, « vérifié le ») sans alerte d'obsolescence automatique ; E propose un test de cohérence, pas d'expiration.
- Fiche Google connectée (Business Profile API : appels, itinéraires, avis du dirigeant) : personne ne la propose ; E vise les données publiques de Places et l'API Search Console.

## Commentaires
- C est le meilleur audit : ses cinq pages pièges et ses commandes se rejouent à l'identique et révèlent des faux positifs qui pousseraient une TPE à de mauvaises actions (2e balise GA4, schéma inutile, achat de liens, 1 500 € sur Meta), avec des correctifs chiffrés en heures et testables ; à compléter par le benchmark de marché de E et l'angle « lundi matin » de B.
- B est le plus utile : chaque constat se reproduit au chiffre près (350 € conseillés à l'aveugle, robots.txt de 28 lignes en « 15 min », « au beurre AOP, à. », version complète absente de main) et ses améliorations s'attaquent d'abord à ce qui empêche un boulanger d'agir lundi ; il faut lui adjoindre le benchmark de E, les pièges de C et la note provisoire de A.
- B est le meilleur de peu : chaque chiffre que j'ai rejoué tient (350 € conseillés à l'aveugle, robots.txt de 28 lignes classé « Vous ⏱ 15 min », 4 hôtes tiers, 404 sur main), ses améliorations partent de la réalité d'un boulanger sur téléphone et son benchmark le compare aux vraies alternatives d'une TPE (ChatGPT, Search Console, Localo). C le talonne par la profondeur de ses pages pièges et ses correctifs testables, et E apporte le meilleur benchmark du marché.
- B est le plus utile pour Nadir : sans erreur de fait relevée, il suit un boulanger réel et prouve que la promesse « un lien suffit » échoue (page claude.ai bloquée, version complète absente de main, impasse sur téléphone, 350 € conseillés sans valeur client), puis propose des correctifs courts, dans le bon ordre, avec un benchmark qui nomme les vraies alternatives d'une TPE (ChatGPT, Search Console, Localo) ; C le talonne par la justesse SEO de ses pièges, E par son benchmark.
- B l'emporte de peu devant C, plus profond sur la justesse des conseils : B part de la question décisive pour une TPE (« lundi, un boulanger peut-il auditer son site ? »), prouve chaque blocage et propose des correctifs courts et réalistes, dont des consignes par outil de site (Wix, Shopify, WordPress) qu'aucun autre audit ne donne.

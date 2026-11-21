```json
{
  "X": {"Honnêteté": 8, "Recommandations": 7, "Parcours": 7, "Couverture": 7, "Robustesse": 8, "Différenciation": 7, "total_sur_100": 73},
  "Y": {"Honnêteté": 5, "Recommandations": 5, "Parcours": 6, "Couverture": 6, "Robustesse": 4, "Différenciation": 5, "total_sur_100": 52.5},
  "meilleure": "X",
  "pourquoi": "X mesure plus juste et dit quand elle suppose : verdict publicitaire avec ses hypothèses, gains Search Console corrigés, pas de faux positifs sur tarteaucitron, GTM seul, microdata ou entreprise sans vitrine. Y annonce « Rentable » sur des marges supposées, conseille d'acheter des liens, et plante ou se laisse tromper là où X tient (bombe ZIP, JSON-LD profond, faux audit envoyé par une autre page, plugin incomplet).",
  "defauts_de_la_meilleure": [
    {"gravite": "critique", "defaut": "Une boutique en ligne est calculée comme une entreprise de devis : objectif « Demandes de devis » par défaut, verdict par « contact » avec 25 % de signature.", "preuve": "node critique/X/seo/cli.mjs budget --secteur ecommerce --valeur 60 → « coût maximal rentable par contact : 8 € » ; même résultat dans l'interface (critique-travail/scripts/goal.cjs) ; X/seo/budget-cli.mjs:10, X/seo/cli.mjs:124, X/docs/seo/engine/ads.js:78", "correctif": "Objectif par défaut selon le secteur (e-commerce, mode, déco, luxe → ventes ; app → téléchargements), affiché à côté du verdict avec un bouton pour le changer."},
    {"gravite": "élevée", "defaut": "Le correctif JSON-LD dégrade le balisage existant : Plumber devient HomeAndConstructionBusiness, areaServed et les horaires disparaissent, et une adresse est réclamée à une entreprise sans vitrine.", "preuve": "critique-travail/s2/X/127-0-0-1-18977-artisan2.md (« Schéma Plumber incomplet : address » + bloc proposé) ; X/docs/seo/engine/fixes.js:70-81 (type pris dans le secteur) ; audit.js:546", "correctif": "Partir du JSON-LD détecté : garder le type précis et les propriétés existantes, ne compléter que ce qui manque ; adresse facultative quand areaServed est déclaré."},
    {"gravite": "élevée", "defaut": "Le robots.txt « base à adapter » efface les règles du site : Disallow: /admin disparaît et le blocage de GPTBot devient un commentaire.", "preuve": "robots.txt du site de test (Disallow: /admin) contre le bloc du rapport critique-travail/s1-X/127-0-0-1-8766.md (aucune occurrence de /admin) ; X/docs/seo/engine/robots.js:87 ne reçoit que l'origine", "correctif": "Générer le modèle à partir du robots.txt lu : conserver les groupes existants, ne modifier que les robots de recherche IA, montrer la différence."},
    {"gravite": "élevée", "defaut": "Page claude.ai : le proxy, la clé PageSpeed, le jeton GitHub et le nombre de pages restent affichés alors qu'ils ne peuvent pas y fonctionner ; la note promet « il apparaît ici » sans base de données ; la page tente quand même PageSpeed et affiche « Failed to fetch ».", "preuve": "critique-travail/scripts/artifields.cjs (proxy, psiKey, githubToken, crawl : visible) ; scripts/hidden.cjs (attribut hidden posé, display:flex imposé par X/docs/seo/app.css:54) ; X/docs/seo/app.js:914 ; scripts/claudepage.cjs", "correctif": "[hidden]{display:none!important} ; en mode page, aucun appel à PageSpeed ni aux proxys, accroche et pied de page adaptés ; promesse « il apparaît ici » seulement si live.db existe."},
    {"gravite": "élevée", "defaut": "Le robots.txt collé est ignoré sans prévenir quand l'adresse est saisie sans https:// (le format même du champ, « votre-site.fr ») : le blocage de PerplexityBot n'est pas vu.", "preuve": "critique-travail/scripts/robotscolle.cjs : « maison-test.fr » → PerplexityBot non vu, part mesurée 80 % ; « https://maison-test.fr » → vu, 91 % ; X/docs/seo/app.js:136 (new URL(pasted.url) échoue)", "correctif": "Normaliser l'adresse (préfixe https://) avant de construire « pasted », comme pour l'analyse."},
    {"gravite": "élevée", "defaut": "Sur téléphone, l'en-tête collant de 127 px (onglets sur 3 lignes) cache le titre de chaque onglet après un clic, et le bouton Analyser est hors du premier écran (892 px pour 844).", "preuve": "critique-travail/scripts/sticky.cjs (X : headerBottom 127, h2Hidden true ; Y : 57, false) ; scripts/smoke.cjs (goTop 892) ; X/docs/seo/app.css:284 et :16 (scroll-padding-top 76 px)", "correctif": "Sous 560 px, onglets sur une ligne défilante (ou en-tête non collant) et scroll-padding-top égal à la hauteur mesurée de l'en-tête."},
    {"gravite": "moyenne", "defaut": "Un lien Instagram ou TikTok est bien reconnu, mais le plan ne contient que des actions de site (fiche Google, Search Console et « déclarer le sitemap », « relancez avec --avant ») et aucune action réseau.", "preuve": "node critique/X/seo/cli.mjs https://www.instagram.com/maisontest/ --secteur boulangerie --ville Lyon --no-psi", "correctif": "Si ctx.social : 3 actions réseau (bio et lien, rythme de Reels calé sur les temps forts, hashtags de niche, import des statistiques exportées) et renvoi vers le skill contenus-reseaux-video."},
    {"gravite": "moyenne", "defaut": "La boucle « corriger puis revérifier » ne se referme pas en ligne de commande : --avant affiche « Aucune dérive… Note 60 → 60 » sans les 4 corrections, que l'interface liste comme « corrigés et vérifiés ».", "preuve": "critique-travail/evol/apres-X/127-0-0-1-18977-evol.md et evol/apres-X.stdout ; interface : scripts/progres.cjs", "correctif": "Reprendre dans drift.js et cli.mjs le calcul « corrigés et vérifiés / nouveaux » de l'interface."}
  ]
}
```

# Critique indépendante de SEO 360 : X contre Y (5 novembre 2026)

**X est meilleure : 73/100 contre 52,5/100.** Le socle est commun (moteur, 21 skills, 6 onglets). X mesure plus juste, annonce ses hypothèses et résiste aux fichiers piégés. Y donne des verdicts publicitaires trop optimistes, des faux positifs et un plugin cassé, et laisse passer plusieurs failles.

Tout se rejoue depuis `critique-travail/` : scripts dans `scripts/`, pages pièges dans `pieges/site/` (`node scripts/serve.cjs pieges/site 18977`), sorties et captures dans les sous-dossiers. X et Y ont reçu les mêmes entrées, en 1366 et 390 px.

## Notes et preuves

**Honnêteté : X 8, Y 5**
- Boutique en ligne (`node critique/<v>/seo/cli.mjs budget --secteur ecommerce --objectif ventes --valeur 60`) : Y annonce « Rentable : ≈ 106 ventes à ≈ 14 € » sur une marge supposée qu'il ne dit pas (ROAS implicite 4,3). X conclut « Pas rentable… hypothèse : marge de 30 % » et alerte quand le ROAS dépasse 4.
- Sans aucune vérification, Y écrit « Rien de bloquant détecté » (ads.js:182).
- Search Console : Y promet +373 clics/mois, dont +94 sur une requête déjà 2e ; X annonce +168, corrigé de l'effet des réponses IA.
- Y conseille d'acheter des liens à « 80 à 400 € » (ads.js:235). Il présente le proxy comme facultatif (« si vous le choisissez », index.html:88) alors qu'il est utilisé par défaut. Il dit l'interface et le plugin publiés sur `main` (l'API GitHub répond 404). Son prix SE Ranking est périmé (65 $ au lieu de 129 $).
- Pages pièges (`pieges-out/`) : Y ne détecte aucun outil de mesure sous tarteaucitron et ne voit pas `nosnippet`. Il met un ✗ au consentement d'un site en GTM seul et signale l'absence d'un LocalBusiness déclaré en microdata. X juge juste.

**Recommandations : X 7, Y 5**
- Pour un plombier sans vitrine (`s2/`), Y met « Adresse introuvable » dans les 3 actions ; publier cette adresse va contre les règles de Google. X reconnaît la zone desservie.
- Sur WordPress, X donne 8 consignes « Où le faire », Y aucune.
- Le Markdown de Y est cassé : 129 lignes de code mal indentées produisent 20 faux titres H1 (`node scripts/mdcheck.mjs`) ; X n'en a aucune.

**Parcours : X 7, Y 6.** Sur téléphone et sans proxy (`MODE=reel node scripts/boulanger.cjs`) :
- X dit « Audit incomplet », propose « M'envoyer le lien » et affiche les 3 actions dans le premier écran.
- Y dit « Analyse terminée » et renvoie au clic droit et au bouton-favori. Ses actions sont à 1104 px.

Le contour du sélecteur de secteur contraste à 1,29:1 chez Y et à 4,02:1 chez X.

**Couverture : X 7, Y 6.** Les canaux sont identiques. Y traite un profil Instagram comme un site (« Page inaccessible, voir l'hébergeur »). Dans son plugin, `cli.mjs outils` échoue (ERR_MODULE_NOT_FOUND, plugin.mjs:26), alors que le skill `plan-croissance-360` en dépend.

**Robustesse : X 8, Y 4**
- Une bombe ZIP de 2 Mo fait monter Y à 2,18 Go puis le fait planter. Dans le navigateur, Y monte à 1,55 Go sans aucun message ; X refuse le fichier en 0,4 s.
- Un JSON-LD imbriqué sur 200 000 niveaux fait planter Y (html.js:234).
- Y accepte un faux audit envoyé par une autre page (`scripts/postmessage.cjs`).
- Le lien de partage de Y contient la marge et le budget.
- Aucune injection ne s'exécute dans l'une ou l'autre (`scripts/xss.cjs`).

**Différenciation : X 7, Y 5.** X ajoute Claude dans la page claude.ai, testé avec un faux `window.claude` : la sortie est échappée. Elle donne aussi des consignes par CMS.

## Les 8 défauts les plus graves de X

1. **Critique.** Une boutique en ligne est calculée comme une entreprise de devis : « coût maximal rentable par contact : 8 € ».
   - Preuve : `node critique/X/seo/cli.mjs budget --secteur ecommerce --valeur 60` et `scripts/goal.cjs`. Les valeurs par défaut sont dans budget-cli.mjs:10, cli.mjs:124 et ads.js:78.
   - Correctif : un objectif par défaut selon le secteur, affiché à côté du verdict.
2. **Élevée.** Le correctif JSON-LD dégrade le balisage : Plumber devient HomeAndConstructionBusiness, areaServed et les horaires sont perdus, et une adresse est quand même réclamée.
   - Preuve : `s2/X/127-0-0-1-18977-artisan2.md` ; fixes.js:70-81.
   - Correctif : partir du JSON-LD détecté et ne compléter que ce qui manque.
3. **Élevée.** Le robots.txt proposé efface l'existant : `Disallow: /admin` disparaît.
   - Preuve : `s1-X/*.md` ; robots.js:87 ne reçoit que l'origine.
   - Correctif : fusionner avec le fichier lu.
4. **Élevée.** La page claude.ai affiche le proxy, la clé PageSpeed et le jeton, que la page ne peut pas utiliser. Sa note promet « il apparaît ici » sans base de données, et l'écran montre « Failed to fetch ».
   - Preuve : `scripts/artifields.cjs` et `scripts/hidden.cjs` (l'attribut `hidden` est écrasé par app.css:54) ; app.js:914.
   - Correctif : `[hidden]{display:none!important}`, aucun appel externe dans la page, et la promesse seulement si `live.db` existe.
5. **Élevée.** Le robots.txt collé est ignoré quand l'adresse est saisie sans https://.
   - Preuve : `scripts/robotscolle.cjs`, où PerplexityBot n'est pas vu ; app.js:136.
   - Correctif : normaliser l'adresse saisie.
6. **Élevée.** Sur téléphone, l'en-tête collant de 127 px cache le titre de chaque onglet, et le bouton Analyser est hors écran.
   - Preuve : `scripts/sticky.cjs` ; app.css:284.
   - Correctif : onglets sur une ligne défilante, `scroll-padding-top` égal à la hauteur réelle de l'en-tête.
7. **Moyenne.** Un lien Instagram ou TikTok ne donne aucune action réseau.
   - Preuve : `node critique/X/seo/cli.mjs https://www.instagram.com/maisontest/ --secteur boulangerie --no-psi`.
   - Correctif : 3 actions sociales et un renvoi vers `contenus-reseaux-video`.
8. **Moyenne.** En ligne de commande, `--avant` affiche « Note 60 → 60 » sans les 4 corrections, que l'interface, elle, liste.
   - Preuve : `evol/apres-X/127-0-0-1-18977-evol.md` et `evol/apres-X.stdout`.
   - Correctif : reprendre la liste « corrigés et vérifiés » de l'interface.

**À traiter ensuite :**
- L'échec des suggestions Google n'est pas signalé (keywords.js:88).
- La page proposée contient « à Lyon à Lyon » (fixes.js:173).
- La fiche Google n'apparaît pas dans les 3 actions d'un commerce local.

## Réponse

Preuves : `/tmp/claude-0/-home-user-rgte-redesign/137803cc-e0f1-5e43-837f-1ccac4c64755/scratchpad/conseil-v3/preuves/B/`. Testé : v3 servie sur 8810 et 8820, identique à `conseil-v3/avant/`.

### 1. Note : 65/100

| Critère (poids) | /10 | Justification |
|---|---:|---|
| Honnêteté (20) | 7 | Pas de note sans lecture ; mais « 91 % des contrôles » gonflé, promesse de confidentialité fausse, 350 € « conseillés » à l'aveugle. |
| Recommandations (25) | 6,5 | 3 actions avec qui et durée, bon message au prestataire ; mais tâches « Vous » infaisables, texte à coller cassé. |
| Parcours (20) | 5 | Rapide, exemple en 1 clic. Mais impossible d'auditer son site depuis la page publiée ou un téléphone. |
| Multicanal (15) | 7,5 | Google, local, IA, pub, hashtags, calendrier, Search Console ; réseaux ni publiés ni mesurés. |
| Robustesse (10) | 6,5 | 34 tests sur 35. Lecture par 2 proxys publics gratuits ; Markdown cassé. |
| Différenciation (10) | 7 | Gratuit, français, sans compte, correctifs prêts à coller. Ni données réelles ni fiche Google connectée. |

### 2. Les 8 problèmes

1. **Critique : lundi, un boulanger ne peut pas auditer son site.** La page claude.ai bloque l'analyse (p2) ; reste le code source à coller, sur ordinateur. La « version complète » et `.claude-plugin/` ne sont pas sur `main` (`gh api "repos/valeriongg/rgte-redesign/contents/docs/seo?ref=main"` → 404) : la page GitHub Pages et `/plugin install … --marketplace valeriongg/rgte-redesign` échoueront probablement [À VÉRIFIER, github.io bloqué ici].
2. **Majeur : si la lecture échoue, le téléphone est une impasse.** Sur 8810, l'échec arrive en 2 s (réseau bloqué ici). Les remèdes : un favori « sur ordinateur », un « clic droit », ou `node seo/cli.mjs`, « aucune installation » selon `app.js:666`, alors qu'il faut Node et le dépôt. La ligne d'état conseille une clé PageSpeed, hors sujet. Les données partent vers 4 hôtes tiers, malgré « tout reste dans votre navigateur » (`index.html:38`).
3. **Majeur : 350 €/mois « conseillés » à l'aveugle.** `node seo/cli.mjs budget --secteur boulangerie` affiche « Budget de départ conseillé : 350 € » et « Rien de bloquant détecté », alors que les 6 points sont à « ? ». Avec `--valeur 35 --marge 60` : « Pas rentable aujourd'hui » (`engine/ads.js:192`).
4. **Majeur : des tâches « Vous » hors de portée.** Action n° 2 de l'exemple : un robots.txt de 28 lignes (Content-Signal, « décommentez »), étiqueté « Vous ⏱ 15 min ». Rien ne dit où le coller sous Wix, Shopify ou WordPress.
5. **Majeur : un texte « prêt à coller » fautif.** L'exemple propose « Pâtisserie lyon : Depuis 1998… au beurre AOP, à. », repris dans le message au prestataire (`engine/fixes.js:58-62`).
6. **Important : des chiffres contradictoires.**
   - Le même site a 66/100 en Synthèse et 73 dans Concurrents (accueil seul, dit en petit).
   - « 3 actions », puis « Cette semaine 0/9 », pastille « 10 », « 0/48 » ; la fiche Google passe de la 1re à la 8e place.
   - La même carte Search Console affiche « 2 741 clics », « 500 → 475 (-5 %) » et « chute de 40 % ».
   - « 91 % des contrôles » est une part pondérée de catégories (`engine/audit.js:488-491`). Le code collé donne aussi 91 %, sans robots.txt ni vitesse (p4).
7. **Important : sur mobile, l'essentiel est enfoui.** À 390 px : 3 onglets sur 6 hors écran ; 1re tâche à 959 px, après 18 contrôles ; cases de 20 × 20 px (p5).
8. **Moyen : trop de jargon, trop de contenu.**
   - Synthèse : 16 termes techniques en 345 mots.
   - En-têtes de Concurrents tronqués : « MESURE, », deux « VITESSE » (`app.js:640`).
   - 18 outils le 1er mois, dont le Pixel Meta, alors que la pub n'est « pas rentable ».
   - Rapport CLI : 10 054 mots, blocs de code cassés (`engine/report.js:46-47`, vérifié avec prettier).
   - Erreur brute « Failed to fetch » sur la page claude.ai (`app.js:179`).
   - Bouton Search Console « Télécharger le fichier ZIP » inexistant (`app.js:489`).

### 3. Les 8 améliorations

| # | Amélioration | Impact | Effort | Comment |
|---|---|---|---|---|
| 1 | Publier la version complète et y renvoyer depuis claude.ai | Très fort | < 1 jour | Fusionner dans `main` ; bouton « Analyser mon site » ; tester `/plugin`. |
| 2 | Lecture fiable par défaut | Fort | ½ jour | Le Worker existant (`seo/proxy`) d'abord, les proxys publics en secours. |
| 3 | Jamais de budget « conseillé » sans valeur client | Fort | < 1 jour | Demander « Combien rapporte une commande ? » dans la carte Budget. |
| 4 | « Qui » réaliste et « où coller » selon l'outil de site | Fort | 2 jours | Réutiliser la détection Wix, Shopify et WordPress ; robots.txt et schémas en « Webmaster ». |
| 5 | Une seule liste de 3 actions | Moyen-fort | < 1 jour | Même ordre et même note partout. |
| 6 | Des textes justes | Moyen | < 1 jour | Couper la description en fin de phrase ; dire « page non lue » ; lister ce qui a été lu au lieu du % ; traduire les erreurs ; indenter le code Markdown. |
| 7 | Mobile d'abord | Moyen-fort | 1 jour | Tâches avant les exports, filtres repliés, onglets en bas, cases de 44 px. |
| 8 | 3 outils par semaine au plus | Moyen | < 1 jour | Filtrer selon le verdict (pas de pixel sans pub). |

### 4. Benchmark

| Outil (prix) | Fait mieux | SEO 360 fait mieux | Source |
|---|---|---|---|
| ChatGPT (Go 8 $/mois, Plus 20 $/mois, prix US) | Déjà sur le téléphone ; converse, rédige | Mesure au lieu d'improviser ; correctifs tirés de la page | macrumors.com/2026/01/16/chatgpt-go-now-available-worldwide |
| Search Console et fiche Google (gratuits) | Vraies données ; fiche modifiable sur mobile | Dit quoi faire ; lit l'export en français clair | search.google.com/search-console/about ; developers.google.com/search/blog/2020/02/data-export |
| Ubersuggest (29 $/mois ou 290 $ à vie) | Audite tout site en 1 clic ; vrais volumes ; positions | Gratuit, en français ; local, IA, pub, hashtags | capterra.com/p/229169/Ubersuggest/pricing |
| Semrush Pro (139,95 $/mois) | Profondeur des données | Prix ; 3 actions au lieu de 100 indicateurs ; droit français | seo.com/blog/semrush-pricing |
| Localo (≈ 39 à 49 $/mois) | Relié à la fiche Google ; tâches de la semaine faisables au téléphone | Site, IA, pub, réseaux ; gratuit | localo.com/local-seo-tool/smart-tasks ; dupple.com/learn/best-local-seo-tools |
| Metricool (gratuit ; Starter ≈ 20 $/mois) | Programme, publie, statistiques réelles | Hashtags par niveau, calendrier, budget pub | socialpilot.co/insights/metricool-pricing |

## Hypothèses

- Cas type : boulanger surtout sur téléphone, site sous Wix, Shopify ou WordPress, sans webmaster, panier de 5 à 40 €.
- 8820 reproduit fidèlement claude.ai.
- Sur Internet ouvert, l'analyse marche quand les proxys publics répondent [À VÉRIFIER].
- 4 clics jusqu'au premier correctif copié (1,9 s par automate) ; un humain : 1 à 2 minutes [À VÉRIFIER].

## Faiblesses connues

- Aucun vrai dirigeant n'a testé.
- Web réel, GitHub Pages et plugin non testés (réseau bloqué) ; skills lus, pas exécutés.
- Prix tirés de comparateurs, en dollars ; outils du benchmark non essayés.
- Dépôt modifié pendant l'audit (`seo/live.js`) : constats valables pour la v3 servie.

## Confiance

Moyenne : constats reproduits par script, capture et commande, mais parcours réel sur Internet et temps humains non mesurés.

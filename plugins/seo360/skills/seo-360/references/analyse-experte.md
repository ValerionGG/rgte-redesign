# Analyse experte : grilles et modèles

La CLI mesure (technique, balises, vitesse, robots, données structurées). Ce fichier sert à faire ce qu'elle ne fait pas : comprendre le métier du client, regarder ce que Google montre vraiment, lire les concurrents, et écrire des propositions qu'on ne pourrait pas coller sur un autre site.

## 1. Lire une page comme un client

| Question | Où regarder | Constat utile (exemple de forme) |
|---|---|---|
| Quoi, pour qui, où, en 5 secondes ? | titre, H1, premier écran | « Le H1 dit "agencement", pas "vitrines réfrigérées" : le produit vendu n'apparaît qu'au 3e écran. » |
| Quelle offre ? | menus, pages gammes, tarifs | gammes, prix ou « sur devis », délais, zone servie, SAV |
| Quelles preuves ? | réalisations, références, avis, chiffres | « 12 réalisations sans lieu ni nom de client : impossible de juger. » |
| Comment contacter ? | en-tête, pied de page, mobile | téléphone cliquable, devis en combien de clics, champs du formulaire |
| Qu'est-ce qui freine ? | tout le parcours | page devis introuvable, mentions légales en texte sans lien, prix absents sans explication |

## 2. Les 5 requêtes à tester

Adapter au métier, en français, comme un client les tape. Au moins 3 sans la marque.

| Activité | Requêtes types |
|---|---|
| Fabricant, B2B | « <produit> sur mesure », « fabricant <produit> », « <produit> pour <métier client> », « <produit> prix », « <produit> <région> » |
| Artisan, service local | « <métier> <ville> », « <prestation> prix », « <problème> urgence <ville> », « avis <métier> <ville> », « meilleur <métier> <ville> » |
| Commerce, restaurant | « <type> <ville> », « meilleur <type> <ville> », « <type> ouvert dimanche <ville> », « <spécialité> <ville> », « <type> près de moi » |
| E-commerce | « acheter <produit> », « <produit> pas cher », « meilleur <produit> 2026 », « <produit> avis », « alternative à <marque concurrente> » |
| Logiciel, SaaS | « logiciel <besoin> », « <besoin> gratuit », « alternative à <concurrent> », « <concurrent> vs <concurrent> », « <besoin> pour <métier> » |
| Application | « application <besoin> », « app <besoin> gratuite », puis la même recherche dans l'App Store et Google Play |

Pour chaque requête, noter : les 5 premiers domaines et leur type de page, la présence d'un pack local, d'une réponse IA (AI Overviews) et de publicités. Ne jamais donner de volume ni de position sans source (Search Console, Keyword Planner, suggestions Google de la CLI).

## 3. Lire un concurrent

| Point | À noter |
|---|---|
| Promesse | son H1 et son titre, mot pour mot |
| Preuves | réalisations, références, chiffres, labels |
| Offre | gammes, prix affichés ou non, délais, services en plus |
| Contenus | guides, FAQ, comparatifs, vidéos : les sujets qu'il traite et pas le client |
| Réputation | note et nombre d'avis Google, réponses aux avis |
| Ce qu'il fait mieux | une phrase précise |
| L'angle libre | ce qu'aucun concurrent ne dit et que le client peut prouver |

## 4. Ce que les règles ne voient pas : à croiser

- **Sitemap incomplet** : `ctx.sitemap.count` très inférieur aux pages trouvées par l'exploration (`ctx.crawl.discovered`) : Google découvre mal le catalogue.
- **Titres** : le même titre sur plusieurs pages, le produit absent du titre, la marque absente, des gammes sans page à elles.
- **Liens internes** : page devis ou gammes à plus de 2 clics ; mentions légales, CGV ou cookies écrits sans lien.
- **Offre et demande** : une requête existe (suggestion, concurrent classé) mais aucune page n'y répond.
- **Confiance** : réalisations sans lieu ni client, avis non affichés, aucun chiffre vérifiable.
- **Données structurées** : catalogue sans `Product`, entreprise sans `Organization` ou `LocalBusiness` complet.

## 5. Modèles de propositions

**Réécriture d'une page** (une ligne par élément) :

| Page | Élément | Actuel | Proposé | Longueur | Preuve |
|---|---|---|---|---|---|
| / | Titre | « Vitrines boulangerie, pâtisserie, chocolatiers » | « Vitrines réfrigérées sur mesure pour boulangeries \| Exemple » | 59 | la mesure : titre sans marque ni « sur mesure » ; la recherche : requêtes testées à l'étape 2 |
| / | Meta description | absente | « Fabricant de vitrines réfrigérées sur mesure pour boulangeries, pâtisseries et traiteurs. Bureau d'études, devis gratuit, installation partout en France. » | 153 | absente : Google choisit un extrait au hasard |

Exemple de forme, à refaire avec les mots du client : ne jamais promettre qu'un titre « fera monter » la page.

**Contenu à créer** :

| Titre | Requête visée | Preuve de demande | Plan (H2) | Liens vers et depuis |
|---|---|---|---|---|

**Autres canaux** : l'action exacte, pas le principe. Fiche Google : la catégorie principale précise et les 3 secondaires. Avis : le texte de la demande, prêt à envoyer. Publicité : les mots-clés, l'annonce et la page d'arrivée. Réseaux : les 3 premières publications, écrites à partir des produits réels.

## 6. Erreurs fréquentes

- Recopier les constats de la CLI sans les relier au métier ni aux pages.
- Recommander un outil payant sans dire pourquoi celui-là, son prix daté (`node "${CLAUDE_SKILL_DIR}/../../seo/cli.mjs" outils`) et l'alternative gratuite.
- Proposer un titre ou une description sans compter les caractères.
- Inventer un volume, une position, un CPC ou un concurrent.
- Donner 30 actions de même poids : 3 cette semaine, le reste classé par impact et effort.

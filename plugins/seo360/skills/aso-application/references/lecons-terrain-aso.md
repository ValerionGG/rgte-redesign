# Leçons de terrain ASO (chantier RaceLink, novembre 2026)

Ce qui a servi sur de vraies fiches App Store et Google Play. Les exemples viennent du chantier ; refaire chaque mesure avant d'agir.

## 1. Ce qui rapporte le plus, dans l'ordre

1. **Les risques bloquants d'abord** : « Aucune donnée collectée » sur Google Play alors que l'app a des comptes, une messagerie ou des photos ; étiquette Apple qui déclare des coordonnées « sans lien avec vous ». Une fausse déclaration peut bloquer les mises à jour.
2. **Nom + sous-titre** : 35 % du poids de la fiche Apple, 0 € et 1 h de travail. Un nom de 8 caractères sur 30 sans mot-clé est le plus gros manque à gagner. Forme : « Marque : mot-clé principal » (nom), puis 3 ou 4 mots nouveaux (sous-titre).
3. **Langue de la fiche et de la build** : une app déclarée en anglais ne sort pas sur les recherches françaises.
4. **Réponses aux avis** : 100 % des avis négatifs, en moins de 24 h, méthode HEAR (écouter, montrer qu'on a compris, agir, répondre).
5. Captures, vidéo, événements in-app, pages produit personnalisées.

## 2. Règles par champ

| Champ | Règle |
|---|---|
| Mots-clés Apple | 100 **octets** UTF-8 : « é » en vaut 2. Virgules sans espace. Aucun mot déjà dans le nom ou le sous-titre (Apple l'indexe une seule fois). Pas de doublon. |
| Nom et sous-titre Apple | Pas de « gratuit », « n°1 », « meilleur », emoji, ni marque d'autrui (championnat, fédération, constructeur, concurrent). |
| Description Apple | Non lue par la recherche Apple : elle sert à convaincre, pas à classer. Prix clair et appel à l'action. |
| Description courte Play | 80 caractères, sans répéter le titre. |
| Description longue Play | Lue par la recherche : mot-clé principal dans les 167 premiers caractères. |
| Image de présentation Play | 1024 × 500, un seul message. |
| Captures | Les 3 premières = 3 bénéfices, 4 à 6 mots chacune ; jamais l'écran de connexion en premier. |
| Promesses | Pas de promesse plus large que le produit (« toutes les courses du monde entier ») : motif de refus et d'avis négatifs. |

Contrôle : `node "${CLAUDE_SKILL_DIR}/../../seo/cli.mjs" fiche …` (voir le skill).

## 3. Noter une fiche sans se tromper

- Une note par critère, sur 10, **avec sa raison**. « ? » quand ce n'est pas mesurable (mots-clés cachés, classements).
- Calculer la moyenne **sur les critères notés seulement**, et le dire.
- Donner la note d'aujourd'hui et la note attendue une fois le kit appliqué.
- Regarder les « Vous aimerez peut-être aussi » : ce sont les voisins que le store vous attribue, et la plupart ont un sous-titre.

## 4. Ce qui ne se mesure pas depuis le cloud

La recherche App Store, l'API iTunes Search et la recherche Google Play refusent souvent la lecture automatique depuis un centre de données. Ne pas contourner : mesurer depuis l'ordinateur de l'utilisateur, ou lire la fiche dans son navigateur.

## 5. Erreurs vues dans les packs ASO tiers

- Mots-clés Apple comptés en caractères (c'est en octets).
- Poids d'une grille qui totalisent 110 %.
- « Demandez d'abord si l'utilisateur aime l'app » : interdit par les consignes Android.
- « Les notes se remettent à zéro à chaque version » : faux, c'est un choix du développeur ; avec peu de notes, ne pas remettre à zéro.
- Nombre de pages produit personnalisées qui diffère d'un pack à l'autre (35 ou 70) : vérifier dans App Store Connect.

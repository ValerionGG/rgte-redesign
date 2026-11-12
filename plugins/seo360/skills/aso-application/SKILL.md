---
name: aso-application
description: ASO des applications iOS et Android : audit de la fiche App Store ou Google Play (titre, sous-titre, mots-clés, captures, notes), 3 options par champ avec leur longueur, ASO saisonnier, Custom Product Pages, In-App Events, Apple Ads. À utiliser avec un lien apps.apple.com ou play.google.com, ou pour « plus de téléchargements », « mon appli n'est pas trouvée », « mots-clés App Store », « aso ». Site de l'app → seo-360.
metadata:
  version: "2.1"
---

# ASO : référencer une application

> **Contexte d'abord** : si `.claude/contexte-entreprise.md` existe, le lire avant toute question et ne demander que ce qui manque ; y enregistrer les nouvelles réponses. Sinon, proposer de le créer avec le skill `contexte-entreprise` (2 minutes).

## Règles essentielles

- **Données non publiques** (champ mots-clés iOS, taux de conversion, installations, recherches) : les demander, ou écrire « à vérifier dans App Store Connect / Play Console ». Ne jamais les estimer.
- **Compter les caractères** de chaque proposition et respecter les limites. Livrer **3 options par champ**, avec leur nombre de caractères.
- Google Play : sans note ni avis lisibles, l'audit est marqué incomplet (`result.incomplete`, pas de note).

## 1. Audit

`node "${CLAUDE_SKILL_DIR}/../../seo/cli.mjs" https://apps.apple.com/fr/app/<nom>/id<ID> --mot-cle "<mot-clé>" --secteur app-mobile`

La commande lit la fiche iOS via l'API iTunes Lookup et la fiche Android sur Google Play.

## 2. Maturité de la marque (règle la stratégie et la notation)

| Maturité | Signe | Stratégie de mots-clés |
|---|---|---|
| Dominante | on la cherche par son nom | protéger la marque (Apple Ads sur le nom), travailler la conversion de la fiche |
| Établie | quelques recherches de marque, bonnes notes | termes génériques moyens + marque |
| Challenger | inconnue, peu d'avis | longue traîne précise (usage + public + bénéfice) ; éviter les termes génériques très disputés |

Ne pas juger une application challenger sur sa position pour un terme générique : la juger sur les termes précis qu'elle peut gagner.

## 3. Métadonnées

| Champ | Limite | Indexé pour la recherche | À savoir |
|---|---|---|---|
| iOS : nom | 30 | oui, champ le plus pondéré | mot-clé principal après la marque |
| iOS : sous-titre | 30 | oui | bénéfice + 2e mot-clé |
| iOS : champ mots-clés | 100 **octets** (une lettre accentuée en vaut 2) | oui (privé) | virgules sans espaces, pas de mot déjà dans le nom ou le sous-titre, singulier ; ne change qu'avec une nouvelle version |
| iOS : texte promotionnel | 170 | non | modifiable à tout moment sans nouvelle version : idéal pour les offres et les saisons |
| iOS : description | 4 000 | non pour l'App Store | sert la conversion (et la page web de la fiche) |
| Android : titre | 30 | oui | |
| Android : description courte | 80 | oui | |
| Android : description longue | 4 000 | oui | 3 à 5 mots-clés répétés naturellement |

Format de livraison, par champ :

```text
Sous-titre (30 car.)
1. Méditation guidée en 5 min      (26)
2. Sommeil, stress et respiration  (30)
3. Respirer mieux, dormir mieux    (28)
```

Pas de nom d'application concurrente, de marque déposée ni de prix dans les métadonnées : l'App Review le refuse (règle 2.3.7 des App Review Guidelines).

### Contrôle avant envoi (obligatoire)

```bash
node "${CLAUDE_SKILL_DIR}/../../seo/cli.mjs" fiche --store apple --nom "…" --sous-titre "…" --mots-cles "a,b,c" --marques "marque1,marque2"
node "${CLAUDE_SKILL_DIR}/../../seo/cli.mjs" fiche --store play --titre "…" --description-courte "…" --description-longue fiche.txt --mot-cle "…"
```

Il vérifie les longueurs (mots-clés Apple en octets), les doublons, les mots déjà pris par le nom ou le sous-titre, les mots refusés dans un titre (« gratuit », « n°1 », « meilleur », emoji), les marques d'autrui passées en `--marques`, et la présence du mot-clé dans les 167 premiers caractères sur Google Play. Leçons d'un vrai chantier : [references/lecons-terrain-aso.md](references/lecons-terrain-aso.md).

## 4. Conversion de la fiche

- Icône simple, lisible en petit ; la tester.
- Captures : jusqu'à 10 sur l'App Store, jusqu'à 8 par type d'appareil sur Google Play. Les 3 premières décident : un bénéfice écrit en gros sur chacune.
- Vidéo : aperçu de 30 secondes au maximum sur l'App Store, vidéo YouTube sur Google Play.
- Tests : Product Page Optimization (iOS) et tests de fiche (Play Console). Un seul changement à la fois.

## 5. Notes et avis

- Demander l'avis dans l'application après un moment réussi (tâche terminée, objectif atteint), jamais au premier lancement. iOS : SKStoreReviewController, que le système n'affiche que 3 fois par an au maximum. Android : In-App Review API.
- Répondre aux avis, surtout négatifs, et dire ce qui a été corrigé dans la mise à jour.
- Repère : viser 4,5 ou plus. En dessous de 4, corriger d'abord les causes citées dans les avis.

## 6. Fraîcheur et qualité

- Mise à jour toutes les 4 à 6 semaines (repère), avec des notes de version utiles.
- Android vitals : rester sous les seuils de mauvais comportement de Google Play, soit 1,09 % de plantages perçus et 0,47 % d'ANR perçus.

## 7. Localisation

Traduire et adapter la fiche par marché (mots-clés de la langue locale, captures traduites). Sur iOS, certaines localisations supplémentaires sont indexées dans un pays et ajoutent un champ de mots-clés : vérifier lesquelles dans la documentation d'Apple pour le pays visé.

## 8. Leviers payants et événementiels

- Custom Product Pages (iOS) et fiches personnalisées (Play) : une page par audience ou par campagne.
- In-App Events (iOS) et Promotional Content (Play) : défis, nouveautés, événements saisonniers visibles dans la boutique.
- Apple Ads (anciennement Apple Search Ads) : marque + 5 à 10 termes génériques pour démarrer. Campagnes App de Google : budget et montée en charge → budget-publicite.

## 9. ASO saisonnier (calendrier français)

Prendre les dates du skill calendrier-marketing-fr (rentrée, Noël, bonnes résolutions de janvier, soldes, fêtes) et préparer :
- le texte promotionnel et les captures de saison, sans nouvelle version ;
- le champ mots-clés saisonnier, qui demande une nouvelle version soumise **avant** la saison ;
- un In-App Event ou un Promotional Content pour le temps fort.

## 10. Site de l'application

Vérifier d'abord où mènent les boutons « Télécharger » du site : vers les fiches des stores, pas vers une page d'inscription ou un site de test (contrôles `store-links` et `staging-links` de l'audit). Smart App Banner, liens universels (iOS) et App Links (Android), schéma `SoftwareApplication`, une page par fonctionnalité pour le SEO (seo-360), contenus TikTok et Reels (contenus-reseaux-video).

## Format de sortie

1. **Verdict** : la maturité de la marque et les 3 changements qui feront le plus d'effet.
2. Tableau `Champ | Actuel | Option 1 | Option 2 | Option 3`, avec le nombre de caractères de chaque option.
3. Conversion : captures, icône, vidéo, tests à lancer.
4. Notes et avis : diagnostic et plan.
5. Plan saisonnier des 3 prochains mois.
6. **À vérifier** dans App Store Connect ou la Play Console.

## Quand ne pas l'utiliser

- Le site web de l'application, ou son référencement sur Google → seo-360.
- Le budget des campagnes d'installation → budget-publicite.
- Les dates des temps forts → calendrier-marketing-fr.
- Les vidéos TikTok ou Reels de l'application → contenus-reseaux-video.

## Terminé quand

- [ ] La maturité de la marque est établie et la stratégie de mots-clés en découle.
- [ ] 3 options par champ, chacune dans sa limite, avec son nombre de caractères.
- [ ] Chaque fiche proposée passe `node "${CLAUDE_SKILL_DIR}/../../seo/cli.mjs" fiche` sans erreur.
- [ ] La déclaration de données (Google Play) et l'étiquette de confidentialité (Apple) sont comparées à ce que l'app collecte vraiment.
- [ ] Le texte promotionnel (iOS) et un plan saisonnier sont proposés.
- [ ] Les données non publiques sont marquées « à vérifier ».
- [ ] Les causes des mauvais avis sont listées avec leur correctif.

## Jamais

- Envoyer une fiche sans l'avoir passée au contrôle `fiche`, ou compter les mots-clés Apple en caractères.
- Demander « Vous aimez l'app ? » avant la fenêtre de note (interdit par les consignes Android).
- Mettre le nom d'une application concurrente ou une marque déposée dans les métadonnées.
- Acheter des avis, des notes ou des installations, ou récompenser un avis.
- Demander un avis au premier lancement, ou seulement aux utilisateurs satisfaits.
- Annoncer un volume de recherche ou un classement qu'on n'a pas mesuré.

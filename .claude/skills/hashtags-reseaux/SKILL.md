---
name: hashtags-reseaux
description: Hashtags et légendes par réseau (Instagram, TikTok, LinkedIn, YouTube, X, Facebook, Pinterest, Threads, Bluesky, Snapchat) selon le secteur, la ville et la marque, avec les règles 2026 (5 au maximum sur Instagram), un niveau par hashtag (niche, moyen, large) et une réserve à faire tourner. À utiliser pour « quels hashtags mettre », « hashtag pour mon post », « hastags tiktok », « combien de hashtags sur LinkedIn », « légende de post ». Scripts et plan de posts → contenus-reseaux-video ; hashtags réellement employés → veille-sociale.
metadata:
  version: "2.0"
---

# Hashtags et légendes par réseau

> **Contexte d'abord** : si `.claude/contexte-entreprise.md` existe, le lire avant toute question et ne demander que ce qui manque ; y enregistrer les nouvelles réponses. Sinon, proposer de le créer avec le skill `contexte-entreprise` (2 minutes).

## Ce qu'il faut savoir avant de commencer

- **Les hashtags pèsent peu.** Sur Instagram, 5 hashtags donnent la meilleure portée, mais seulement +2 % par rapport à aucun (1,6 million de publications, [Fanpage Karma](https://www.fanpagekarma.com/insights/do-instagram-hashtags-work/)). Sur TikTok, ils apportent environ 10 % des vues, le fil « Pour toi » domine ([Metricool 2026](https://metricool.com/press-release-tiktok-study-2026/)). Le sujet, l'accroche et les mots-clés écrits dans la légende et à l'écran comptent davantage : le dire au client.
- **Un hashtag populaire hors sujet nuit** : il expose le post à un public qui ne s'y intéresse pas.
- **Aucune API gratuite ne donne le nombre de publications par hashtag.** Les niveaux ci-dessous sont des niveaux *attendus*. Faire vérifier le compteur réel via le lien de chaque hashtag (interface) ou dans la recherche de l'application, et ne jamais inventer un volume.

## Générer

- **Interface** : onglet « Mots-clés & réseaux » de https://valeriongg.github.io/rgte-redesign/seo/. On y règle le secteur, la ville, le mot-clé et la marque ; chaque hashtag affiche son niveau attendu et un lien vers sa page sur le réseau.
- **Ligne de commande, sans audit** : `node seo/cli.mjs hashtags --secteur <id> --mot-cle "<mot-clé 1>, <mot-clé 2>" --ville <ville> --marque "<nom>"` → hashtags par réseau avec leur niveau attendu, réserve à faire tourner et modèle de légende (`--json` pour les données).
- **Avec l'audit du site** : `node seo/cli.mjs <url> --secteur <id> --mot-cle "<mot-clé>" --ville <ville> --marque "<nom>"` → section hashtags du rapport, réseau par réseau. Secteurs et bases de hashtags : `seo/data/sectors.js` ; règles par réseau : `seo/data/research/benchmarks.json` → `social_rules`.
- **Données réelles** : lancer d'abord le skill veille-sociale. Les hashtags observés dans au moins 2 publications réelles passent devant les gabarits (la veille importée dans l'interface est prise en compte automatiquement).

## Niveaux et mélange

Repère tiré de la pratique, pas une règle officielle :

| Niveau | Publications utilisant le hashtag | Rôle |
|---|---|---|
| Niche | moins de 50 000 | se classer parmi les publications du hashtag, public très ciblé (métier + ville, produit précis) |
| Moyen | de 50 000 à 500 000 | élargir sans se noyer |
| Large | plus de 500 000 | contexte du sujet, presque aucune chance de s'y classer |

Mélange pour 5 hashtags : 2 ou 3 niche, 1 ou 2 moyens, 0 ou 1 large. Le hashtag de marque compte parmi les hashtags de niche. Changer la réserve selon le sujet du post plutôt que de recopier la même ligne à chaque fois.

## Règles par réseau

| Réseau | Nombre | Placement et remarques |
|---|---|---|
| Instagram | 3 à 5 (5 au maximum depuis décembre 2025) | Dans la légende plutôt qu'en premier commentaire : +29 % de portée dans un test d'Agorapulse sur 3 comptes, preuve faible ([Agorapulse](https://www.agorapulse.com/social-media-lab/instagram-hashtags-comments-post)). Mot-clé écrit en clair : le contenu public des comptes pros est indexé par Google depuis le 10/07/2025. |
| TikTok | 3 à 5 | Plafond de 5 signalé depuis août 2025, contesté. Mot-clé dit à l'oral et écrit à l'écran dans les 3 premières secondes. |
| LinkedIn | 0 à 3 | Le modèle de classement lit le sens du texte ([AuthoredUp](https://authoredup.com/blog/linkedin-360brew)). |
| YouTube | 2 ou 3 | Les 3 premiers s'affichent au-dessus du titre ; au-delà de 60, YouTube les ignore tous. |
| Threads | 1 | Un seul tag de sujet. |
| X, Bluesky | 1 ou 2 | Ils comptent dans la limite de caractères. |
| Facebook, Pinterest | 0 à 2 | Préférer les mots-clés naturels dans le texte. |
| Snapchat | 1 à 3 | Sujets de Spotlight. |

Écriture : en CamelCase pour les tags composés générés (#PatisserieLyon, #VitrineRefrigereeSurMesure : l'expression entière, sans retirer de mot au milieu), sans accents, « métier + ville » avant « ville » seule, un hashtag de marque fixe.

## Légende

- **Instagram** : accroche dans les 125 premiers caractères (la partie visible avant « plus »), corps facile à survoler, un seul appel à l'action, hashtags à la fin.
- **TikTok et Reels** : le lot de 6 à 10 accroches en 3 couches (image, voix, texte à l'écran) et les scripts relèvent du skill contenus-reseaux-video.
- Relire chaque légende avec la grille anti-tics d'IA du skill contenus-reseaux-video (notée par densité).

## Livrer

Pour chaque réseau prioritaire du secteur :
1. la ligne à copier, chaque hashtag avec son niveau attendu ;
2. la réserve à faire tourner ;
3. une légende modèle ;
4. le rythme et les créneaux (`social_rules`) ;
5. la consigne de vérification des compteurs.

Puis 3 idées de posts reliées aux mots-clés SEO, pour qu'un même sujet soit décliné sur le site et sur les réseaux.

## Quand ne pas l'utiliser

- Scripts vidéo, accroches, carrousels, plan de publication → contenus-reseaux-video.
- Ce que les internautes disent ou cherchent vraiment sur un sujet → veille-sociale.
- Hashtags saisonniers d'un temps fort (fête des mères, Noël) → calendrier-marketing-fr pour la date, puis ce skill.
- Publicité payante sur les réseaux → budget-publicite.

## Terminé quand

- [ ] Le nombre de hashtags respecte la règle de chaque réseau.
- [ ] Chaque hashtag a un niveau attendu, le mélange niche / moyen / large est respecté et aucun tag n'est hors sujet.
- [ ] Une réserve est fournie et la consigne de vérification des compteurs est donnée.
- [ ] La légende Instagram a son accroche dans les 125 premiers caractères.
- [ ] Aucun hashtag de la liste noire n'apparaît.

## Jamais

- #followforfollow, #like4like, #f4f et les autres tags de la liste `BANNED_HASHTAGS` (`seo/data/sectors.js`).
- Annoncer un nombre de publications ou une portée qu'on n'a pas mesurés.
- Dépasser 5 hashtags sur Instagram, ou en mettre plus de 3 sur LinkedIn.
- Promettre qu'un hashtag rendra un post viral.

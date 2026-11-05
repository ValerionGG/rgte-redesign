---
name: veille-sociale
description: Veille sociale et étude de la demande réelle avec Agent Reach (Reddit, YouTube, X, GitHub, web, LinkedIn, Instagram) — vraies questions des internautes, hashtags réellement utilisés, expressions qui reviennent, contenus qui marchent, mentions de la marque et des concurrents — pour nourrir les mots-clés, la FAQ, les hashtags et le calendrier éditorial. À utiliser pour « que cherchent les gens », « de quoi on parle sur Reddit / YouTube », « quels hashtags marchent vraiment », « que dit-on de ma marque », « trouve des idées de contenus » ou pour valider des hashtags et des mots-clés avec des données réelles.
---

# Veille sociale avec Agent Reach

[Agent Reach](https://github.com/Panniantong/Agent-Reach) (MIT) donne à l’agent un accès en **lecture seule** à Reddit, YouTube (y compris sous-titres), X, GitHub, LinkedIn, Instagram et au web, via une seule commande `agent-reach <canal> <action>` qui renvoie du JSON.

## 0. Prérequis (une fois, sur l’ordinateur de l’utilisateur)

- Vérifier : `agent-reach doctor --text`. S’il est absent, proposer l’installation **depuis GitHub uniquement** :
  `uv tool install https://github.com/Panniantong/Agent-Reach/archive/refs/tags/v1.6.0.zip` puis `agent-reach setup`. Le paquet PyPI nommé `agent-reach` n’est **pas** ce projet.
- Les canaux web, youtube et github marchent sans compte. Reddit, X, LinkedIn et Instagram demandent `agent-reach add <canal>`, puis l’utilisateur **se connecte lui-même** (`agent-reach login <canal>`) ; conseiller un compte secondaire.

## 1. Lancer la veille (le plus simple)

```bash
node seo/cli.mjs veille "<sujet>" --sources reddit,youtube,web --marque "<marque>" \
  --requetes "<variante 1>;<variante 2>" --limit 10 --sortie rapports-seo
```

Le rapport `.md` contient les questions, les hashtags observés, les expressions récurrentes, les publications qui marchent et les mentions de la marque. Le `.json` s’importe dans l’interface SEO 360 (onglet Mots-clés & réseaux) : les hashtags observés dans au moins 2 publications y deviennent prioritaires.

Choisir les requêtes comme un humain chercherait : le mot-clé principal, sa version question (« comment choisir … »), la ville si l’activité est locale, la marque et 1 ou 2 concurrents.

## 2. Approfondir (commandes directes)

| Besoin | Commande |
|---|---|
| Lire un fil Reddit et ses commentaires | `agent-reach reddit read <url>` |
| Derniers sujets d’un subreddit | `agent-reach reddit subreddit <nom> --limit 10` |
| Analyser le script d’une vidéo YouTube qui marche | `agent-reach youtube subtitle <url> --lang fr,en` |
| Ce qu’on dit d’un concurrent sur X | `agent-reach twitter search "<concurrent>" --limit 10` |
| Repérer des projets ou outils (secteur tech) | `agent-reach github search "<sujet>" --limit 10` |
| Lire une page web proprement | `agent-reach read <url>` |

Les paramètres exacts de chaque canal s’obtiennent avec `agent-reach channels`.

## 3. Transformer en actions SEO

1. **FAQ et intertitres** : reprendre les 5 à 8 questions les plus engageantes **dans leurs propres mots**, avec une réponse directe de 40 à 60 mots. Ce sont les formulations que reprennent les IA (skill `geo-visibilite-ia`).
2. **Mots-clés** : comparer les expressions récurrentes aux pages du site. Une expression fréquente sans page dédiée est une opportunité. Confirmer la demande avec Search Console ou Keyword Planner (skill `seo-360`).
3. **Hashtags** : ne garder que les hashtags observés dans plusieurs publications **et** propres à la niche. Les mélanger avec la marque et le local selon les limites de chaque réseau (skill `hashtags-reseaux`).
4. **Contenus** : s’inspirer des titres et des formats qui marchent (top YouTube et Reddit) pour 4 idées de contenus du mois. Ne jamais copier le texte d’un tiers.
5. **Réputation** : pour chaque mention de la marque, proposer une réponse ou une action (remercier, corriger, citer un avis positif sur le site).

## Règles (celles d’Agent Reach, à respecter strictement)

- Lecture seule : ne jamais publier, commenter, liker ni envoyer de message.
- Ne jamais se connecter à la place de l’utilisateur, ni demander ou afficher un mot de passe ou un cookie.
- Sur `NEED_LOGIN`, `RATE_LIMITED`, `PLATFORM_BLOCKED` ou `BUSY` : arrêter cette source, garder les résultats déjà obtenus et dire à l’utilisateur ce qu’il doit faire. Pas de relance en boucle, pas de changement de compte ni de backend.
- Pour du contenu public, les outils de recherche intégrés suffisent souvent (`site:reddit.com …`). Agent Reach comble les manques : connexion requise, sous-titres, JSON propre.
- Citer les sources (URL) et ne jamais présenter un extrait comme le contenu complet.

## Sans Agent Reach

Utiliser la recherche web intégrée avec `site:reddit.com`, `site:youtube.com` et `site:x.com` sur les mêmes requêtes. Indiquer à l’utilisateur que les résultats sont partiels (extraits seulement).

# Confidentialité : qui reçoit quoi

SEO 360 n'a pas de serveur. Rien n'est envoyé à « SEO 360 ». Selon ce que vous faites, certaines données partent chez des tiers. Voici la liste complète.

## Dans le navigateur (interface web)

| Action | Tiers contacté | Ce qui est envoyé |
|---|---|---|
| Lire votre page, réglage « Automatique » (par défaut) | AllOrigins (`api.allorigins.win`), CodeTabs (`api.codetabs.com`) et Jina Reader (`r.jina.ai`), interrogés en même temps pour la page principale ; les fichiers suivants passent par celui qui a répondu, puis par les autres encore en service | L'adresse de la page, puis celles de robots.txt, du sitemap, de llms.txt et des pages explorées (et celles des concurrents que vous indiquez) |
| Lire votre page, réglage « Mon proxy » | Votre propre proxy (Cloudflare Worker, `seo/proxy/`) | Les mêmes adresses |
| Lire votre page, réglage « Aucune » | Personne | Seul le code que vous collez est analysé, dans le navigateur |
| Mesurer la vitesse | Google PageSpeed Insights (`www.googleapis.com`) | L'adresse de la page, et votre clé PageSpeed si vous en donnez une |
| Suggestions de mots-clés | Google Suggest (`suggestqueries.google.com`) | Le mot-clé |
| Auditer un dépôt GitHub | API GitHub (`api.github.com`) | Le nom du dépôt, et votre jeton si vous en donnez un |
| Auditer une application | App Store (`itunes.apple.com`) ou Google Play, via le service de lecture choisi | L'identifiant de l'application |
| Liens « Google Maps », « Trends », réseaux | Le site ouvert, seulement si vous cliquez | Ce que contient le lien |

Ce qui reste sur votre appareil :
- dans le stockage local du navigateur : vos réglages (sauf le code collé, le robots.txt collé, la clé PageSpeed et le jeton GitHub), l'historique de vos audits et les tâches cochées ;
- pour la session seulement : la clé PageSpeed et le jeton GitHub.

## Lien de partage

Le rapport est encodé dans l'adresse, après le `#`. Cette partie n'est pas envoyée aux serveurs quand on ouvre le lien. En revanche, toute personne qui a le lien peut lire le rapport. Depuis la version 3.3, le lien ne contient ni vos clés, ni votre marge, ni votre budget, ni la valeur d'un client.

## Page claude.ai

- Les rapports enregistrés et le tableau du conseil sont stockés dans la base de la page. Seul le propriétaire de la page peut les lire et les écrire.
- Les boutons « Claude » envoient à Claude (Anthropic) un résumé du rapport et votre question. Rien n'est envoyé si vous ne cliquez pas.

## Ligne de commande et skills

Tout tourne sur votre machine. La ligne de commande contacte :
- le site audité, et les concurrents que vous indiquez ;
- PageSpeed, sauf avec `--no-psi` ;
- Google Suggest ;
- GitHub, pour un dépôt ;
- Jina Reader (`r.jina.ai`), seulement pour un site que le réseau ne permet pas de joindre directement (bac à sable, session cloud filtrée) : l'adresse des pages lues lui est alors envoyée. `--lecture direct` l'interdit ; `--html` et `--robots` lisent des fichiers fournis, sans aucun accès au site.

La veille (`veille`) passe par Agent Reach, installé chez vous, en lecture seule. Elle ne se connecte jamais à un compte à votre place.

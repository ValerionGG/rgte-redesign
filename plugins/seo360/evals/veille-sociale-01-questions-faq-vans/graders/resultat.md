---
type: llm
weight: 2
---

La réponse finale respecte chacune de ces affirmations :

- Indique d'installer Agent Reach depuis GitHub (adresse releases/latest/download/agent-reach.zip) et précise que le paquet PyPI du même nom n'est pas le bon projet.
- Donne une commande de veille sur Reddit et YouTube (par exemple `node seo/cli.mjs veille "…" --sources reddit,youtube…` ou des commandes `agent-reach reddit search` et `agent-reach youtube search`).
- Rappelle que l'outil est en lecture seule et que l'utilisateur se connecte lui-même aux comptes, jamais l'agent à sa place.
- Mentionne la pause entre deux recherches sur une même plateforme, ou l'interdiction de relancer en boucle une source bloquée.
- Explique comment transformer les questions trouvées en FAQ : questions reprises dans les mots des internautes, réponse directe et courte.

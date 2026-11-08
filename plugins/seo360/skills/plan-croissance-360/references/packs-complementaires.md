# Packs de skills complémentaires

Packs relus le 05/11/2026, commit par commit. Rien n'y envoie de données à des tiers sans clé fournie par l'utilisateur, et aucune télémétrie n'a été trouvée. Tous sont sous licence MIT.

Ils sont dans le catalogue **seo360-fr** (le même que SEO 360), **chacun épinglé au commit relu** : une mise à jour de leur auteur n'arrive pas sans nouvelle relecture. Ils ne s'installent pas tout seuls : c'est à l'utilisateur de le faire.

**Chaque skill installé coûte des jetons à chaque échange.** Au-delà d'environ 1 % du contexte, Claude Code raccourcit les descriptions, et le choix du bon skill se dégrade. Il vaut donc mieux installer peu, mais juste.

## Installer

- **Claude, Cowork et Claude Code en une fois** : dans l'application Claude, *Personnaliser › Plugins › Ajouter une marketplace*, saisir `ValerionGG/rgte-redesign`, puis installer depuis *Découvrir*. Un plugin installé là est enregistré dans le compte et sert partout.
- **Claude Code seul** : `/plugin marketplace add ValerionGG/rgte-redesign`, puis `/plugin install <nom>@seo360-fr`.

Le nom à installer est celui du catalogue. Les skills gardent le préfixe de leur projet d'origine (par exemple `claude-seo:…` pour `audit-seo-avance`).

## Les plus utiles pour un plan de croissance

| Nom dans le catalogue | Projet d'origine | Pour quoi | Skills | Coût permanent | Commit relu |
|---|---|---|---:|---:|---|
| `audit-seo-avance` | claude-seo (AgriciDaniel, v2.5.0) | audit SEO approfondi en sous-agents, Search Console, CrUX, schéma, local, e-commerce | 26 | ≈ 4 700 jetons | 6be93f4 |
| `audit-publicite` | claude-ads (AgriciDaniel, v2.1.0) | audits publicitaires Google, Meta, TikTok, LinkedIn, Microsoft | 34 | ≈ 6 600 jetons | fc3908e |
| `instagram-skills` | sergebulaev | croissance Instagram : Reels, carrousels, légendes, hashtags | 9 | ≈ 1 800 jetons | 550d3cf |
| `linkedin-skills` | sergebulaev | posts LinkedIn, profil, régularité (B2B) | 12 | ≈ 2 100 jetons | 8f8bc4b |
| `social-media-research-skills` | ScrapeCreators | données réelles TikTok, Instagram, YouTube : tendances, commentaires, pubs des concurrents | 13 | ≈ 1 400 jetons | 64ba7b4 |
| `web-quality-skills` | Addy Osmani | performance, accessibilité, bonnes pratiques | 6 | ≈ 540 jetons | afa8da9 |
| `youtube` | claude-youtube (AgriciDaniel) | croissance d'une chaîne YouTube | 1 | faible | 84c3fa6 |

Précisions :

- **audit-seo-avance** ajoute un hook : après chaque modification de fichier, il valide localement le JSON-LD du fichier. Ses extensions MCP (Ahrefs, DataForSEO, Firecrawl…) sont optionnelles et demandent des clés payantes.
- **social-media-research-skills** demande une clé API ScrapeCreators, payante. **youtube** : ses scripts demandent une clé de l'API YouTube.

## Seulement si le besoin existe

| Nom dans le catalogue | Quand | Skills | Coût permanent | Commit relu |
|---|---|---:|---:|---|
| `aso-skills` | une application mobile | 40 | ≈ 7 200 jetons | 3919d7c |
| `local-seo-skills` | un réseau d'établissements locaux (contient un serveur MCP) | 39 | ≈ 5 900 jetons | c3b7a25 |
| `blog-seo` (claude-blog) | un blog à fort volume | 32 | ≈ 7 300 jetons | 4f9c2cb |
| `last30days` | veille Reddit, X, YouTube, Hacker News, avec accès réseau à ces sites | 1 | ≈ 100 jetons | e9c31b8 (pas la dernière version) |
| `marketing-skills` | pack marketing complet (copywriting, offres, e-mails, lead magnets, relations presse) | 53 | ≈ 16 100 jetons | 88c79f6 (pas la dernière version) |

Ces packs recoupent largement les skills SEO 360 : seo-local, avis-clients-reputation, contenu-seo-redaction, geo-visibilite-ia.

## Hors catalogue (copie à la main)

Pas de manifeste de plugin, ou une sélection plus légère que le pack entier. À copier dans `~/.claude/skills/`, en gardant la licence MIT, seulement à la demande de l'utilisateur :

- **marketingskills**, sélection conseillée au commit relu 88c79f6 : marketing-plan, copywriting, offers, influencer-marketing, ad-creative, emails, conversion-tracking, lead-magnets, public-relations, reverse-engineer-marketing.
- **content-skills** (vyralcontent, commit 349e495) : 7 skills de vidéo courte (accroches, TikTok, Reels, Shorts, idées, légendes).
- **geo-seo-claude** (zubair-trabzada, commit 989cae0) : approfondir la visibilité IA.

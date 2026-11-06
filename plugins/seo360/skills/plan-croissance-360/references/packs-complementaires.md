# Packs de skills complémentaires

Packs relus le 05/11/2026, commit par commit. Rien n'y envoie de données à des tiers sans clé fournie par l'utilisateur, et aucune télémétrie n'a été trouvée.

Ils ne s'installent pas tout seuls : c'est à l'utilisateur de le faire.

**Chaque skill installé coûte des jetons à chaque échange.** Au-delà d'environ 1 % du contexte, Claude Code raccourcit les descriptions, et le choix du bon skill se dégrade. Il vaut donc mieux installer peu, mais juste.

## Les plus utiles pour un plan de croissance

| Pack | Pour quoi | Skills | Coût permanent | Commit relu | Installation (dans Claude Code) |
|---|---|---:|---:|---|---|
| claude-seo (AgriciDaniel, MIT, v2.5.0) | audit SEO approfondi en sous-agents, Search Console, CrUX, schéma, dérive, local, e-commerce | 26 | ≈ 4 700 jetons | 6be93f4 | `/plugin marketplace add AgriciDaniel/claude-seo` puis `/plugin install claude-seo@agricidaniel-claude-seo` |
| claude-ads (AgriciDaniel, MIT, v2.1.0) | audits publicitaires Google, Meta, TikTok, LinkedIn, Microsoft | 34 | ≈ 6 600 jetons | fc3908e | `/plugin marketplace add AgriciDaniel/claude-ads` puis `/plugin install claude-ads@ai-marketing-hub-claude-ads` |
| instagram-skills (sergebulaev, MIT) | croissance Instagram : Reels, carrousels, légendes, hashtags | 9 | ≈ 1 800 jetons | 550d3cf | `/plugin marketplace add sergebulaev/instagram-skills` puis `/plugin install instagram-skills@instagram-skills` |
| linkedin-skills (sergebulaev, MIT) | posts LinkedIn, profil, régularité (B2B) | 12 | ≈ 2 100 jetons | 8f8bc4b | `/plugin marketplace add sergebulaev/linkedin-skills` puis `/plugin install linkedin-skills@linkedin-skills` |
| social-media-research-skills (ScrapeCreators, MIT) | données réelles TikTok, Instagram, YouTube : tendances, commentaires, pubs des concurrents | 13 | ≈ 1 400 jetons | 64ba7b4 | `/plugin marketplace add ScrapeCreators/social-media-research-skills` puis `/plugin install social-media-research-skills@social-media-research-skills` |
| web-quality-skills (Addy Osmani, MIT) | performance, accessibilité, bonnes pratiques | 6 | ≈ 540 jetons | afa8da9 | `/plugin marketplace add addyosmani/web-quality-skills` puis `/plugin install web-quality-skills@addy-web-quality-skills` |

Précisions :

- **claude-seo** ajoute un hook : après chaque modification de fichier, il valide localement le JSON-LD du fichier. Ses extensions MCP (Ahrefs, DataForSEO, Firecrawl…) sont optionnelles et demandent des clés payantes.
- **social-media-research-skills** demande une clé API ScrapeCreators, payante.

## À copier un par un

Ces dossiers vont dans `~/.claude/skills/`, en gardant la licence MIT. Ils ne sont pas proposés en plugin, ou le pack complet est trop lourd :

- **marketingskills** (coreyhaines31, MIT, commit 88c79f6). Le pack entier compte 53 skills et coûte environ 16 100 jetons permanents. Sélection conseillée :
  - marketing-plan, copywriting, offers ;
  - influencer-marketing, ad-creative, emails ;
  - conversion-tracking, lead-magnets ;
  - public-relations, reverse-engineer-marketing.
- **content-skills** (vyralcontent, MIT, commit 349e495) : 7 skills de vidéo courte (accroches, TikTok, Reels, Shorts, idées, légendes).
- **claude-youtube** (AgriciDaniel, MIT, commit 84c3fa6) : croissance d'une chaîne. Ses scripts demandent une clé de l'API YouTube.

## Seulement si le besoin existe

| Pack | Quand | Skills | Coût permanent |
|---|---|---:|---:|
| aso-skills (appeeky) | une application mobile | 40 | ≈ 7 200 jetons |
| local-seo-skills (garrettjsmith) | un réseau d'établissements locaux (contient un serveur MCP) | 39 | ≈ 5 900 jetons |
| claude-blog (AgriciDaniel) | un blog à fort volume | 32 | ≈ 7 300 jetons |
| geo-seo-claude (zubair-trabzada) | approfondir la visibilité IA | 16 | non mesuré (pas de plugin) |
| last30days (mvanhorn) | veille Reddit et Hacker News, avec accès réseau à ces sites | 1 | ≈ 100 jetons |

Ces packs recoupent largement les skills SEO 360 : seo-local, avis-clients-reputation, contenu-seo-redaction, geo-visibilite-ia.

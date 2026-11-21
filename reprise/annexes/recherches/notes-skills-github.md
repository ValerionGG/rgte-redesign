# Notes veille (preuves brutes)
## Accès
- reddit.com : bloqué (WebSearch allowed_domains refusé, WebFetch refusé, curl 000). Miroirs reddit.sentinel-team.org (non résolu en fetch) => extraits seulement.
- hn.algolia.com, developers.google.com : non résolus. github.com, platform.claude.com : OK via WebFetch.
## GitHub (gh search, 2026-11-05)
- Panniantong/Agent-Reach 109137★ 9760 forks, créé 2026-02-24, push 2026-11-05, 278 issues, MIT, topics claude-code mcp reddit-scraper...
- ComposioHQ/awesome-claude-skills 78828★; hesreallyhim/awesome-claude-code 57309★; travisvn/awesome-claude-skills 15707; BehiSecc 10348
- sickn33/agentic-awesome-skills 49209★ (2926+ skills); VoltAgent/awesome-agent-skills 36886★ (1000+); heilcheng/awesome-agent-skills 6346
- coreyhaines31/marketingskills 58677★; AgriciDaniel/claude-seo 26900★ (26 sub-skills 19 sub-agents); zubair-trabzada/geo-seo-claude 11529★; Ryze-AI-Adgent/open-seo-mcp-skills 8857; TheCraigHewitt/seomachine 7576; irinabuht12-oss/marketing-skills 6868; alirezarezvani/claude-skills 29347; AgriciDaniel/claude-blog 2652; onvoyage-ai/gtm-engineer-skills 1354
- MCP: AminForou/mcp-gsc 2114★; iannuttall/seo 604; avansaber/seo-monster 511; saurabhsharma2u/search-console-mcp 320; dataforseo/mcp-server-typescript 260; seranking/seo-skills 199; ahonn/mcp-server-gsc 283; Suganthan GSC MCP 176 (29 tools quick wins cannibalisation); kLOsk/adloop 293; irinabuht12-oss/google-ads-meta-ads-mcp 7009
- GEO OSS: elmohq/elmo 570; yaojingang/GEOInflow 809; amplifying-ai/awesome-generative-engine-optimization 538; cxcscmu/AutoGEO 236 (ICLR'26)
## Agent Reach (lu dans le dépôt, raw.githubusercontent.com, 2026-11-05)
- v1.6.1 2026-11-01 (Reddit: fallback public web si outil site échoue #880; login copy fails clearly); v1.6.0 2026-10-23 rebuild: 28/40 actions validées; Reddit, Instagram, LinkedIn non testés à la sortie.
- Install officiel: uv tool install https://github.com/Panniantong/Agent-Reach/releases/latest/download/agent-reach.zip ; agent-reach setup ; PyPI agent-reach != projet.
- Commandes: channels, read <url>, <canal> <action>, setup, add/remove, login/logout, doctor (--text), check <canal> --text, skill, skill link <dir>, update (--check, --sync-only), configure (groq-key, browser-port), uninstall (--dry-run).
- JSON: ok/result/error{code,message,hint}; items title/url/author/published_at/text ; raw. Codes: NEED_SETUP NEED_LOGIN UPSTREAM_BROKEN TIMEOUT RATE_LIMITED NOT_FOUND BAD_INPUT PLATFORM_BLOCKED BUSY. doctor: not_added needs_setup needs_login unverified search_ready ready cooldown broken + regressed.
- Parallélisme: 2/plateforme, 4 total; >=10 s entre 2 recherches même plateforme. Navigateur dédié (CloakBrowser) headless, ferme après 10 min.
- Canaux: default github youtube web v2ex bilibili; optional reddit linkedin xiaohongshu xueqiu boss xiaoyuzhou; experimental twitter facebook instagram. PAS de TikTok. Instagram: search users/profile/posts, pas de commentaires. Reddit: search/read/subreddit, arbre de commentaires non garanti. backend public-web pour canaux non ajoutés.
- Skill officiel: "公开内容优先用 Agent 自带工具，Reach 补缺口" ; skill copié dans ~/.agents/skills/agent-reach/SKILL.md + lien dans ~/.claude/skills.
- Sponsors README: Bright Data, RapidProxy, BrowserAct (proxies résidentiels) ; avertissement crypto.
- Avis tiers: dev.to/andrew-ooo review ; dev.to/alya_mahalini pragmatic review (cookies requis => agents avec exécution de code) ; repodaily 2026-06-17 (commencer par sources sans login) ; xugj520 (Reddit bloque IP serveurs 403) ; stars 52.9k/18.7k selon agrégateurs (obsolètes) vs 109k GitHub API.
## Google 2026
- GSC Search generative AI performance report: annonce 2026-06-03 developers.google.com/search/blog/2026/06/gen-ai-performance-reports ; impressions seulement (pas clics/CTR/position) ; pages, pays, appareils, dates ; AIO + AI Mode + Discover ; UK d'abord, puis Inde/US..., mondial ~1er sept (seroundtable 41984, SEJ 587836).
- Contrôle "Search generative AI" (Settings) opt-out AIO/AI Mode/Discover AI, défaut Include, au niveau domaine ; n'affecte pas ChatGPT/Perplexity ; réaction ordre UK (CMA) (ppc.land). 9to5google 2026-06-02.
- Spam updates 2026: mars (24 mars ~19,5 h), juin (24-26), août (18-21, pas liens ni site reputation abuse), septembre (fin 8 oct., 13 j 16 h, 4e). Core: mars (27 mars-8 avr), mai (21 mai-2 juin). Aucune core confirmée après mai.
## GEO études
- Ahrefs mars 2026: 37,9% des citations AIO dans top 10 (863k SERP, 4M URL) vs 76% juil 2025 ; parser + Gemini 3 => pas comparable ; BrightEdge ~17%.
- Ahrefs déc 2025: mentions de marque corr 0,664 vs backlinks 0,218 (75k marques).
- Seer 2026 (53 marques, 5,47M requêtes): cités = +120% clics/impression vs non cités, mais -38% vs SERP sans AIO ; CTR non-AIO 2,8% -> 3,8% (fév 2026). Payant cité 15,74% vs 11,19%.
- Seer fraîcheur (7 683 pages, 47 097 citations, mars-juin 2026): 75% mises à jour <1 an, 42% publiées <1 an ; ChatGPT 73%/87% (<2 ans).
- Seer listicles: 16,6% de 2M citations ChatGPT, baisse dans 13/16 secteurs ; pages qui montent listent 10-20 options vs 5-8.
## Skills authoring (docs officielles lues)
- platform.claude.com best-practices: name<=64 (minuscules/chiffres/tirets, pas anthropic/claude), description<=1024, 3e personne, quoi+quand ; SKILL.md <500 lignes ; références 1 niveau ; TOC si >100 lignes ; 3 évaluations min ; tester Haiku/Sonnet/Opus ; pas d'info datée (section "old patterns") ; terminologie constante ; MCP ServerName:tool_name ; scripts: solve don't defer, pas de constantes magiques ; plan-validate-execute.
- code.claude.com/docs/en/skills: description+when_to_use tronqués à 1536 car. ; budget listing = 1% contexte (skillListingBudgetFraction, SLASH_COMMAND_TOOL_CHAR_BUDGET) ; /skill-doctor ; /doctor ; claude plugin validate .claude/skills (v2.1.233+) ; claude plugin eval + grader tool_used: Skill ; après compaction 5000 tokens/skill, 25000 total => règles clés en haut ; hooks frontmatter pour règles obligatoires ; !`cmd` injection (exit≠0 = abandon, ajouter || true) ; ${CLAUDE_SKILL_DIR} ; claude.ai/API n'acceptent que name, description, license, compatibility, metadata, allowed-tools ; paths ; disable-model-invocation.
## Outils
- anthropics/knowledge-work-plugins 34840★ marketing plugin (/seo-audit, /campaign-plan, /performance-report...; connecteurs Ahrefs, Similarweb, HubSpot, Canva...) install claude plugin marketplace add anthropics/knowledge-work-plugins ; claude plugin install marketing@knowledge-work-plugins
- anthropics/claude-plugins-official 46208★ ; anthropics/skills 187679★ ; agentskills/agentskills 26974★ (spec)
- googleads/google-ads-mcp 1120★ Apache-2.0 (search GAQL, list_accessible_customers; écriture propose&confirm; désactivable)
- AgriciDaniel/claude-seo: /plugin marketplace add AgriciDaniel/claude-seo ; 30 commandes ; GSC, PSI, CrUX, GA4, Bing/IndexNow, drift SQLite, local/maps geo-grid ; MIT ; Python 3.11-3.14
- coreyhaines31/marketingskills: npx skills add coreyhaines31/marketingskills ; 53 skills ; .agents/product-marketing.md partagé ; pas de skill local
- AminForou/mcp-gsc: 20 outils, row_limit 500, batch 10 URL, GSC_DATA_STATE all/final, destructifs désactivés par défaut, local stdio
- skills.sh (Vercel, lancé 2026-01-20) classement par télémétrie installs ; npx skills add
- karanb192/reddit-mcp-buddy 881★ ; dialog-tools/reddit-research-mcp 263
- Concurrents FR: johssinma/Audit-my-site (bilingue FR/EN, 15 commandes, r/ClaudeAI 2026-03-20) ; david-corroy/skills-seo-geo (25 skills FR) ; david-corroy/skills-marketing-fr (47) ; Gallyan/trouvable ; NicolasW83/skills-claude-fr
## Local / social
- GBP Q&A supprimé -> Ask Maps (Gemini) 2026-03-12 US/Inde ; pas de correction possible des réponses ; GBP->GA4 2026-06-08 7 métriques, 6 mois, pas de split par établissement.
- LSA en France: certains services à domicile seulement (lionelz.com) ; migration LSA dans Google Ads août 2026 (US d'abord).
- Instagram indexation Google pros 18+ depuis 2025-07-10 ; TikTok légende 4000 car. in-app mais 2200 via Content Posting API ; cap hashtags TikTok contesté (5 vs 30).
## Agent Reach issues (gh search/issues)
- #642 open 2026-08-21 Reddit: rdt-cli v0.4.2 bloqué par WAF Reddit 403, doctor ne le voit pas
- #566 open 2026-08-04 v1.5.0 test 15 canaux: sous-titres YouTube cassés, doctor sans backend pour canaux login, transcribe Windows KO
- #550 open 2026-07-31 Instagram: whoami OK mais profile/user/followers 400
- #384 open 2026-06-16 demande Instagram + TikTok ; #533 closed 2026-07-26 tiktok adapter tout échoue
- #685 open 2026-09-11 doctor dit web ok alors que Jina injoignable (faux positif)
- #906 closed 2026-11-03 reddit subreddit sans fallback public-web ; #892 #868 régressions reddit search (corrigées 1.6.1)
- #907 open 2026-11-03 GitHub public API read échoue sans README
- #913 open 2026-11-04 xiaohongshu Windows
## Autres
- Ahrefs llms.txt 2026-06-15: 137 210 domaines, ~38 000 llms.txt valides, 97% sans requête en mai ; adoption 28% borne haute
- Rutgers/Wharton arXiv 2512.24968: bloquer crawlers IA = -23% trafic total grands éditeurs (révisé ~-7%) ; BuzzStream 70,6% des sites bloquants cités quand même
- Cloudflare Content Signals (search / ai-input / ai-train) ; 3,8M domaines managed robots.txt ; 2026-09-15 interrupteurs Search/Agent/Training, nouveaux domaines: Training+Agent bloqués par défaut sur pages avec pub
- Cloudflare Radar crawl/referral juillet 2026: Anthropic 1917:1, OpenAI 251:1, Perplexity 289:1 (ecorpit) ; Q1 ClaudeBot 23 951:1 (seomator)
- Lighthouse Agentic browsing (13.3.0, 2026-05-07 ; post Chrome 2026-06-22 M150) ; chrome-devtools-mcp 54 840★ lighthouse_audit
- Bing WMT AI Performance (preview fév 2026): citations Copilot/Bing, grounding queries, pas de clics
- FAQ rich results arrêtés 2026-05-07 ; rapports GSC FAQ juin 2026 ; API août 2026
- Semrush AI Mode: 92-94% zéro-clic (69M sessions, mai-juil 2025) ; SparkToro 0,34% recherches -> AI Mode jan-avr 2026
- Product Hunt: Agent A by Ahrefs #3 Product of the Day 2026-05-29 ; RankSpot 538 votes 2026-05-08 ; RankAI 2026-04-21 ; Dageno 211

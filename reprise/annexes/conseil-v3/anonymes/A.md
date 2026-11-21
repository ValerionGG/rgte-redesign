## Réponse

T = `/tmp/claude-0/-home-user-rgte-redesign/137803cc-e0f1-5e43-837f-1ccac4c64755/scratchpad/conseil-v3/preuves/A` : scripts, captures et pages pièges.

### 1. Note : 61/100

| Critère (poids) | /10 | Justification |
|---|---:|---|
| Honnêteté (20) | 5 | Un site bloqué pour Google reçoit 92/100 A ; rapports falsifiables ; marge inventée. 5 faits du catalogue vérifiés, tous justes ; skill juridique exact. |
| Valeur (25) | 7 | Correctifs prêts à coller et outils guidés, mais des correctifs dangereux et `outils` cassé dans le plugin. |
| Parcours (20) | 6 | 390 px sans débordement ; erreurs brutes en anglais (« Failed to fetch », « Maximum call stack size exceeded »). |
| Couverture (15) | 7 | Google, local, IA, pub, Search Console ; profils TikTok et Instagram non lus. |
| Robustesse (10) | 4 | 643 charges HTML importées ou partagées : 0 injection. Mais bombe ZIP, page piège, messages forgés, test rouge. |
| Différenciation (10) | 7 | Gratuit, français, droit français, CLI et skills : combinaison rare ; rapports aussi peu vérifiables qu'ailleurs. |

### 2. Les 8 problèmes

1. **Critique : note A pour un site invisible sur Google.** Même page avec robots.txt `Disallow: /` : la CLI donne 30/100 E (`python3 -m http.server 8898` dans `T/pieges/bloque`, puis `node seo/cli.mjs http://127.0.0.1:8898/ --no-psi`). En code collé (page claude.ai 8820, version complète sans proxy) : « 92/100 · A, Excellent socle, Mesuré : 91 % ». Un robots.txt illisible n'est qu'une info sans pénalité (`seo/engine/audit.js:165`), et la couverture compte des catégories, pas des contrôles (`audit.js:491`). Preuve : `node T/scripts/colle-bloque.cjs T/pieges/bloque/index.html T/out/colle-bloque`, capture `T/out/colle-bloque-8820.png`.
2. **Élevée : n'importe qui fabrique un rapport SEO 360.**
   - Un lien `#r=` ou un JSON importé garde sa note (`docs/seo/app.js:726`) : « 98/100 · A, Mesuré : 100 % » pour un domaine jamais audité (`T/out/fake-98-share.png`).
   - Aucun contrôle d'origine sur `message` (`app.js:203`) : une page de 127.0.0.1:8897 y injecte un faux audit, gardé dans l'historique (`T/pieges` servi sur 8897, puis `T/scripts/postmessage.cjs`).
3. **Élevée : plugin cassé, test rouge, évaluations aveugles.**
   - `node plugins/seo360/seo/cli.mjs outils` donne ERR_MODULE_NOT_FOUND : outils-cli.mjs manque dans `seo/plugin.mjs:26`, et plan-croissance-360 n'autorise aucun prix hors de cette commande.
   - `plugin.mjs --check` échoue : 34 tests sur 35 passent.
   - Les 63 évaluations n'autorisent pas Bash et aucun résultat n'est enregistré : elles ne verront pas cette panne.
4. **Élevée : promesses de confidentialité fausses.**
   - L'interface promet « tout reste dans votre navigateur » (`docs/seo/index.html:38`) et un proxy « si vous le choisissez » (l. 88).
   - Réglages par défaut : l'adresse part vers AllOrigins, CodeTabs et PageSpeed, le mot-clé vers Google Suggest (22 requêtes, `T/scripts/net-default.cjs`).
   - Le lien de partage contient marge, taux de signature, budget et panier, sans avertissement (`T/scripts/share-leak.mjs`).
   - Le pied de page dit « open-source » sans LICENSE (`claude plugin validate`).
5. **Moyenne+ : verdict pub fondé sur une marge inventée.** `node seo/cli.mjs budget --secteur boulangerie --valeur 45` répond « Pas rentable aujourd'hui : ≈ 13 € par contact pour ≈ 6 € de marge ». Le calcul suppose 50 % de marge et 25 % de signature (`seo/engine/ads.js:80-81`), jamais affichés. Le skill promet « verdict inconnu, rien d'inventé » (`budget-publicite/SKILL.md:17`).
6. **Moyenne : fichiers et pages pièges.**
   - ZIP Search Console de 373 Ko (1 Ko déclaré, 150 Mo réels) : CLI en « heap out of memory » (2,4 Go, 21 s), onglet figé ~30 s. La limite lit la taille déclarée (`gsc.js:416`).
   - JSON-LD imbriqué sur 5 000 niveaux (page de 11,7 Ko ; plantage dès 4 000) : « Maximum call stack size exceeded » (`html.js:233`), audit perdu dans la CLI et l'interface.
   - Rapport avec `input.lang: "de"` : « Fichier JSON invalide », puis les onglets Budget et Plan plantent.
7. **Moyenne : des correctifs « prêts à coller » peuvent casser un site.**
   - HSTS d'un an avec includeSubDomains, sans palier (`fixes.js:82`) : un sous-domaine en HTTP devient inaccessible un an.
   - La redirection HTTPS ignore les proxys : elle boucle derrière Cloudflare en mode « Flexible ».
8. **Moyenne : pas d'« audit mesuré » d'un lien TikTok ou Instagram.** `detectKind('https://www.tiktok.com/@x')` renvoie « site » : l'interface audite la page de la plateforme, et Agent Reach ne lit pas TikTok. La description de plan-croissance-360 promet pourtant cet audit.

### 3. Les 8 améliorations

| # | Quoi et comment | Impact | Effort |
|---|---|---|---|
| 1 | Contrôle bloquant non lu (robots.txt, en-têtes) : note « provisoire » plafonnée, « non vérifié » visible ; couverture par contrôle ; test « code collé + Disallow » | Fort | < 1 j |
| 2 | Recalculer la note à l'import, afficher « importé, non revérifié » ; exiger `e.origin === new URL(d.url).origin` | Fort | < 1 j |
| 3 | Ajouter outils-cli.mjs au plugin ; tester chaque sous-commande depuis le plugin ; Bash dans les évaluations | Fort | < 1 j |
| 4 | Nommer les tiers ; aucun proxy par défaut ; partage sans données commerciales ; LICENSE, SECURITY.md, PRIVACY.md | Fort | < 1 j |
| 5 | Sans marge : verdict « inconnu », ou hypothèses affichées à côté | Moyen | 2 h |
| 6 | Compter les octets décompressés (comme `decodeReport`) ; parcours JSON-LD itératif borné ; valider `input` | Moyen | 1 j |
| 7 | HSTS par paliers (max-age=300 sans includeSubDomains) ; variante X-Forwarded-Proto | Moyen | 2 h |
| 8 | Reconnaître les profils sociaux et demander l'export des statistiques ; corriger la description du skill | Moyen | 1-2 j |

### 4. Benchmark

- **Lighthouse et PageSpeed** :
  - un audit en erreur n'a pas de score, et la catégorie reste sans note plutôt que devinée ;
  - le Lighthouse Viewer affiche aussi un JSON collé, donc un faux rapport, mais PageSpeed sert ses résultats depuis Google.
- **Semrush Site Audit** : la note ne porte que sur les pages explorées, et un blocage par robots.txt est signalé comme un problème d'exploration.
- **Ahrefs Site Audit** : le Health Score est la part des adresses explorées sans erreur, donc calculé sur ce qui a été lu.
- **claude-seo** :
  - SECURITY.md avec un modèle de menace (site malveillant, SSRF, installation altérée) ;
  - PRIVACY.md qui liste chaque tiers et les données envoyées ;
  - des tests sur le contenu non fiable.
- **Règles de l'art** : hstspreload.org, paliers dès max-age=300 ; Cloudflare, boucle « Flexible » + redirection d'origine.

Sources : github.com/GoogleChrome/lighthouse/issues/15828 · github.com/GoogleChrome/lighthouse/pull/2521 · semrush.com/kb/114-total-score · semrush.com/kb/681-site-audit-troubleshooting · help.ahrefs.com/fr/articles/1424673 · github.com/AgriciDaniel/claude-seo · hstspreload.org · developers.cloudflare.com/ssl/troubleshooting/too-many-redirects/

## Hypothèses

- Version auditée : la v3 de 20 h 38 (docs/seo sur 8810, artifact-seo360 sur 8820). `seo/app.js` (20 h 58) et la page publiée ont changé pendant l'audit ; les défauts 1, 2 et 4 y restent (`seo/app.js:205` et `:823`, `seo/index.html:38`).
- La politique de sécurité de 8820 imite celle de claude.ai, non vérifiée.
- Vérifiés par recherche web et justes : Semrush, Screaming Frog, Metricool, Haloscan, Data Studio, décret 2026-662.

## Faiblesses connues

- Pas de test sur le vrai réseau (PageSpeed en quota, proxys bloqués).
- Pas de test utilisateur : la note de parcours repose sur peu de mesures.
- Correctifs Apache non essayés sur un vrai serveur.
- Étoiles d'Agent Reach (109 000) [À VÉRIFIER] : 77 000 au 1er septembre selon un tiers.

## Confiance

Haute : chaque problème est reproduit par script ou capture, sur du code toujours présent.

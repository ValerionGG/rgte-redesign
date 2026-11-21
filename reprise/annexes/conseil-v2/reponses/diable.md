## Réponse

### Verdict
Moteur riche (≈ 120 contrôles), mais dans le navigateur **la note ment dès qu'une donnée manque** : proxy en panne → 93/100 « A, excellent socle » sans une ligne de HTML lue. Taper `rgte.fr` lance un audit d'appli Android ; un panier moyen de 45 € rend « Analyser » muet. Priorité : une couche de vérité avant toute nouvelle fonction.
**UX : 45/100 · Efficacité réelle : 40/100.**

### Constats (tous rejoués en local)
1. **Pas de données = bonne note.** Score = 100 − pénalités, aucun état « non vérifié » (`audit.js:418-429`).
   - Proxy public injoignable + PageSpeed 429 (fréquent sans clé) → **93/100 · A** alors que la carte dit « HTML non lu » (capture).
   - Proxy « Aucun » sans HTML collé → **100/100 · A**, « Rien de bloquant 🎉 ».
   - Deux erreurs passagères du proxy → **65 → 70 (C → B)** : les problèmes robots.txt disparaissent, une page valide devient « lien cassé » (`collect.js:96`).
   - Concurrents non lus → 100 partout, « concurrent-a.fr vous devance en Contenu (100 contre 52) » (`app.js:358-366`).
   - Vous : crawl 8 ; concurrents : crawl 0 (`app.js:96`) → même site noté 58 contre 64.
2. **Domaine sans https mal routé** (`index.js:27-31`, `appstore.js:18`) : `rgte.fr`, `www.rgte.fr` → « Application » → audit ASO de la page 404 de Google Play → 93/100 A. `monsite.fr/contact` → « Dépôt GitHub ».
3. **Bouton muet** : `step="10"` / `step="50"` (`index.html:47-48`). Panier 45 € ou budget 1 230 € → formulaire invalide, rien ne se passe. Le rapport d'exemple importé (panier 45) bloque les analyses suivantes, valeur mémorisée.
4. **Erreurs avalées, attentes infinies.** L'erreur est écrasée en < 1 s par le compteur (`clearInterval` hors `finally`, `app.js:91-106`) : « Analyse en cours… 9 s » après un crash. Aucun délai côté proxy (`app.js:49-75`) : « en cours… 60 s », bouton grisé. CLI : délai de 20 s limité aux en-têtes (`cli.mjs:55,64`) → bloquée > 70 s par un serveur lent.
5. **Faux constats.**
   - Pare-feu qui refuse l'UA « SEO360 » (Googlebot passe) : la page d'erreur est auditée → « pas de viewport », « title absent » (`collect.js:11`).
   - Site ISO-8859-1 → « P�tisserie » (CLI `res.text()`, `worker.js:36`) → « mot-clé absent : titre, H1, description ».
   - URL avec `%E9` → crash `URIError` (`audit.js:213`).
   - `</h2>` au lieu de `</h1>` → H1 de 1 274 caractères ; 4 000 `<a>` non fermés (172 Ko) → 5,4 s de calcul, croissance quadratique (`html.js:56-61`).
6. **Sécurité.**
   - XSS par rapport importé : `counts.critique = "<img onerror=…>"` s'exécute et lit `seo360:form`, **jeton GitHub et clé PageSpeed compris** (en clair, `app.js:39`, origine `valeriongg.github.io` partagée). Non échappés : `app.js:20,125,159,178,181,369,373`.
   - Worker : proxy ouvert (`'*'`, ni Origin ni jeton vérifiés ; CORS n'arrête pas curl), filtre SSRF contourné par `0.0.0.0` et par redirection non revérifiée (`worker.js:17,26`), exception non gérée → 500 sans CORS (`:23`).
7. **Chiffres faussement précis.** E-commerce à 3 000 € : « ≈ 151 conversions » pour une fourchette 32–711 (×22). Boulangerie à 30 000 €/mois : « pour 3 000 conv. : ≈ 36 283 € », sans plafond de volume local (`ads.js:86-90`). Le robots.txt modèle bloque `/compteurs-…`, `/recherche-et-developpement` (`robots.js:74-95`).
8. **Plan d'action corrompu** : cases indexées par position (`app.js:254-263`). Coché « JSON-LD invalide », description corrigée, relance → la coche passe sur « Open Graph manquantes ».
9. **Tests** : 8 tests verts, aucun sur ces cas.

### Améliorations priorisées
| # | Amélioration | Impact | Effort | Où / comment |
|---|---|---|---|---|
| 1 | Couverture + « non vérifié » | 5 | 2 | `finalize()` : score sur contrôles exécutés, `coverage` par catégorie ; pas de note si page non lue ou couverture < 70 % ; concurrent en erreur = « non comparable » |
| 2 | Routage de la saisie | 5 | 1 | supprimer le paquet nu (`appstore.js:18`) ; `owner/repo` seulement si owner sans point (`index.js:29`) |
| 3 | Formulaire | 4 | 1 | `step="any"` ; invalidité expliquée dans `#progress` |
| 4 | Délais et erreurs | 4 | 1 | `AbortController` 20 s/requête, 120 s au total ; `clearInterval` en `finally` ; CLI : délai jusqu'à la fin du corps, 5 Mo max |
| 5 | Collecte honnête | 4 | 2 | 401/403/429/503 → « robot bloqué », pas d'audit on-page ; `TextDecoder(charset)` ; erreur de collecte ≠ lien cassé ; même crawl pour tous |
| 6 | Sécurité interface | 4 | 1 | CSP en `<meta>` (testée : XSS bloqué, 0 violation sur 8 onglets) ; `Number()` + version vérifiée à l'import (`app.js:110`) ; `esc()` partout ; jetons non stockés |
| 7 | Durcir le Worker | 3 | 1 | 403 sans Origin connue ou jeton `?k=` ; revérifier l'hôte à chaque saut ; bloquer 0.0.0.0/8, 172.16/12, IPv6 privées ; `try/catch` |
| 8 | Budget honnête | 4 | 3 | fourchette d'abord ; champ « recherches/mois » (Keyword Planner) qui plafonne les clics |
| 9 | Plan par identifiant | 3 | 1 | clé `étape:issue.id` (`plan.js:38`, `app.js:254`) |
| 10 | robots.txt et Bing | 3 | 1 | modèle « à adapter » sans Disallow génériques ; Bing en info (`audit.js:288`) |
| 11 | Tests de non-régression | 3 | 2 | un test par constat ci-dessus |

### Objectif meilleur
**« Aucune note sans preuve. »** La meilleure plateforme pour une TPE est celle où chaque chiffre se vérifie : chaque constat porte sa preuve (extrait HTML, statut, en-tête) et sa source ; la note affiche sa couverture ; deux analyses du même site restent à ±2 points ; un ré-audit annonce « 3 corrigés, 1 nouveau, 58 → 66 ».
1. Semaine 1 : couche de vérité (actions 1 à 4 et 6).
2. Semaines 2-3 : collecte fiable (5, 7, 9) + écran « non vérifié : comment le vérifier ».
3. Mois 2 : 30 sites FR réels figés en fixtures ; en CI, taux de faux positifs < 5 %, reproductibilité, durée p90 ; budget plafonné par le volume.

### Gains rapides (< 1 h)
`step="any"` ; `detectKind` + tests ; `clearInterval` en `finally` + `AbortController` ; `global: null` si `!ctx.page` ; CSP ; jetons hors de `persist()` ; `try` sur `decodeURIComponent` ; plan par `id` ; Origin + `try/catch` du Worker.

## Hypothèses
- AllOrigins, CodeTabs et PageSpeed simulés par Playwright (réseau bloqué) : vrais statuts, quotas et encodages [À VÉRIFIER].
- Worker exécuté tel quel sous Node ; Cloudflare filtre sans doute les IP privées [À VÉRIFIER] : le risque principal reste le proxy ouvert.
- Mesuré : crawl 8 + 5 concurrents = 39 requêtes proxy et 6 PageSpeed simultanés.

## Faiblesses connues
Aucun site réel audité : taux réel de faux positifs inconnu. Données sectorielles, hashtags et benchmarks non vérifiés ; mobile non testé. Cas quadratique rare.

## Confiance
Haute sur les constats 1 à 8 (reproduits par script, sorties et captures conservées) ; moyenne sur les notes et l'impact/effort.

# Critique indépendante — deux versions de SEO 360 (5 novembre 2026)

## La demande

Nadir, dirigeant francophone, veut « la meilleure plateforme qui soit » pour qu'une TPE ou PME française soit première sur Google, perce sur TikTok, Instagram et les autres réseaux, et reçoive à partir d'un simple lien un plan complet : toutes les améliorations gratuites et payantes, les meilleurs outils avec leurs guides d'installation, et un benchmark de la concurrence. La plateforme doit pouvoir être testée en ligne, y compris dans une page privée claude.ai.

SEO 360 répond à cette demande avec :
- une interface web statique en 6 onglets (Synthèse, À faire, Mots-clés & réseaux, Budget, Concurrents, Ressources) ;
- une ligne de commande, `node seo/cli.mjs --aide` ;
- 21 skills Claude Code dans `.claude/skills/`, et un plugin dans `plugins/seo360/` ;
- une version « page claude.ai » qui ne peut joindre aucun autre site.

## Les deux versions, X et Y

Tu ne sais pas laquelle est la plus récente, et cela n'a pas d'importance : juge chacune pour ce qu'elle est.

| | X | Y |
|---|---|---|
| Copie complète (sources, skills, plugin, version construite) | `conseil-v3/critique/X/` | `conseil-v3/critique/Y/` |
| Interface | http://127.0.0.1:8851/docs/seo/ | http://127.0.0.1:8852/docs/seo/ |
| Version « page claude.ai », avec les restrictions réelles | http://127.0.0.1:8853/ | http://127.0.0.1:8854/ |
| Ligne de commande | `node conseil-v3/critique/X/seo/cli.mjs` | `node conseil-v3/critique/Y/seo/cli.mjs` |
| Tests | `node --test conseil-v3/critique/X/seo/test/engine.test.mjs` | idem pour Y |

Le dossier `conseil-v3` est `/tmp/claude-0/-home-user-rgte-redesign/137803cc-e0f1-5e43-837f-1ccac4c64755/scratchpad/conseil-v3`.

Pour tester :
- **Site de test local** : http://127.0.0.1:8766/. Exemple : `NO_PROXY=127.0.0.1 no_proxy=127.0.0.1 node <version>/seo/cli.mjs http://127.0.0.1:8766/ --secteur boulangerie --ville Lyon --no-psi --crawl 5 --sortie <ton dossier>`.
- **Exports Search Console de test** : `<version>/seo/test/fixtures/`.
- **Navigateur** : Playwright est installé (`require('playwright')`, `chromium.launch()` sans options). Teste en 1366 et en 390 px.
- **Tes propres cas** : tu peux créer et servir des pages pièges dans ton dossier de travail.

## Interdits

- Travaille uniquement dans `conseil-v3/critique-travail/`. Ne modifie rien d'autre.
- Ne lance pas `git`, et ne regarde pas le dépôt `/home/user/rgte-redesign`.
- Ne lis aucun autre fichier de `conseil-v3` que ce brief et `critique/`. N'exécute jamais de code téléchargé.
- Le réseau bloque presque tout Internet (GitHub et 127.0.0.1 passent). La recherche web (WebSearch) fonctionne.

## Grille (note sur 100 pour chaque version)

| Critère | Poids |
|---|---:|
| Honnêteté et exactitude des mesures et des faits | 20 |
| Valeur des recommandations (actionnables, correctifs, outils, plan) | 25 |
| Parcours et expérience (clarté, mobile, accessibilité, temps jusqu'à la 1re action) | 20 |
| Couverture multicanal (Google, local, IA, réseaux, pub, outils) | 15 |
| Robustesse et sécurité | 10 |
| Différenciation face aux concurrents | 10 |

## Ce qu'on attend

- Teste les deux versions sur les mêmes scénarios. Par exemple :
  - un boulanger lyonnais sur son téléphone ;
  - un artisan qui se déplace chez ses clients ;
  - une boutique en ligne qui veut savoir combien investir en publicité ;
  - quelqu'un qui n'a que la page claude.ai ;
  - quelqu'un qui installe le plugin.
- Chaque note se justifie par une preuve rejouable : une commande, un `fichier:ligne`, une mesure ou une capture.
- Dis laquelle est meilleure et pourquoi.
- Liste les 8 défauts les plus graves **de la meilleure version**, du plus grave au moins grave, avec la preuve et le correctif proposé. Ils serviront à la dernière boucle de correction.
- 1 000 mots au plus, hors JSON.

## Rendu

Écris ton rapport dans `conseil-v3/critique-travail/rapport.md`, puis rends ce JSON suivi du rapport :

```json
{
  "X": {"Honnêteté": 0, "Recommandations": 0, "Parcours": 0, "Couverture": 0, "Robustesse": 0, "Différenciation": 0, "total_sur_100": 0},
  "Y": {"Honnêteté": 0, "Recommandations": 0, "Parcours": 0, "Couverture": 0, "Robustesse": 0, "Différenciation": 0, "total_sur_100": 0},
  "meilleure": "X ou Y",
  "pourquoi": "deux phrases",
  "defauts_de_la_meilleure": [{"gravite": "critique|élevée|moyenne", "defaut": "…", "preuve": "…", "correctif": "…"}]
}
```

Les notes de critère vont de 0 à 10 ; le total sur 100 applique les poids.

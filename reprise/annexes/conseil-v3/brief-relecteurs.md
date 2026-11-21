# Relecture à l'aveugle — conseil v3 de SEO 360 (5 novembre 2026)

## Contexte

Nadir, dirigeant francophone, veut « la meilleure plateforme qui soit » pour qu'une TPE ou PME française soit première sur Google, perce sur les réseaux, et reçoive à partir d'un simple lien un plan complet (améliorations gratuites et payantes, outils et guides d'installation, benchmark de la concurrence).

SEO 360 v3 est cette plateforme : interface web statique (6 onglets), ligne de commande (`node seo/cli.mjs`), 21 skills Claude Code, plugin, page claude.ai privée en mode démonstration.

Cinq experts l'ont auditée séparément. Chacun devait rendre :
1. une note de la plateforme sur 100 (grille commune) ;
2. ses 8 problèmes les plus graves, avec preuves ;
3. ses 8 améliorations prioritaires (impact, effort) ;
4. un benchmark concurrentiel sourcé.
Limite : 1 200 mots environ.

Les cinq audits, anonymes, sont dans `conseil-v3/anonymes/A.md` à `E.md`. Leurs preuves (scripts, captures, mesures, pages pièges) sont dans `conseil-v3/preuves/A/` à `E/`. Le dossier `conseil-v3` est `/tmp/claude-0/-home-user-rgte-redesign/137803cc-e0f1-5e43-837f-1ccac4c64755/scratchpad/conseil-v3`.

## Où vérifier

- **Copie figée de la v3 auditée** : `conseil-v3/avant/` (sources `seo/`, skills `.claude/skills/`, plugin `plugins/seo360/`, version construite `docs/seo/`). La ligne de commande y tourne sans installation : `NO_PROXY=127.0.0.1 no_proxy=127.0.0.1 node conseil-v3/avant/seo/cli.mjs --aide`.
- **Interface v3** : http://127.0.0.1:8811/docs/seo/ (Playwright installé : `require('playwright')`, `chromium.launch()` sans options). **Simulation de la page claude.ai** : http://127.0.0.1:8820/. **Site de test** : http://127.0.0.1:8766/. **Exports Search Console de test** : `conseil-v3/avant/seo/test/fixtures/`.
- Les pages pièges citées par un audit ne tournent peut-être plus : relance-les depuis son dossier de preuves (`python3 -m http.server <port> --directory <dossier>`).
- Le dépôt `/home/user/rgte-redesign` est en cours de modification : **ne t'en sers pas pour vérifier**, utilise `conseil-v3/avant/`.
- Le réseau bloque presque tout Internet (GitHub et 127.0.0.1 passent). La recherche web (WebSearch) fonctionne.

## Interdits

- Ne modifie aucun fichier hors de `conseil-v3/relectures/`. Ne lance pas `git`. N'exécute jamais de code téléchargé.
- Ne cherche pas à savoir qui a écrit quoi. Ne lis pas `conseil-v3/reponses/`, `conseil-v3/travail/`, `conseil-v3/cles.json`, ni les autres fichiers de `conseil-v3/relectures/`.

## Grille (critère : poids)

| Critère | Poids |
|---|---:|
| Justesse et preuves (constats reproduits, pas d'erreur de fait) | 30 |
| Impact des améliorations proposées pour une TPE | 25 |
| Priorisation et faisabilité | 20 |
| Qualité du benchmark concurrentiel | 15 |
| Clarté | 10 |

## Règles

- Juge le fond. Une réponse longue ou bien tournée n'a pas de point en plus si elle n'apporte pas plus. A.md à E.md n'ont pas la même longueur : ne récompense pas la longueur.
- **Vérifie au moins 2 constats par audit** : relance la commande, ouvre le `fichier:ligne` dans `conseil-v3/avant/`, rejoue le script ou fais une recherche web. Note ce que tu as vérifié et le résultat.
- Chaque note se justifie par un passage précis de l'audit.
- Pour chaque audit, dis ce qu'il a de meilleur et qui manque aux autres : c'est ce qu'il faudra garder.
- Signale toute erreur de fait ou affirmation douteuse, et dis si tu l'as vérifiée.

## Rendu

Écris ton JSON dans `conseil-v3/relectures/r<ton numéro>.json`, puis rends exactement le même JSON comme réponse finale, sans autre texte. Les clés des notes sont exactement celles-ci : "Justesse et preuves", "Impact des améliorations", "Priorisation et faisabilité", "Qualité du benchmark", "Clarté" (notes de 0 à 10, décimales permises).

```json
{
  "notes": {"A": {"Justesse et preuves": 0, "Impact des améliorations": 0, "Priorisation et faisabilité": 0, "Qualité du benchmark": 0, "Clarté": 0}, "B": {}, "C": {}, "D": {}, "E": {}},
  "classement": ["meilleure lettre", "…", "moins bonne"],
  "verifications": {"A": ["constat vérifié → résultat"], "B": []},
  "a_garder": {"A": ["idée ou passage à reprendre"], "B": []},
  "erreurs": {"A": ["erreur ou affirmation douteuse (vérifiée ou non)"]},
  "manques_communs": ["ce qu'aucun audit ne traite"],
  "commentaire": "une phrase sur le meilleur audit"
}
```

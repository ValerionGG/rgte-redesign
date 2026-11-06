---
name: github-seo
description: Référencement d'un dépôt GitHub : description, topics, README, image d'aperçu, GitHub Pages, licence, SECURITY.md, CITATION.cff, releases, diffusion (listes awesome, Show HN, Reddit) et mesure (requêtes suivies, trafic archivé avant 14 jours, vues → étoiles). À utiliser pour « référencer mon repo », « plus d'étoiles », « visibilité GitHub », « améliorer mon README », « github seo ». Site de documentation hors GitHub → seo-360.
metadata:
  version: "2.0"
---

# Référencer un dépôt GitHub

> **Contexte d'abord** : si `.claude/contexte-entreprise.md` existe, le lire avant toute question et ne demander que ce qui manque ; y enregistrer les nouvelles réponses. Sinon, proposer de le créer avec le skill `contexte-entreprise` (2 minutes).

## Règles essentielles

- **Mesurer avant de changer** (section 8), puis changer une seule chose à la fois et juger après 2 à 4 semaines.
- Jamais d'étoiles achetées ni d'échanges d'étoiles : c'est une activité non authentique, contraire aux règles d'utilisation de GitHub, et le dépôt peut être sanctionné.
- Respecter les règles de chaque communauté avant d'y publier (Show HN, règlement de chaque subreddit, contribution aux listes awesome).

## 1. Audit

`node "${CLAUDE_SKILL_DIR}/../../seo/cli.mjs" owner/repo` interroge l'API GitHub ; au-delà de 60 requêtes par heure, ajouter `GITHUB_TOKEN`. Les constats sont rangés par catégorie : découvrabilité, README, confiance, activité. Un contrôle bloqué par la limite de l'API s'affiche « non vérifié » : ce n'est pas un défaut du dépôt.

## 2. Recherche GitHub et Google

- Nom avec tirets et mot-clé.
- Description de 80 à 160 caractères avec 2 ou 3 mots-clés.
- 10 à 20 topics (20 au maximum) : langage, framework, domaine, cas d'usage.
- Champ « Website » rempli (démo ou documentation sur GitHub Pages).

## 3. README (la page d'accueil du projet)

`# Nom` + la promesse en une phrase, badges, GIF ou capture en haut (avec un texte alternatif), Fonctionnalités, Installation (commande copiable), Utilisation (exemple et résultat), FAQ, Contribuer, Licence. Placer les mots-clés de la description dans les 2 premières lignes.

## 4. Confiance

- `LICENSE` : sans licence, personne n'a le droit de réutiliser le code.
- `SECURITY.md` : comment signaler une faille ; GitHub l'affiche dans l'onglet Security.
- `CITATION.cff` : ajoute le bouton « Cite this repository », utile pour la recherche et pour que le projet soit cité correctement.
- `CONTRIBUTING.md`, `CODE_OF_CONDUCT.md`, modèles d'issues, Discussions, étiquette « good first issue ».

## 5. Activité

Releases numérotées en SemVer, avec des notes de version lisibles. Commits réguliers. Répondre aux issues.

## 6. Diffusion

2 ou 3 listes awesome-* pertinentes (une pull request par liste, en suivant ses règles), Show HN, sous-forums Reddit du domaine, dev.to ou Medium, LinkedIn, newsletters du secteur. Image d'aperçu (social preview) en 1280×640.

## 7. GitHub Pages

Même hygiène SEO qu'un site (title, description, Open Graph, sitemap). Auditer avec `node "${CLAUDE_SKILL_DIR}/../../seo/cli.mjs" https://<owner>.github.io/<repo>/`.

## 8. Mesurer

1. **Requêtes fixes** : choisir 5 à 10 requêtes (ce que taperait un utilisateur) et relever chaque semaine la position du dépôt dans la recherche GitHub (`https://github.com/search?q=<requête>&type=repositories`) et sur Google. Garder la même liste d'une semaine à l'autre.
2. **Trafic** : GitHub ne garde que 14 jours de trafic. L'archiver au moins une fois par semaine (accès en écriture au dépôt requis) :
   ```bash
   gh api repos/OWNER/REPO/traffic/views
   gh api repos/OWNER/REPO/traffic/clones
   gh api repos/OWNER/REPO/traffic/popular/referrers
   gh api repos/OWNER/REPO/traffic/popular/paths
   ```
   Ajouter chaque relevé à un CSV daté (par exemple `traffic/AAAA-MM.csv`) ou le planifier : tâche planifiée de Claude Code, ou action GitHub programmée dotée d'un jeton qui a les droits nécessaires.
3. **Conversion** : étoiles gagnées divisées par les visiteurs uniques de la semaine. Comparer avant et après chaque changement.
4. **Journal des expériences** : date, changement (un seul), résultat après 2 à 4 semaines (amélioré, neutre, non prouvé).

Pour s'inspirer, voir les projets SEO et marketing les plus suivis de `${CLAUDE_SKILL_DIR}/../../seo/data/research/github-oss.json` : skills composables, démos visuelles, serveurs MCP.

## Format de sortie

1. **Verdict** : les 3 changements au plus fort effet.
2. Description et topics prêts à coller, avec leur nombre de caractères.
3. Plan du README, ou README réécrit.
4. Fichiers de confiance à ajouter.
5. Plan de diffusion sur 4 semaines.
6. Tableau de mesure à remplir chaque semaine.

## Quand ne pas l'utiliser

- Le site de documentation d'un projet hébergé hors de GitHub → seo-360.
- Une application mobile → aso-application.
- Les posts LinkedIn ou les vidéos de lancement → contenus-reseaux-video.

## Terminé quand

- [ ] Description (80 à 160 caractères), topics (20 au maximum) et Website prêts à coller.
- [ ] README avec promesse, visuel, installation et exemple.
- [ ] LICENSE, SECURITY.md et CITATION.cff présents ou proposés.
- [ ] Requêtes fixes et archivage du trafic mis en place, avant tout changement.
- [ ] Une seule expérience lancée, avec sa date de bilan.

## Jamais

- Acheter des étoiles, des forks ou des abonnés, ou en échanger.
- Publier en masse les mêmes annonces dans des communautés qui l'interdisent.
- Mettre dans les topics ou la description des mots-clés sans rapport avec le projet.
- Conclure qu'un changement a marché sans relevé d'avant.

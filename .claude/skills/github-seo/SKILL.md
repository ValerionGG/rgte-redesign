---
name: github-seo
description: Référencement et découvrabilité d'un dépôt GitHub — description, topics, README, image social preview, GitHub Pages, licence, releases, communauté, diffusion (awesome lists, Show HN, Reddit) pour gagner des visiteurs, des étoiles et des positions Google. À utiliser pour « référencer mon repo », « plus d'étoiles », « visibilité GitHub ».
---

# Référencer un dépôt GitHub

1. `node seo/cli.mjs owner/repo` (API GitHub ; `GITHUB_TOKEN` au-delà de 60 requêtes/h). Constats par catégorie : découvrabilité, README, confiance, activité.
2. **Recherche GitHub & Google** : nom avec tirets et mot-clé, description 80–160 car. avec 2–3 mots-clés, 10–20 topics (max 20 : langage, framework, domaine, cas d'usage), champ Website (démo/doc GitHub Pages).
3. **README** (c'est la landing page) : `# Nom` + promesse en 1 phrase, badges, GIF/capture en haut, Fonctionnalités, Installation (commande copiable), Utilisation (exemple + sortie), FAQ, Contribuer, Licence ; mots-clés de la description dans les 2 premières lignes.
4. **Confiance** : licence, CONTRIBUTING, CODE_OF_CONDUCT, modèles d'issues, Discussions, « good first issue ».
5. **Activité** : releases SemVer avec notes, commits réguliers.
6. **Diffusion** : 2–3 listes awesome-* pertinentes, Show HN, Reddit (sous-forums du domaine), dev.to/Medium, LinkedIn, newsletters ; image social preview 1280×640.
7. **GitHub Pages** : même hygiène SEO qu'un site (title, description, OG, sitemap) — auditer avec `node seo/cli.mjs https://<owner>.github.io/<repo>/`.

Inspiration : top projets SEO/marketing de `seo/data/research/github-oss.json` (ce qui marche : skills composables, démos visuelles, MCP).

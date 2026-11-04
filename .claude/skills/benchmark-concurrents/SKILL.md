---
name: benchmark-concurrents
description: Étude concurrentielle et benchmarking SEO / social / pub — compare un site à ses concurrents sur la même grille d'audit, identifie ce qu'ils font mieux, et situe un projet dans le marché des outils SEO (Semrush, Ahrefs, Haloscan, outils GEO, ASO, social) et de l'open-source GitHub. À utiliser pour « analyse mes concurrents », « benchmark », « étude de marché », « SWOT », « positionnement ».
---

# Benchmark concurrents & marché

## Concurrents d'un site
```bash
node seo/cli.mjs monsite.fr --secteur <id> --concurrents c1.fr,c2.fr,c3.fr --crawl 10
```
Lire `competitors[]` : note et notes par catégorie **calculées sur la page d'accueil, sans l'exploration multi-pages** (`pageGlobal` / `pageScores`, mêmes conditions pour tous), vitesse mobile, nombre de mots, réseaux reliés, termes principaux (`terms`). Un concurrent non lu est « non comparable » (`error`), jamais noté 100. L'onglet Concurrents liste aussi les sujets traités par au moins 2 concurrents et absents chez vous.
Compléter à la main (sources publiques, sans inventer) : offre et prix affichés, avis Google (note/volume), fréquence de publication sur les réseaux, présence dans les réponses IA (poser 10 questions types à ChatGPT/Perplexity/Gemini et noter qui est cité).

## Marché des outils
- `seo/data/research/competitors.json` : 35 outils, prix d'entrée (à reconfirmer), forces/faiblesses, matrice de fonctionnalités 0–2, SWOT, positionnement, sources.
- `seo/data/research/github-oss.json` : 50 projets open-source (étoiles réelles au 03/11/2026), ce qu'on peut en reprendre, lacunes, licences (attention AGPL).
- Mettre à jour : relancer une recherche, modifier le JSON, puis `node seo/data/sync.mjs`.

## Livrer
1. Tableau comparatif (vous en surbrillance). 2. « Ce qu'ils font mieux » → action concrète pour chaque écart. 3. Opportunités non prises par personne (mots-clés, réseaux, formats, IA). 4. SWOT court. 5. 3 priorités pour passer devant en 90 jours.

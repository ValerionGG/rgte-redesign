---
name: geo-visibilite-ia
description: Optimisation pour les moteurs de réponse et l'IA générative (GEO / AEO) — être cité par ChatGPT Search, Perplexity, Claude, Gemini, Google AI Overviews / AI Mode et Copilot - robots IA, Bing/IndexNow, llms.txt, structure des contenus, entité de marque, mesure du trafic IA. À utiliser pour « apparaître dans ChatGPT », « AI Overviews », « GEO », « référencement IA ».
---

# Visibilité dans les IA (GEO)

## Diagnostic automatique
La CLI (`node seo/cli.mjs <url>`) vérifie : robots IA autorisés/bloqués (OAI-SearchBot, ChatGPT-User, PerplexityBot, Claude-SearchBot, GPTBot, ClaudeBot, Google-Extended…), Bingbot, `/llms.txt`, contenu lisible sans JS, intertitres en questions, faits chiffrés, auteur/date, sameAs, vérification Bing, page À propos. Matrice : `result.meta.bots`.

## Leviers, par impact
1. **Être crawlable** : autoriser les robots de *recherche* IA (bloquer l'entraînement reste un choix éditorial). Contenu dans le HTML (les robots IA n'exécutent généralement pas le JS).
2. **Bing** : Bing Webmaster Tools + IndexNow (ChatGPT Search et Copilot s'appuient sur Bing).
3. **Passages citables** : intertitre = question réelle ; réponse directe de 40–60 mots juste dessous ; puis détails, tableau HTML, chiffres datés, sources.
4. **Entité de marque** : Organization + sameAs cohérents (LinkedIn, Wikidata, réseaux), NAP identique, page À propos riche, auteurs experts identifiés.
5. **Mentions tierces** : comparatifs, presse, Reddit/forums, annuaires pro, avis — les IA citent beaucoup les sources tierces.
6. **llms.txt** : coût nul, effet non démontré, Google ne l'utilise pas : signalé en simple information, jamais en défaut (modèle : `buildFixes(report).llms`).
7bis. **Rendu JavaScript** : le bouton-favori compare le HTML envoyé par le serveur au texte après JavaScript ; au-delà de 50 % de texte ajouté par JS, les robots IA (qui n'exécutent pas le JS) voient une page vide.
7. **Fraîcheur** : dates de mise à jour réelles, contenus revus chaque trimestre.

## Mesurer
- Protocole mensuel : 10–20 questions types (marque, catégorie + ville, comparatifs, « meilleur … ») dans ChatGPT, Perplexity, Gemini, Copilot, Mistral Le Chat ; noter cité oui/non, position, concurrents cités, sources utilisées.
- GA4 : segment de trafic référent `chatgpt.com|perplexity.ai|gemini.google.com|copilot.microsoft.com|claude.ai`.
- Outils de suivi payants si besoin (voir l'étude de marché : Otterly, Peec AI, Semrush AI Toolkit, Ahrefs Brand Radar…).

Contexte chiffré (AI Overviews en France, baisse de CTR, zero-click) : `seo/data/research/benchmarks.json` → `seo_facts`. Citer les chiffres avec leur source, jamais de mémoire.

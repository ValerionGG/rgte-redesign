---
name: hashtags-reseaux
description: Génère les meilleurs hashtags et légendes pour chaque réseau social (Instagram, TikTok, LinkedIn, YouTube, X, Facebook, Pinterest, Threads, Bluesky, Snapchat) selon le secteur, la ville, la marque et les limites 2026 (ex. 5 hashtags max sur Instagram). À utiliser pour « quels hashtags », une légende de post, un calendrier éditorial ou une stratégie social media / SMO.
---

# Hashtags & légendes par réseau

## Générer
```bash
node -e "import('./seo/engine/hashtags.js').then(m=>console.log(JSON.stringify(m.generateHashtags({sector:'boulangerie',keywords:['pâtisserie lyon'],city:'Lyon',brand:'Maison X',lang:'fr'}),null,1)))"
```
Secteurs et bases de hashtags : `seo/data/sectors.js` ; règles officielles/observées par réseau : `seo/data/research/benchmarks.json` → `social_rules`.

## Règles 2026 à respecter
- **Instagram** : 5 hashtags max (depuis déc. 2025). Mix : 1 marque, 2 niche, 1 local, 1 sectoriel. Mots-clés dans la légende (la recherche Instagram les indexe).
- **TikTok** : 3–5 ; dire le mot-clé à l'oral + texte à l'écran dans les 3 premières secondes.
- **LinkedIn** : 0–3 (l'algorithme lit le sens du texte). **Threads** : 1 tag de sujet. **YouTube** : 2–3 (les 3 premiers s'affichent au-dessus du titre ; > 60 = tous ignorés). **Pinterest / Facebook** : 0–2, privilégier les mots-clés. **X / Bluesky** : 1–2.
- CamelCase pour les tags composés générés (#PatisserieLyon, #VitrineRefrigereeSurMesure : expression entière, jamais de mot retiré au milieu) ; pas d'accents ; « métier + ville » avant « ville » seule ; rotation de 2–3 tags par post (réserve) ; un tag de marque fixe.
- Popularité : aucune API gratuite ne la donne. Dans l'interface, chaque hashtag est un lien vers sa page sur le réseau pour la vérifier (nombre de publications, fraîcheur).
- Jamais : #followforfollow, #like4like, #f4f, etc. (liste `BANNED_HASHTAGS`).

## Livrer
Par réseau prioritaire du secteur : la ligne à copier, la réserve, 1 légende modèle adaptée, fréquence et créneaux (FR). Ajouter 3 idées de posts alignées sur les mots-clés SEO (un même sujet décliné site ↔ réseaux). Ne pas prétendre connaître le volume exact d'un hashtag : proposer de vérifier dans la recherche de l'app.

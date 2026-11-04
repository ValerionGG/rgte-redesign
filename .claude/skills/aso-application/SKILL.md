---
name: aso-application
description: App Store Optimization (ASO) pour applications iOS et Android — audit de fiche App Store / Google Play (titre, sous-titre, mots-clés, description, captures, vidéo, notes, mises à jour, localisation), Custom Product Pages, In-App Events, Apple Search Ads, et lien avec le SEO du site de l'app. À utiliser avec un lien apps.apple.com ou play.google.com, ou pour « plus de téléchargements ».
---

# ASO

1. `node seo/cli.mjs https://apps.apple.com/fr/app/<nom>/id<ID> --mot-cle "<mot-clé>" --secteur app-mobile` (iOS : API iTunes Lookup ; Android : lecture de la fiche Play).
2. **Métadonnées** — iOS : nom 30 car. (champ le plus pondéré), sous-titre 30, champ mots-clés 100 (virgules, sans espaces, sans doublons du nom, singulier). Android : titre 30, description courte 80, description longue 4 000 **indexée** (3–5 mots-clés répétés naturellement).
3. **Conversion** : icône testée, 6–10 captures avec un bénéfice écrit en gros (les 3 premières décident), vidéo 15–30 s.
4. **Notes** : viser ≥ 4,5 ; demande d'avis in-app après un moment positif (SKStoreReviewController / In-App Review API) ; répondre aux avis.
5. **Fraîcheur & qualité** : mise à jour toutes les 4–6 semaines ; Android Vitals (plantages < 1,09 %, ANR < 0,47 %).
6. **Localisation** de la fiche par marché (chaque langue = un champ mots-clés de plus sur iOS).
7. **Leviers 2026** : Custom Product Pages / fiches personnalisées par audience, In-App Events / Promotional Content, Apple Search Ads (marque + 5–10 génériques), Product Page Optimization (A/B).
8. **Site de l'app** : Smart App Banner, liens universels, schéma SoftwareApplication, page par fonctionnalité (SEO), hashtags du skill `hashtags-reseaux` pour TikTok/Reels.

Données non publiques (sous-titre, mots-clés iOS, conversions) : les demander ou les signaler « à vérifier dans App Store Connect / Play Console ».
Google Play : sans la note et les avis lisibles, l'audit est marqué incomplet (`result.incomplete`, pas de note) ; le budget d'une app utilise les campagnes App de Google et Apple Ads, sans repère de coût par installation inventé.

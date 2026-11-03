---
name: seo-local
description: SEO local et Google Business Profile pour commerces, artisans, restaurants, cabinets et PME de proximité — fiche Google, catégories, avis, NAP, pages ville, LocalBusiness, annuaires FR, Apple Plans / Bing Places, publicité locale. À utiliser pour « apparaître sur Google Maps », « être premier dans ma ville », « plus d'avis », « fiche Google ».
---

# SEO local

1. Lancer `node seo/cli.mjs <url> --secteur <id> --ville <ville> --local` : constats `tel`, `nap`, `localbusiness`, `hours`, `gbp-link`, `city`.
2. **Fiche Google Business Profile** (1er levier) : catégorie principale la plus précise (facteur n°1 selon Whitespark 2026), catégories secondaires, nom réel sans mots-clés ajoutés (risque de suspension), horaires + exceptionnels, services/produits avec prix, attributs, 1–3 photos/vidéos réelles par semaine, 1 post/semaine, Q&R.
3. **Avis** : process systématique (QR code, SMS après prestation), objectif +10/mois, réponse à 100 % sous 48 h en citant le service et la ville, sans incentive (interdit).
4. **Site** : NAP identique partout, schéma LocalBusiness précis (geo, openingHoursSpecification, sameAs), une page par ville/zone avec contenu unique (réalisations locales, accès, avis locaux), ville dans titre/H1, tel: cliquable, carte intégrée.
5. **Citations** : PagesJaunes, Apple Plans (Business Connect), Bing Places, Waze, annuaires métier et chambres consulaires ; corriger les anciens NAP.
6. **Pub locale** : Google Search sur « [métier] [ville] » + extension de lieu ; Meta rayon 10–20 km. Calcul : skill `budget-publicite`.
7. Suivi : appels/itinéraires de la fiche, positions dans le pack local (grille de points), avis.

Checklist complète : `seo/engine/checklists.js` (id `local`).

---
name: calendrier-marketing-fr
description: Calendrier marketing français de l'année, dates calculées (Pâques, fête des mères, soldes, Black Friday, fériés, ponts, Alsace-Moselle) et temps forts du secteur, avec rétroplanning contenu J-30, pub J-14, posts J-7 et horaires de la fiche Google ; export CSV et .ics. À utiliser pour « calendrier marketing », « temps forts de l'année », « quand préparer Noël ou la fête des mères », « planning commercial 2027 », « callendrier ». Écrire les posts → contenus-reseaux-video.
metadata:
  version: "1.0"
---

# Calendrier marketing français

> **Contexte d'abord** : si `.claude/contexte-entreprise.md` existe, le lire avant toute question et ne demander que ce qui manque ; y enregistrer les nouvelles réponses. Sinon, proposer de le créer avec le skill `contexte-entreprise` (2 minutes).

Livre les temps forts d'une année : la date exacte, pourquoi elle compte pour ce secteur, et le rétroplanning de chaque opération. Les calendriers saisonniers des outils anglo-saxons (Thanksgiving, fête des mères en mai) ne valent pas pour la France : tout se recalcule ici.

## Règles essentielles

- **Aucune date de mémoire.** Lancer `node "${CLAUDE_SKILL_DIR}/../../seo/cli.mjs" calendrier <année> --secteur <id> [--alsace] --sortie rapports-seo` (identifiants dans `${CLAUDE_SKILL_DIR}/../../seo/data/sectors.js`) : la CLI écrit le tableau (.md), le tableur (.csv) et l'agenda (.ics) au format de [references/formats-export.md](references/formats-export.md). Sans terminal, lire la table [references/dates-mobiles.md](references/dates-mobiles.md), calculée par script et identique à la CLI.
- **Soldes** : la CLI applique la règle nationale (début et durée de 4 semaines). Confirmer chaque année sur economie.gouv.fr : certains départements ont des dates dérogatoires (frontaliers, montagne, outre-mer).
- **Vacances scolaires et rentrée** : fixées par le ministère, par zone A, B ou C → education.gouv.fr. Ne pas les deviner.
- **Peu de temps forts, bien préparés** : 6 à 10 dans l'année pour une TPE, choisis pour le secteur et la ville. Une liste de 40 dates n'est pas un plan.
- **Rétroplanning** pour chaque temps fort : contenu à J-30, pub à J-14, posts à J-7, fiche Google à J-7. Pinterest et le SEO saisonnier s'anticipent davantage : 45 à 90 jours.

## Étapes

1. **Cadrer** (depuis le contexte, sinon une seule question) : année, secteur, ville ou département (Alsace-Moselle ? outre-mer ?), canaux utilisés, budget pub, jours d'ouverture.
2. **Calculer** les dates avec la CLI ou la table de référence.
3. **Choisir les temps forts** :
   - universels utiles au secteur ;
   - temps forts propres au secteur : [references/temps-forts-secteurs.md](references/temps-forts-secteurs.md) ;
   - événements locaux (marché de Noël, salon, fête de la ville), à demander au dirigeant ou à vérifier sur le site de la mairie ou de l'office de tourisme.
4. **Ponts** : un jour férié un mardi ou un jeudi crée un pont probable. Adapter les horaires, l'offre (e-commerce : livraison) et les posts.
5. **Rétroplanning par temps fort** :
   - **J-30, contenu** : page ou fiche produit saisonnière (SEO), article, visuels, offre. La page saisonnière reste en ligne d'une année sur l'autre (même URL, mise à jour) pour garder son ancienneté.
   - **J-14, pub** : lancer avant le pic. La concurrence fait monter les coûts en fin d'année (repère : CPM Meta/TikTok +30 à 60 % en novembre-décembre, `${CLAUDE_SKILL_DIR}/../../seo/data/research/benchmarks.json` → `budget_rules`) → budget-publicite.
   - **J-7, posts** : série de posts et de Stories → contenus-reseaux-video ; hashtags saisonniers → hashtags-reseaux.
   - **J-7, fiche Google** : horaires exceptionnels de chaque jour férié et de chaque fermeture, post Google sur l'offre (seo-local).
   - **Application** : contenus promotionnels (In-App Events, Promotional Content) et mots-clés saisonniers → aso-application.
   - **Promotions** : un prix barré se calcule sur le prix le plus bas des 30 derniers jours ; les soldes n'ont lieu qu'aux dates légales → conformite-marketing-fr.
6. **Livrer et exporter** : tableau mois par mois, puis les fichiers CSV et .ics produits par la CLI (`--sortie`). Pour ajouter des événements locaux ou des actions à la main, respecter le format de [references/formats-export.md](references/formats-export.md). Avant d'écrire un fichier, dire où il sera créé.

## Format de sortie

1. **Verdict en 2 lignes** : les 3 temps forts qui rapportent le plus à ce secteur et la prochaine échéance (« dans 23 jours : préparer la page fête des mères »).
2. **Tableau annuel** : `Mois | Date | Temps fort | Pourquoi pour vous | J-30 contenu | J-14 pub | J-7 posts et fiche Google`.
3. **Jours fériés et ponts** de l'année, avec les horaires à saisir dans la fiche Google.
4. **Ce qui reste à vérifier** : dates des soldes du département, vacances scolaires, événements locaux.
5. **Fichiers** : `calendrier-<année>.csv` et `calendrier-<année>.ics`.

## Quand ne pas l'utiliser

- Écrire les posts, scripts ou légendes d'un temps fort → contenus-reseaux-video.
- Calculer le budget pub d'une période → budget-publicite.
- Vérifier qu'une promotion ou une mention « soldes » est légale → conformite-marketing-fr.
- Une campagne ponctuelle sans lien avec une date (lancement produit) → seo-360 ou budget-publicite.

## Terminé quand

- [ ] Chaque date vient de la CLI ou de la table calculée, et l'année est la bonne.
- [ ] 6 à 10 temps forts choisis pour le secteur, chacun avec sa raison.
- [ ] Rétroplanning J-30 / J-14 / J-7 et horaires exceptionnels de la fiche Google pour chaque temps fort.
- [ ] Jours fériés locaux traités (Alsace-Moselle, outre-mer) si l'adresse l'exige.
- [ ] Soldes, vacances scolaires et événements locaux marqués « à vérifier » avec la source officielle.
- [ ] CSV et .ics proposés (ou écrits) au format attendu.

## Jamais

- Donner une date mobile, une date de soldes ou une date de vacances de mémoire.
- Reprendre un calendrier américain sans le transposer (fête des mères en mai, Thanksgiving).
- Annoncer des « soldes » hors des périodes légales, ou un prix barré qui n'est pas le plus bas des 30 derniers jours.
- Publier, programmer une pub ou modifier la fiche Google à la place du dirigeant : le skill prépare, le dirigeant valide.

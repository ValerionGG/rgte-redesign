---
name: suivi-performance-mensuel
description: Suivi et rapport mensuel SEO, local, IA et pub : référence datée, indicateurs par objectif (contacts, appels et itinéraires de la fiche Google, avis, clics hors marque, positions 4-20, coût par contact), cadence, actions « fait (déclaré) » contre « encore détecté », rapport court avec 3 prochaines actions, marque blanche pour agences. À utiliser pour « rapport mensuel », « reporting SEO », « mes actions ont-elles marché ? », « tableau de bord », « rapport client ». Chute brutale → diagnostic-baisse-trafic.
metadata:
  version: "1.0"
---

# Suivi et rapport mensuel

> **Contexte d'abord** : si `.claude/contexte-entreprise.md` existe, le lire avant toute question et ne demander que ce qui manque ; y enregistrer les nouvelles réponses. Sinon, proposer de le créer avec le skill `contexte-entreprise` (2 minutes).

Annoncer au début : « Je compare ce mois-ci à la référence avec vos propres données, je vérifie l'effet de chaque action et je prépare le rapport. Je ne publie rien et je n'engage aucune dépense. »

## Règles essentielles

1. **Chiffres tirés des sources** (Search Console, GA4, fiche Google, régies publicitaires, plateforme SEO 360), jamais estimés ni arrondis à son avantage. Un indicateur sans donnée s'écrit « non mesuré ».
2. **Périodes comparables** : le mois contre le mois précédent et contre le même mois de l'an passé, à durée égale.
3. **Laisser le temps** : attendre 3 à 4 semaines avant de juger une modification SEO ; une modification à la fois quand c'est possible ; abandonner une action après deux tours sans effet.
4. **Séparer marque et hors marque** : les clics de marque suivent la notoriété, les clics hors marque mesurent le SEO.
5. **Dire « non prouvé »** quand une hausse peut venir de la saison, de la marque ou de la publicité plutôt que de l'action.

## Étape 1 — Référence datée (mois 0)

Enregistrer dans `.claude/contexte-entreprise.md` (section Suivi) ou dans `suivi/AAAA-MM.md` :

- audit : `node seo/cli.mjs <url> --sortie rapports-seo` (note, couverture, constats) ;
- Search Console : export des 3 derniers mois, puis `node seo/cli.mjs gsc export.zip --marque "<marque>"` ;
- GA4 : sessions par canal, événements clés (appels, formulaires, réservations, achats) ;
- fiche Google : appels, itinéraires, clics vers le site, avis (nombre, note moyenne, taux de réponse) ;
- publicité : dépense, conversions, coût par contact.

## Étape 2 — Indicateurs par objectif

| Objectif | Indicateur principal | Source | Indicateurs secondaires |
|---|---|---|---|
| Contacts | appels + formulaires + rendez-vous | GA4 (événements clés), suivi d'appels | taux de conversion des pages clés |
| Local | appels, itinéraires et clics depuis la fiche ; avis | Fiche Google (Performances) ; GA4 importe 7 mesures de la fiche depuis juin 2026, sans détail par établissement (https://www.straightnorth.com/blog/google-business-profile-and-ga4-integration-setup-metrics-and-limitations/) | positions locales vérifiées à la main depuis 5 points de la zone |
| SEO | clics hors marque ; requêtes en positions 4-20 | `node seo/cli.mjs gsc actuel.zip --avant precedent.zip --marque "<marque>"` | pages en déclin, requêtes disparues |
| IA | visites venues des assistants | GA4 : référents chatgpt.com, perplexity.ai, gemini.google.com, copilot.microsoft.com, claude.ai | impressions du rapport « IA générative » de Search Console (impressions seulement), taux de citation (protocole de geo-visibilite-ia) |
| Publicité | coût par contact réel contre coût maximal rentable | régies + skill budget-publicite | retour sur dépense publicitaire |
| Réseaux | clics vers le site, messages reçus | statistiques des réseaux | portée, abonnés |

## Étape 3 — Cadence

- **Chaque semaine (5 minutes)** : positions de 5 à 10 requêtes clés (Search Console, filtre par requête), avis à répondre.
- **Chaque mois** : rapport (étape 5).
- **Chaque trimestre** : audit complet et comparaison avec le précédent (historique des audits dans l'interface, ou `node seo/cli.mjs <url> --avant <ancien-rapport.json>`), revue des contenus sans impression.

## Étape 4 — Statut et effet de chaque action

| Action | Date | Déclaré | Contrôle suivant | Effet | Preuve |
|---|---|---|---|---|---|
| Titres de 6 pages réécrits | 2026-10-08 | fait | corrigé / encore détecté | amélioré / neutre / non prouvé | CTR des 6 pages, à 4 semaines |

L'interface SEO 360 garde l'historique des audits d'une même adresse : un point marqué « fait (déclaré) » mais encore présent au contrôle suivant ressort comme « encore détecté ». L'évolution de la note ne s'affiche qu'à couverture comparable : sans cela, ne pas comparer les notes.

## Étape 5 — Rapport mensuel (une page)

1. **Verdict en une phrase** : en progrès, stable ou en recul, et pourquoi.
2. **Ce qui a été fait** : actions du mois avec leur statut vérifié.
3. **Indicateurs** : tableau mois, mois précédent, même mois l'an passé, variation ; « non mesuré » ou « non fourni » quand la donnée manque.
4. **Ce qui a marché, ce qui n'a pas marché**, avec la confiance (Confirmé, Probable, Hypothèse).
5. **3 prochaines actions** : qui, combien de temps, date de contrôle.
6. **Ce qu'on n'a pas pu vérifier.**

**Marque blanche** (agence, freelance) : en-tête avec le logo, le nom et les coordonnées de l'agence, sans mention de l'outil si c'est demandé. Garder la source de chaque chiffre : les dirigeants se méfient des rapports qui ne concordent pas avec GA4 et Search Console. Joindre les exports bruts sur demande.

## Étape 6 — Planifier la re-mesure

Programmer le contrôle suivant : tâche planifiée de Claude Code ou simple rappel d'agenda le 1er du mois (relancer l'audit et les comparaisons, préparer le rapport). Toute publication, envoi au client ou dépense attend la validation humaine.

## Quand ne pas l'utiliser

- Chute brutale à expliquer → `diagnostic-baisse-trafic`.
- Premier audit, pas encore de référence → `seo-360`.
- Fixer ou répartir un budget publicitaire → `budget-publicite`.
- Suivre ce que disent les IA de la marque en détail → `geo-visibilite-ia`.

## Terminé quand

- [ ] La référence datée est enregistrée.
- [ ] Chaque indicateur du tableau est rempli ou marqué « non mesuré ».
- [ ] Le statut et l'effet de chaque action sont vérifiés.
- [ ] Le rapport d'une page est livré.
- [ ] La date du prochain contrôle est fixée.

## Jamais

- Inventer ou arrondir un chiffre à son avantage.
- Comparer des périodes de longueurs différentes.
- Attribuer une hausse à une action sans preuve.
- Publier, envoyer un rapport au client ou dépenser sans validation.

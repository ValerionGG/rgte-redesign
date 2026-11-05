---
name: netlinking-mentions-locales
description: Liens et mentions gratuits et propres : audit de l'export « Liens » de Search Console (sites référents, ancres, liens perdus), sources françaises (annuaires de qualité, CCI, CMA, fédérations, fournisseurs, presse locale, mairie), mentions qui comptent pour les IA, modèles de demande ; jamais d'achat de liens. À utiliser pour « obtenir des backlinks », « netlinking », « être cité par d'autres sites », « annuaires », « on me propose des liens pas chers ». Citations NAP et fiche Google → seo-local.
metadata:
  version: "1.0"
---

# Liens et mentions locales

> **Contexte d'abord** : si `.claude/contexte-entreprise.md` existe, le lire avant toute question et ne demander que ce qui manque ; y enregistrer les nouvelles réponses. Sinon, proposer de le créer avec le skill `contexte-entreprise` (2 minutes).

Annoncer au début : « J'analyse vos liens actuels, je vous propose 10 cibles et je rédige les demandes. Je n'envoie aucun message et je n'achète rien. »

## Règles essentielles

1. **Un lien doit pouvoir exister sans le SEO** : une vraie relation (fournisseur, client, partenaire, club, presse) qui enverrait aussi des visiteurs.
2. **Qualité et pertinence avant le nombre** : un lien de la mairie ou d'un média local vaut plus que des centaines d'annuaires automatiques.
3. **Ancres naturelles** : nom de la marque, adresse du site, description (« ce traiteur lyonnais »). Pas d'ancre « mot-clé exact » répétée.
4. **Mêmes coordonnées partout** : chaque fiche d'annuaire reprend exactement le nom, l'adresse et le téléphone de la fiche Google (skill seo-local).
5. **Achat de liens, réseaux de sites, échanges massifs : non.** Ils enfreignent les règles de Google sur le spam (https://developers.google.com/search/docs/essentials/spam-policies) et le gain ne vaut pas le risque.

## Étape 1 — Audit gratuit des liens

Search Console → Liens → bouton « Exporter » en haut à droite (tableaux du rapport : pages les plus liées, sites référents, textes des liens) et, si besoin, « Exporter les liens externes » (échantillons de liens). Puis :

```bash
node "${CLAUDE_SKILL_DIR}/../../seo/cli.mjs" gsc liens.zip
```

La commande sort les sites référents, les pages les plus liées, les ancres et une alerte quand les ancres sont suroptimisées. Lire :

- **Pages très liées contre pages qui rapportent** (rapport Performances) : ajouter des liens internes depuis les pages très liées vers les pages qui vendent.
- **Ancres** : une forte concentration d'ancres « mot-clé exact » venant d'un même site est un signal de liens artificiels ; la diversifier en obtenant de nouveaux liens naturels.
- **Sites douteux** (annuaires automatiques, sites sans rapport) : en général ne rien faire, Google ignore la plupart de ces liens. Le fichier de désaveu ne se justifie qu'en cas d'action manuelle ou d'anciens liens achetés en nombre.
- Seconde vue gratuite possible : Bing Webmaster Tools (rapport backlinks) ou Ahrefs Webmaster Tools pour un site vérifié.

## Étape 2 — Cibles françaises (en choisir 10, les plus faciles d'abord)

| Source | Exemples | Comment obtenir le lien | Effort |
|---|---|---|---|
| Fournisseurs, fabricants, distributeurs | page « revendeurs », « installateurs agréés » | demander l'ajout avec le numéro de client | faible |
| Clients professionnels, partenaires | étude de cas, témoignage | proposer un témoignage croisé | faible |
| Annuaires de qualité | PagesJaunes, annuaires métier des fédérations, annuaire RGE de France Rénov' pour le bâtiment, ordres professionnels | fiche complète et identique à la fiche Google | faible |
| Chambres consulaires | CCI, CMA (chambre de métiers et de l'artisanat) | fiche adhérent, événements, prix locaux | moyen |
| Associations, clubs, événements soutenus | club sportif, festival, association de commerçants | partenariat local ; un lien obtenu contre paiement doit porter `rel="sponsored"` selon Google : il apporte visibilité et visites, pas de poids SEO | moyen |
| Collectivités et tourisme | mairie, intercommunalité, office de tourisme | fiche dans l'annuaire des entreprises ou des prestataires | moyen |
| Presse et médias locaux | quotidien régional, radio locale, blogs de la ville | info utile : ouverture, embauche, chiffre local, initiative | moyen |
| Écoles et formation | stages, apprentissage, interventions | page partenaires de l'école | moyen |
| Salons et labels | salon professionnel, certification | page exposants ou annuaire des certifiés | moyen |

## Étape 3 — Mentions qui comptent pour les IA

Selon Ahrefs (mai 2025, 75 000 marques), les mentions de la marque sur le web corrèlent à 0,664 avec la visibilité dans les AI Overviews, contre 0,218 pour le nombre de backlinks ; corrélation, pas causalité (https://ahrefs.com/blog/ai-overview-brand-correlation/). Une étude de suivi (décembre 2025) trouve la plus forte corrélation pour les mentions sur YouTube, environ 0,737 (https://ahrefs.com/de/blog/ai-brand-visibility-correlations/).

- Être cité dans les comparatifs du secteur, les forums métier, Reddit (réponses utiles, compte identifié, jamais de faux avis) et les vidéos YouTube (sa chaîne, ou une apparition chez un créateur local).
- Wikidata : fiche d'entité seulement si l'entreprise est notable et sourcée. Wikipédia : jamais d'article écrit par l'entreprise elle-même (conflit d'intérêts).
- Mentions sans lien : les trouver avec `node "${CLAUDE_SKILL_DIR}/../../seo/cli.mjs" veille "<marque>"` (skill veille-sociale) et demander poliment l'ajout du lien.

## Étape 4 — Demander

Modèles courts en français (fournisseur, presse locale, association, mention sans lien) : [references/modeles-demandes.md](references/modeles-demandes.md). Chaque demande dit ce que le partenaire y gagne, tient en 5 lignes et propose le texte ou l'adresse exacte à ajouter. Faire valider chaque message par le dirigeant avant envoi.

## Étape 5 — Suivre

Tableau de suivi, à tenir en CSV :

```csv
cible,type,contact,date_demande,relance_j10,statut,url_du_lien,ancre
Mairie de Villefranche,collectivité,communication@…,2026-11-12,2026-11-22,en attente,,
```

Mesure chaque trimestre : nombre de domaines référents (export « Liens »), mentions trouvées par la veille, citations par les IA (protocole du skill geo-visibilite-ia).

## Livrer

L'audit des liens (ou « export non fourni »), les 10 cibles classées par effort, 3 demandes prêtes à envoyer, le tableau de suivi et la date de la prochaine mesure.

## Quand ne pas l'utiliser

- Citations NAP, fiche Google, avis → `seo-local` et `avis-clients-reputation`.
- Maillage interne dans un audit de site → `seo-audit-technique`.
- Visibilité dans les réponses des IA dans son ensemble → `geo-visibilite-ia`.
- Campagne de relations presse nationale : hors du périmètre de ce skill.

## Terminé quand

- [ ] L'export « Liens » est analysé, ou son absence est notée.
- [ ] 10 cibles sont classées par effort, avec le contact à trouver.
- [ ] 3 demandes sont rédigées et validées par le dirigeant.
- [ ] Le tableau de suivi existe et la date de la prochaine mesure est fixée.

## Jamais

- Acheter des liens, louer des articles sponsorisés sans le signaler, utiliser un réseau de sites.
- Faire des échanges de liens en masse ou des articles invités en série avec la même ancre exacte.
- Publier des commentaires ou des messages de forum promotionnels, créer de faux profils ou de faux avis.
- Désavouer des liens sans action manuelle ni historique d'achat de liens.
- Envoyer un message au nom de l'entreprise sans validation.

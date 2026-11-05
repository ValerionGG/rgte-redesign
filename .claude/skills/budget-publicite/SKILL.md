---
name: budget-publicite
description: Budget publicitaire rentable (Google Ads, Meta, TikTok, LinkedIn, YouTube, Microsoft…) : verdict rentable, à tester ou pas rentable, CPA maximal, ROAS d'équilibre, 3 scénarios, minimums et apprentissage, montée en charge, contrôle avant dépense (conversions suivies, Consent Mode v2, page mobile). À utiliser pour « combien investir en pub », « quel budget pour démarrer », « google ads ou facebook ? », « mes pubs coûtent trop cher », « budjet pub ». Page qui ne convertit pas → conversion-site.
metadata:
  version: "2.0"
---

# Budget publicitaire

> **Contexte d'abord** : si `.claude/contexte-entreprise.md` existe, le lire avant toute question et ne demander que ce qui manque ; y enregistrer les nouvelles réponses. Sinon, proposer de le créer avec le skill `contexte-entreprise` (2 minutes).

## Règles

- **Rentabilité d'abord.**
  - CPA maximal = valeur d'un client × marge brute × part des contacts qui signent.
  - ROAS d'équilibre = 1 / taux de marge brute. Avec 40 % de marge, il faut un ROAS d'au moins 2,5 (règle de `seo/data/research/benchmarks.json`).
  - Sans valeur client ni marge : verdict « inconnu », rien d'inventé.
- **Pas de verdict « rentable » si le contrôle avant dépense a un ✗** (section 2).
- **Toujours des fourchettes.** Elles se recalent après 2 à 4 semaines de données réelles. Les règles de concentration et de montée en charge sont des heuristiques à valider sur les données du compte, pas des lois.
- Ne jamais lancer, modifier ou payer une campagne à la place de l'utilisateur. Le skill calcule et recommande.

## 1. Calculer

```bash
node seo/cli.mjs <url> --secteur btp --objectif leads --budget 1500 --valeur 2500 --marge 40 --signature 20 --cpc 3.5 --volume 4000
```

- Sans `--budget`, la CLI calcule un budget de départ conseillé : le minimum viable du canal principal.
- `--cpc` (CPC réel de Keyword Planner) et `--volume` (recherches par mois, qui plafonnent les clics Search) remplacent les estimations.
- Sans site à auditer (projet, ou pour comparer des hypothèses), même calcul :

```bash
node seo/cli.mjs budget --secteur btp --objectif leads --budget 1500 --valeur 2500 --marge 40 --signature 20 --objectif-conv 20 --cpc 3.5 --volume 4000
```

  Ajouter `--json` pour récupérer verdict, CPA maximal, ROAS d'équilibre, canaux et budget nécessaire. Sans audit, le contrôle avant dépense reste à « ? » : il ne se remplit qu'avec l'audit du site.

Données : `seo/data/research/benchmarks.json`.
- Google Ads par secteur : WordStream et LocaliQ 2026, médianes américaines.
- Plateformes : fourchettes France et UE, minimums officiels, règles de budget.
- Le CPC français vaudrait environ 40 à 60 % du CPC américain. C'est un ratio d'agences, non officiel : préférer le CPC réel.

**Ce que renvoie `planBudget`** :
- `verdict` :
  - `ok` : rentable ;
  - `test` : à tester, budget plafonné ;
  - `non` : pas rentable, priorité aux leviers gratuits ;
  - `inconnu` : valeur client manquante, ou objectif de notoriété ou de trafic.
- `maxCpa` ; `assumptions` (marge et taux de signature par défaut, à annoncer s'ils sont utilisés) ;
- `channels` (budget, CPC, clics, conversions par canal, canaux sous leur minimum écartés) ;
- `totals.band` (bande de ±35 %) ; `rampUp` ; `warnings`.

**Trois scénarios** à présenter :
- bas : bas de la bande, ou le CPC le plus cher ;
- central ;
- haut : haut de la bande.

Pour chacun : conversions, CPA et marge dégagée.

## 2. Contrôle avant dépense

Noter chaque point ✓ (vérifié), ✗ (absent) ou ? (inconnu). L'interface affiche ce contrôle dans l'onglet **Budget** (https://valeriongg.github.io/rgte-redesign/seo/).

| Condition | Comment vérifier |
|---|---|
| Conversion suivie (formulaire, appel, achat) | Constat `analytics` de l'audit ; événements clés GA4 ; conversions dans Google Ads |
| Consent Mode v2 (Espace économique européen) | Constats `cmp` et `consent-mode` |
| Page de destination rapide sur mobile | PageSpeed dans l'audit (LCP) |
| Téléphone cliquable, formulaire court | Constat `tel` ; skill `conversion-site` |
| Prix et offre identiques à l'annonce | Comparer le texte de l'annonce et la page |
| UTM sur les liens hors Google Ads, numéro d'appel suivi | Paramètres des liens ; numéro de suivi ou extension d'appel |

- Un ✗ suspend le verdict « rentable » : corriger d'abord (skill `conversion-site`).
- Un ? se dit dans le livrable.

## 3. Méthode

1. **Objectif, puis canal** :
   - demande existante : Google Search ;
   - e-commerce : Performance Max ou Shopping, plus Meta ;
   - B2B : Search plus LinkedIn ;
   - notoriété : Meta, TikTok, YouTube ;
   - application : campagnes d'installation.
2. **Concentrer** (heuristique) : moins de 600 €/mois, 1 canal ; moins de 1 500 €, 2 ; moins de 4 000 €, 3. Un ensemble Meta ou TikTok sort de l'apprentissage vers 50 conversions par semaine. Sinon, optimiser sur un événement plus fréquent.
3. **Minimums** :
   - TikTok : 50 $/jour par campagne et 20 $/jour par groupe ;
   - Performance Max : au moins 3 × le CPA cible par jour ;
   - LinkedIn : 50 à 100 €/jour en pratique ;
   - Google Search : au moins 10 clics par jour.
4. **Budget nécessaire** : conversions visées × CPA estimé, en fourchette.
5. **Montée en charge** (heuristique) : +15 à 20 % au plus tous les 3 à 7 jours, sur les campagnes gagnantes. Décider au **CPA marginal** : coût supplémentaire divisé par les conversions supplémentaires entre deux paliers. Arrêter de monter quand il dépasse le CPA maximal, même si le CPA moyen reste bon.
6. **Saisonnalité** : les CPM montent en fin d'année. Avancer la notoriété et réserver le reciblage aux temps forts (skill `calendrier-marketing-fr`).
7. **Annonces Local Services** (paiement au contact) : en France, réservées à quelques métiers à domicile, à vérifier (skill `seo-local`).

## 4. SEO contre SEA

- **Payer ce qu'on a déjà gratuitement ?**
  - Croiser les termes de recherche Google Ads (export CSV) avec Search Console : `node seo/cli.mjs gsc <export.zip> --marque "<nom>"` donne la part marque / hors marque et les positions.
  - Pour un terme déjà dans le top 3 naturel, surtout la marque : tester une baisse d'enchère ou une pause de 2 à 4 semaines, puis comparer le total des clics (naturels et payants).
  - Garder la campagne de marque si des concurrents enchérissent sur le nom (Centre de transparence des annonces Google).
- **Termes payants qui convertissent sans page naturelle** : créer la page (skill `contenu-seo-redaction`), puis réduire l'enchère quand elle se classe.
- Faire le pont avec la pub pendant 3 à 6 mois, puis réallouer vers le contenu quand le naturel monte.

## 5. Lire ses résultats

- **Phase d'apprentissage** : ne pas juger ni modifier enchères et ciblage pendant 2 à 4 semaines sur Search, 1 à 2 semaines sur Meta et TikTok, environ 6 semaines sur Performance Max (benchmarks).
- **Clics** : sur Meta, lire les « clics sur un lien » ou les vues de page de destination, pas les « clics (tous) », qui comptent aussi les mentions J'aime et les ouvertures de profil.
- **Effet de ventilation** (Meta) : un placement ou un âge au CPA moyen plus élevé peut rester efficace à la marge. Ne pas couper un segment sur sa seule moyenne.
- **Conversions** : comparer les conversions de la plateforme à celles de GA4 et au CRM, c'est-à-dire aux devis réellement reçus. La vérité est celle des ventes.

## Livrer

1. **Verdict** en une phrase, et l'état du contrôle avant dépense.
2. **Tableau** canal / €/mois / €/jour / CPC / clics / conversions / CPA, pour les 3 scénarios.
3. **CPA maximal et ROAS d'équilibre**, avec les hypothèses annoncées.
4. **Plan** : semaines 1-2, semaines 3-6, mois 2-3, avec les critères d'arrêt et de montée.
5. **Ce qu'on n'a pas pu vérifier**, et la prochaine action.

## Quand ne pas l'utiliser

- La page ne transforme pas les visites : `conversion-site` d'abord.
- Être trouvé sans payer : `seo-360`, `seo-local`.
- Ce que font les concurrents en publicité : `benchmark-concurrents`.
- Règles d'une promotion, d'un prix barré ou d'un partenariat d'influence : `conformite-marketing-fr`.

## Terminé quand

- [ ] CPA maximal et ROAS d'équilibre calculés, ou « inconnu » avec la donnée manquante.
- [ ] Contrôle avant dépense noté ✓, ✗ ou ? ligne par ligne.
- [ ] Trois scénarios en fourchettes, avec les minimums des canaux respectés.
- [ ] Plan de montée en charge avec critères d'arrêt (CPA marginal).
- [ ] Point SEO contre SEA fait si la marque ou des termes du top 3 sont achetés.

## Jamais

- Annoncer un résultat garanti ou un chiffre sans fourchette.
- Déclarer « rentable » sans conversion suivie ou avec un ✗ au contrôle avant dépense.
- Inventer une marge, un panier moyen ou un taux de signature.
- Lancer, modifier ou payer une campagne à la place de l'utilisateur.

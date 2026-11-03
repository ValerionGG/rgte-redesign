---
name: budget-publicite
description: Calcule et répartit un budget publicitaire (Google Ads Search / Performance Max, Meta, TikTok, LinkedIn, YouTube, Microsoft, Pinterest, Snapchat, Amazon) selon le secteur et l'objectif — clics, conversions, CPA et ROAS estimés, budget nécessaire pour un objectif, minimums et phases d'apprentissage, plan de montée en charge, part SEO vs SEA. À utiliser pour « combien dois-je investir », « quel budget pour démarrer », « où mettre mon argent » ou un plan média.
---

# Budget publicitaire

## Calculer
```bash
node -e "import('./seo/engine/ads.js').then(m=>console.log(JSON.stringify(m.planBudget({sector:'btp',goal:'leads',monthly:1500,avgValue:2500,targetConversions:20}),null,1)))"
```
Données : `seo/data/research/benchmarks.json` (Google Ads par secteur : WordStream/LocaliQ 2026, médianes US ; plateformes : fourchettes FR/UE ; minimums officiels ; règles de budget). CPC FR ≈ 40–60 % du CPC US (ratio d'agences, non officiel).

## Méthode
1. Objectif → canal : demande existante = Google Search ; e-commerce = PMax/Shopping + Meta ; B2B = Search + LinkedIn ; notoriété = Meta/TikTok/YouTube ; app = campagnes d'installation.
2. **Concentrer** : < 600 €/mois → 1 canal ; < 1 500 → 2 ; < 4 000 → 3. Chaque ensemble Meta/TikTok vise ~50 conversions/semaine pour sortir de l'apprentissage ; sinon optimiser sur un événement plus fréquent.
3. Minimums : TikTok 50 $/j par campagne et 20 $/j par groupe ; PMax ≥ 3 × CPA cible/jour ; LinkedIn pratique 50–100 €/j ; Google Search ≥ 10 clics/jour.
4. Inverse : budget = conversions visées × CPA estimé (fourchette).
5. Montée en charge : +15–20 % max tous les 3–7 jours sur les gagnants ; décision au CPA/ROAS réel.
6. SEO en parallèle : la pub fait le pont 3–6 mois ; réallouer vers le contenu quand l'organique monte.

## Livrer
Tableau canal / €/mois / €/jour / CPC / clics / conversions / CPA, alertes, plan semaines 1–2, 3–6, mois 2–3, et prérequis de mesure (GA4, Consent Mode v2, API Conversions). Toujours présenter des **fourchettes** et dire qu'elles se recalent après 2–4 semaines de données réelles.

// Plan d'action : quick wins de la semaine, puis 30 / 60 / 90 jours, à partir des constats de l'audit.
import { CATEGORIES } from './audit.js'

export function actionPlan(result, { local = false, hasAds = false, kind = 'site' } = {}) {
  const issues = result?.issues || []
  const quick = issues.filter((i) => i.effort <= 1 && i.impact >= 3).slice(0, 10)
  const used = new Set(quick)
  const pick = (fn, n) => { const l = issues.filter((i) => !used.has(i) && fn(i)).slice(0, n); l.forEach((i) => used.add(i)); return l }
  const m1 = pick((i) => ['critique', 'important'].includes(i.sev), 12)
  const m2 = pick((i) => ['technique', 'contenu', 'performance', 'donnees'].includes(i.cat), 10)
  const m3 = pick(() => true, 10)
  const steps = [
    { id: 'semaine', title: 'Cette semaine — gains rapides', why: 'Corrections de moins d’une heure, impact fort.', items: quick.map(toItem), extra: [
      'Créer / vérifier Google Search Console et Bing Webmaster Tools, soumettre le sitemap.',
      local ? 'Revendiquer et compléter la fiche Google Business Profile (catégorie principale exacte, horaires, photos).' : 'Vérifier GA4 : conversions clés (formulaire, appel, achat) marquées comme « événements clés ».',
    ] },
    { id: 'j30', title: '30 jours — fondations', why: 'Indexation, technique et pages clés propres.', items: m1.map(toItem), extra: [
      'Lister 10–20 mots-clés cibles (onglet Mots-clés) et attribuer UNE page par intention.',
      'Réécrire titres, H1 et descriptions des 10 pages qui reçoivent le plus d’impressions (Search Console).',
      hasAds ? 'Lancer la publicité sur 1–2 canaux (onglet Budget) pour obtenir des conversions pendant que le SEO monte.' : 'Envisager un petit budget Google Search sur les mots-clés transactionnels pour démarrer vite.',
    ] },
    { id: 'j60', title: '60 jours — contenu & autorité', why: 'Ce qui fait monter durablement.', items: m2.map(toItem), extra: [
      'Publier 4–8 contenus experts (guides, comparatifs, FAQ, cas clients) répondant aux questions réelles.',
      'Obtenir 5–10 liens de sites FR thématiques/locaux (partenaires, fournisseurs, presse locale, annuaires pro).',
      'Plan social : 3–5 publications / semaine sur les 2 réseaux prioritaires, hashtags de l’onglet Hashtags.',
      local ? 'Campagne d’avis clients (QR code, SMS après prestation) : objectif +10 avis / mois, réponse à 100 %.' : 'Mettre en place des données structurées sur tous les gabarits (produit, article, FAQ).',
    ] },
    { id: 'j90', title: '90 jours — accélération & IA', why: 'Mesurer, étendre, être cité par les IA.', items: m3.map(toItem), extra: [
      'Suivre la visibilité IA : poser 10–20 questions types à ChatGPT, Perplexity, Gemini, Copilot ; noter si vous êtes cités.',
      'Consolider : fusionner les pages faibles, mettre à jour les meilleures (date + contenu), renforcer le maillage.',
      'Réallouer le budget publicitaire vers les canaux au meilleur CPA réel ; tester un nouveau format (vidéo courte).',
      kind === 'app' ? 'ASO : tester 2 variantes d’icône et de captures (Product Page Optimization / expériences Play Console).' : 'Benchmark concurrent trimestriel (onglet Concurrents) et nouvelle passe d’audit.',
    ] },
  ]
  return { steps, kpis: kpis(result, local) }
}

const toItem = (i) => ({ title: i.title, cat: CATEGORIES[i.cat]?.label || i.cat, sev: i.sev, fix: i.fix, effort: i.effort })

function kpis(result, local) {
  return [
    { kpi: 'Score de l’audit', now: result ? `${result.global}/100` : '—', target: result ? `${Math.min(100, result.global + 20)}/100 en 90 j` : '≥ 80' },
    { kpi: 'Pages indexées (Search Console)', now: 'à relever', target: '≈ 100 % des pages utiles' },
    { kpi: 'Impressions / clics Google', now: 'à relever', target: '+30 à +100 % en 6 mois (selon concurrence)' },
    { kpi: 'Core Web Vitals (mobile)', now: 'voir Vitesse', target: 'LCP ≤ 2,5 s · INP ≤ 200 ms · CLS ≤ 0,1' },
    { kpi: 'Conversions organiques / mois', now: 'à relever (GA4)', target: 'suivre la tendance mensuelle' },
    local ? { kpi: 'Avis Google', now: 'à relever', target: '+10 / mois, note ≥ 4,5' } : { kpi: 'Liens entrants (domaines référents)', now: 'à relever', target: '+5 à +10 / mois' },
    { kpi: 'Citations IA (ChatGPT, Perplexity, Gemini)', now: 'test manuel', target: 'cité sur ≥ 30 % des questions types' },
    { kpi: 'CPA publicitaire', now: '—', target: '≤ valeur d’un client × marge visée' },
  ]
}

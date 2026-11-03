// Planificateur de budget publicitaire : répartition par canal, clics/conversions/CPA estimés (fourchettes),
// budget nécessaire pour un objectif, règles d'apprentissage et plan de montée en charge.
// Sources : data/research/benchmarks.js (WordStream/LocaliQ 2026 US + estimations FR/UE). Ce sont des ordres de grandeur.
import research from '../data/research/benchmarks.js'
import { sectorById } from '../data/sectors.js'

const USD_EUR = 0.86
const FR_CPC = [0.4, 0.6] // CPC France ≈ 40–60 % du CPC US (ratio d'agences, non officiel)

const INDUSTRY = {
  restaurants: 'Restaurants & Food', industrial: 'Industrial & Commercial', apparel: 'Apparel / Fashion & Jewelry',
  shopping: 'Shopping, Collectibles & Gifts', beauty: 'Beauty & Personal Care', health: 'Physicians & Surgeons', dentists: 'Dentists & Dental Services',
  realestate: 'Real Estate', homeservices: 'Home & Home Improvement', automotive: 'Automotive — Repair, Service & Parts', legal: 'Attorneys & Legal Services',
  finance: 'Finance & Insurance', b2b: 'Business Services', education: 'Education & Instruction', travel: 'Travel', fitness: 'Health & Fitness',
  events: 'Personal Services', homegoods: 'Furniture', pets: 'Animals & Pets', arts: 'Arts & Entertainment', apps: 'All industries (median)',
  nonprofit: 'All industries (median)', average: 'All industries (median)',
}

export const CHANNELS = {
  google_search: { label: 'Google Ads — Search', short: 'Google Search' },
  google_pmax: { label: 'Google Ads — Performance Max / Shopping', short: 'Google PMax' },
  meta: { label: 'Meta Ads (Facebook + Instagram)', short: 'Meta' },
  tiktok: { label: 'TikTok Ads', short: 'TikTok' },
  linkedin: { label: 'LinkedIn Ads', short: 'LinkedIn' },
  youtube: { label: 'YouTube (Demand Gen / Vidéo)', short: 'YouTube' },
  microsoft: { label: 'Microsoft Advertising (Bing)', short: 'Microsoft' },
  pinterest: { label: 'Pinterest Ads', short: 'Pinterest' },
  snapchat: { label: 'Snapchat Ads', short: 'Snapchat' },
  amazon: { label: 'Amazon Ads (Sponsored Products)', short: 'Amazon' },
}

// Répartition de départ par objectif (puis ajustée au secteur et au budget)
const MIX = {
  leads_local: { google_search: 0.6, meta: 0.3, microsoft: 0.1 },
  leads_b2b: { google_search: 0.45, linkedin: 0.35, microsoft: 0.1, meta: 0.1 },
  ventes: { google_pmax: 0.35, google_search: 0.2, meta: 0.3, tiktok: 0.1, pinterest: 0.05 },
  notoriete: { meta: 0.35, tiktok: 0.25, youtube: 0.25, snapchat: 0.15 },
  notoriete_b2b: { linkedin: 0.5, youtube: 0.3, meta: 0.2 },
  telechargements: { google_pmax: 0.35, meta: 0.3, tiktok: 0.25, snapchat: 0.1 },
  trafic: { meta: 0.35, google_search: 0.3, tiktok: 0.2, pinterest: 0.15 },
}
export const GOALS = {
  leads: 'Demandes de devis / appels / prises de RDV', ventes: 'Ventes en ligne', notoriete: 'Notoriété / visibilité',
  telechargements: 'Téléchargements d’application', trafic: 'Trafic vers le site / contenus',
}
const VISUAL = new Set(['ecommerce-mode', 'maison-deco', 'luxe', 'evenementiel', 'boulangerie', 'restaurant', 'tourisme', 'beaute'])

export function industryBenchmark(sid) {
  const sector = sectorById(sid)
  const rows = research.google_ads_by_industry || []
  const avg = rows.find((r) => /All industries/.test(r.industry_en)) || { ctr: 0.0664, cpc_usd: 5.42, cvr: 0.0818, cpl_usd: 66.69 }
  const row = rows.find((r) => r.industry_en === INDUSTRY[sector.ads]) || avg
  const v = (k) => row[k] ?? avg[k]
  return {
    industry: row.industry_fr, ctr: v('ctr'), cvr: v('cvr'), cpcUS: v('cpc_usd'), cplUS: v('cpl_usd'),
    cpcFR: [v('cpc_usd') * USD_EUR * FR_CPC[0], v('cpc_usd') * USD_EUR * FR_CPC[1]],
    cplFR: [v('cpl_usd') * USD_EUR * 0.45, v('cpl_usd') * USD_EUR * 0.65],
    filled: Object.keys(row).filter((k) => row[k] == null), note: row.note || '',
  }
}

const platform = (id) => (research.platforms || []).find((p) => p.id === id) || {}

export function planBudget({ sector: sid = 'autre', goal = 'leads', monthly = 1000, b2b, local, avgValue = 0, targetConversions = 0, closeRate } = {}) {
  const sector = sectorById(sid)
  // Un lead n'est pas un client : on applique un taux de transformation commercial (25 % par défaut)
  const close = goal === 'leads' ? (closeRate ?? 0.25) : 1
  avgValue = (avgValue || 0) * close
  b2b ??= sector.b2b; local ??= sector.local
  let key = goal === 'leads' ? (b2b ? 'leads_b2b' : 'leads_local') : goal === 'notoriete' && b2b ? 'notoriete_b2b' : goal
  const mix = { ...(MIX[key] || MIX.leads_local) }
  if (sid === 'ecommerce' || sid === 'ecommerce-mode') mix.amazon = goal === 'ventes' ? 0.05 : 0
  if (!VISUAL.has(sid)) { if (mix.pinterest) { mix.meta = (mix.meta || 0) + mix.pinterest; delete mix.pinterest } }
  if (b2b && mix.tiktok && goal !== 'notoriete') { mix.linkedin = (mix.linkedin || 0) + mix.tiktok; delete mix.tiktok }
  // Plus le budget est petit, moins il faut de canaux : chaque canal doit sortir de sa phase d'apprentissage.
  const maxCh = monthly < 600 ? 1 : monthly < 1500 ? 2 : monthly < 4000 ? 3 : monthly < 10000 ? 4 : 6
  const ordered = Object.entries(mix).filter(([, w]) => w > 0).sort((a, b) => b[1] - a[1]).slice(0, maxCh)
  const tot = ordered.reduce((s, [, w]) => s + w, 0)
  const bench = industryBenchmark(sid)
  const channels = ordered.map(([id, w]) => estimate(id, Math.round((monthly * w) / tot), bench, goal, avgValue))
  const sum = (k, i) => channels.reduce((s, c) => s + (c[k]?.[i] || 0), 0)
  const conv = [sum('conversions', 0), sum('conversions', 1)]
  const cpa = conv[1] ? [monthly / conv[1], conv[0] ? monthly / conv[0] : null] : [null, null]
  const out = {
    sector: sector.label, goal, goalLabel: GOALS[goal], monthly, daily: Math.round(monthly / 30.4), b2b, local, bench, channels,
    close, totals: { clicks: [sum('clicks', 0), sum('clicks', 1)], conversions: conv, mid: Math.round(Math.sqrt(conv[0] * conv[1])), cpa, cpaMid: conv[0] * conv[1] ? monthly / Math.sqrt(conv[0] * conv[1]) : null, revenue: avgValue ? [conv[0] * avgValue, conv[1] * avgValue] : null, roas: avgValue ? [conv[0] * avgValue / monthly, conv[1] * avgValue / monthly] : null },
    dropped: Object.keys(mix).filter((id) => !ordered.some(([x]) => x === id) && mix[id] > 0).map((id) => CHANNELS[id]?.short || id),
    warnings: [], rampUp: rampUp(monthly, channels), seo: seoBudget(monthly, sector, local),
  }
  if (targetConversions && cpa[0]) out.needed = { target: targetConversions, budget: [Math.round(targetConversions * cpa[0]), Math.round(targetConversions * (cpa[1] || cpa[0] * 2))], mid: out.totals.cpaMid ? Math.round(targetConversions * out.totals.cpaMid) : null }
  for (const c of channels) out.warnings.push(...c.warnings)
  if (monthly < 300) out.warnings.unshift('Budget < 300 €/mois : concentrez tout sur Google Search (mots-clés transactionnels + locaux exacts) ou sur un seul ensemble Meta, et misez d’abord sur le SEO local et la fiche Google, gratuits.')
  return out
}

function estimate(id, budget, bench, goal, avgValue) {
  const p = platform(id === 'meta' ? 'meta' : id)
  const warnings = []
  let cpc = p.cpc_eur?.[0] != null ? [...p.cpc_eur] : [0.5, 2]
  let cvr = p.cvr?.[0] != null ? [...p.cvr] : [0.01, 0.04]
  if (id === 'google_search') { cpc = bench.cpcFR; cvr = [bench.cvr * 0.6, bench.cvr * 1.1] }
  if (id === 'microsoft') cpc = [bench.cpcFR[0] * 0.6, bench.cpcFR[1] * 0.75]
  if (goal === 'notoriete') cvr = [0, 0]
  // fourchette prudente : CPC haut × CVR bas → pessimiste ; CPC bas × CVR haut → optimiste
  const clicks = [Math.round(budget / cpc[1]), Math.round(budget / cpc[0])]
  const conversions = [Math.round(clicks[0] * cvr[0] * 10) / 10, Math.round(clicks[1] * cvr[1] * 10) / 10]
  const cpm = p.cpm_eur?.[0] != null ? p.cpm_eur : null
  const impressions = cpm ? [Math.round((budget / cpm[1]) * 1000), Math.round((budget / cpm[0]) * 1000)] : null
  const daily = budget / 30.4
  const weeklyConv = conversions.map((c) => c / 4.35)
  if (['meta', 'tiktok', 'snapchat'].includes(id) && goal !== 'notoriete' && weeklyConv[1] < 50) warnings.push(`${CHANNELS[id].short} : ~${Math.round(weeklyConv[0])}–${Math.round(weeklyConv[1])} conversions/semaine, sous les ~50 nécessaires pour sortir de l’apprentissage. Optimisez sur un événement plus fréquent (vue de page clé, ajout au panier, clic WhatsApp) ou un seul ensemble de publicités.`)
  if (id === 'tiktok' && daily < 50 * USD_EUR) warnings.push(`TikTok : minimum officiel ≈ 50 $/jour par campagne et 20 $/jour par groupe d’annonces — budget actuel ≈ ${Math.round(daily)} €/jour.`)
  if (id === 'linkedin' && daily < 50) warnings.push(`LinkedIn : ${Math.round(daily)} €/jour, c’est peu (CPC 4–9 €). Pratique B2B : 50–100 €/jour, ou ciblez des listes de comptes (ABM) très précises.`)
  if (id === 'google_pmax' && daily < 30) warnings.push(`Performance Max : Google recommande un budget quotidien ≥ 3 × CPA cible (pratique PME : 30–50 €/jour) — actuel ≈ ${Math.round(daily)} €/jour.`)
  if (id === 'google_search' && daily < cpc[1] * 10) warnings.push(`Google Search : ${Math.round(daily)} €/jour ≈ moins de 10 clics/jour au CPC haut (${cpc[1].toFixed(2)} €). Limitez-vous aux mots-clés exacts à forte intention et à votre zone.`)
  return {
    id, label: CHANNELS[id]?.label || id, budget, daily: Math.round(daily), cpc, cvr, cpm, clicks, impressions, conversions,
    cpa: conversions[1] ? [budget / conversions[1], conversions[0] ? budget / conversions[0] : null] : [null, null],
    roas: avgValue && conversions[1] ? [conversions[0] * avgValue / budget, conversions[1] * avgValue / budget] : null,
    learning: p.learning_phase || '', minimum: p.min_daily_budget || '', bestFor: p.best_for || '', notes: p.notes || '', warnings,
  }
}

function rampUp(monthly, channels) {
  return [
    { phase: 'Semaines 1–2 — Lancement & apprentissage', actions: [
      'Suivi des conversions vérifié (GA4 + balises Google Ads / Meta / TikTok, Consent Mode v2, API Conversions Meta).',
      `Démarrez à ~70 % du budget (${Math.round(monthly * 0.7)} €/mois) ; gardez 10–20 % pour tester de nouvelles audiences et créations.`,
      '3–5 créations par ensemble (vidéo verticale, carrousel, image), 2–3 accroches différentes.',
      'Ne touchez à rien pendant 7 jours (apprentissage) sauf erreur flagrante.',
    ] },
    { phase: 'Semaines 3–6 — Optimisation', actions: [
      'Coupez les annonces / mots-clés au CPA > 2× la cible après ≥ 50–100 clics.',
      'Ajoutez les termes de recherche négatifs chaque semaine (Google).',
      'Augmentez le budget des gagnants de 15–20 % maximum tous les 3–7 jours (au-delà, l’algorithme réapprend).',
      'Renouvelez les créations dès que la fréquence dépasse ~3 (Meta) ou que le CTR baisse de 30 %.',
    ] },
    { phase: 'Mois 2–3 — Montée en charge', actions: [
      'Passez aux enchères automatiques (CPA / ROAS cible) une fois 30+ conversions / mois par campagne.',
      `Montez vers ${Math.round(monthly * 1.3)}–${Math.round(monthly * 1.6)} €/mois si le CPA reste dans la cible.`,
      'Lancez le remarketing (visiteurs 30 jours, vidéos vues à 50 %), puis les audiences similaires.',
      channels.length < 2 ? 'Ajoutez un 2e canal seulement quand le 1er est rentable et stable.' : 'Comparez les canaux au CPA réel (et non au CPC) et réallouez chaque mois.',
    ] },
  ]
}

function seoBudget(monthly, sector, local) {
  return {
    note: 'Le SEO prend 3 à 6 mois avant d’effets nets ; la publicité « fait le pont » et révèle les mots-clés qui convertissent.',
    split: local ? 'PME locale : 50–60 % Google Search/Maps, 15–25 % SEO local (fiche Google, avis, pages services), 15–25 % Meta.' : sector.b2b ? 'B2B : 40–50 % contenu & SEO, 30–40 % Search + LinkedIn, 10–20 % remarketing.' : 'E-commerce / B2C : 50–60 % Shopping/PMax + Meta, 25–35 % SEO & contenu, 10 % tests (TikTok, Pinterest).',
    items: [
      { item: 'Corrections techniques (audit ci-dessus)', cost: 'souvent 0 € en interne, sinon 500–3 000 € une fois' },
      { item: 'Contenu : 2 à 4 pages / articles par mois', cost: '150–500 € par contenu expert (rédacteur spécialisé FR)' },
      { item: 'Fiche Google + avis clients', cost: '0 € — 1 h/semaine' },
      { item: 'Netlinking (liens de sites thématiques FR)', cost: '80–400 € par lien de qualité, 2–5 / mois si concurrence forte' },
      { item: 'Outils', cost: 'Search Console + Bing Webmaster (0 €) ; suite SEO 30–140 €/mois si besoin' },
    ],
    rules: research.budget_rules || [],
  }
}

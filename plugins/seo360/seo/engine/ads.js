// Budget publicitaire : verdict de rentabilité, minimum pour tester, répartition par canal (minimum viable
// respecté), estimation centrale ±35 %, plafond de demande, apprentissage, montée en charge.
// Sources : data/research/benchmarks.js (WordStream/LocaliQ 2026 US + fourchettes FR/UE). Ordres de grandeur.
import research from '../data/research/benchmarks.js'
import { sectorById } from '../data/sectors.js'

const USD_EUR = 0.86
const FR_CPC = [0.4, 0.6] // CPC France ≈ 40–60 % du CPC US (ratio d'agences, non officiel)
const BAND = 0.35 // fourchette affichée autour de l'estimation centrale

const INDUSTRY = {
  restaurants: 'Restaurants & Food', industrial: 'Industrial & Commercial', apparel: 'Apparel / Fashion & Jewelry',
  shopping: 'Shopping, Collectibles & Gifts', beauty: 'Beauty & Personal Care', health: 'Physicians & Surgeons', dentists: 'Dentists & Dental Services',
  realestate: 'Real Estate', homeservices: 'Home & Home Improvement', automotive: 'Automotive — Repair, Service & Parts', legal: 'Attorneys & Legal Services',
  finance: 'Finance & Insurance', b2b: 'Business Services', education: 'Education & Instruction', travel: 'Travel', fitness: 'Health & Fitness',
  events: 'Personal Services', homegoods: 'Furniture', pets: 'Animals & Pets', arts: 'Arts & Entertainment', apps: 'All industries (median)',
  nonprofit: 'All industries (median)', average: 'All industries (median)',
}

export const CHANNELS = {
  google_search: { label: 'Google Ads — Search', short: 'Google Search', min: (c) => Math.max(150, 10 * c.cpc[1] * 30.4) },
  google_pmax: { label: 'Google Ads — Performance Max / Shopping', short: 'Google PMax', min: () => 900 },
  google_app: { label: 'Google Ads — campagnes App', short: 'Google App', min: () => 900, noData: 'Pas de repère de coût par installation sourcé : démarrez à 30 €/jour et mesurez le coût réel dès la 1re semaine.' },
  apple_ads: { label: 'Apple Ads (App Store)', short: 'Apple Ads', min: () => 300, noData: 'Pas de repère sourcé : démarrez sur votre marque et 5 à 10 mots-clés, 10–20 €/jour.' },
  meta: { label: 'Meta Ads (Facebook + Instagram)', short: 'Meta', min: (c, goal) => (['notoriete', 'trafic'].includes(goal) ? 300 : 600) },
  tiktok: { label: 'TikTok Ads', short: 'TikTok', min: () => Math.round(50 * USD_EUR * 30.4) },
  linkedin: { label: 'LinkedIn Ads', short: 'LinkedIn', min: () => 1500 },
  youtube: { label: 'YouTube (Demand Gen / Vidéo)', short: 'YouTube', min: () => 450 },
  microsoft: { label: 'Microsoft Advertising (Bing)', short: 'Microsoft', min: () => 150 },
  pinterest: { label: 'Pinterest Ads', short: 'Pinterest', min: () => 300 },
  snapchat: { label: 'Snapchat Ads', short: 'Snapchat', min: () => 450 },
  amazon: { label: 'Amazon Ads (Sponsored Products)', short: 'Amazon', min: () => 300 },
}

const MIX = {
  leads_local: { google_search: 0.6, meta: 0.3, microsoft: 0.1 },
  leads_b2b: { google_search: 0.45, linkedin: 0.35, microsoft: 0.1, meta: 0.1 },
  ventes: { google_pmax: 0.35, google_search: 0.2, meta: 0.3, tiktok: 0.1, pinterest: 0.05 },
  notoriete: { meta: 0.35, tiktok: 0.25, youtube: 0.25, snapchat: 0.15 },
  notoriete_b2b: { linkedin: 0.5, youtube: 0.3, meta: 0.2 },
  telechargements: { google_app: 0.4, meta: 0.25, tiktok: 0.2, apple_ads: 0.15 },
  trafic: { meta: 0.35, google_search: 0.3, tiktok: 0.2, pinterest: 0.15 },
}
export const GOALS = {
  leads: 'Demandes de devis / appels / rendez-vous', ventes: 'Ventes en ligne', notoriete: 'Notoriété / visibilité',
  telechargements: 'Téléchargements d’application', trafic: 'Visites sur le site / les contenus',
}
const UNIT = { leads: 'contact', ventes: 'vente', telechargements: 'installation', trafic: 'visite', notoriete: 'visite' }
const VISUAL = new Set(['ecommerce-mode', 'maison-deco', 'luxe', 'evenementiel', 'boulangerie', 'restaurant', 'tourisme', 'beaute'])
const gm = (a, b) => Math.sqrt(a * b)

export function industryBenchmark(sid) {
  const sector = sectorById(sid)
  const rows = research.google_ads_by_industry || []
  const avg = rows.find((r) => /All industries/.test(r.industry_en)) || { ctr: 0.0664, cpc_usd: 5.42, cvr: 0.0818, cpl_usd: 66.69 }
  const row = rows.find((r) => r.industry_en === INDUSTRY[sector.ads]) || avg
  const v = (k) => row[k] ?? avg[k]
  return {
    industry: row.industry_fr, ctr: v('ctr'), cvr: v('cvr'), cpcUS: v('cpc_usd'), cplUS: v('cpl_usd'),
    cpcFR: [v('cpc_usd') * USD_EUR * FR_CPC[0], v('cpc_usd') * USD_EUR * FR_CPC[1]], filled: Object.keys(row).filter((k) => row[k] == null),
  }
}
const platform = (id) => (research.platforms || []).find((p) => p.id === id) || {}

function ranges(id, bench, goal) {
  const p = platform(id)
  let cpc = p.cpc_eur?.[0] != null ? [...p.cpc_eur] : [0.5, 2]
  let cvr = p.cvr?.[0] != null ? [...p.cvr] : [0.01, 0.04]
  if (id === 'google_search') { cpc = bench.cpcFR; cvr = [bench.cvr * 0.6, bench.cvr * 1.1] }
  // Achats en ligne sur Meta : la fourchette générale (2 à 9 %) mesure surtout des contacts. Médiane achats e-commerce ≈ 1,5 %
  // (données Triple Whale août 2025-juillet 2026, citées par des sources secondaires).
  if (id === 'meta' && goal === 'ventes') cvr = [0.01, 0.025]
  if (id === 'microsoft') cpc = [bench.cpcFR[0] * 0.6, bench.cpcFR[1] * 0.75]
  if (goal === 'trafic') cvr = [1, 1]
  return { cpc, cvr, cpm: p.cpm_eur?.[0] != null ? p.cpm_eur : null, p }
}

export function planBudget({ sector: sid = 'autre', goal = 'leads', monthly = null, b2b, local, avgValue = 0, margin = null, closeRate = null, targetConversions = 0, searchVolume = 0, cpcOverride = 0 } = {}) {
  const sector = sectorById(sid)
  b2b ??= sector.b2b; local ??= sector.local
  const unit = UNIT[goal] || 'conversion'
  const assumptions = {
    margin: margin ?? (goal === 'ventes' ? 0.3 : goal === 'telechargements' ? 1 : b2b ? 0.4 : 0.5),
    closeRate: goal === 'leads' ? closeRate ?? (b2b ? 0.1 : 0.25) : 1,
    // Valeurs supposées (non saisies) : affichées à côté du verdict, et jamais de « Rentable » franc sur une marge supposée.
    defaults: [margin == null && goal !== 'telechargements' ? 'margin' : null, goal === 'leads' && closeRate == null ? 'closeRate' : null].filter(Boolean),
  }
  const maxCpa = avgValue > 0 && ['leads', 'ventes', 'telechargements'].includes(goal) ? avgValue * assumptions.margin * assumptions.closeRate : null
  const key = goal === 'leads' ? (b2b ? 'leads_b2b' : 'leads_local') : goal === 'notoriete' && b2b ? 'notoriete_b2b' : goal
  const mix = { ...(MIX[key] || MIX.leads_local) }
  if ((sid === 'ecommerce' || sid === 'ecommerce-mode') && goal === 'ventes') mix.amazon = 0.05
  if (!VISUAL.has(sid) && mix.pinterest) { mix.meta = (mix.meta || 0) + mix.pinterest; delete mix.pinterest }
  if (b2b && mix.tiktok && goal !== 'notoriete') { mix.linkedin = (mix.linkedin || 0) + mix.tiktok; delete mix.tiktok }
  const bench = industryBenchmark(sid)
  if (cpcOverride > 0) bench.cpcFR = [cpcOverride * 0.8, cpcOverride * 1.2]
  const info = Object.fromEntries(Object.keys(mix).map((id) => [id, ranges(id, bench, goal)]))
  const minOf = (id) => Math.round(CHANNELS[id].min(info[id], goal) / 10) * 10

  // Budget conseillé si non renseigné : minimum viable du canal principal (+ le 2e pour la vente en ligne)
  const ordered = Object.entries(mix).sort((a, b) => b[1] - a[1]).map(([id]) => id)
  const recommended = Math.ceil((minOf(ordered[0]) + (goal === 'ventes' && ordered[1] ? minOf(ordered[1]) : 0)) / 50) * 50
  const recommendedUsed = monthly == null || monthly === '' || !(+monthly > 0)
  monthly = recommendedUsed ? recommended : +monthly

  // Répartition : le canal principal reçoit au moins son minimum viable (sinon une répartition proportionnelle
  // pouvait l'écarter, par exemple PMax en e-commerce) ; les autres se partagent le reste selon le mix, et
  // ceux qui n'atteignent pas leur minimum sont retirés (le moins prioritaire d'abord) : un petit budget reste concentré.
  const allocate = (act) => {
    const [top, ...others] = act
    const totO = others.reduce((s, id) => s + mix[id], 0)
    let topB = (monthly * mix[top]) / (totO + mix[top])
    if (topB < minOf(top)) topB = Math.min(monthly, minOf(top))
    return Object.fromEntries([[top, topB], ...others.map((id) => [id, totO ? ((monthly - topB) * mix[id]) / totO : 0])])
  }
  let active = ordered.slice()
  for (;;) {
    const alloc = allocate(active)
    const under = active.slice(1).filter((id) => alloc[id] < minOf(id))
    if (!under.length) break
    active = active.filter((id) => id !== under.sort((x, y) => mix[x] - mix[y])[0])
  }
  const alloc = allocate(active)
  let rest = monthly
  const channels = active.map((id, i) => {
    const budget = i === active.length - 1 ? rest : Math.round(alloc[id])
    rest -= budget
    return estimate(id, budget, info[id], goal, unit, bench, searchVolume, minOf(id))
  })
  const est = channels.filter((c) => c.mid)
  const clicksMid = est.reduce((s, c) => s + c.mid.clicks, 0)
  const mid = goal === 'notoriete' ? null : Math.round(est.reduce((s, c) => s + c.mid.conv, 0))
  const spendEst = est.reduce((s, c) => s + c.budget, 0)
  const cpaMid = mid ? spendEst / mid : null
  const totals = { clicksMid: Math.round(clicksMid), mid, band: mid != null ? [Math.round(mid * (1 - BAND)), Math.round(mid * (1 + BAND))] : null, cpaMid, impressions: Math.round(est.reduce((s, c) => s + (c.mid.impressions || 0), 0)) }
  const out = {
    sector: sector.label, goal, goalLabel: GOALS[goal], unit, monthly, daily: Math.round(monthly / 30.4), recommended, recommendedUsed, b2b, local, bench, channels,
    assumptions, maxCpa, totals, roasBreakEven: goal === 'ventes' && assumptions.margin > 0 ? 1 / assumptions.margin : null, cpcSource: cpcOverride > 0 ? `CPC Google : votre valeur (${cpcOverride} €).` : 'CPC Google : estimé d’après des médianes américaines ajustées pour la France ; saisissez votre CPC réel (Keyword Planner) pour un calcul fiable.', dropped: ordered.filter((id) => !active.includes(id)).map((id) => CHANNELS[id].short),
    warnings: channels.flatMap((c) => c.warnings), rampUp: rampUp(monthly, channels), seo: seoBudget(sector, local),
  }
  // Garde-fou : un ROAS implicite très au-dessus des médianes observées signale des hypothèses trop optimistes.
  const roasImplied = goal === 'ventes' && avgValue > 0 && cpaMid ? avgValue / cpaMid : null
  if (roasImplied > 4) out.warnings.push(`ROAS implicite de ${roasImplied.toFixed(1).replace('.', ',')} : bien au-dessus des médianes observées (≈ 1,9 sur Meta en 2025, données Triple Whale citées par des sources secondaires). Prévoyez moins de ventes au départ.`)
  out.verdict = verdict(out)
  if (targetConversions > 0 && cpaMid) {
    const need = targetConversions * cpaMid
    const cap = channels.find((c) => c.capClicks)
    out.needed = { target: targetConversions, mid: Math.round(need), band: [Math.round(need * (1 - BAND)), Math.round(need * (1 + BAND))], capped: cap ? `Attention : vos mots-clés ne génèrent qu’environ ${Math.round(cap.capClicks)} clics possibles par mois sur Google Search ; au-delà, il faut d’autres canaux ou d’autres mots-clés.` : '' }
  }
  if (monthly < 300) out.warnings.unshift('Moins de 300 €/mois : concentrez tout sur Google Search (mots-clés à forte intention, dans votre zone) et misez d’abord sur la fiche Google et le SEO, gratuits.')
  return out
}

function estimate(id, budget, { cpc, cvr, cpm, p }, goal, unit, bench, searchVolume, min) {
  const ch = CHANNELS[id], warnings = []
  const daily = budget / 30.4
  let mid = null
  if (!ch.noData) {
    const cpcMid = gm(cpc[0], cpc[1]), cvrMid = gm(cvr[0], cvr[1])
    let clicks = budget / cpcMid
    let capClicks = null
    if (id === 'google_search' && searchVolume > 0) {
      capClicks = searchVolume * (bench.ctr || 0.06)
      if (clicks > capClicks) { warnings.push(`Google Search : au-delà de ≈ ${Math.round(capClicks * cpcMid)} €/mois, il n’y a plus assez de recherches sur vos mots-clés (${Math.round(searchVolume)} / mois). Réallouez le surplus ou élargissez les mots-clés.`); clicks = capClicks }
    }
    const conv = goal === 'notoriete' ? 0 : clicks * cvrMid
    mid = { clicks: Math.round(clicks), conv: Math.round(conv * 10) / 10, cpa: conv ? budget / conv : null, impressions: cpm ? (budget / gm(cpm[0], cpm[1])) * 1000 : null }
    if (capClicks) mid.capped = true
    const weekly = conv / 4.35
    if (['meta', 'tiktok', 'snapchat'].includes(id) && !['notoriete', 'trafic'].includes(goal) && weekly < 50) warnings.push(`${ch.short} : ≈ ${Math.round(weekly)} ${unit}s/semaine, sous les ~50 nécessaires pour sortir de l’apprentissage. Optimisez sur un événement plus fréquent (vue de la page devis, clic sur le téléphone, ajout au panier) avec un seul ensemble de publicités.`)
    if (id === 'google_search' && daily < cpc[1] * 10) warnings.push(`Google Search : ${Math.round(daily)} €/jour, c’est moins de 10 clics par jour au coût haut (${cpc[1].toFixed(2)} €). Limitez-vous aux mots-clés exacts à forte intention et à votre zone.`)
    return { id, label: ch.label, budget, daily: Math.round(daily), min, cpc, cvr, cpm, mid, capClicks, learning: p.learning_phase || '', minimum: p.min_daily_budget || '', bestFor: p.best_for || '', warnings }
  }
  return { id, label: ch.label, budget, daily: Math.round(daily), min, cpc: null, cvr: null, cpm: null, mid: null, noEstimate: ch.noData, learning: '', minimum: `Minimum pratique ≈ ${min} €/mois.`, bestFor: id === 'apple_ads' ? 'Utilisateurs iPhone qui cherchent dans l’App Store : intention forte.' : 'Installations Android et iOS sur Search, Play, YouTube et Display.', warnings }
}

// Contrôle avant dépense : chaque point vaut ✓ (vérifié), ✗ (manquant) ou ? (à vérifier vous-même).
// Un ✗ suspend le verdict « rentable » : sans mesure fiable ni page qui convertit, la pub ne peut pas être jugée.
export function preSpendChecks(report, budget = report?.budget) {
  const m = report?.result?.meta || {}, psi = report?.ctx?.psi && !report.ctx.psi.error ? report.ctx.psi : null
  const site = report?.kind === 'site' && !!report?.ctx?.page, tr = m.trackers || [], cmp = m.cmp || []
  const goal = budget?.goal || report?.input?.goal
  const conv = tr.includes('Google Ads') ? '✓' : !site ? '?' : tr.some((t) => /Analytics|Tag Manager|Matomo|Piano/.test(t)) ? '?' : '✗'
  // GTM seul : le bandeau et le Consent Mode peuvent être réglés dans GTM, invisibles dans le code de la page → « ? », pas « ✗ ».
  const gtmOnly = tr.includes('Google Tag Manager') && !tr.some((t) => t !== 'Google Tag Manager' && /Ads|Pixel|Analytics|Insight|UET|Tag/.test(t))
  const consent = !site ? '?' : cmp.includes('Consent Mode Google') ? '✓' : cmp.length || gtmOnly ? '?' : tr.some((t) => /Ads|Pixel|Analytics|Insight|UET|Tag/.test(t)) ? '✗' : '?'
  const perf = psi?.scores?.performance, lcp = psi?.field?.LCP
  const mobile = perf == null && !lcp ? '?' : (perf == null || perf >= 50) && !(lcp > 4000) ? '✓' : '✗'
  const contact = !site || goal === 'ventes' || goal === 'telechargements' ? '?' : m.telLink || m.forms > 0 ? '✓' : '✗'
  const checks = [
    { id: 'conversion', label: 'Conversion suivie', short: 'la mesure des conversions', status: conv, detail: conv === '✓' ? 'Balise Google Ads détectée : vérifiez que l’action de conversion (appel, formulaire, achat) est « principale ».' : conv === '?' ? 'Déclarez vos contacts ou achats comme événements clés dans GA4 et importez-les dans Google Ads (ou ajoutez la balise de conversion).' : 'Aucune mesure détectée : sans conversion suivie, l’algorithme optimise à l’aveugle et vous ne saurez pas ce que rapporte la pub.' },
    { id: 'consent', label: 'Consent Mode v2', short: 'le Consent Mode v2', status: consent, detail: consent === '✓' ? 'Consent Mode détecté.' : consent === '✗' ? 'Traceurs sans gestion du consentement : obligatoire (CNIL) et indispensable pour que Google Ads modélise les conversions.' : gtmOnly ? 'Google Tag Manager détecté : le bandeau cookies et le Consent Mode v2 peuvent y être réglés, invisibles dans le code de la page. Vérifiez dans GTM (mode Aperçu) ou avec Tag Assistant que le consentement par défaut est « refusé » avant le choix du visiteur.' : 'Vérifiez dans votre bandeau cookies que le Consent Mode v2 de Google est activé.' },
    { id: 'mobile', label: 'Vitesse mobile', short: 'la vitesse sur mobile', status: mobile, detail: mobile === '?' ? 'Vitesse non mesurée : lancez l’audit avec PageSpeed.' : mobile === '✓' ? `Score mobile ${perf ?? '—'}${lcp ? `, LCP réel ${(lcp / 1000).toFixed(1).replace('.', ',')} s` : ''}.` : `Page lente sur mobile (score ${perf ?? '—'}${lcp ? `, LCP ${(lcp / 1000).toFixed(1).replace('.', ',')} s` : ''}) : chaque clic payé risque d’être perdu avant l’affichage.` },
    { id: 'contact', label: 'Téléphone et formulaire', short: 'le téléphone cliquable ou le formulaire', status: contact, detail: contact === '✓' ? `${m.telLink ? 'Téléphone cliquable' : ''}${m.telLink && m.forms ? ' et ' : ''}${m.forms ? 'formulaire' : ''} détecté(s) sur la page.` : contact === '✗' ? 'Ni téléphone cliquable ni formulaire sur la page : ajoutez un lien « tel: » et un formulaire court avant d’acheter des clics.' : goal === 'ventes' ? 'Testez un achat complet sur mobile (fiche produit → panier → paiement).' : 'À vérifier sur la page de destination de vos annonces.' },
    { id: 'prix', label: 'Prix identiques à l’annonce', status: '?', detail: 'À vérifier vous-même : même offre, même prix, même promesse dans l’annonce et sur la page (sinon clics perdus, et risque de pratique trompeuse).' },
    { id: 'suivi', label: 'UTM et numéro suivi', status: '?', detail: 'Ajoutez des paramètres UTM aux liens des réseaux et un suivi des appels (extension d’appel Google ou numéro dédié) pour savoir quel canal rapporte.' },
  ]
  const missing = checks.filter((c) => c.status === '✗')
  return {
    checks, blocked: missing.length > 0,
    message: missing.length ? `Verdict suspendu : corrigez d’abord ${missing.map((c) => c.short || c.label).join(', ').replace(/, ([^,]*)$/, ' et $1')}.` : !site ? 'Rien n’a pu être vérifié sans lire votre site : lancez d’abord l’audit de votre page, puis revenez au budget.' : checks.some((c) => c.status === '?') ? `Rien de bloquant parmi les points vérifiés ; ${checks.filter((c) => c.status === '?').length} point(s) « ? » restent à vérifier avant de lancer.` : 'Tout est prêt pour mesurer la rentabilité.',
  }
}

function verdict(b) {
  const u = b.unit, euro = (n) => `${Math.round(n).toLocaleString('fr-FR')} €`
  const base = b.totals.mid ? `≈ ${b.totals.mid} ${u}s par mois à ≈ ${euro(b.totals.cpaMid)} chacun` : ''
  if (b.goal === 'notoriete') return { level: 'inconnu', text: `Objectif notoriété : ≈ ${b.totals.impressions.toLocaleString('fr-FR')} affichages par mois pour ${euro(b.monthly)}.`, detail: 'Jugez au coût pour 1 000 vues et à la hausse des recherches de votre marque (Search Console), pas aux ventes immédiates.' }
  if (!b.totals.mid) return { level: 'inconnu', text: 'Pas d’estimation chiffrée possible pour ces canaux : mesurez le coût réel dès la première semaine.', detail: '' }
  if (b.goal === 'trafic') return { level: 'inconnu', text: `${base.replace(/chacun$/, 'la visite')}.`, detail: 'Pour juger la rentabilité, suivez les contacts ou ventes générés par ces visites (GA4).' }
  if (!b.maxCpa) return { level: 'inconnu', text: `${b.recommendedUsed ? `Minimum pour tester : ${euro(b.monthly)} par mois (ce n’est pas un budget rentable calculé). ` : ''}${base[0].toUpperCase() + base.slice(1)}.`, detail: `Indiquez la valeur d’un client (et votre marge) pour savoir si c’est rentable.` }
  const r = b.totals.cpaMid / b.maxCpa
  const start = b.recommendedUsed ? `Minimum pour tester : ${euro(b.monthly)} par mois. ` : ''
  const pct = (x) => `${Math.round(x * 100)} %`
  const hyp = b.assumptions.defaults?.length ? ` Hypothèses par défaut, à remplacer par vos chiffres : ${[b.assumptions.defaults.includes('margin') ? `marge de ${pct(b.assumptions.margin)}` : '', b.assumptions.defaults.includes('closeRate') ? `${pct(b.assumptions.closeRate)} des contacts deviennent clients` : ''].filter(Boolean).join(', ')}.` : ''
  if (r <= 0.8 && b.assumptions.defaults?.includes('margin')) return { level: 'test', text: `${start}Probablement rentable, à confirmer : ${base}, pour ≈ ${euro(b.maxCpa)} de marge par ${u}.${hyp}`, detail: `Indiquez votre vraie marge pour un verdict ferme. En attendant, test de 6 semaines plafonné à ${euro(b.monthly * 1.5)}.` }
  if (r <= 0.8) return { level: 'ok', text: `${start}Rentable : ${base}, pour ≈ ${euro(b.maxCpa)} de marge par ${u}.${hyp}`, detail: `Augmentez par paliers de 15–20 % tant que le coût réel reste sous ${euro(b.maxCpa)} par ${u}.` }
  if (r <= 1.25) return { level: 'test', text: `${start}À tester prudemment : ${base}, pour ≈ ${euro(b.maxCpa)} de marge par ${u}.${hyp}`, detail: `Test de 6 semaines plafonné à ${euro(b.monthly * 1.5)} ; arrêtez un canal si son coût dépasse ${euro(b.maxCpa)} par ${u} après 50 clics.` }
  const why = { leads: b.local ? 'Priorité au gratuit : fiche Google, avis, SEO local et conversion du site (appel en un clic, devis simple). Ou ciblez des prestations de plus forte valeur.' : 'Priorité au SEO et au contenu ; resserrez les mots-clés sur les demandes les plus qualifiées ou ciblez des contrats de plus forte valeur.', ventes: 'Travaillez d’abord le panier moyen, le taux de conversion du site et le SEO ; testez ensuite de petits budgets sur vos meilleurs produits.', telechargements: 'Priorité à l’ASO (titre, captures, avis) et au bouche-à-oreille ; augmentez la valeur par utilisateur (abonnement, achats intégrés) avant d’acheter des installations.' }
  return { level: 'non', text: `Pas rentable aujourd’hui : ≈ ${euro(b.totals.cpaMid)} par ${u} pour ≈ ${euro(b.maxCpa)} de marge.${hyp}`, detail: why[b.goal] || why.leads }
}

function rampUp(monthly, channels) {
  const ids = new Set(channels.map((c) => c.id))
  const social = ['meta', 'tiktok', 'snapchat', 'pinterest', 'linkedin', 'youtube'].filter((x) => ids.has(x))
  const tags = [ids.has('google_search') || ids.has('google_pmax') || ids.has('google_app') ? 'Google Ads' : '', ids.has('microsoft') ? 'Microsoft Ads' : '', ids.has('meta') ? 'Meta (API Conversions)' : '', ids.has('tiktok') ? 'TikTok (Events API)' : '', ids.has('linkedin') ? 'LinkedIn (Insight Tag)' : ''].filter(Boolean)
  return [
    { phase: 'Semaines 1–2 : lancement', actions: [
      `Mesure des conversions vérifiée : GA4${tags.length ? ' + ' + tags.join(', ') : ''}, Consent Mode v2.`,
      `Démarrez à ~70 % du budget (${Math.round(monthly * 0.7)} €/mois) ; gardez 10–20 % pour tester ${social.length ? 'audiences et créations' : 'de nouveaux mots-clés'}.`,
      social.length ? '3 à 5 créations par ensemble (vidéo verticale, carrousel, image), 2 ou 3 accroches différentes.' : '2 ou 3 annonces par groupe, avec le mot-clé dans le titre ; extensions (appel, lieu, liens annexes) activées.',
      'Ne touchez à rien pendant 7 jours (apprentissage), sauf erreur flagrante.',
    ] },
    { phase: 'Semaines 3–6 : optimisation', actions: [
      'Coupez les annonces et mots-clés dont le coût par client dépasse 2× la cible après 50–100 clics.',
      'Ajoutez chaque semaine les recherches non pertinentes en mots-clés négatifs (Google).',
      'Augmentez les gagnants de 15–20 % maximum tous les 3–7 jours (au-delà, l’algorithme réapprend).',
      social.length ? 'Renouvelez les créations quand la fréquence dépasse ~3 ou que le CTR baisse de 30 %.' : 'Ajustez les enchères par appareil, horaire et zone selon le coût par client réel.',
    ] },
    { phase: 'Mois 2–3 : montée en charge', actions: [
      'Enchères automatiques (CPA ou ROAS cible) dès 30 conversions par mois et par campagne.',
      `Montez vers ${Math.round(monthly * 1.3)}–${Math.round(monthly * 1.6)} €/mois si le coût réel reste sous votre seuil de rentabilité.`,
      social.length ? 'Remarketing (visiteurs 30 jours, vidéos vues à 50 %), puis audiences similaires.' : 'Remarketing des visiteurs (30 jours) quand le volume le permet.',
      channels.length < 2 ? 'Ajoutez un 2e canal seulement quand le 1er est rentable et stable.' : 'Comparez les canaux au coût par client réel (pas au CPC) et réallouez chaque mois.',
    ] },
  ]
}

function seoBudget(sector, local) {
  return {
    note: 'Le SEO met 3 à 6 mois à produire un effet net ; la publicité fait le pont et révèle les recherches qui rapportent.',
    split: local ? 'PME locale : 50–60 % Google Search et Maps, 15–25 % SEO local (fiche Google, avis, pages services), 15–25 % Meta.' : sector.b2b ? 'B2B : 40–50 % contenu et SEO, 30–40 % Search + LinkedIn, 10–20 % remarketing.' : 'E-commerce / B2C : 50–60 % Shopping/PMax + Meta, 25–35 % SEO et contenu, 10 % tests (TikTok, Pinterest).',
    items: [
      { item: 'Corrections techniques (onglet À faire)', cost: 'souvent 0 € en interne, sinon 500 à 3 000 € une fois' },
      { item: 'Contenu : 2 à 4 pages ou articles par mois', cost: '150 à 500 € par contenu expert (rédacteur spécialisé)' },
      { item: 'Fiche Google + avis clients', cost: '0 € — 1 h par semaine' },
      { item: 'Liens et mentions gagnés : fournisseurs, partenaires, fédération, presse locale, annuaires de qualité', cost: '0 € à payer, 2 à 4 h par mois. On n’achète pas de liens (règles anti-spam de Google) ; un article sponsorisé porte rel="sponsored"' },
      { item: 'Outils', cost: 'Search Console et Bing Webmaster (0 €) ; suite SEO 30 à 140 €/mois si besoin' },
    ],
    rules: research.budget_rules || [],
  }
}

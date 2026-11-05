// Import Search Console : vos vraies données, lues sur votre machine, sans serveur.
// - Export « Performances » (ZIP : Requêtes, Pages, Pays, Appareils, Dates, Filtres) : opportunités, part de la marque,
//   comparaison de deux périodes, chute de trafic datée et mises à jour Google proches.
// - Exports du rapport « Liens » : sites référents, pages les plus liées, textes d'ancre.
// Opportunités = requêtes en positions 4–20 avec des impressions : gain en clics/mois si la page passe en position 3,
// d'après une courbe de CTR prudente (sans AI Overview).
import { GOOGLE_UPDATES } from '../data/google-updates.js'

// CTR moyen par position, prudent : GrowthSRC 2025 (pos. 1 ≈ 19 %, pos. 2 ≈ 12,6 %) et First Page Sage 2026 (pos. 10 ≈ 1,6 %).
export const CTR_CURVE = [0, 0.19, 0.126, 0.09, 0.065, 0.05, 0.04, 0.033, 0.028, 0.024, 0.02]
export const ctrAt = (pos) => (pos < 1 ? CTR_CURVE[1] : pos <= 10 ? CTR_CURVE[Math.round(pos)] : pos <= 20 ? 0.01 : 0.003)

// CSV tolérant : séparateur , ; ou tabulation, guillemets, BOM, décimales à virgule, pourcentages.
export function parseCsv(text) {
  text = String(text || '').replace(/^﻿/, '')
  const first = text.split(/\r?\n/, 1)[0] || ''
  const sep = [',', ';', '\t'].sort((a, b) => first.split(b).length - first.split(a).length)[0]
  const rows = []
  let row = [], cell = '', q = false
  for (let i = 0; i < text.length; i++) {
    const ch = text[i]
    if (q) {
      if (ch === '"' && text[i + 1] === '"') { cell += '"'; i++ }
      else if (ch === '"') q = false
      else cell += ch
    } else if (ch === '"') q = true
    else if (ch === sep) { row.push(cell); cell = '' }
    else if (ch === '\n' || ch === '\r') {
      if (ch === '\r' && text[i + 1] === '\n') i++
      row.push(cell); cell = ''
      if (row.some((c) => c.trim() !== '')) rows.push(row)
      row = []
    } else cell += ch
  }
  row.push(cell)
  if (row.some((c) => c.trim() !== '')) rows.push(row)
  return rows
}

const num = (v) => {
  if (v == null) return NaN
  let s = String(v).trim().replace(/[\s  ]/g, '')
  const pct = s.endsWith('%')
  s = s.replace('%', '')
  if (s.includes(',') && !s.includes('.')) s = s.replace(',', '.')
  else s = s.replace(/,/g, '')
  const n = parseFloat(s)
  return pct ? n / 100 : n
}
const fold = (s) => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()

// Colonnes : en mode « comparer » Search Console exporte deux colonnes par mesure (période actuelle, période précédente).
const METRICS = { clicks: /\bclic|\bclick/i, impressions: /impression/i, ctr: /\bctr\b/i, position: /position/i }
const PREV = /pr[ée]c[ée]dent|previous|prior|ant[ée]rieur/i
const DATE_IN = /(\d{4})-(\d{2})-(\d{2})/

// Type de tableau d'après la 1re colonne (français ou anglais) puis le nom du fichier
const KINDS = [
  ['requetes', /requ[eê]te|quer(y|ies)/i],
  ['pages', /^pages?\b|^url|pages? (les plus|top)|top pages/i],
  ['pays', /^pays|countr/i],
  ['appareils', /^appareil|device/i],
  ['dates', /^date/i],
  ['apparence', /apparence|appearance/i],
]
function kindOf(head0, name) {
  for (const [k, re] of KINDS) if (re.test(head0)) return k
  for (const [k, re] of KINDS) if (re.test(name || '')) return k
  return null
}

// Un tableau « Performances » : lignes { key, clicks, impressions, ctr, position, prev? }
export function parseGsc(text, name = '') {
  const rows = parseCsv(text)
  if (rows.length < 2) return { error: 'Fichier vide ou illisible.' }
  const head = rows[0].map((h) => h.trim())
  const cols = {}
  for (const [m, re] of Object.entries(METRICS)) {
    const found = head.map((h, i) => ({ h, i })).filter(({ h, i }) => i > 0 && re.test(h) && !(m === 'clicks' && /ctr/i.test(h)))
    if (!found.length) continue
    let cur = found[0], prev = null
    if (found.length >= 2) {
      const byWord = found.find((f) => PREV.test(f.h))
      if (byWord) { prev = byWord; cur = found.find((f) => f !== byWord) }
      else {
        const d = found.map((f) => (f.h.match(DATE_IN) || [])[0] || '')
        if (d[0] && d[1] && d[0] < d[1]) { prev = found[0]; cur = found[1] } else { cur = found[0]; prev = found[1] }
      }
    }
    cols[m] = { cur: cur.i, prev: prev ? prev.i : -1 }
  }
  if (!cols.impressions && !cols.clicks) return { error: 'Colonnes « Clics » et « Impressions » introuvables : exportez un tableau de Search Console (Performances → Exporter → CSV ou ZIP).' }
  const kind = kindOf(head[0], name) || 'requetes'
  const get = (r, m, w) => (cols[m] && cols[m][w] >= 0 ? num(r[cols[m][w]]) : NaN)
  const compare = Object.values(cols).some((c) => c.prev >= 0)
  const data = rows.slice(1).map((r) => {
    const one = (w) => {
      const impressions = get(r, 'impressions', w), clicks = get(r, 'clicks', w)
      let ctr = get(r, 'ctr', w)
      if (ctr > 1) ctr = ctr / 100
      if (Number.isNaN(ctr) && impressions > 0 && !Number.isNaN(clicks)) ctr = clicks / impressions
      return { clicks: Number.isNaN(clicks) ? 0 : clicks, impressions: Number.isNaN(impressions) ? 0 : impressions, ctr: Number.isNaN(ctr) ? 0 : ctr, position: get(r, 'position', w) }
    }
    const d = { key: (r[0] || '').trim(), ...one('cur') }
    if (compare) d.prev = one('prev')
    return d
  }).filter((d) => d.key && (d.impressions > 0 || d.clicks > 0 || (d.prev && (d.prev.impressions > 0 || d.prev.clicks > 0))))
  return { kind, compare, rows: data, totals: { clicks: data.reduce((s, d) => s + d.clicks, 0), impressions: data.reduce((s, d) => s + d.impressions, 0) } }
}

// ───────── Rapport « Liens » ─────────
// Exports par tableau (sites, pages liées, textes) ou « derniers liens » (une URL par ligne). Détection souple FR/EN.
export function parseLinks(text, name = '') {
  const rows = parseCsv(text)
  if (rows.length < 2) return null
  const head = rows[0].map((h) => h.trim()), h0 = head[0] || '', n = fold(name)
  const count = (r) => { for (let i = 1; i < r.length; i++) { const v = num(r[i]); if (Number.isFinite(v)) return v } return 1 }
  const sites2 = head.findIndex((h, i) => i > 0 && /site/i.test(h))
  let type = null
  if (/intern/.test(n)) type = 'internes'
  else if (/texte|text|ancre|anchor/i.test(h0) || /texte|text|ancre|anchor/.test(n)) type = 'ancres'
  else if (/crawl|explor/i.test(head.join(' ')) && /page|url|lien|link/i.test(h0)) type = 'derniers'
  else if (/^site|domain|domaine/i.test(h0) || (/site/.test(n) && !/page/.test(n))) type = 'sites'
  else if (/page|url|lien|link/i.test(h0) || /page/.test(n)) type = 'pages'
  if (!type) return null
  const data = rows.slice(1).map((r) => ({ key: (r[0] || '').trim(), links: count(r), sites: sites2 > 0 ? num(r[sites2]) || 0 : 0 })).filter((d) => d.key)
  if (type === 'derniers') {
    // Une ligne = un lien : on regroupe par domaine référent
    const by = new Map()
    for (const d of data) { const host = tryHost(d.key); if (host) by.set(host, (by.get(host) || 0) + 1) }
    return { type: 'sites', rows: [...by].map(([key, links]) => ({ key, links, sites: 0 })).sort((a, b) => b.links - a.links), fromLatest: true }
  }
  return { type, rows: data }
}
const tryHost = (u) => { try { return new URL(/^https?:/i.test(u) ? u : 'https://' + u).hostname.replace(/^www\./, '') } catch { return '' } }
const isLinksFile = (head0, name) => /lien|link|ancre|anchor|provenance|r[ée]f[ée]rent/i.test(fold(name)) || /linking|provenance|r[ée]f[ée]rent|texte du lien|linking text/i.test(head0)

// Lit tous les CSV utiles d'un ou plusieurs fichiers déposés : { perf: { requetes, pages, … }, liens: { sites, pages, ancres, internes }, filtres, inconnus }
export function parseGscFiles(files) {
  const out = { perf: {}, liens: {}, filtres: [], inconnus: [] }
  for (const f of files || []) {
    const rows = parseCsv(f.text)
    if (rows.length < 2) continue
    const h0 = (rows[0][0] || '').trim()
    if (/^filtre|^filter/i.test(h0)) { out.filtres = rows.slice(1).map((r) => [String(r[0] || '').trim(), String(r[1] || '').trim()]); continue }
    const looksPerf = rows[0].some((h, i) => i > 0 && METRICS.impressions.test(h))
    if (!looksPerf && isLinksFile(h0, f.name)) {
      const l = parseLinks(f.text, f.name)
      if (l) { out.liens[l.type] = l; continue }
    }
    if (looksPerf) {
      const p = parseGsc(f.text, f.name)
      if (!p.error && p.rows.length) { if (!out.perf[p.kind]) out.perf[p.kind] = p; continue }
    }
    const l = parseLinks(f.text, f.name)
    if (l && !looksPerf) { out.liens[l.type] = l; continue }
    out.inconnus.push(f.name || 'fichier')
  }
  return out
}

// ───────── Marque ─────────
// Requêtes de marque : celles qui contiennent le nom de la marque ou du domaine (sans accents, espaces optionnels).
export function brandTerms({ brand = '', domain = '' } = {}) {
  const t = new Set()
  const add = (s) => { s = fold(s).replace(/[^a-z0-9]+/g, ' ').trim(); if (s.length >= 3) { t.add(s); if (s.includes(' ')) t.add(s.replace(/ /g, '')) } }
  add(brand)
  const host = fold(domain).replace(/^[a-z]+:\/\//, '').split(/[/?#:]/)[0].replace(/^www\./, '')
  const labels = host.split('.').filter(Boolean)
  if (labels.length >= 2) {
    labels.pop()
    if (labels.length >= 2 && /^(co|com|org|net|gouv|asso)$/.test(labels[labels.length - 1])) labels.pop()
    add(labels[labels.length - 1].replace(/-/g, ' '))
  }
  return [...t]
}
export function isBrand(query, terms) {
  if (!terms?.length) return false
  const q = ' ' + fold(query).replace(/[^a-z0-9]+/g, ' ').trim() + ' ', compact = q.replace(/ /g, '')
  return terms.some((t) => q.includes(' ' + t + ' ') || (t.length >= 6 && !t.includes(' ') && compact.includes(t)))
}
export function splitBrand(rows, terms) {
  const a = { clicks: 0, impressions: 0, count: 0 }, b = { clicks: 0, impressions: 0, count: 0 }
  for (const r of rows || []) { const x = isBrand(r.key, terms) ? a : b; x.clicks += r.clicks; x.impressions += r.impressions; x.count++ }
  const clicks = a.clicks + b.clicks
  return { brand: a, nonBrand: b, share: clicks ? a.clicks / clicks : null }
}

// Les meilleures opportunités, chiffrées en clics par mois. Les requêtes de marque sont écartées si on les connaît.
export function opportunities(parsed, { months = 3, min = 30, limit = 15, brand = [] } = {}) {
  if (!parsed?.rows) return []
  const out = []
  for (const d of parsed.rows) {
    if (parsed.kind !== 'pages' && isBrand(d.key, brand)) continue
    const imp = d.impressions / months
    if (imp < min / months) continue
    if (d.position > 3.5 && d.position <= 20) {
      const gain = imp * Math.max(0, ctrAt(3) - d.ctr)
      out.push({ ...d, prev: undefined, type: 'remonter', gain, action: d.position <= 10 ? 'Page 1 mais sous le pli : renforcez le titre, le contenu sur cette requête et 2–3 liens internes vers la page. Une modification à la fois, puis attendez 3 à 4 semaines.' : 'Page 2 : enrichissez la page qui se positionne (ou créez une page dédiée) et ajoutez des liens internes.' })
    } else if (d.position <= 3.5 && d.ctr < ctrAt(Math.round(d.position)) * 0.6 && imp >= 50) {
      const gain = imp * (ctrAt(Math.round(d.position)) * 0.8 - d.ctr)
      out.push({ ...d, prev: undefined, type: 'ctr', gain, action: 'Bien classée mais peu cliquée : réécrivez le titre et la meta description (bénéfice, chiffre, appel à l’action). Vérifiez si une réponse IA ou un encart occupe le haut de page.' })
    }
  }
  return out.filter((o) => o.gain >= 1).sort((a, b) => b.gain - a.gain).slice(0, limit).map((o) => ({ ...o, gain: Math.round(o.gain) }))
}

// ───────── Comparaison de deux périodes ─────────
// Cause probable d'une évolution, d'après positions, impressions et CTR (règles simples, à confirmer page par page).
export function cause(cur, prev) {
  if (!cur || !(cur.impressions > 0 || cur.clicks > 0)) return 'Disparue : vérifiez que la page existe, est indexable (pas de noindex) et n’a pas été redirigée.'
  if (!prev || !(prev.impressions > 0 || prev.clicks > 0)) return 'Nouvelle sur la période.'
  const dPos = cur.position > 0 && prev.position > 0 ? cur.position - prev.position : 0, dImp = prev.impressions ? cur.impressions / prev.impressions - 1 : 0
  const dClk = prev.clicks ? cur.clicks / prev.clicks - 1 : 0
  if (dPos >= 2) return `Recul de ${dPos.toFixed(1).replace('.', ',')} place(s) : concurrent plus pertinent, mise à jour Google ou problème technique de la page.`
  if (dPos <= -2 && dClk > 0) return 'Gain de positions.'
  if (dClk <= -0.3 && Math.abs(dPos) < 1 && Math.abs(dImp) < 0.2) return 'Positions et impressions stables mais moins de clics : un résumé IA ou un nouveau bloc occupe le haut de page (pas une pénalité). Retravaillez titre et description, visez la citation dans la réponse IA.'
  if (dImp <= -0.4 && Math.abs(dPos) < 1.5) return 'Moins de recherches (saison, tendance) ou moins de variantes couvertes : comparez avec la même période l’an passé.'
  if (dClk >= 0.3) return 'Progression.'
  return 'Évolution modérée.'
}
export function compareRows(cur, prev, { min = 5, limit = 10 } = {}) {
  const P = new Map((prev || []).map((r) => [r.key, r])), seen = new Set(), all = []
  for (const r of cur || []) { seen.add(r.key); all.push({ key: r.key, cur: r, prev: P.get(r.key) || null }) }
  for (const r of prev || []) if (!seen.has(r.key)) all.push({ key: r.key, cur: null, prev: r })
  const rows = all.map((x) => ({ key: x.key, clicks: x.cur?.clicks || 0, prevClicks: x.prev?.clicks || 0, position: x.cur?.position ?? null, prevPosition: x.prev?.position ?? null, impressions: x.cur?.impressions || 0, prevImpressions: x.prev?.impressions || 0 }))
    .map((r) => ({ ...r, delta: r.clicks - r.prevClicks }))
    .filter((r) => Math.max(r.clicks, r.prevClicks) >= min)
  const withCause = (r) => ({ ...r, cause: cause(r.clicks || r.impressions ? { clicks: r.clicks, impressions: r.impressions, position: r.position } : null, r.prevClicks || r.prevImpressions ? { clicks: r.prevClicks, impressions: r.prevImpressions, position: r.prevPosition } : null) })
  return {
    gagnants: rows.filter((r) => r.delta > 0).sort((a, b) => b.delta - a.delta).slice(0, limit).map(withCause),
    perdants: rows.filter((r) => r.delta < 0).sort((a, b) => a.delta - b.delta).slice(0, limit).map(withCause),
    nouveaux: rows.filter((r) => !r.prevClicks && !r.prevImpressions).length,
    disparus: rows.filter((r) => !r.clicks && !r.impressions).sort((a, b) => b.prevClicks - a.prevClicks).slice(0, limit).map(withCause),
  }
}
// Un export en mode « comparer » : chaque ligne porte déjà la période précédente
const splitCompare = (p) => p && p.compare ? { cur: p.rows.map(({ prev, ...r }) => r), prev: p.rows.filter((r) => r.prev).map((r) => ({ key: r.key, ...r.prev })) } : null

// ───────── Courbe quotidienne : chute et mises à jour Google proches ─────────
const avg = (a) => (a.length ? a.reduce((s, x) => s + x, 0) / a.length : 0)
const dayMs = 86400000
export function detectDrop(dates, { window = 14, minPerDay = 3, threshold = 0.25 } = {}) {
  const d = (dates || []).filter((r) => DATE_IN.test(r.key)).sort((a, b) => (a.key < b.key ? -1 : 1))
  if (d.length < window * 2) return null
  let best = null
  for (let i = window; i <= d.length - window; i++) {
    const b = d.slice(i - window, i), a = d.slice(i, i + window)
    const before = avg(b.map((x) => x.clicks)), after = avg(a.map((x) => x.clicks))
    if (before < minPerDay) continue
    const drop = (before - after) / before
    if (drop >= threshold && (!best || drop > best.drop)) {
      best = { date: d[i].key, before, after, drop, impBefore: avg(b.map((x) => x.impressions)), impAfter: avg(a.map((x) => x.impressions)), posBefore: avg(b.map((x) => x.position || 0)), posAfter: avg(a.map((x) => x.position || 0)) }
    }
  }
  if (!best) return null
  const t = Date.parse(best.date)
  best.updates = GOOGLE_UPDATES.filter((u) => t >= Date.parse(u.start) - 3 * dayMs && t <= Date.parse(u.end) + 10 * dayMs)
  const impDrop = best.impBefore ? 1 - best.impAfter / best.impBefore : 0, posLoss = best.posAfter - best.posBefore
  best.lecture = posLoss >= 1.5 ? 'Les positions ont reculé en même temps : vrai recul de classement (mise à jour, concurrent, problème technique).'
    : impDrop < 0.15 ? 'Impressions et positions stables, clics en baisse : réponse IA ou nouveaux blocs au-dessus de vous. Ce n’est pas une pénalité.'
      : 'Impressions en baisse sans recul de position : moins de recherches (saison) ou pages sorties de l’index. Vérifiez la couverture et la même période l’an passé.'
  return best
}

// Durée de la période, en mois : courbe quotidienne, sinon filtre « Date » de l'export, sinon 3 mois (défaut de Search Console)
function periodMonths(bundle) {
  const n = bundle?.perf?.dates?.rows?.length
  if (n >= 7) return n / 30.44
  const f = (bundle?.filtres || []).find(([k]) => /^date/i.test(k))?.[1] || ''
  const m = fold(f).match(/(\d+)\s*(derniers?\s*)?(jours?|days?|mois|months?)/)
  if (m) return /jour|day/.test(m[3]) ? +m[1] / 30.44 : +m[1]
  return 3
}

// ───────── Liens ─────────
const GENERIC = /^(ici|cliquez ici|click here|here|en savoir plus|lire la suite|voir|site|site web|website|link|lien|plus|more|read more|accueil|home)$/i
export function analyzeLinks(liens, terms = [], prevLiens = null) {
  if (!liens || !Object.keys(liens).length) return null
  const sites = liens.sites?.rows || [], pages = liens.pages?.rows || [], anchors = liens.ancres?.rows || [], internes = liens.internes?.rows || []
  const kinds = { marque: 0, url: 0, generique: 0, mots: 0 }
  for (const a of anchors) {
    const k = isBrand(a.key, terms) ? 'marque' : /^(https?:\/\/|www\.)|\.[a-z]{2,4}(\/|$)/i.test(a.key) ? 'url' : GENERIC.test(a.key.trim()) ? 'generique' : 'mots'
    kinds[k] += a.links || 1
  }
  const totalA = Object.values(kinds).reduce((s, x) => s + x, 0)
  const alerts = []
  if (totalA >= 20 && kinds.mots / totalA > 0.6 && terms.length) alerts.push(`${Math.round((kinds.mots / totalA) * 100)} % de vos liens ont une ancre « mot-clé » : profil qui peut paraître artificiel. Les liens naturels portent surtout le nom de la marque ou l’adresse du site.`)
  if (sites.length && sites.length < 10) alerts.push(`Seulement ${sites.length} site(s) référent(s) : priorité aux partenaires locaux (fournisseurs, fédérations, presse locale, associations soutenues).`)
  const top = sites[0], totalLinks = sites.reduce((s, x) => s + x.links, 0)
  if (top && totalLinks >= 20 && top.links / totalLinks > 0.5) alerts.push(`${top.key} fournit à lui seul ${Math.round((top.links / totalLinks) * 100)} % de vos liens (souvent un lien de pied de page) : ce n’est pas un signal de popularité large.`)
  // Deux exports « Liens » (--avant) : sites référents perdus et gagnés
  let perdus = [], gagnes = []
  const ps = prevLiens?.sites?.rows
  if (ps?.length && sites.length) {
    const now = new Set(sites.map((x) => x.key)), before = new Set(ps.map((x) => x.key))
    perdus = ps.filter((x) => !now.has(x.key)).sort((a, b) => b.links - a.links).slice(0, 15)
    gagnes = sites.filter((x) => !before.has(x.key)).slice(0, 15)
    if (perdus.length) alerts.unshift(`${perdus.length} site(s) référent(s) perdu(s) depuis l’export précédent : ${perdus.slice(0, 5).map((x) => x.key).join(', ')}. Vérifiez si la page qui vous citait existe encore ; demandez la correction du lien si elle a changé d’adresse.`)
  }
  return { sites: sites.slice(0, 15), pages: pages.slice(0, 15), ancres: anchors.slice(0, 15), internes: internes.slice(0, 15), nbSites: sites.length, kinds, totalAncres: totalA, alerts, perdus, gagnes, fromLatest: !!liens.sites?.fromLatest }
}

// ───────── Analyse complète (interface et ligne de commande) ─────────
export function analyzeGsc({ cur, prev = null, brand = '', domain = '' } = {}) {
  // Ancien format stocké : { kind, rows }
  if (cur?.rows) cur = { perf: { [cur.kind || 'requetes']: cur }, liens: {}, filtres: [] }
  const P = cur?.perf || {}, Q = P.requetes, terms = brandTerms({ brand, domain })
  const months = periodMonths(cur)
  const res = { months, terms, warnings: [], actions: [] }
  const days = P.dates?.rows?.length || 0
  const sum = (rows, k) => (rows || []).reduce((s, r) => s + (r[k] || 0), 0)
  res.totals = P.dates ? { clicks: sum(P.dates.rows, 'clicks'), impressions: sum(P.dates.rows, 'impressions'), source: 'dates' } : Q ? { ...Q.totals, source: 'requetes' } : P.pages ? { ...P.pages.totals, source: 'pages' } : null
  if (P.dates && Q) {
    const hidden = res.totals.clicks ? 1 - Q.totals.clicks / res.totals.clicks : 0
    if (hidden > 0.05) res.hidden = hidden
  }
  if (Q) {
    res.brand = terms.length ? splitBrand(Q.rows, terms) : null
    res.opportunities = opportunities(Q, { months, brand: terms })
  } else if (P.pages) res.opportunities = opportunities(P.pages, { months })
  else res.opportunities = []
  if (res.brand?.share != null) {
    const s = res.brand.share
    res.brand.lecture = s >= 0.7 ? 'L’essentiel de vos clics vient de gens qui vous connaissent déjà : votre visibilité hors marque est faible. C’est là qu’est la croissance (pages services, pages ville, contenus qui répondent aux questions).'
      : s >= 0.3 ? 'Équilibre correct entre marque et hors marque. Développez le hors marque sur vos services principaux.'
        : 'Vos clics viennent surtout de recherches hors marque : on vous découvre sur Google. Entretenez aussi la notoriété (avis, mentions) qui rassure et fait citer la marque par les IA.'
  } else if (Q && !terms.length) res.warnings.push('Indiquez la marque (ou le site) pour séparer les requêtes de marque des autres.')
  // Comparaison : export en mode « comparer » ou deuxième export de la période précédente
  const pairQ = splitCompare(Q) || (prev?.perf?.requetes || prev?.rows ? { cur: Q?.rows, prev: (prev.perf?.requetes || prev).rows } : null)
  const pairP = splitCompare(P.pages) || (prev?.perf?.pages ? { cur: P.pages?.rows, prev: prev.perf.pages.rows } : null)
  if (pairQ?.cur || pairP?.cur) {
    const totCur = pairQ?.cur ? sum(pairQ.cur, 'clicks') : sum(pairP.cur, 'clicks'), totPrev = pairQ?.cur ? sum(pairQ.prev, 'clicks') : sum(pairP.prev, 'clicks')
    res.compare = { clicks: totCur, prevClicks: totPrev, evolution: totPrev ? totCur / totPrev - 1 : null, requetes: pairQ?.cur ? compareRows(pairQ.cur, pairQ.prev) : null, pages: pairP?.cur ? compareRows(pairP.cur, pairP.prev) : null }
    if (pairQ?.cur && terms.length) {
      const a = splitBrand(pairQ.cur, terms), b = splitBrand(pairQ.prev, terms)
      res.compare.horsMarque = { clicks: a.nonBrand.clicks, prevClicks: b.nonBrand.clicks, evolution: b.nonBrand.clicks ? a.nonBrand.clicks / b.nonBrand.clicks - 1 : null }
    }
  }
  if (P.dates) res.drop = detectDrop(P.dates.rows)
  else res.warnings.push('Courbe quotidienne absente : importez le ZIP complet (il contient Dates.csv) pour dater une éventuelle chute.')
  res.days = days
  const share = (rows) => { const t = sum(rows, 'clicks'); return (rows || []).slice(0, 6).map((r) => ({ key: r.key, clicks: r.clicks, part: t ? r.clicks / t : 0, ctr: r.ctr, position: r.position })) }
  if (P.appareils) res.appareils = share(P.appareils.rows)
  if (P.pays) res.pays = share(P.pays.rows.slice().sort((a, b) => b.clicks - a.clicks))
  res.liens = analyzeLinks(cur?.liens, terms, prev?.liens)
  // Actions, dans l'ordre où les faire
  if (res.drop) {
    const d = res.drop, ctrOnly = d.posAfter - d.posBefore < 1.5 && (!d.impBefore || 1 - d.impAfter / d.impBefore < 0.15)
    const upd = d.updates.filter((u) => u.type !== 'ia' && u.type !== 'serp')
    res.actions.push(`Chute de ${Math.round(d.drop * 100)} % des clics à partir du ${frDate(d.date)}${d.updates.length ? ` (pendant ou juste après : ${d.updates.map((u) => u.label).join(', ')})` : ''}. ${d.lecture}${upd.length && ctrOnly ? ' La coïncidence avec la mise à jour ne suffit pas : vos positions n’ont pas bougé.' : ''} Vérifiez d’abord le rapport « Actions manuelles » de Search Console.`)
  }
  const lost = res.compare?.pages?.perdants?.length ? res.compare.pages.perdants : res.compare?.requetes?.perdants || []
  if (lost.length) {
    const L = lost.slice(0, 3)
    res.actions.push(`Plus grosses pertes : ${L.map((l) => `${l.key} (${l.delta} clics)`).join(' ; ')}. Commencez par ces pages : ${L[0].cause}`)
  }
  if (res.opportunities.length) res.actions.push(`${res.opportunities.length} requêtes déjà proches du haut de page : ≈ +${res.opportunities.reduce((s, o) => s + o.gain, 0)} clics/mois possibles. Traitez d’abord « ${res.opportunities[0].key} ».`)
  if (res.brand?.share >= 0.7) res.actions.push('Créez ou renforcez une page par service et par ville desservie : votre trafic hors marque est trop faible.')
  if (res.liens?.alerts?.length) res.actions.push(...res.liens.alerts)
  if (res.hidden) res.warnings.push(`Search Console masque ${Math.round(res.hidden * 100)} % des clics (requêtes rares, anonymisées) : les tableaux par requête sont incomplets, les totaux viennent de la courbe quotidienne.`)
  if (cur?.inconnus?.length) res.warnings.push(`Fichier(s) non reconnu(s) : ${cur.inconnus.join(', ')}.`)
  return res
}
const frDate = (d) => { const [y, m, j] = String(d).split('-'); return `${j}/${m}/${y}` }

export function gscMarkdown(a, { titre = 'Search Console' } = {}) {
  const fr = (n, d = 0) => (n == null ? '—' : Number(n).toLocaleString('fr-FR', { maximumFractionDigits: d }))
  const pct = (x) => (x == null ? '—' : `${x >= 0 ? '+' : ''}${Math.round(x * 100)} %`)
  const L = [`# ${titre}`, '']
  if (a.totals) L.push(`Période ≈ ${fr(a.months, 1)} mois · ${fr(a.totals.clicks)} clics · ${fr(a.totals.impressions)} impressions`, '')
  if (a.actions.length) L.push('## À faire, dans l’ordre', '', ...a.actions.map((x, i) => `${i + 1}. ${x}`), '')
  if (a.brand) L.push('## Marque et hors marque', '', `- Clics de marque : ${fr(a.brand.brand.clicks)} (${Math.round(a.brand.share * 100)} %) · hors marque : ${fr(a.brand.nonBrand.clicks)}`, `- ${a.brand.lecture}`, '')
  if (a.compare) {
    L.push('## Comparaison avec la période précédente', '', `- Clics : ${fr(a.compare.prevClicks)} → ${fr(a.compare.clicks)} (${pct(a.compare.evolution)})${a.compare.horsMarque ? ` · hors marque : ${pct(a.compare.horsMarque.evolution)}` : ''}`, '')
    for (const [k, lab] of [['pages', 'Pages'], ['requetes', 'Requêtes']]) {
      const c = a.compare[k]; if (!c) continue
      if (c.perdants.length) L.push(`### ${lab} en recul`, '', '| | Clics | Évolution | Cause probable |', '|---|---:|---:|---|', ...c.perdants.map((r) => `| ${r.key} | ${fr(r.prevClicks)} → ${fr(r.clicks)} | ${r.delta} | ${r.cause} |`), '')
      if (c.gagnants.length) L.push(`### ${lab} en progrès`, '', ...c.gagnants.slice(0, 5).map((r) => `- ${r.key} : +${r.delta} clics`), '')
    }
  }
  if (a.drop) L.push('## Chute détectée', '', `- À partir du ${frDate(a.drop.date)} : ${fr(a.drop.before, 1)} → ${fr(a.drop.after, 1)} clics/jour (−${Math.round(a.drop.drop * 100)} %)`, `- Mises à jour Google proches : ${a.drop.updates.length ? a.drop.updates.map((u) => `${u.label} (${frDate(u.start)} → ${frDate(u.end)})`).join(' ; ') : 'aucune connue'}`, `- ${a.drop.lecture}`, '')
  if (a.opportunities.length) L.push('## Opportunités (requêtes déjà proches du haut de page)', '', '| Requête | Position | Impressions | CTR | Gain ≈ clics/mois |', '|---|---:|---:|---:|---:|', ...a.opportunities.map((o) => `| ${o.key} | ${fr(o.position, 1)} | ${fr(o.impressions)} | ${fr(o.ctr * 100, 1)} % | +${o.gain} |`), '')
  if (a.appareils) L.push('## Appareils', '', ...a.appareils.map((r) => `- ${r.key} : ${Math.round(r.part * 100)} % des clics, position ${fr(r.position, 1)}`), '')
  if (a.liens) L.push('## Liens', '', `- ${a.liens.nbSites} site(s) référent(s)${a.liens.fromLatest ? ' (d’après l’export des derniers liens)' : ''}`, ...a.liens.sites.slice(0, 10).map((s) => `  - ${s.key} : ${fr(s.links)} lien(s)`), ...(a.liens.totalAncres ? [`- Ancres : marque ${a.liens.kinds.marque}, adresse ${a.liens.kinds.url}, génériques ${a.liens.kinds.generique}, mots-clés ${a.liens.kinds.mots}`] : []), ...a.liens.alerts.map((x) => `- ⚠ ${x}`), '')
  if (a.warnings.length) L.push('## Limites', '', ...a.warnings.map((w) => `- ${w}`), '')
  return L.join('\n')
}

// ───────── Lecture des fichiers ─────────
// L'export de Search Console est un ZIP de plusieurs CSV : on les lit tous, dans le navigateur (DecompressionStream) ou Node.
export async function readGscFiles(buf, name = '') {
  const u8 = new Uint8Array(buf)
  if (u8[0] === 0x50 && u8[1] === 0x4b) return unzipAll(u8)
  return [{ name, text: new TextDecoder('utf-8').decode(u8) }]
}
// Compatibilité : le tableau « Requêtes » (ou le 1er CSV) d'un export
export async function readGscFile(buf) {
  const files = await readGscFiles(buf)
  const pick = files.find((e) => /requ.{1,2}tes|quer(y|ies)/i.test(e.name)) || files.find((e) => /pages/i.test(e.name)) || files[0]
  if (!pick) throw new Error('Aucun fichier CSV dans le ZIP.')
  return pick
}
async function unzipAll(u8) {
  const dv = new DataView(u8.buffer, u8.byteOffset, u8.byteLength)
  let eocd = -1
  for (let i = u8.length - 22; i >= Math.max(0, u8.length - 65557); i--) if (dv.getUint32(i, true) === 0x06054b50) { eocd = i; break }
  if (eocd < 0) throw new Error('Fichier ZIP illisible.')
  const count = Math.min(dv.getUint16(eocd + 10, true), 64)
  let p = dv.getUint32(eocd + 16, true)
  const out = []
  for (let n = 0; n < count && p + 46 <= u8.length && dv.getUint32(p, true) === 0x02014b50; n++) {
    const nameLen = dv.getUint16(p + 28, true)
    const e = { method: dv.getUint16(p + 10, true), csize: dv.getUint32(p + 20, true), usize: dv.getUint32(p + 24, true), local: dv.getUint32(p + 42, true), name: new TextDecoder().decode(u8.subarray(p + 46, p + 46 + nameLen)) }
    p += 46 + nameLen + dv.getUint16(p + 30, true) + dv.getUint16(p + 32, true)
    if (!/\.csv$/i.test(e.name) || e.usize > 30 * 1024 * 1024) continue
    if (e.method !== 0 && e.method !== 8) throw new Error('Compression ZIP non prise en charge.')
    const start = e.local + 30 + dv.getUint16(e.local + 26, true) + dv.getUint16(e.local + 28, true)
    const data = u8.subarray(start, start + e.csize)
    const raw = e.method === 0 ? data : new Uint8Array(await new Response(new Blob([data]).stream().pipeThrough(new DecompressionStream('deflate-raw'))).arrayBuffer())
    out.push({ name: e.name.split('/').pop(), text: new TextDecoder('utf-8').decode(raw) })
  }
  if (!out.length) throw new Error('Aucun fichier CSV dans le ZIP.')
  return out
}

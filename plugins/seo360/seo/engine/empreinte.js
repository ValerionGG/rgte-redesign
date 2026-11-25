// Empreinte marketing d'un site (le vôtre et ceux des concurrents), avec preuve pour chaque fait :
// 1. Régies publicitaires : pixels lus dans la page ET dans le conteneur Google Tag Manager (où ils se cachent souvent).
// 2. Historique Wayback Machine : âge du site, années actives, changements de la page d'accueil, titres d'une année à l'autre.
// 3. Common Crawl : pages vues par ce robot public lors de son dernier passage (un échantillon, pas le total du site).
// Sources gratuites et sans clé. Une source qui ne répond pas est notée « non vérifié », jamais remplacée par une estimation.

const enc = encodeURIComponent
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

// ───────── 1. Régies publicitaires ─────────
// Pixel d'une régie = la marque y achète (ou s'apprête à acheter) de la publicité : reciblage, conversions.
export const AD_NETWORKS = {
  meta: { label: 'Meta (Facebook, Instagram)', page: ['Pixel Meta'], gtm: /connect\.facebook\.net|fbevents\.js|fbq\(\s*['"]init/ },
  google: { label: 'Google Ads', page: ['Google Ads'], gtm: /"__awct"|"__sp"|AW-\d{6,}|googleadservices\.com/ },
  tiktok: { label: 'TikTok', page: ['Pixel TikTok'], gtm: /analytics\.tiktok\.com/ },
  linkedin: { label: 'LinkedIn', page: ['LinkedIn Insight'], gtm: /"__bzi"|snap\.licdn\.com|_linkedin_partner_id/ },
  microsoft: { label: 'Microsoft Ads (Bing)', page: ['Microsoft UET'], gtm: /bat\.bing\.com|"__baut"/ },
  pinterest: { label: 'Pinterest', page: ['Pinterest Tag'], gtm: /pintrk|s\.pinimg\.com\/ct/ },
  snapchat: { label: 'Snapchat', page: ['Snap Pixel'], gtm: /sc-static\.net\/scevent|snaptr\(/ },
}
export const gtmIds = (list) => [...new Set([].concat(list || []).flatMap((s) => String(s || '').match(/GTM-[A-Z0-9]{4,10}/g) || []))].slice(0, 3)

// Analyse d'un conteneur GTM (texte de gtm.js) : régies trouvées, avec l'extrait qui le prouve.
export function scanGtm(js) {
  const text = String(js || '').replace(/\\\//g, '/')
  const found = {}
  for (const [id, n] of Object.entries(AD_NETWORKS)) { const m = text.match(n.gtm); if (m) found[id] = m[0].slice(0, 60) }
  return found
}

export async function adsFootprint({ trackers = [], gtm = [] } = {}, { fetchImpl, timeout = 15000 } = {}) {
  const networks = {}
  for (const [id, n] of Object.entries(AD_NETWORKS)) if (n.page.some((p) => trackers.includes(p))) networks[id] = { label: n.label, preuves: ['page : ' + n.page.find((p) => trackers.includes(p))] }
  const containers = []
  for (const cid of gtmIds(gtm)) {
    if (!fetchImpl) { containers.push({ id: cid, ok: false, erreur: 'lecture impossible ici' }); continue }
    try {
      const r = await fetchImpl(`https://www.googletagmanager.com/gtm.js?id=${enc(cid)}`, { headers: { 'user-agent': 'Mozilla/5.0' }, signal: AbortSignal.timeout(timeout) })
      if (!r.ok) { containers.push({ id: cid, ok: false, erreur: `HTTP ${r.status}` }); continue }
      const found = scanGtm(await r.text())
      containers.push({ id: cid, ok: true, regies: Object.keys(found) })
      for (const [id, ev] of Object.entries(found)) (networks[id] ||= { label: AD_NETWORKS[id].label, preuves: [] }).preuves.push(`${cid} : « ${ev} »`)
    } catch (e) { containers.push({ id: cid, ok: false, erreur: String(e?.message || e).slice(0, 60) }) }
  }
  return { regies: networks, conteneurs: containers, verifie: !containers.some((c) => !c.ok) }
}

// ───────── 2. Historique Wayback Machine ─────────
const host = (u) => { try { return new URL(/^https?:/i.test(u) ? u : 'https://' + u).host.replace(/^www\./, '') } catch { return '' } }
const tsDate = (ts) => `${ts.slice(0, 4)}-${ts.slice(4, 6)}-${ts.slice(6, 8)}`

// Lignes CDX (une capture par mois, code 200) → âge, années actives, nombre de versions différentes de la page.
export function parseCdx(json) {
  let rows
  try { rows = typeof json === 'string' ? JSON.parse(json || '[]') : json } catch { return null }
  if (!Array.isArray(rows)) return null
  const caps = rows.filter((r) => Array.isArray(r) && /^\d{14}$/.test(r[0])).map(([timestamp, , digest]) => ({ timestamp, digest: String(digest || '') }))
  if (!caps.length) return { captures: 0, premiere: null, derniere: null, annees: [], versions: 0, parAnnee: {} }
  const parAnnee = {}
  let prev = '', versions = 0
  for (const c of caps) {
    const y = c.timestamp.slice(0, 4)
    const a = (parAnnee[y] ||= { captures: 0, changements: 0 })
    a.captures++
    if (c.digest && c.digest !== prev) { versions++; if (prev) a.changements++ }
    prev = c.digest
  }
  return { captures: caps.length, premiere: tsDate(caps[0].timestamp), derniere: tsDate(caps.at(-1).timestamp), annees: Object.keys(parAnnee), versions, parAnnee, _caps: caps }
}
const titleOf = (html) => (String(html || '').match(/<title[^>]*>([\s\S]{0,300}?)<\/title>/i)?.[1] || '').replace(/&amp;/g, '&').replace(/&#0?39;|&apos;/g, "'").replace(/&quot;/g, '"').replace(/\s+/g, ' ').trim()

export async function waybackHistory(site, { fetchImpl, titles = 6, timeout = 20000, pause = 600 } = {}) {
  const h = host(site)
  if (!h) return { ok: false, erreur: 'adresse invalide' }
  if (!fetchImpl) return { ok: false, erreur: 'lisible seulement en ligne de commande' }
  try {
    const r = await fetchImpl(`https://web.archive.org/cdx/search/cdx?url=${enc(h)}&output=json&fl=timestamp,statuscode,digest&filter=statuscode:200&collapse=timestamp:6&limit=400`, { headers: { 'user-agent': 'Mozilla/5.0' }, signal: AbortSignal.timeout(timeout) })
    if (!r.ok) return { ok: false, erreur: `HTTP ${r.status}` }
    const c = parseCdx(await r.text())
    if (!c) return { ok: false, erreur: 'réponse illisible' }
    const out = { ok: true, site: h, ...c, titres: [] }
    // Un titre par année (la dernière capture de l'année), espacés pour ménager le service ; on garde les plus récentes.
    const perYear = Object.values(Object.fromEntries((c._caps || []).map((x) => [x.timestamp.slice(0, 4), x]))).slice(-titles)
    for (const [i, cap] of perYear.entries()) {
      if (i) await sleep(pause)
      try {
        const p = await fetchImpl(`https://web.archive.org/web/${cap.timestamp}id_/https://${h}/`, { headers: { 'user-agent': 'Mozilla/5.0' }, signal: AbortSignal.timeout(timeout) })
        out.titres.push({ date: tsDate(cap.timestamp), titre: p.ok ? titleOf(await p.text()) || '(sans titre)' : `(HTTP ${p.status})`, url: `https://web.archive.org/web/${cap.timestamp}/https://${h}/` })
      } catch (e) { out.titres.push({ date: tsDate(cap.timestamp), titre: '(non lu)', url: `https://web.archive.org/web/${cap.timestamp}/https://${h}/` }) }
    }
    out.changementsDeTitre = out.titres.filter((t, i) => i && !/^\(/.test(t.titre) && !/^\(/.test(out.titres[i - 1].titre) && t.titre !== out.titres[i - 1].titre).map((t) => t.date)
    delete out._caps
    return out
  } catch (e) { return { ok: false, erreur: String(e?.message || e).slice(0, 80) } }
}

// ───────── 3. Common Crawl ─────────
// Le dernier index public ; puis jusqu'à 5 000 adresses du domaine. Compte les pages distinctes en 200 (sans les fichiers).
export function countCrawl(text) {
  const urls = new Set()
  let lines = 0
  for (const l of String(text || '').split('\n')) {
    if (!l.trim()) continue
    let j; try { j = JSON.parse(l) } catch { continue }
    lines++
    if (j.status !== '200' || !j.url) continue
    if (/\.(jpe?g|png|gif|webp|svg|css|js|pdf|zip|ico|woff2?|xml|txt|json)(\?|$)/i.test(j.url)) continue
    urls.add(j.url.replace(/^https?:\/\/(www\.)?/, '').replace(/[?#].*$/, '').replace(/\/$/, ''))
  }
  return { pages: urls.size, lignes: lines }
}
export async function commonCrawl(site, { fetchImpl, index, timeout = 30000, limit = 5000, retryPause = 3000 } = {}) {
  const h = host(site)
  if (!h) return { ok: false, erreur: 'adresse invalide' }
  if (!fetchImpl) return { ok: false, erreur: 'lisible seulement en ligne de commande' }
  try {
    let idx = index
    if (!idx) {
      const r = await fetchImpl('https://index.commoncrawl.org/collinfo.json', { signal: AbortSignal.timeout(timeout) })
      if (!r.ok) return { ok: false, erreur: `index : HTTP ${r.status}` }
      idx = JSON.parse(await r.text())?.[0]
      if (!idx?.id) return { ok: false, erreur: 'index introuvable' }
    }
    // Le serveur de Common Crawl répond souvent 503/504 sous la charge : une seconde tentative, 3 s plus tard.
    const q = () => fetchImpl(`https://index.commoncrawl.org/${enc(idx.id)}-index?url=${enc(h)}&matchType=domain&output=json&fl=url,status&limit=${limit}`, { signal: AbortSignal.timeout(timeout) }).catch((e) => ({ ok: false, status: 0, err: e }))
    let r = await q()
    if (!r.ok && (r.status >= 500 || r.status === 0)) { await sleep(retryPause); r = await q() }
    if (r.err) throw r.err
    const base = { index: idx.id, nom: idx.name || idx.id, periode: idx.from && idx.to ? `${String(idx.from).slice(0, 10)} → ${String(idx.to).slice(0, 10)}` : '' }
    if (r.status === 404) return { ok: true, site: h, ...base, pages: 0, lignes: 0, plafond: false }
    if (!r.ok) return { ok: false, erreur: `HTTP ${r.status}`, ...base }
    const c = countCrawl(await r.text())
    return { ok: true, site: h, ...base, ...c, plafond: c.lignes >= limit }
  } catch (e) { return { ok: false, erreur: String(e?.message || e).slice(0, 80) } }
}
export async function latestCrawlIndex({ fetchImpl, timeout = 30000 } = {}) {
  try { const r = await fetchImpl('https://index.commoncrawl.org/collinfo.json', { signal: AbortSignal.timeout(timeout) }); return r.ok ? JSON.parse(await r.text())?.[0] || null : null } catch { return null }
}

// ───────── Ensemble : vous + concurrents ─────────
// sites : [{ url, me, trackers, gtm }] (trackers et identifiants GTM viennent de l'audit de la page d'accueil).
export async function footprint(sites, { fetchImpl, onProgress, titles = 6 } = {}) {
  const index = fetchImpl ? await latestCrawlIndex({ fetchImpl }) : null
  const out = []
  for (const s of sites) {
    onProgress?.(`Empreinte de ${host(s.url)} : publicité, historique, pages vues par Common Crawl`)
    const [pub, wb, cc] = await Promise.all([
      adsFootprint(s, { fetchImpl }),
      waybackHistory(s.url, { fetchImpl, titles }),
      index ? commonCrawl(s.url, { fetchImpl, index }) : Promise.resolve({ ok: false, erreur: 'index Common Crawl illisible' }),
    ])
    out.push({ site: host(s.url), me: !!s.me, pub, wayback: wb, commoncrawl: cc })
  }
  return { type: 'seo360-empreinte', generatedAt: new Date().toISOString(), sites: out, constats: footprintFindings(out) }
}

// Constats comparatifs (vous contre eux), uniquement à partir de faits mesurés.
export function footprintFindings(sites) {
  const me = sites.find((s) => s.me), others = sites.filter((s) => !s.me)
  const L = []
  if (!me || !others.length) return L
  const regies = (s) => Object.keys(s.pub?.regies || {})
  for (const o of others) {
    const extra = regies(o).filter((r) => !regies(me).includes(r))
    if (extra.length) L.push(`${o.site} a un pixel ${extra.map((r) => AD_NETWORKS[r].label).join(', ')} : il fait (ou prépare) de la publicité là où vous n’en faites pas.`)
  }
  const ages = sites.filter((s) => s.wayback?.ok && s.wayback.premiere)
  const myAge = me.wayback?.ok ? me.wayback.premiere : null
  for (const o of ages.filter((s) => !s.me)) if (myAge && o.wayback.premiere < myAge) L.push(`${o.site} est archivé depuis ${o.wayback.premiere.slice(0, 4)}, vous depuis ${myAge.slice(0, 4)} : un site plus ancien a souvent plus de liens acquis.`)
  for (const o of others) if (o.wayback?.ok && o.wayback.changementsDeTitre?.length) L.push(`${o.site} a changé le titre de sa page d’accueil (${o.wayback.changementsDeTitre.map((d) => d.slice(0, 4)).join(', ')}) : repositionnement ou refonte, à regarder dans l’historique.`)
  const cc = sites.filter((s) => s.commoncrawl?.ok)
  const mine = me.commoncrawl?.ok ? me.commoncrawl.pages : null
  for (const o of cc.filter((s) => !s.me)) if (mine != null && o.commoncrawl.pages >= Math.max(10, mine * 2)) L.push(mine === 0
    ? `Common Crawl n’a vu aucune page de votre site lors de son dernier passage, contre ${o.commoncrawl.pages}${o.commoncrawl.plafond ? '+' : ''} chez ${o.site} : un site que peu de sites citent est moins visité par les robots (à vérifier dans Search Console, rapport « Liens »).`
    : `Common Crawl a vu ${o.commoncrawl.pages}${o.commoncrawl.plafond ? '+' : ''} pages chez ${o.site} contre ${mine} chez vous : plus de pages, c’est plus de requêtes possibles sur Google.`)
  return L
}

// ───────── Assainissement (rapport importé) et Markdown ─────────
const s = (v, n) => String(v ?? '').replace(/[\u0000-\u001f]/g, ' ').slice(0, n)
const n0 = (v) => Math.max(0, Math.min(1e7, Math.round(+v) || 0))
const day = (v) => (/^\d{4}-\d{2}-\d{2}$/.test(String(v || '')) ? v : null)
const wbUrl = (u) => (/^https:\/\/web\.archive\.org\/web\/\d{14}\/https:\/\/[a-z0-9.-]+\/$/i.test(String(u || '')) ? u : '')
export function sanitizeFootprint(f) {
  if (!f || typeof f !== 'object' || !Array.isArray(f.sites)) return null
  const sites = f.sites.slice(0, 6).map((x) => ({
    site: s(x?.site, 120).replace(/[^a-z0-9.-]/gi, ''), me: !!x?.me,
    pub: { regies: Object.fromEntries(Object.entries(x?.pub?.regies || {}).filter(([k]) => AD_NETWORKS[k]).map(([k, v]) => [k, { label: AD_NETWORKS[k].label, preuves: (v?.preuves || []).slice(0, 4).map((p) => s(p, 120)) }])),
      conteneurs: (x?.pub?.conteneurs || []).slice(0, 3).filter((c) => /^GTM-[A-Z0-9]{4,10}$/.test(c?.id)).map((c) => ({ id: c.id, ok: !!c.ok, ...(c.ok ? { regies: (c.regies || []).filter((k) => AD_NETWORKS[k]) } : { erreur: s(c.erreur, 60) }) })), verifie: !!x?.pub?.verifie },
    wayback: x?.wayback?.ok ? { ok: true, captures: n0(x.wayback.captures), premiere: day(x.wayback.premiere), derniere: day(x.wayback.derniere), versions: n0(x.wayback.versions), annees: (x.wayback.annees || []).filter((y) => /^\d{4}$/.test(y)).slice(0, 40),
      titres: (x.wayback.titres || []).slice(0, 10).map((t) => ({ date: day(t?.date), titre: s(t?.titre, 200), url: wbUrl(t?.url) })).filter((t) => t.date), changementsDeTitre: (x.wayback.changementsDeTitre || []).map(day).filter(Boolean).slice(0, 10) } : { ok: false, erreur: s(x?.wayback?.erreur || 'non vérifié', 80) },
    commoncrawl: x?.commoncrawl?.ok ? { ok: true, index: s(x.commoncrawl.index, 40), nom: s(x.commoncrawl.nom, 60), periode: s(x.commoncrawl.periode, 30), pages: n0(x.commoncrawl.pages), plafond: !!x.commoncrawl.plafond } : { ok: false, erreur: s(x?.commoncrawl?.erreur || 'non vérifié', 80) },
  })).filter((x) => x.site)
  return { type: 'seo360-empreinte', generatedAt: isNaN(Date.parse(f.generatedAt)) ? new Date().toISOString() : f.generatedAt, sites, constats: footprintFindings(sites) }
}

// Titres consécutifs identiques regroupés : « 2020–2026 « X » » plutôt que 6 fois le même titre.
export function titleRuns(titres = []) {
  const runs = []
  for (const t of titres) { const y = t.date.slice(0, 4), last = runs.at(-1); if (last && last.titre === t.titre) last.fin = y; else runs.push({ debut: y, fin: y, titre: t.titre }) }
  return runs
}
export function footprintMarkdown(f) {
  if (!f?.sites?.length) return ''
  const name = (x) => x.site + (x.me ? ' (vous)' : '')
  const pub = (x) => { const r = Object.values(x.pub?.regies || {}).map((v) => v.label); const unread = (x.pub?.conteneurs || []).filter((c) => !c.ok); return (r.length ? r.join(', ') : 'aucun pixel publicitaire') + (unread.length ? ` (conteneur ${unread.map((c) => c.id).join(', ')} non lu : à vérifier)` : '') }
  const wb = (x) => x.wayback?.ok ? (x.wayback.captures ? `depuis ${x.wayback.premiere?.slice(0, 4)} · ${x.wayback.captures} mois archivés` : 'jamais archivé') : `non vérifié (${x.wayback?.erreur})`
  const cc = (x) => x.commoncrawl?.ok ? (x.commoncrawl.pages ? `${x.commoncrawl.pages}${x.commoncrawl.plafond ? '+' : ''}` : 'absent de ce passage') : `non vérifié (${x.commoncrawl?.erreur})`
  const idx = f.sites.find((x) => x.commoncrawl?.ok)?.commoncrawl
  const L = ['## Empreinte marketing : publicité, historique, taille', '',
    `_Preuves publiques et gratuites, lues le ${f.generatedAt.slice(0, 10)}. Publicité : pixels de régies dans la page d’accueil et dans le conteneur Google Tag Manager (un pixel = la marque fait ou prépare de la publicité, pas un budget). Historique : Wayback Machine (une capture par mois). Pages : ${idx ? `Common Crawl, ${idx.nom} (${idx.periode})` : 'Common Crawl'}, un échantillon de ce robot public, pas le total du site._`, '',
    '| Site | Régies publicitaires | Historique (Wayback) | Pages vues par Common Crawl |', '|---|---|---|---:|',
    ...f.sites.map((x) => `| ${name(x)} | ${pub(x)} | ${wb(x)} | ${cc(x)} |`), '']
  if (f.constats?.length) L.push('**Ce que ça dit**', '', ...f.constats.map((c) => `- ${c}`), '')
  for (const x of f.sites.filter((y) => y.wayback?.ok && y.wayback.titres?.length)) L.push(`**Titre de la page d’accueil de ${name(x)}** : ${titleRuns(x.wayback.titres).map((r) => `${r.debut === r.fin ? r.debut : `${r.debut}–${r.fin}`} « ${r.titre} »`).join(' → ')}`, '')
  for (const x of f.sites) for (const [, v] of Object.entries(x.pub?.regies || {})) L.push(`- ${name(x)}, ${v.label} : ${v.preuves.join(' ; ')}`)
  L.push('')
  return L.join('\n')
}

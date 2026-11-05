// SEO 360 — interface (vanilla JS, modules ES, sans dépendance).
// Principes : aucune note sans mesure ; 3 actions claires par semaine ; correctif prêt à coller ;
// preuve du progrès d'un audit à l'autre ; tout reste dans le navigateur.
import { analyze, competitorSummary, detectKind, SEVERITY, GOALS } from './engine/index.js'
import { toMarkdown } from './engine/report.js'
import { generateHashtags } from './engine/hashtags.js'
import { planBudget } from './engine/ads.js'
import { keywordIdeas, googleSuggest, classify, INTENTS } from './engine/keywords.js'
import { actionPlan } from './engine/plan.js'
import { CHECKLISTS, GUIDE } from './engine/checklists.js'
import { buildFixes, suggestTitle, suggestDescription, facts } from './engine/fixes.js'
import { parseGsc, opportunities, readGscFile } from './engine/gsc.js'
import { encodeReport, decodeReport, slimForShare } from './engine/share.js'
import { bookmarkletCode, validateBundle, bundleFetcher } from './engine/bookmarklet.js'
import { extract } from './engine/html.js'
import { gloss, GLOSSARY } from './engine/glossary.js'
import { observedForHashtags } from './engine/veille.js'
import { SECTORS, sectorById } from './data/sectors.js'
import EXEMPLE from './data/exemple.js'
import market from './data/research/competitors.js'
import oss from './data/research/github-oss.js'
import bench from './data/research/benchmarks.js'

const $ = (s, el = document) => el.querySelector(s)
const $$ = (s, el = document) => [...el.querySelectorAll(s)]
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]))
const num = (v, d = 0) => (Number.isFinite(+v) ? +v : d)
const fmt = (n, d = 0) => (n == null || !Number.isFinite(+n) ? '—' : Number(n).toLocaleString('fr-FR', { maximumFractionDigits: d, minimumFractionDigits: d }))
const rng = (a, d = 0, suf = '') => (a && a[0] != null ? `${fmt(a[0], d)} – ${a[1] != null ? fmt(a[1], d) : '?'}${suf}` : '—')
const tryJ = (fn, d) => { try { return fn() } catch { return d } }
const store = { get: (k, d) => tryJ(() => JSON.parse(localStorage.getItem('seo360:' + k)) ?? d, d), set: (k, v) => tryJ(() => localStorage.setItem('seo360:' + k, JSON.stringify(v))), del: (k) => tryJ(() => localStorage.removeItem('seo360:' + k)) }
// Clés et jetons : seulement pour la session (l'origine github.io est partagée entre dépôts).
const sess = { get: (k) => tryJ(() => sessionStorage.getItem('seo360:' + k) || '', ''), set: (k, v) => tryJ(() => sessionStorage.setItem('seo360:' + k, v || '')) }
const color = (s) => (s == null ? 'var(--line)' : s >= 85 ? 'var(--ok)' : s >= 70 ? 'var(--accent-2)' : s >= 50 ? 'var(--mid)' : 'var(--crit)')
const meter = (n, label) => `<span class="meter" role="img" aria-label="${label} ${n} sur 5">${[1, 2, 3, 4, 5].map((i) => `<i class="${i <= n ? 'on' : ''}"></i>`).join('')}</span>`
const KIND = { site: 'Site web', app: 'Application', github: 'Dépôt GitHub' }
const targetKey = (t) => tryJ(() => { const u = new URL(/^https?:/.test(t) ? t : 'https://' + t); return u.host.replace(/^www\./, '') + u.pathname.replace(/\/$/, '') }, String(t))

const TABS = [['synthese', 'Synthèse'], ['afaire', 'À faire'], ['visibilite', 'Mots-clés & réseaux'], ['budget', 'Budget'], ['concurrents', 'Concurrents'], ['ressources', 'Ressources']]
const S = { report: null, fixes: {}, tab: 'synthese', res: 'favori', cat: '', sevs: new Set(['critique', 'important', 'moyen', 'faible']), suggestions: [], gsc: null, mk: 'outils', shared: false, busy: false }

// ───────── Formulaire ─────────
const form = $('#form')
$('#f-sector').innerHTML = `<option value="">Choisissez votre secteur…</option>` + SECTORS.map((s) => `<option value="${s.id}">${esc(s.label)}</option>`).join('')
$('#f-goal').innerHTML = Object.entries(GOALS).map(([k, v]) => `<option value="${k}">${esc(v)}</option>`).join('')
for (const [k, v] of Object.entries(store.get('form', {}))) { const el = form.elements[k]; if (el && el.type !== 'file' && !['html', 'psiKey', 'githubToken'].includes(k)) el.value = v }
form.elements.psiKey.value = sess.get('psiKey'); form.elements.githubToken.value = sess.get('githubToken')
const vals = () => {
  const o = Object.fromEntries(new FormData(form))
  return {
    ...o, sector: o.sector || 'autre', monthly: o.monthly === '' ? null : num(o.monthly), avgValue: num(o.avgValue), margin: o.margin === '' ? null : num(o.margin) / 100,
    closeRate: o.closeRate === '' ? null : num(o.closeRate) / 100, crawl: Math.max(0, Math.min(30, num(o.crawl, 8))), local: o.local === '' ? undefined : o.local === '1',
  }
}
const inputOf = (v) => ({ sector: v.sector, keyword: v.keyword.trim(), city: v.city.trim(), brand: v.brand.trim(), goal: v.goal, monthly: v.monthly, avgValue: v.avgValue, margin: v.margin, closeRate: v.closeRate, lang: v.lang, local: v.local })
const persist = () => { const v = Object.fromEntries(new FormData(form)); delete v.html; delete v.psiKey; delete v.githubToken; store.set('form', v) }
const updateKind = () => { $('#kind').textContent = KIND[detectKind(form.elements.url.value || 'exemple.fr')] }
form.addEventListener('input', (e) => {
  if (e.target.name === 'url') updateKind()
  if (e.target.name === 'psiKey' || e.target.name === 'githubToken') sess.set(e.target.name, e.target.value)
  persist()
  if (S.report && ['sector', 'city', 'brand', 'keyword', 'lang', 'goal', 'monthly', 'avgValue', 'margin', 'closeRate', 'local'].includes(e.target.name)) {
    Object.assign(S.report.input, inputOf(vals()))
    refreshDerived()
    if (['visibilite', 'budget', 'synthese'].includes(S.tab)) render()
  }
})
updateKind()

function refreshDerived() {
  const r = S.report
  if (!r) return
  const v = { ...r.input }
  const terms = r.result?.meta?.terms?.phrases?.map((t) => t.term).slice(0, 5) || []
  r.hashtags = generateHashtags({ sector: v.sector, keywords: [v.keyword].filter(Boolean), terms, city: v.city, brand: v.brand, lang: v.lang })
  r.keywords = keywordIdeas({ seed: v.keyword || terms[0] || '', sector: v.sector, city: v.city, local: v.local })
  r.budget = planBudget({ sector: v.sector, goal: r.kind === 'app' ? 'telechargements' : v.goal, monthly: v.monthly, local: v.local, avgValue: v.avgValue, margin: v.margin, closeRate: v.closeRate, targetConversions: store.get('target', 0), searchVolume: store.get('volume', 0), cpcOverride: store.get('cpc', 0) })
  r.plan = actionPlan(r.result, { local: v.local ?? sectorById(v.sector).local, hasAds: !!v.monthly, kind: r.kind })
  S.fixes = r.result ? buildFixes(r) : {}
}

// ───────── Progression & erreurs ─────────
const progress = (m, kind = '') => { const p = $('#progress'); p.textContent = m; p.className = 'progress ' + kind }
function showError(title, detail, actions = true) {
  progress(title, 'err')
  $('#view').innerHTML = `<div class="card alert" role="alert"><h2>${esc(title)}</h2>${detail ? `<p>${esc(detail)}</p>` : ''}${actions ? solutions() : ''}</div>`
  $('#view').scrollIntoView({ block: 'start' })
}
const solutions = () => `<div class="sol"><p><b>3 façons d’obtenir l’audit complet :</b></p><ol>
  <li><b>Le bouton-favori (recommandé)</b> : il lit votre page depuis votre propre site, sans intermédiaire. <a href="#ressources" data-res="favori">L’installer (30 s)</a></li>
  <li><b>Coller le code source</b> : sur votre page, clic droit → « Afficher le code source » → tout copier, puis collez-le dans « Plus d’options ». <button class="btn sm" type="button" data-open-paste>Coller le code</button></li>
  <li><b>La ligne de commande</b> (audit le plus complet, avec exploration du site) : <code>node seo/cli.mjs votre-site.fr</code></li></ol></div>`

// ───────── Collecte via proxy (navigateur) ─────────
const PROXIES = {
  allorigins: async (url, signal) => { const r = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(url)}`, { signal }); const j = await r.json(); return { status: j.status?.http_code || (j.contents ? 200 : 0), body: j.contents || '', finalUrl: j.status?.url || url, headers: {}, redirects: [] } },
  codetabs: async (url, signal) => { const r = await fetch(`https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(url)}`, { signal }); return { status: r.status, body: await r.text(), finalUrl: url, headers: {}, redirects: [] } },
}
function makeFetcher(v, pasted) {
  const order = v.proxy === 'custom' ? ['custom'] : v.proxy === 'none' ? [] : [v.proxy, ...Object.keys(PROXIES).filter((p) => p !== v.proxy)]
  return async (url, { noFollow = false } = {}) => {
    if (noFollow && v.proxy !== 'custom') return {} // redirections http/www : vérifiables seulement en CLI ou via votre proxy
    if (pasted && !noFollow && sameDoc(url, pasted.url)) return { status: 200, body: pasted.html, finalUrl: url, headers: {}, redirects: [] }
    for (const name of order) {
      const ctrl = new AbortController(), t = setTimeout(() => ctrl.abort(), 15000)
      try {
        if (name === 'custom') {
          if (!v.proxyUrl) break
          const r = await fetch(v.proxyUrl.replace('{url}', encodeURIComponent(url)) + (noFollow ? '&nofollow=1' : ''), { signal: ctrl.signal })
          const headers = {}
          for (const [k, val] of r.headers) if (k.startsWith('x-orig-')) headers[k.slice(7)] = val
          const status = num(r.headers.get('x-status') || r.status)
          if (noFollow) return { status, location: r.headers.get('x-location') || '' }
          const buf = await r.arrayBuffer(), cs = (headers['content-type'] || '').match(/charset=["']?([\w-]+)/i)?.[1] || 'utf-8'
          const body = tryJ(() => new TextDecoder(/^(iso-8859-1|latin1)$/i.test(cs) ? 'windows-1252' : cs).decode(buf), null) ?? new TextDecoder().decode(buf)
          return { status, headers, body, finalUrl: r.headers.get('x-final-url') || url, redirects: tryJ(() => JSON.parse(r.headers.get('x-redirects') || '[]'), []), timeMs: num(r.headers.get('x-time')), ttfbMs: num(r.headers.get('x-ttfb')) }
        }
        const res = await PROXIES[name](url, ctrl.signal)
        if (res.status) return res
      } catch { /* proxy suivant */ } finally { clearTimeout(t) }
    }
    return { status: 0, unknown: true }
  }
}
const sameDoc = (a, b) => tryJ(() => { const x = new URL(a), y = new URL(/^https?:/.test(b) ? b : 'https://' + b); return x.host.replace(/^www\./, '') === y.host.replace(/^www\./, '') && x.pathname.replace(/\/$/, '') === y.pathname.replace(/\/$/, '') }, false)

// ───────── Lancer une analyse ─────────
form.addEventListener('submit', (e) => { e.preventDefault(); run() })
async function run({ bundle } = {}) {
  if (S.busy) return
  const v = vals()
  const target = bundle ? bundle.url : v.url.trim()
  if (!target) { progress('Indiquez l’adresse de votre site, de votre application ou de votre dépôt GitHub.', 'err'); form.elements.url.focus(); return }
  if (!form.elements.sector.value && !bundle) { progress('Choisissez votre secteur : il sert aux mots-clés, hashtags et budgets.', 'err'); form.elements.sector.focus(); return }
  const kind = bundle ? 'site' : detectKind(target)
  const pasted = !bundle && v.html?.trim() ? { url: target, html: v.html } : null
  const fetcher = bundle ? bundleFetcher(bundle) : makeFetcher(v, pasted)
  const canRead = bundle || pasted || kind !== 'site' || v.proxy !== 'none'
  const input = inputOf(v)
  S.busy = true; $('#go').disabled = true; $('#go').textContent = 'Analyse…'
  const t0 = performance.now()
  let step = 'Préparation'
  const tick = setInterval(() => progress(`${step}… ${Math.round((performance.now() - t0) / 1000)} s`), 1000)
  try {
    const comps = kind === 'site' && !bundle ? (v.competitors || '').split(/\s*[\n,;]\s*/).map((s) => s.trim()).filter(Boolean).slice(0, 5) : []
    const source = bundle ? 'bookmarklet' : pasted ? 'paste' : v.proxy === 'custom' ? 'worker' : 'proxy'
    const common = { fetcher: canRead ? fetcher : null, noFetch: !canRead, source, psiKey: v.psiKey, githubToken: v.githubToken, input, onProgress: (m) => { step = m } }
    if (bundle?.rendered) common.rendered = { wordCount: extract(bundle.rendered, bundle.url).wordCount }
    const job = Promise.all([
      analyze(target, { ...common, kind, crawl: bundle ? bundle.pages.length + 1 : pasted || v.proxy === 'none' ? 0 : v.crawl }),
      ...comps.map((c) => analyze(c, { ...common, fetcher: v.proxy === 'none' ? null : makeFetcher(v, null), noFetch: v.proxy === 'none', source: 'proxy', kind: 'site', crawl: 0, rendered: null }).then((r) => competitorSummary(c, r)).catch((err) => ({ url: c, error: err.message, scores: {} }))),
    ])
    const timeout = new Promise((_, rej) => setTimeout(() => rej(new Error('L’analyse a dépassé 2 minutes (proxy ou PageSpeed trop lent).')), 120000))
    const [rep, ...compReps] = await Promise.race([job, timeout])
    if (comps.length) rep.competitors = compReps
    S.report = rep; S.suggestions = []; S.cat = ''; S.shared = false
    refreshDerived()
    remember(rep)
    const psiErr = rep.ctx?.psi?.error
    progress(rep.error ? rep.error : `Analyse terminée en ${Math.round((performance.now() - t0) / 1000)} s.${psiErr ? ' Vitesse non mesurée : ' + psiShort(psiErr) : ''}`, rep.error ? 'err' : 'ok')
    collapseHero(true)
    go('synthese')
    autoSuggest()
  } catch (err) {
    console.error(err)
    showError('L’analyse n’a pas abouti', err.message)
  } finally {
    clearInterval(tick); S.busy = false; $('#go').disabled = false; $('#go').textContent = 'Analyser'
  }
}
const psiShort = (e) => (/429|quota/i.test(e) ? 'quota PageSpeed atteint (ajoutez une clé gratuite dans « Plus d’options »).' : e)

// Historique : chaque audit d'une même adresse est comparé au précédent.
function remember(rep) {
  store.set('last', slimForShare(rep))
  const R = rep.result
  if (!R || R.global == null) return
  const k = 'hist:' + targetKey(rep.target)
  const hist = store.get(k, [])
  hist.push({ date: rep.generatedAt, global: R.global, coverage: R.coverage, issues: R.issues.map((i) => [i.id, i.sev, i.title]) })
  store.set(k, hist.slice(-12))
}
function progressSince(rep) {
  const hist = store.get('hist:' + targetKey(rep.target), [])
  if (hist.length < 2) return null
  const [prev, cur] = hist.slice(-2)
  const now = new Set(cur.issues.map((i) => i[0])), before = new Set(prev.issues.map((i) => i[0]))
  return { prev, cur, fixed: prev.issues.filter((i) => !now.has(i[0])), added: cur.issues.filter((i) => !before.has(i[0])), delta: cur.global - prev.global }
}

// ───────── Bouton-favori : réception des données ─────────
window.addEventListener('message', (e) => {
  if (!e.data || e.data.type !== 'seo360-bm') return
  if (!validateBundle(e.data)) return
  tryJ(() => e.source?.postMessage('seo360-ack', e.origin))
  if (S.bmUrl === e.data.url && S.busy) return
  S.bmUrl = e.data.url
  form.elements.url.value = e.data.url; updateKind()
  progress(`Données reçues de ${new URL(e.data.url).host} : ${e.data.pages.length + 1} page(s). Analyse…`)
  run({ bundle: e.data })
})

// ───────── Navigation ─────────
function renderTabs() {
  const R = S.report?.result
  const n = R ? R.issues.filter((i) => ['critique', 'important'].includes(i.sev) && !isDone(i.id)).length : 0
  $('#tabs').innerHTML = TABS.map(([id, label]) => `<button type="button" role="tab" data-tab="${id}" aria-selected="${S.tab === id}" tabindex="${S.tab === id ? 0 : -1}" ${S.tab === id ? 'aria-current="page"' : ''}>${label}${id === 'afaire' && n ? `<span class="count" aria-label="${n} points importants">${n}</span>` : ''}</button>`).join('')
  $(`#tabs [data-tab="${S.tab}"]`)?.scrollIntoView({ block: 'nearest', inline: 'center' })
}
$('#tabs').addEventListener('click', (e) => { const b = e.target.closest('[data-tab]'); if (b) go(b.dataset.tab) })
// Clavier : flèches gauche/droite, Début/Fin entre les onglets
$('#tabs').addEventListener('keydown', (e) => {
  const i = TABS.findIndex(([id]) => id === S.tab), n = TABS.length
  const j = e.key === 'ArrowRight' ? (i + 1) % n : e.key === 'ArrowLeft' ? (i - 1 + n) % n : e.key === 'Home' ? 0 : e.key === 'End' ? n - 1 : -1
  if (j < 0) return
  e.preventDefault(); go(TABS[j][0], { focus: false }); $(`#tabs [data-tab="${TABS[j][0]}"]`)?.focus()
})
function go(tab, { push = true, focus = true } = {}) {
  S.tab = tab
  if (push && location.hash !== '#' + tab) history.pushState({ tab }, '', '#' + tab)
  render()
  if (focus) { $('#view').focus({ preventScroll: true }); $('#view').scrollIntoView({ block: 'start' }) }
}
window.addEventListener('popstate', () => { const h = location.hash.slice(1); if (TABS.some(([id]) => id === h)) go(h, { push: false }) })

function render() {
  renderTabs()
  const fn = { synthese, afaire, visibilite, budget, concurrents, ressources }[S.tab] || synthese
  $('#view').innerHTML = fn()
  after[S.tab]?.()
}
const after = {}

function collapseHero(on) {
  $('#hero').classList.toggle('compact', on)
  $('#current').innerHTML = on && S.report ? `<span>Rapport : <b>${esc(S.report.target)}</b>${S.report.exemple ? ' <span class="chip tag">exemple fictif</span>' : S.shared ? ' <span class="chip tag">partagé</span>' : ''}</span><button class="btn sm" type="button" data-edit>Modifier / nouvelle analyse</button>` : ''
}
document.addEventListener('click', (e) => {
  const t = e.target
  if (t.closest('[data-edit]')) { collapseHero(false); form.elements.url.focus() }
  const g = t.closest('[data-go]'); if (g) { e.preventDefault(); go(g.dataset.go) }
  const rs = t.closest('[data-res]'); if (rs) { e.preventDefault(); S.res = rs.dataset.res; go('ressources') }
  if (t.closest('[data-open-paste]')) { collapseHero(false); $('details.more').open = true; form.elements.html.focus(); form.elements.html.scrollIntoView({ block: 'center' }) }
  const c = t.closest('[data-copy]'); if (c) copy(c.dataset.copy !== undefined && c.dataset.copy !== '' ? c.dataset.copy : c.closest('.code')?.querySelector('pre')?.textContent || '')
  const act = t.closest('[data-act]')?.dataset.act; if (act) action(act)
  if (t.closest('[data-exemple]')) { S.report = structuredClone(EXEMPLE); S.shared = true; refreshDerived(); syncForm(S.report); collapseHero(true); go('synthese'); progress('Exemple fictif : « Maison Exemple », pâtisserie à Lyon.', 'ok') }
})
function copy(t) { navigator.clipboard?.writeText(t).then(() => toast('Copié'), () => toast('Copie impossible : sélectionnez le texte')) }
function toast(m) { const d = document.createElement('div'); d.className = 'toast'; d.setAttribute('role', 'status'); d.textContent = m; document.body.append(d); setTimeout(() => d.remove(), 1800) }
function download(name, text, type) { const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([text], { type })); a.download = name; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 2000) }
const slug = () => String(S.report?.target || 'rapport').replace(/^https?:\/\//, '').replace(/[^a-z0-9]+/gi, '-').slice(0, 50)

async function action(a) {
  const r = S.report
  if (!r) return
  if (a === 'md') download(`seo360-${slug()}.md`, toMarkdown({ ...r, suggestions: S.suggestions }, { fixes: S.fixes, done: doneMap() }), 'text/markdown')
  if (a === 'json') download(`seo360-${slug()}.json`, JSON.stringify(r, null, 1), 'application/json')
  if (a === 'pdf') printReport()
  if (a === 'share') {
    try { const code = await encodeReport(r); const url = location.href.split('#')[0] + '#r=' + code; copy(url); toast(`Lien copié (${fmt(url.length)} caractères)`) } catch (err) { toast('Partage impossible : ' + err.message) }
  }
  if (a === 'recheck') { syncForm(r); run() }
  if (a === 'mail') copy(prestataireMessage())
}
function syncForm(r) {
  const i = r.input || {}
  for (const k of ['sector', 'keyword', 'city', 'brand', 'goal', 'lang']) if (i[k] != null && form.elements[k]) form.elements[k].value = i[k]
  for (const k of ['monthly', 'avgValue']) if (form.elements[k]) form.elements[k].value = i[k] ?? ''
  if (r.target) form.elements.url.value = r.target
  updateKind(); persist()
}
const reportBar = () => `<div class="actions">
  <button class="btn" data-act="pdf">Rapport PDF</button><button class="btn" data-act="share">Copier le lien de partage</button>
  <button class="btn" data-act="md">Markdown</button><button class="btn" data-act="json">JSON</button>${S.shared ? '' : '<button class="btn" data-act="recheck">Revérifier</button>'}</div>`

// ───────── Statuts « fait » (une seule source, par identifiant) ─────────
const doneKey = () => 'done:' + targetKey(S.report?.target || '')
const doneMap = () => store.get(doneKey(), {})
const isDone = (id) => !!doneMap()[id]
function setDone(id, v) { const d = doneMap(); if (v) d[id] = true; else delete d[id]; store.set(doneKey(), d) }

// ───────── Synthèse ─────────
function ring(score, grade) {
  const r = 70, c = 2 * Math.PI * r, off = score == null ? c : c * (1 - score / 100)
  return `<svg viewBox="0 0 170 170" role="img" aria-label="${score == null ? 'Pas de note : audit incomplet' : `Note ${score} sur 100`}"><circle cx="85" cy="85" r="${r}" fill="none" stroke="var(--surface-2)" stroke-width="16"/>${score == null ? '' : `<circle cx="85" cy="85" r="${r}" fill="none" stroke="${color(score)}" stroke-width="16" stroke-linecap="round" stroke-dasharray="${c}" stroke-dashoffset="${off}" transform="rotate(-90 85 85)"/>`}<text x="85" y="92" text-anchor="middle" class="num">${score == null ? '—' : score}</text><text x="85" y="118" text-anchor="middle" class="grade">${score == null ? 'non noté' : `/100 · ${grade}`}</text></svg>`
}
function synthese() {
  const r = S.report
  if (!r) return intro()
  const R = r.result
  if (!R) return `<div class="card alert" role="alert"><h2>${esc(r.target)}</h2><p>${esc(r.error || 'Aucun résultat')}</p></div>`
  const m = R.meta || {}, c = r.ctx || {}, psi = c.psi && !c.psi.error ? c.psi : null
  const week = r.plan?.week || []
  const prog = S.shared ? null : progressSince(r)
  const b = r.budget
  const gscOpp = S.gsc ? opportunities(S.gsc) : []
  const head = `<div class="section-head"><div><h2>${esc(r.target)}</h2><p>${KIND[r.kind]} · ${esc(sectorById(r.input.sector).label)}${r.input.city ? ' · ' + esc(r.input.city) : ''} · ${new Date(r.generatedAt).toLocaleString('fr-FR')}${c.fetch?.source ? ' · collecte : ' + esc(SOURCE[c.fetch.source] || c.fetch.source) : ''}</p></div>${reportBar()}</div>`
  const incomplete = R.incomplete ? `<div class="card alert" role="alert"><h3>Audit incomplet : ${esc(R.incomplete)}</h3><p>Nous n’affichons pas de note quand l’essentiel n’a pas pu être mesuré : elle serait trompeuse. Ce qui a été mesuré reste listé ci-dessous.</p>${solutions()}</div>` : ''
  const caps = (R.caps || []).length ? `<p class="cap">Note plafonnée : ${R.caps.map((x) => esc(x)).join(' · ')}</p>` : ''
  return `${head}${incomplete}
  <div class="summary">
    <div class="card ring">${ring(R.global, R.grade)}<p>${R.global == null ? 'Complétez la collecte pour obtenir une note.' : R.global >= 85 ? 'Excellent socle : place à la croissance.' : R.global >= 70 ? 'Bon niveau, quelques freins à lever.' : R.global >= 50 ? 'Des corrections importantes vont débloquer du trafic.' : 'Priorité : corriger les points critiques.'}</p>
      <p class="cover">Mesuré : <b>${Math.round((R.coverage || 0) * 100)} %</b> des contrôles${R.coverage < 1 ? ` <a href="#" data-go="afaire">(voir ce qui manque)</a>` : ''}</p>${caps}</div>
    <div class="card week"><h3>Vos 3 actions cette semaine</h3>
      ${week.length ? `<ol class="clean steps">${week.slice(0, 3).map((i) => `<li><div><b>${gloss(esc(i.title))}</b><p class="note">${esc(i.fix || '')}</p><p class="who"><span class="chip tag">${esc(i.who)}</span>${i.time ? ` <span class="chip tag">⏱ ${esc(i.time)}</span>` : ''}${S.fixes[i.id] ? ' <span class="chip ok-soft">correctif prêt</span>' : ''}</p></div></li>`).join('')}</ol>
      <div class="actions"><button class="btn primary" data-go="afaire">Voir les correctifs</button><button class="btn" data-act="mail">Copier le message pour mon prestataire</button></div>` : '<p>Rien d’urgent : place au contenu et à la visibilité.</p>'}</div>
  </div>
  <div class="cols" style="margin-top:16px">
    ${c.page ? serpCard(r) : ''}
    ${prog ? `<div class="card"><h3>Vos progrès</h3><p class="big">${prog.delta >= 0 ? '▲' : '▼'} ${fmt(prog.prev.global)} → <b>${fmt(prog.cur.global)}</b> <span class="note">depuis le ${new Date(prog.prev.date).toLocaleDateString('fr-FR')}</span></p><p>✅ ${prog.fixed.length} point(s) corrigé(s)${prog.fixed.length ? ' : ' + prog.fixed.slice(0, 4).map((i) => esc(i[2])).join(' · ') : ''}</p>${prog.added.length ? `<p>🆕 ${prog.added.length} nouveau(x) : ${prog.added.slice(0, 3).map((i) => esc(i[2])).join(' · ')}</p>` : ''}</div>` : ''}
    <div class="card"><h3>Budget publicitaire</h3><p class="verdict v-${b.verdict.level}">${esc(b.verdict.text)}</p><p><a href="#budget" data-go="budget">Détail par canal et montée en charge →</a></p></div>
    <div class="card"><h3>Vos vraies données Google</h3>${gscOpp.length ? `<p class="big">≈ +${fmt(gscOpp.reduce((s, o) => s + o.gain, 0))} clics/mois possibles</p><p class="note">sur ${gscOpp.length} requêtes déjà proches du haut de page (Search Console).</p><a href="#visibilite" data-go="visibilite">Voir les requêtes →</a>` : `<p class="note">Importez l’export « Requêtes » de Search Console : nous chiffrons les clics à gagner sur les requêtes où vous êtes déjà en page 1–2.</p><a href="#visibilite" data-go="visibilite">Importer (2 min) →</a>`}</div>
  </div>
  <div class="card" style="margin-top:16px"><h3>Scores par catégorie</h3><div class="bars">${Object.entries(R.scores).map(([k, s]) => `<div class="bar"><span class="lbl"><a href="#afaire" data-cat="${esc(k)}">${esc(s.label)}</a>${s.estimated ? '<small>(estimé)</small>' : ''}</span><span class="track"><span class="fill" style="width:${s.score ?? 0}%;background:${color(s.score)}"></span></span><b>${s.score == null ? '<span class="note">non mesuré</span>' : s.score}</b></div>`).join('')}</div>
    <div class="chips">${['critique', 'important', 'moyen', 'faible', 'ok'].map((s) => `<span class="chip sev-${s}">${SEVERITY[s].label} · ${R.counts[s]}</span>`).join('')}</div></div>
  ${r.kind === 'site' ? `<div class="kpis">${[['Vitesse mobile (Lighthouse)', psi?.scores?.performance ?? '—'], ['LCP réel', psi?.field?.LCP ? fmt(psi.field.LCP / 1000, 1) + ' s' : '—'], ['INP réel', psi?.field?.INP ? psi.field.INP + ' ms' : '—'], ['Mots sur la page', c.page?.wordCount ?? '—'], ['Pages lues', c.crawl?.pages?.filter((x) => x.status === 200).length ?? (c.page ? 1 : 0)], ['Points validés', R.counts.ok]].map(([k, v]) => `<div class="kpi"><div class="v">${v}</div><div class="k">${gloss(esc(k))}</div></div>`).join('')}</div>` : `<div class="card" style="margin-top:16px">${metaFacts(m)}</div>`}
  ${r.kind === 'site' && c.page ? `<details class="card fold"><summary><h3>La page en bref, technologies et robots IA</h3></summary>${siteFacts(r)}${m.bots ? `<div class="table-wrap"><table><caption class="sr">Accès des robots</caption><thead><tr><th>Robot</th><th>Usage</th><th>Accès</th></tr></thead><tbody>${m.bots.map((x) => `<tr><td><code>${esc(x.ua)}</code></td><td>${esc(x.owner)}</td><td>${x.allowed ? '<span class="chip sev-ok">autorisé</span>' : '<span class="chip sev-critique">bloqué</span>'}</td></tr>`).join('')}</tbody></table></div>` : ''}</details>` : ''}`
}
const SOURCE = { node: 'ligne de commande', worker: 'votre proxy', proxy: 'proxy public', paste: 'code collé', bookmarklet: 'bouton-favori', psi: 'PageSpeed seul' }
after.synthese = () => {
  $$('[data-cat]').forEach((a) => a.addEventListener('click', (e) => { e.preventDefault(); S.cat = a.dataset.cat; go('afaire') }))
}
function serpCard(r) {
  const f = facts(r), p = r.ctx.page
  const host = tryJ(() => new URL(r.ctx.fetch?.finalUrl || r.target), null)
  const crumb = host ? `${host.host}${host.pathname !== '/' ? ' › ' + host.pathname.split('/').filter(Boolean).join(' › ') : ''}` : ''
  const t = suggestTitle(f), d = suggestDescription(f)
  const snip = (title, desc) => `<div class="serp"><div class="crumb">${esc(crumb)}</div><div class="st">${esc(title.length > 62 ? title.slice(0, 60) + '…' : title)}</div><div class="sd">${esc(desc.length > 158 ? desc.slice(0, 155) + '…' : desc)}</div></div>`
  return `<div class="card"><h3>Votre résultat dans Google</h3><p class="note">Aujourd’hui</p>${snip(p.title || '(sans titre)', p.metaDescription || '(Google choisit un extrait au hasard de la page)')}
    <p class="note" style="margin-top:10px">Proposé (à relire)</p>${snip(t, d)}<button class="btn sm" data-copy="${esc(`<title>${t}</title>\n<meta name="description" content="${d.replace(/"/g, '&quot;')}">`)}">Copier le titre et la description</button></div>`
}
function siteFacts(r) {
  const p = r.ctx?.page, m = r.result.meta || {}
  const row = (k, v) => `<tr><th>${k}</th><td>${v || '<span class="note">—</span>'}</td></tr>`
  return `<div class="table-wrap"><table><tbody>
    ${row('Titre', esc(p.title) + (p.title ? ` <span class="note">(${p.title.length} car.)</span>` : ''))}
    ${row('Description', esc(p.metaDescription) + (p.metaDescription ? ` <span class="note">(${p.metaDescription.length} car.)</span>` : ''))}
    ${row('H1', esc(p.h?.find((h) => h.level === 1)?.text))}
    ${row('CMS / techno', esc(m.cms?.join(', ')))}${row('Mesure & pixels', esc(m.trackers?.join(', ')))}${row('Bandeau cookies', esc(m.cmp?.join(', ')))}
    ${row('Schema.org', esc(m.schemaTypes?.join(', ')))}${row('Réseaux liés', esc(Object.keys(m.social || {}).join(', ')))}
    ${row('Sujets détectés', esc([...(m.terms?.phrases || []), ...(m.terms?.words || [])].slice(0, 6).map((t) => t.term).join(' · ')))}
  </tbody></table></div>`
}
function metaFacts(m) {
  return `<h3>Fiche</h3><div class="table-wrap"><table><tbody>${Object.entries(m).filter(([, v]) => v != null && typeof v !== 'object').map(([k, v]) => `<tr><th>${esc(k)}</th><td>${esc(v)}</td></tr>`).join('')}${m.topics ? `<tr><th>topics</th><td>${m.topics.map((t) => `<span class="chip tag">${esc(t)}</span>`).join(' ')}</td></tr>` : ''}</tbody></table></div>`
}
function intro() {
  const last = store.get('last')
  return `<div class="cols3 intro">
    <div class="card"><h3>1. Un diagnostic honnête</h3><p class="note">Technique, contenu, vitesse réelle, visibilité dans les IA, SEO local, RGPD. Pas de note sans mesure.</p></div>
    <div class="card"><h3>2. Des correctifs prêts à coller</h3><p class="note">Titre, description, données structurées, robots.txt… construits à partir de votre page, avec qui s’en charge et combien de temps.</p></div>
    <div class="card"><h3>3. Un budget et la preuve du progrès</h3><p class="note">Combien investir en publicité et si c’est rentable ; à chaque nouvel audit : points corrigés et évolution de la note.</p></div>
  </div>
  <div class="actions" style="margin-top:16px"><button class="btn" data-exemple>Voir un exemple de rapport</button>${last ? `<button class="btn" id="restore">Rouvrir : ${esc(last.target)}</button>` : ''}<a class="btn" href="#ressources" data-res="favori">Installer le bouton-favori</a></div>`
}
const _afterSyn = after.synthese
after.synthese = () => { _afterSyn(); $('#restore')?.addEventListener('click', () => { S.report = tryJ(() => sanitizeReport(store.get('last')), null); if (!S.report) return; refreshDerived(); syncForm(S.report); collapseHero(true); render() }) }

function prestataireMessage() {
  const r = S.report, items = (r.plan?.steps || []).flatMap((s) => s.items.filter((i) => !isDone(i.id)).map((i) => ({ ...i, step: s.title }))).filter((i) => i.who !== 'Vous')
  return `Bonjour,\n\nVoici les corrections à faire sur ${r.target} (audit SEO 360 du ${new Date(r.generatedAt).toLocaleDateString('fr-FR')}), par ordre de priorité :\n\n${items.slice(0, 15).map((i, n) => `${n + 1}. ${i.title}\n   → ${i.fix}${S.fixes[i.id] ? `\n   Code proposé :\n${S.fixes[i.id].value.split('\n').map((l) => '     ' + l).join('\n')}` : ''}`).join('\n\n')}\n\nPouvez-vous me dire le délai et le coût ? Merci !`
}

// ───────── À faire (liste unique) ─────────
function afaire() {
  const r = S.report
  if (!r?.result) return needReport('À faire')
  const R = r.result, done = doneMap()
  const visible = (i) => (!S.cat || i.cat === S.cat) && (!i.sev || S.sevs.has(i.sev) || i.extra)
  const all = r.plan.steps.flatMap((s) => [...s.items, ...s.extra])
  const nDone = all.filter((i) => done[i.id]).length
  const cats = Object.entries(R.scores).filter(([, s]) => s.issues)
  return `<div class="section-head"><div><h2>À faire</h2><p>${nDone}/${all.length} fait · cochez au fur et à mesure (enregistré sur cet appareil). Cliquez une ligne pour le correctif.</p></div><div class="actions"><button class="btn" data-act="mail">Copier le message pour mon prestataire</button>${reportBar()}</div></div>
  <div class="progressbar" role="progressbar" aria-valuenow="${nDone}" aria-valuemin="0" aria-valuemax="${all.length}" aria-label="Avancement"><span style="width:${all.length ? (nDone / all.length) * 100 : 0}%"></span></div>
  <div class="filters" role="group" aria-label="Filtrer par catégorie"><button class="chip tag" data-fcat="" aria-pressed="${!S.cat}">Toutes</button>${cats.map(([k, v]) => `<button class="chip tag" data-fcat="${esc(k)}" aria-pressed="${S.cat === k}">${esc(v.label)} · ${v.issues}</button>`).join('')}</div>
  <div class="filters" role="group" aria-label="Filtrer par gravité">${['critique', 'important', 'moyen', 'faible'].map((s) => `<button class="chip sev-${s}" data-fsev="${s}" aria-pressed="${S.sevs.has(s)}">${SEVERITY[s].label} · ${R.counts[s]}</button>`).join('')}</div>
  ${r.plan.steps.map((s) => { const items = [...s.items, ...s.extra].filter(visible); return items.length ? `<section class="step"><h3>${esc(s.title)} <span class="pct">${items.filter((i) => done[i.id]).length}/${items.length}</span></h3><p class="why">${esc(s.why)}</p><div class="issues">${items.map((i) => item(i, done)).join('')}</div></section>` : '' }).join('')}
  ${R.passed.length ? `<details class="card fold"><summary><h3>Déjà bien (${R.passed.length})</h3></summary><ul class="clean">${R.passed.map((p) => `<li><span class="chip sev-ok">OK</span> ${gloss(esc(p.title))}</li>`).join('')}</ul></details>` : ''}
  ${R.infos.length ? `<details class="card fold" open><summary><h3>Non vérifié ou à vérifier hors site (${R.infos.length})</h3></summary><ul class="clean">${R.infos.map((p) => `<li><span class="chip sev-info">À vérifier</span> <b>${gloss(esc(p.title))}</b>${p.detail ? ` — <span class="note">${esc(p.detail)}</span>` : ''}${p.fix ? `<br><span class="note">${esc(p.fix)}</span>` : ''}</li>`).join('')}</ul></details>` : ''}`
}
function item(i, done) {
  const fx = S.fixes[i.id], d = !!done[i.id]
  if (i.extra) return `<div class="issue extra ${d ? 'is-done' : ''}"><label class="row"><input type="checkbox" data-done="${esc(i.id)}" ${d ? 'checked' : ''}><span class="t">${gloss(esc(i.title))}</span><span class="m"><span class="chip tag">${esc(i.who)}</span></span></label></div>`
  return `<details class="issue ${i.sev} ${d ? 'is-done' : ''}">
    <summary><input type="checkbox" data-done="${esc(i.id)}" ${d ? 'checked' : ''} aria-label="Marquer comme fait : ${esc(i.title)}"><span class="chip sev-${i.sev}">${SEVERITY[i.sev].label}</span><span class="t">${gloss(esc(i.title))}</span><span class="m"><span class="chip tag">${esc(i.who)}</span><span class="chip tag">⏱ ${esc(i.time)}</span>${fx || i.code ? '<span class="chip ok-soft">correctif prêt</span>' : ''}</span></summary>
    <div class="body">${i.detail ? `<p>${gloss(esc(i.detail))}</p>` : ''}${i.fix ? `<div class="fix"><b>À faire :</b> ${gloss(esc(i.fix))}</div>` : ''}
      ${fx ? `<div class="code"><p class="note"><b>${esc(fx.label)}</b>${fx.note ? ' — ' + esc(fx.note) : ''}</p><pre>${esc(fx.value)}</pre><button class="btn sm" data-copy="">Copier</button></div>` : i.code ? `<div class="code"><pre>${esc(i.code)}</pre><button class="btn sm" data-copy="">Copier</button></div>` : ''}
      <p class="note">Impact ${meter(i.impact, 'impact')} · Effort ${meter(i.effort, 'effort')} · ${esc(i.cat)} · <a href="${esc(reportIssueUrl(i))}" target="_blank" rel="noopener">Ce constat est faux ?</a></p></div></details>`
}
after.afaire = () => {
  $$('[data-fcat]').forEach((b) => b.addEventListener('click', () => { S.cat = b.dataset.fcat; render() }))
  $$('[data-fsev]').forEach((b) => b.addEventListener('click', () => { const s = b.dataset.fsev; S.sevs.has(s) ? S.sevs.delete(s) : S.sevs.add(s); render(); $(`[data-fsev="${s}"]`)?.focus() }))
  $$('[data-done]').forEach((c) => {
    c.addEventListener('click', (e) => e.stopPropagation())
    c.addEventListener('change', () => {
      setDone(c.dataset.done, c.checked)
      c.closest('.issue')?.classList.toggle('is-done', c.checked)
      renderTabs()
      const all = $$('[data-done]'), n = all.filter((x) => x.checked).length
      const pb = $('.progressbar'); if (pb) { pb.setAttribute('aria-valuenow', n); pb.firstElementChild.style.width = (n / all.length) * 100 + '%' }
    })
  })
}
const reportIssueUrl = (i) => `https://github.com/valeriongg/rgte-redesign/issues/new?title=${encodeURIComponent('[SEO 360] Constat à revoir : ' + i.id)}&body=${encodeURIComponent(`Constat : ${i.title}\nIdentifiant : ${i.id}\nCatégorie : ${i.cat}\n\nPourquoi c’est faux (URL de la page si possible) :\n`)}`
const needReport = (what) => `<div class="card empty"><h2>${what}</h2><p>Lancez une analyse ci-dessus, ou <button class="btn sm" data-exemple>voyez un exemple</button>.</p><p class="note">Sans analyse, vous pouvez déjà utiliser : <a href="#visibilite" data-go="visibilite">Mots-clés & réseaux</a> · <a href="#budget" data-go="budget">Budget</a> · <a href="#ressources" data-go="ressources">Ressources</a></p></div>`

// ───────── Mots-clés & réseaux ─────────
function visibilite() {
  const v = vals(), r = S.report
  const terms = r?.result?.meta?.terms
  const seed = v.keyword || terms?.phrases?.[0]?.term || sectorById(v.sector).keywords[0]
  const k = keywordIdeas({ seed, sector: v.sector, city: v.city, local: v.local })
  const opp = S.gsc ? opportunities(S.gsc) : []
  const extra = store.get('hkw', '')
  const h = generateHashtags({ sector: v.sector, keywords: [v.keyword, ...extra.split(',')].filter((x) => x && x.trim()), terms: terms?.phrases?.map((t) => t.term).slice(0, 5) || [], city: v.city, brand: v.brand, lang: v.lang, observed: observedForHashtags(S.veille) })
  const nets = Object.values(h.networks).sort((a, b) => (h.priority.indexOf(a.id) + 1 || 99) - (h.priority.indexOf(b.id) + 1 || 99))
  return `<div class="section-head"><div><h2>Mots-clés & réseaux</h2><p>Vos vraies requêtes d’abord, puis les idées, puis les hashtags par réseau.</p></div></div>
  <div class="card"><h3>Vos vraies requêtes Google (Search Console)</h3>
    ${opp.length ? `<p>≈ <b>+${fmt(opp.reduce((s, o) => s + o.gain, 0))} clics/mois</b> possibles (estimation prudente si chaque requête gagne le top 3).</p><div class="table-wrap"><table><thead><tr><th>${S.gsc.kind === 'pages' ? 'Page' : 'Requête'}</th><th class="n">Position</th><th class="n">Impressions</th><th class="n">CTR</th><th class="n">Gain ≈ clics/mois</th><th>Action</th></tr></thead><tbody>${opp.map((o) => `<tr><td>${esc(o.key)}</td><td class="n">${fmt(o.position, 1)}</td><td class="n">${fmt(o.impressions)}</td><td class="n">${fmt(o.ctr * 100, 1)} %</td><td class="n"><b>+${fmt(o.gain)}</b></td><td class="note">${esc(o.action)}</td></tr>`).join('')}</tbody></table></div><p class="note">Courbe de clics prudente (sans résumé IA). Période supposée : 3 mois (export par défaut).</p>`
      : `<p class="note">Search Console → Performances → Exporter → « Télécharger au format CSV », puis importez le fichier .zip tel quel. Rien n’est envoyé : il est lu dans votre navigateur.</p>`}
    <div class="row-inputs"><label>Export Search Console (.zip ou .csv)<input type="file" id="gsc-file" accept=".zip,.csv,text/csv,application/zip"></label>${S.gsc ? '<button class="btn sm" id="gsc-clear" type="button">Retirer les données</button>' : ''}</div></div>
  ${veillePanel()}
  <div class="card" style="margin-top:16px"><div class="section-head"><h3>Idées de mots-clés autour de « ${esc(seed)} »</h3><button class="btn" id="suggest" type="button">${S.suggestions.length ? 'Recharger' : 'Charger'} les suggestions Google</button></div>
    ${S.suggestions.length ? `<p><b>Suggestions Google réelles</b> (ce que les gens tapent) :</p><div class="tags">${S.suggestions.map((s) => `<span class="chip tag" title="${esc(classify(s))}">${esc(s)}</span>`).join('')}</div><button class="btn sm" data-copy="${esc(S.suggestions.join('\n'))}">Copier</button>` : ''}
    <div class="cols" style="margin-top:12px">${Object.entries(k.groups).map(([intent, list]) => `<div><h4>${intent[0].toUpperCase() + intent.slice(1)}</h4><p class="note">${esc(INTENTS[intent])}</p><div class="tags">${list.map((x) => `<span class="chip tag">${esc(x.keyword)}</span>`).join('')}</div></div>`).join('')}</div>
    ${terms ? `<p class="note" style="margin-top:12px"><b>Sujets que Google lit sur votre page :</b> ${esc([...terms.phrases, ...terms.words].slice(0, 12).map((t) => t.term).join(' · '))}</p>` : ''}
    <details><summary class="note">Outils de volume et de tendances</summary><ul class="clean">${k.tools.map((t) => `<li><a href="${esc(t.url)}" target="_blank" rel="noopener">${esc(t.name)}</a></li>`).join('')}</ul></details></div>
  <div class="section-head" style="margin-top:22px"><div><h3>Hashtags par réseau (règles 2026)</h3><p class="note">${esc(h.sector)}${v.city ? ' · ' + esc(v.city) : ''}. Les réseaux prioritaires pour votre secteur sont en premier.</p></div>
    <label style="min-width:260px">Mots-clés en plus (séparés par des virgules)<input id="hkw" value="${esc(extra)}" placeholder="ex. vitrine pâtissière"></label></div>
  <div class="cols">${nets.map((n, idx) => `<details class="card net" ${idx < 2 ? 'open' : ''}><summary><h3>${esc(n.label)} ${h.priority.includes(n.id) ? '<span class="prio">prioritaire</span>' : ''}</h3><span class="tags">${n.tags.map((t) => tagLink(n.id, t)).join('')}</span></summary>
    <div class="actions"><button class="btn sm" data-copy="${esc(n.tags.map((t) => '#' + t.camel).join(' '))}">Copier les hashtags</button><button class="btn sm" data-copy="${esc(n.caption)}">Copier un modèle de légende</button></div>
    ${n.reserve.length ? `<p class="note">À faire tourner d’un post à l’autre :</p><div class="tags">${n.reserve.slice(0, 10).map((t) => `<span class="htag res">#${esc(t.camel)}</span>`).join('')}</div>` : ''}
    ${n.rules ? `<dl><dt>Limite</dt><dd>${esc(n.rules.hashtag_limit)}</dd><dt>Placement</dt><dd>${esc(n.rules.placement)}</dd><dt>Rythme</dt><dd>${esc(n.rules.posting_frequency)}</dd><dt>Moments</dt><dd>${esc(n.rules.best_times_fr)}</dd><dt>Formats</dt><dd>${esc((n.rules.best_formats || []).join(' · '))}</dd></dl>` : ''}</details>`).join('')}</div>
  <div class="card" style="margin-top:16px"><h3>À ne jamais utiliser</h3><p class="note">Hashtags d’engagement artificiel : signal de spam, portée réduite.</p><div class="tags">${h.banned.map((t) => `<span class="chip sev-critique">#${esc(t)}</span>`).join('')}</div></div>`
}
after.visibilite = () => {
  $('#veille-file')?.addEventListener('change', async (e) => {
    const f = e.target.files[0]; if (!f) return
    try { const d = JSON.parse(await f.text()); if (d?.type !== 'seo360-veille') throw new Error(); S.veille = sanitizeVeille(d); store.set('veille', S.veille); render() } catch { toast('Fichier de veille invalide : utilisez celui produit par « node seo/cli.mjs veille »') }
  })
  $('#veille-clear')?.addEventListener('click', () => { S.veille = null; store.del('veille'); render() })
  $('#hkw')?.addEventListener('change', (e) => { store.set('hkw', e.target.value); render() })
  $('#suggest')?.addEventListener('click', autoSuggest)
  $('#gsc-file')?.addEventListener('change', async (e) => {
    const f = e.target.files[0]; if (!f) return
    let p
    try { p = parseGsc((await readGscFile(await f.arrayBuffer())).text) } catch (err) { toast(err.message); return }
    if (p.error) { toast(p.error); return }
    S.gsc = p; if (S.report) store.set('gsc:' + targetKey(S.report.target), p); render()
  })
  $('#gsc-clear')?.addEventListener('click', () => { S.gsc = null; if (S.report) store.del('gsc:' + targetKey(S.report.target)); render() })
}
async function autoSuggest() {
  const v = vals(), seed = v.keyword || S.report?.result?.meta?.terms?.phrases?.[0]?.term || sectorById(v.sector).keywords[0]
  const btn = $('#suggest'); if (btn) { btn.disabled = true; btn.textContent = 'Interrogation de Google…' }
  S.suggestions = await googleSuggest(seed).catch(() => [])
  if (S.report) S.report.suggestions = S.suggestions
  if (S.tab === 'visibilite') render()
}

// ───────── Veille sociale (Agent Reach) ─────────
const httpUrl = (u) => (/^https?:\/\//i.test(u || '') ? u : '')
function sanitizeVeille(d) {
  const s = (v, n = 300) => String(v ?? '').slice(0, n), n0 = (v) => (Number.isFinite(+v) ? +v : 0)
  return {
    type: 'seo360-veille', sujet: s(d.sujet, 120), marque: s(d.marque, 80), generatedAt: isNaN(Date.parse(d.generatedAt)) ? '' : d.generatedAt, total: n0(d.total),
    sources: (d.sources || []).slice(0, 30).map((x) => ({ channel: s(x.channel, 30), action: s(x.action, 30), query: s(x.query, 120), ok: !!x.ok, count: n0(x.count), error: x.error ? { code: s(x.error.code, 40), hint: s(x.error.hint || x.error.message, 300) } : null })),
    questions: (d.questions || []).slice(0, 40).map((q) => ({ question: s(q.question, 200), url: httpUrl(s(q.url, 500)), channel: s(q.channel, 30) })),
    hashtags: (d.hashtags || []).filter((h) => /^[a-z0-9_]{2,40}$/.test(h.tag)).slice(0, 40).map((h) => ({ tag: h.tag, camel: s(h.camel, 45), count: n0(h.count), channels: (h.channels || []).slice(0, 6).map((c) => s(c, 30)) })),
    termes: { phrases: (d.termes?.phrases || []).slice(0, 20).map((t) => ({ term: s(t.term, 60), count: n0(t.count) })), words: (d.termes?.words || []).slice(0, 20).map((t) => ({ term: s(t.term, 40), count: n0(t.count) })) },
    top: (d.top || []).slice(0, 15).map((t) => ({ title: s(t.title, 200), url: httpUrl(s(t.url, 500)), channel: s(t.channel, 30), engagement: n0(t.engagement) })),
    mentions: (d.mentions || []).slice(0, 20).map((m) => ({ title: s(m.title, 200), url: httpUrl(s(m.url, 500)), channel: s(m.channel, 30) })),
    recommandations: (d.recommandations || []).slice(0, 10).map((r) => s(r, 400)),
  }
}
const link = (url, text) => (url ? `<a href="${esc(url)}" target="_blank" rel="noopener nofollow">${esc(text)}</a>` : esc(text))
function veillePanel() {
  const v = S.veille
  const howto = `<div class="code"><pre>node seo/cli.mjs veille "${esc(vals().keyword || sectorById(vals().sector).keywords[0])}" --sources reddit,youtube,web${vals().brand ? ` --marque "${esc(vals().brand)}"` : ''}</pre><button class="btn sm" data-copy="">Copier</button></div>`
  if (!v) return `<div class="card" style="margin-top:16px"><h3>Ce que disent vraiment les internautes (veille Agent Reach)</h3>
    <p class="note">Avec <a href="https://github.com/Panniantong/Agent-Reach" target="_blank" rel="noopener">Agent Reach</a> installé sur votre ordinateur (gratuit, lecture seule), une commande lit Reddit, YouTube, X, GitHub et le web sur votre sujet : vraies questions des gens, hashtags réellement utilisés, expressions qui reviennent. Importez ensuite le fichier ici : les hashtags observés deviennent prioritaires.</p>${howto}
    <div class="row-inputs"><label>Fichier de veille (.json)<input type="file" id="veille-file" accept=".json,application/json"></label></div></div>`
  return `<div class="card" style="margin-top:16px"><div class="section-head"><h3>Veille « ${esc(v.sujet)} » : ${fmt(v.total)} publications lues</h3><button class="btn sm" id="veille-clear" type="button">Retirer</button></div>
    ${v.recommandations.length ? `<ul class="clean">${v.recommandations.map((r) => `<li>• ${esc(r)}</li>`).join('')}</ul>` : ''}
    <div class="cols" style="margin-top:12px">
      <div><h4>Questions des internautes</h4><ul class="clean">${v.questions.slice(0, 12).map((q) => `<li>${link(q.url, q.question)} <span class="note">· ${esc(q.channel)}</span></li>`).join('') || '<li class="note">Aucune question trouvée.</li>'}</ul></div>
      <div><h4>Hashtags observés (nombre de publications)</h4><div class="tags">${v.hashtags.slice(0, 20).map((h) => `<span class="htag">#${esc(h.camel)} <small style="display:inline">${h.count}</small></span>`).join('') || '<span class="note">Aucun hashtag dans ces publications.</span>'}</div>
        ${v.termes.phrases.length ? `<h4 style="margin-top:12px">Expressions récurrentes</h4><div class="tags">${v.termes.phrases.slice(0, 12).map((t) => `<span class="chip tag">${esc(t.term)} · ${t.count}</span>`).join('')}</div>` : ''}</div>
    </div>
    ${v.top.length ? `<details><summary class="note">Publications qui marchent (${v.top.length})</summary><ul class="clean">${v.top.map((t) => `<li><span class="chip tag">${esc(t.channel)}</span> ${link(t.url, t.title)}</li>`).join('')}</ul></details>` : ''}
    ${v.sources.some((x) => !x.ok) ? `<p class="note">Sources non lues : ${v.sources.filter((x) => !x.ok).map((x) => `${esc(x.channel)} (${esc(x.error?.code || 'erreur')})`).join(', ')}.</p>` : ''}</div>`
}

// ───────── Budget ─────────
// Lien vers la page du hashtag sur le réseau : pour juger soi-même sa popularité et sa fraîcheur.
const TAG_URL = { instagram: (t) => `https://www.instagram.com/explore/tags/${t}/`, tiktok: (t) => `https://www.tiktok.com/tag/${t}`, linkedin: (t) => `https://www.linkedin.com/feed/hashtag/${t}/`, x: (t) => `https://x.com/hashtag/${t}`, facebook: (t) => `https://www.facebook.com/hashtag/${t}`, youtube: (t) => `https://www.youtube.com/hashtag/${t}`, pinterest: (t) => `https://www.pinterest.fr/search/pins/?q=%23${t}`, threads: (t) => `https://www.threads.net/search?q=${t}`, bluesky: (t) => `https://bsky.app/hashtag/${t}` }
const tagLink = (net, t) => TAG_URL[net] ? `<a class="htag" href="${esc(TAG_URL[net](t.tag))}" target="_blank" rel="noopener" title="Voir ce hashtag sur le réseau">#${esc(t.camel)}</a>` : `<span class="htag">#${esc(t.camel)}</span>`
const CH_COLORS = ['#4338ca', '#0f766e', '#b45309', '#be185d', '#0369a1', '#4d7c0f', '#7e22ce']
function budget() {
  const v = vals(), r = S.report
  const b = planBudget({ sector: v.sector, goal: r?.kind === 'app' ? 'telechargements' : v.goal, monthly: v.monthly, local: v.local, avgValue: v.avgValue, margin: v.margin, closeRate: v.closeRate, targetConversions: store.get('target', 0), searchVolume: store.get('volume', 0), cpcOverride: store.get('cpc', 0) })
  const ind = bench.google_ads_by_industry || []
  return `<div class="section-head"><div><h2>Budget publicitaire</h2><p>${esc(b.sector)} · ${esc(b.goalLabel)} · ${b.local ? 'zone locale' : 'national'}</p></div></div>
  <div class="card verdict-card v-${b.verdict.level}"><p class="verdict">${esc(b.verdict.text)}</p>${b.verdict.detail ? `<p class="note">${esc(b.verdict.detail)}</p>` : ''}</div>
  <div class="card" style="margin-top:14px"><h3>Vos chiffres</h3><div class="grid">
    <label>Budget pub par mois (€)<input data-b="monthly" type="number" min="0" step="any" value="${v.monthly ?? ''}" placeholder="vide = budget conseillé"></label>
    <label>Valeur d’un client (€)<input data-b="avgValue" type="number" min="0" step="any" value="${v.avgValue || ''}" placeholder="panier ou contrat moyen"></label>
    <label>Votre marge (%)<input data-b="margin" type="number" min="1" max="100" step="any" value="${v.margin != null ? Math.round(v.margin * 100) : ''}" placeholder="${Math.round(b.assumptions.margin * 100)} par défaut"></label>
    ${b.goal === 'leads' ? `<label>Contacts qui deviennent clients (%)<input data-b="closeRate" type="number" min="1" max="100" step="any" value="${v.closeRate != null ? Math.round(v.closeRate * 100) : ''}" placeholder="${Math.round(b.assumptions.closeRate * 100)} par défaut"></label>` : ''}
    <label>Clients visés par mois<input id="target" type="number" min="0" step="any" value="${store.get('target', 0) || ''}" placeholder="optionnel"></label>
    <label>Recherches / mois sur vos mots-clés<input id="volume" type="number" min="0" step="any" value="${store.get('volume', 0) || ''}" placeholder="optionnel (Keyword Planner)"></label>
    <label>Votre CPC réel Google (€)<input id="cpc" type="number" min="0" step="any" value="${store.get('cpc', 0) || ''}" placeholder="optionnel (Keyword Planner)"></label>
  </div><p class="note">Hypothèses utilisées : marge ${Math.round(b.assumptions.margin * 100)} %${b.goal === 'leads' ? `, ${Math.round(b.assumptions.closeRate * 100)} % des contacts signent` : ''}. Coût maximal rentable par ${b.unit} : <b>${b.maxCpa ? fmt(b.maxCpa) + ' €' : '— (indiquez la valeur d’un client)'}</b>.${b.cpcSource ? ' ' + esc(b.cpcSource) : ''}</p></div>
  <div class="kpis">
    <div class="kpi"><div class="v">${fmt(b.monthly)} €</div><div class="k">${b.recommendedUsed ? (b.verdict.level === 'non' ? 'budget minimum d’un test' : 'budget de départ conseillé') : 'par mois'} · ${fmt(b.daily)} €/jour</div></div>
    <div class="kpi"><div class="v">≈ ${fmt(b.totals.clicksMid)}</div><div class="k">clics / mois</div></div>
    <div class="kpi"><div class="v">≈ ${fmt(b.totals.mid)}</div><div class="k">${b.unit}s / mois (${rng(b.totals.band)})</div></div>
    <div class="kpi"><div class="v">≈ ${b.totals.cpaMid ? fmt(b.totals.cpaMid) + ' €' : '—'}</div><div class="k">coût par ${b.unit}</div></div>
  </div>
  ${b.needed ? `<div class="card" style="margin-top:14px"><b>Pour ${fmt(b.needed.target)} ${b.unit}s / mois :</b> prévoir ≈ <b>${fmt(b.needed.mid)} €</b> / mois (${rng(b.needed.band, 0, ' €')}).${b.needed.capped ? ' ' + esc(b.needed.capped) : ''}</div>` : ''}
  <div class="card" style="margin-top:14px"><h3>Répartition conseillée</h3>
    <div class="stackbar" aria-hidden="true">${b.channels.map((c, i) => `<span style="width:${(c.budget / (b.monthly || 1)) * 100}%;background:${CH_COLORS[i % CH_COLORS.length]}">${Math.round((c.budget / (b.monthly || 1)) * 100)} %</span>`).join('')}</div>
    <div class="cols3 channels">${b.channels.map((c, i) => `<div class="channel"><h4><i style="background:${CH_COLORS[i % CH_COLORS.length]}"></i>${esc(c.label)}</h4><p class="big">${fmt(c.budget)} € <span class="note">/ mois · ${fmt(c.daily)} €/jour</span></p>
      ${c.mid ? `<p>≈ ${fmt(c.mid.clicks)} clics · ≈ ${fmt(c.mid.conv)} ${b.unit}s · ≈ ${c.mid.cpa ? fmt(c.mid.cpa) + ' €' : '—'} par ${b.unit}</p><p class="note">${gloss('CPC')} ${rng(c.cpc, 2, ' €')}</p>` : `<p class="note">${esc(c.noEstimate || 'Pas de repère chiffré fiable : mesurez dès la 1re semaine.')}</p>`}
      <p class="note">${esc(c.bestFor)}</p><details><summary class="note">Apprentissage et minimum</summary><p class="note">${esc(c.learning)}</p><p class="note">${esc(c.minimum)}</p></details></div>`).join('')}</div>
    ${b.dropped.length ? `<p class="note">Écartés à ce budget (chaque canal doit avoir de quoi apprendre) : ${esc(b.dropped.join(', '))}.</p>` : ''}</div>
  ${b.warnings.length ? `<div class="stack" style="margin-top:14px">${b.warnings.map((w) => `<div class="warn">${esc(w)}</div>`).join('')}</div>` : ''}
  ${b.verdict.level === 'non' ? '<details class="card fold"><summary><h3>Si vous testez malgré tout : plan de lancement prudent</h3></summary>' : ''}<div class="cols3" style="margin-top:16px">${b.rampUp.map((p) => `<div class="card"><h3>${esc(p.phase)}</h3><ul class="clean">${p.actions.map((a) => `<li>• ${gloss(esc(a))}</li>`).join('')}</ul></div>`).join('')}</div>${b.verdict.level === 'non' ? '</details>' : ''}
  <div class="card" style="margin-top:16px"><h3>Et le SEO ?</h3><p>${esc(b.seo.note)}</p><p class="note">${esc(b.seo.split)}</p><ul class="clean">${b.seo.items.map((i) => `<li><b>${esc(i.item)}</b> — ${esc(i.cost)}</li>`).join('')}</ul></div>
  <details class="card fold"><summary><h3>Repères sectoriels et plateformes (sources)</h3></summary><p class="note">${esc(bench.meta?.google_ads_dataset || '')} ${esc(bench.meta?.us_only_warning || '')}</p>
    <div class="table-wrap"><table><thead><tr><th>Secteur (Google Ads, US)</th><th class="n">CTR</th><th class="n">CPC US</th><th class="n">CPC FR estimé</th><th class="n">Conv.</th></tr></thead><tbody>${ind.map((x) => `<tr class="${x.industry_fr === b.bench.industry ? 'us' : ''}"><td>${esc(x.industry_fr)}</td><td class="n">${x.ctr != null ? fmt(x.ctr * 100, 2) + ' %' : '—'}</td><td class="n">${x.cpc_usd != null ? fmt(x.cpc_usd, 2) + ' $' : '—'}</td><td class="n">${x.cpc_usd != null ? `${fmt(x.cpc_usd * 0.86 * 0.4, 2)}–${fmt(x.cpc_usd * 0.86 * 0.6, 2)} €` : '—'}</td><td class="n">${x.cvr != null ? fmt(x.cvr * 100, 1) + ' %' : '—'}</td></tr>`).join('')}</tbody></table></div>
    <div class="table-wrap" style="margin-top:12px"><table><thead><tr><th>Plateforme</th><th class="n">CPM</th><th class="n">CPC</th><th>Minimum</th></tr></thead><tbody>${(bench.platforms || []).map((p) => `<tr><td>${esc(PLATFORM_LABEL[p.id] || p.id)}</td><td class="n">${p.cpm_eur?.[0] != null ? rng(p.cpm_eur, 0, ' €') : '—'}</td><td class="n">${rng(p.cpc_eur, 2, ' €')}</td><td class="note">${esc(p.min_daily_budget)}</td></tr>`).join('')}</tbody></table></div></details>`
}
const PLATFORM_LABEL = { google_search: 'Google Ads — Search', google_pmax: 'Google — Performance Max', meta: 'Meta (Facebook + Instagram)', instagram: 'Instagram', tiktok: 'TikTok', linkedin: 'LinkedIn', youtube: 'YouTube', microsoft: 'Microsoft (Bing)', pinterest: 'Pinterest', snapchat: 'Snapchat', x: 'X (Twitter)', amazon: 'Amazon Ads' }
after.budget = () => {
  $$('[data-b]').forEach((el) => el.addEventListener('change', () => { form.elements[el.dataset.b].value = el.value; form.dispatchEvent(new Event('input')); persist(); if (S.report) { Object.assign(S.report.input, inputOf(vals())); refreshDerived() } render(); $(`[data-b="${el.dataset.b}"]`)?.focus() }))
  for (const id of ['target', 'volume', 'cpc']) $('#' + id)?.addEventListener('change', (e) => { store.set(id, num(e.target.value)); if (S.report) refreshDerived(); render(); $('#' + id)?.focus() })
}

// ───────── Concurrents ─────────
function concurrents() {
  const r = S.report
  if (!r?.competitors?.length) return `<div class="card empty"><h2>Concurrents</h2><p>Ajoutez jusqu’à 5 sites concurrents dans « Plus d’options », puis relancez l’analyse.</p><p class="note">En ligne de commande : <code>node seo/cli.mjs votre-site.fr --concurrents a.fr,b.fr</code></p></div>`
  const R = r.result
  const base = R.pageScores || Object.fromEntries(Object.entries(R.scores).map(([k, v]) => [k, v.score]))
  const me = { url: r.target + ' (vous)', global: R.pageGlobal ?? R.global, scores: base, perf: r.ctx?.psi?.scores?.performance, lcp: r.ctx?.psi?.field?.LCP, words: r.ctx?.page?.wordCount, schema: R.meta?.schemaTypes?.join(', '), social: Object.keys(R.meta?.social || {}), llms: r.ctx?.llms?.status === 200, terms: R.meta?.terms?.words?.map((t) => t.term) || [], me: true }
  const comps = r.competitors.map((c) => ({ ...c, comparable: c.global != null && !c.error }))
  const all = [me, ...comps]
  const cats = Object.keys(R.scores).filter((k) => base[k] != null)
  const better = []
  for (const c of comps.filter((x) => x.comparable)) {
    for (const k of cats) if (c.scores[k] != null && c.scores[k] - base[k] >= 10) better.push(`<b>${esc(c.url)}</b> fait mieux en ${esc(R.scores[k].label)} (${c.scores[k]} contre ${base[k]}).`)
    if (c.perf != null && me.perf != null && c.perf - me.perf >= 10) better.push(`<b>${esc(c.url)}</b> est plus rapide sur mobile (${c.perf} contre ${me.perf}).`)
    const extraSocial = (c.social || []).filter((s) => !me.social.includes(s))
    if (extraSocial.length) better.push(`<b>${esc(c.url)}</b> est relié à ${esc(extraSocial.join(', '))}.`)
  }
  const mine = new Set(me.terms), gap = new Map()
  for (const c of comps.filter((x) => x.comparable)) for (const t of c.terms || []) if (!mine.has(t)) gap.set(t, (gap.get(t) || 0) + 1)
  const gapTerms = [...gap].filter(([, n]) => n >= Math.min(2, comps.filter((x) => x.comparable).length)).map(([t]) => t).slice(0, 15)
  return `<div class="section-head"><div><h2>Concurrents</h2><p>Même grille, mêmes conditions : page d’accueil de chacun (votre exploration multi-pages est exclue de la comparaison).</p></div></div>
  <div class="table-wrap"><table><thead><tr><th>Site</th><th class="n">Note</th>${cats.map((k) => `<th class="n" title="${esc(R.scores[k].label)}">${esc(R.scores[k].label.split(/[ &]/)[0])}</th>`).join('')}<th class="n">Vitesse</th><th class="n">Mots</th><th>Réseaux</th></tr></thead><tbody>
    ${all.map((c) => `<tr class="${c.me ? 'us' : ''}"><td>${esc(c.url)}${c.me || c.comparable ? '' : `<br><span class="note">non comparable : ${esc(c.error || 'page non lue')}</span>`}</td><td class="n"><b style="color:${color(c.global)}">${c.global ?? '—'}</b></td>${cats.map((k) => `<td class="n">${c.me || c.comparable ? c.scores?.[k] ?? '—' : '—'}</td>`).join('')}<td class="n">${c.perf ?? '—'}</td><td class="n">${fmt(c.words)}</td><td class="note">${esc((c.social || []).join(', '))}</td></tr>`).join('')}
  </tbody></table></div>
  <div class="cols" style="margin-top:16px">
    <div class="card"><h3>Ce qu’ils font mieux</h3><ul class="clean">${!comps.some((x) => x.comparable) ? '<li>Aucun concurrent n’a pu être lu : comparaison impossible. Essayez la ligne de commande ou un autre mode de collecte.</li>' : better.map((b) => `<li>• ${b}</li>`).join('') || '<li>Rien de mesurable : vous êtes devant ou à égalité sur les axes comparés.</li>'}</ul></div>
    <div class="card"><h3>Sujets qu’ils traitent et pas vous</h3>${gapTerms.length ? `<div class="tags">${gapTerms.map((t) => `<span class="chip tag">${esc(t)}</span>`).join('')}</div><p class="note">Termes fréquents chez vos concurrents, absents de votre page : pistes de contenu.</p>` : '<p class="note">Pas d’écart net détecté.</p>'}</div>
  </div>`
}

// ───────── Ressources ─────────
const FEAT = { audit_technique: 'Audit', mots_cles: 'Mots-clés', backlinks: 'Liens', rank_tracking: 'Positions', geo_ia: 'IA', local: 'Local', aso: 'ASO', hashtags_social: 'Social', ads_budget: 'Pub', francais: 'FR' }
function ressources() {
  const subs = [['favori', 'Bouton-favori & CLI'], ['checklists', 'Checklists'], ['guide', 'Guide 2026'], ['glossaire', 'Glossaire'], ['marche', 'Étude de marché']]
  const head = `<div class="section-head"><div><h2>Ressources</h2></div><div class="actions" role="tablist">${subs.map(([k, l]) => `<button class="btn ${S.res === k ? 'primary' : ''}" data-sub="${k}" role="tab" aria-selected="${S.res === k}">${l}</button>`).join('')}</div></div>`
  if (S.res === 'checklists') return head + checklistsView()
  if (S.res === 'guide') return head + `<div class="stack">${GUIDE.map((g) => `<div class="card"><h3>${esc(g.title)}</h3><ul class="clean">${g.body.map((b) => `<li>• ${gloss(esc(b))}</li>`).join('')}</ul></div>`).join('')}<details class="card fold"><summary><h3>Faits sourcés</h3></summary><div class="table-wrap"><table><tbody>${(bench.seo_facts || []).map((f) => `<tr><th>${esc(f.topic)}</th><td>${esc(f.fact)}${f.source ? `<br><a class="src" href="${esc(f.source)}" target="_blank" rel="noopener">source</a>` : ''}</td></tr>`).join('')}</tbody></table></div></details></div>`
  if (S.res === 'glossaire') return head + `<div class="card"><dl class="gloss">${Object.entries(GLOSSARY).map(([k, d]) => `<dt>${esc(k)}</dt><dd>${esc(d)}</dd>`).join('')}</dl></div>`
  if (S.res === 'marche') return head + marcheView()
  const code = bookmarkletCode(location.href.split('#')[0])
  return head + `<div class="cols">
    <div class="card"><h3>Le bouton-favori « Auditer cette page »</h3><p>Il lit votre page <b>depuis votre propre site</b> : HTML réel, en-têtes, robots.txt, sitemap, jusqu’à 15 pages internes et le rendu après JavaScript. Aucun proxy, aucun serveur intermédiaire.</p>
      <ol><li>Glissez ce bouton dans votre barre de favoris (sur ordinateur) :</li></ol>
      <p><a class="btn primary bm" href="${esc(code)}" draggable="true">📌 Auditer avec SEO 360</a></p>
      <ol start="2"><li>Ouvrez votre site, sur la page à auditer.</li><li>Cliquez sur le favori : SEO 360 s’ouvre et lance l’analyse.</li></ol>
      <p class="note">Si rien ne se passe : autorisez les fenêtres pop-up pour votre site. Certains sites très protégés bloquent les favoris : utilisez alors la ligne de commande.</p></div>
    <div class="card"><h3>La ligne de commande (audit le plus complet)</h3><p>Exploration de tout le site, redirections, en-têtes, encodages, concurrents. Node 18 ou plus, aucune installation.</p>
      <div class="code"><pre>node seo/cli.mjs https://www.votre-site.fr \\
  --secteur ${esc(vals().sector)} --ville "${esc(vals().city || 'Lyon')}" --crawl 30 \\
  --concurrents concurrent1.fr,concurrent2.fr</pre><button class="btn sm" data-copy="">Copier</button></div>
      <p class="note">Le rapport <code>.json</code> s’importe ici (« Plus d’options »). Variables utiles : <code>PSI_KEY</code> (clé PageSpeed gratuite), <code>GITHUB_TOKEN</code>.</p></div></div>`
}
after.ressources = () => {
  $('.bm')?.addEventListener('click', (e) => { e.preventDefault(); toast('Glissez ce bouton dans votre barre de favoris, puis cliquez-le depuis votre site.') })
  $$('[data-sub]').forEach((b) => b.addEventListener('click', () => { S.res = b.dataset.sub; render() }))
  $$('[data-chk]').forEach((c) => c.addEventListener('change', () => { const k = 'chk:' + targetKey(S.report?.target || 'global'), d = store.get(k, {}); d[c.dataset.chk] = c.checked; store.set(k, d); c.nextElementSibling?.classList.toggle('done', c.checked) }))
  $$('[data-mk]').forEach((b) => b.addEventListener('click', () => { S.mk = b.dataset.mk; render() }))
}
function checklistsView() {
  const done = store.get('chk:' + targetKey(S.report?.target || 'global'), {})
  const v = vals(), sector = sectorById(v.sector)
  const rank = (c) => ((c.id === 'local' && (v.local ?? sector.local)) || (c.id === 'aso' && S.report?.kind === 'app') || (c.id === 'github' && S.report?.kind === 'github') || (c.id === 'ecommerce' && v.sector.startsWith('ecommerce')) ? 2 : ['technique', 'contenu', 'geo'].includes(c.id) ? 1 : 0)
  return `<div class="cols">${[...CHECKLISTS].sort((a, b) => rank(b) - rank(a)).map((c) => `<details class="card fold" ${rank(c) === 2 ? 'open' : ''}><summary><h3>${esc(c.title)} <span class="pct">${c.items.filter((it) => done[c.id + ':' + slugify(it)]).length}/${c.items.length}</span></h3></summary><ul class="clean check">${c.items.map((it) => { const id = c.id + ':' + slugify(it); return `<li><label><input type="checkbox" data-chk="${esc(id)}" ${done[id] ? 'checked' : ''}><span class="${done[id] ? 'done' : ''}">${gloss(esc(it))}</span></label></li>` }).join('')}</ul></details>`).join('')}</div>`
}
const slugify = (s) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').slice(0, 40)
function marcheView() {
  const sub = S.mk
  const nav = `<div class="filters">${[['outils', 'Outils du marché'], ['swot', 'Positionnement'], ['oss', 'Open-source GitHub']].map(([k, l]) => `<button class="chip tag" data-mk="${k}" aria-pressed="${sub === k}">${l}</button>`).join('')}</div><p class="note">Étude réalisée le ${esc(market.generated)} pour concevoir SEO 360 : tarifs relevés par recherche web, à reconfirmer.</p>`
  if (sub === 'swot') return nav + `<div class="cols">${[['forces', 'Forces'], ['faiblesses', 'Faiblesses'], ['opportunites', 'Opportunités'], ['menaces', 'Menaces']].map(([k, l]) => `<div class="card"><h3>${l}</h3><ul class="clean">${(market.swot[k] || []).map((x) => `<li>• ${esc(x)}</li>`).join('')}</ul></div>`).join('')}</div><div class="card" style="margin-top:16px"><h3>Positionnement</h3><ol>${market.positioning.map((x) => `<li>${esc(x)}</li>`).join('')}</ol></div>`
  if (sub === 'oss') return nav + `<div class="table-wrap"><table><thead><tr><th>Dépôt</th><th class="n">★</th><th>Ce qu’il fait</th><th>Ce qu’on en retient</th></tr></thead><tbody>${[...oss.projects].sort((a, b) => b.stars - a.stars).map((p) => `<tr><td><a href="${esc(p.url)}" target="_blank" rel="noopener">${esc(p.name)}</a><br><span class="note">${esc(p.category)} · ${esc(p.license || '—')}</span></td><td class="n">${fmt(p.stars)}</td><td>${esc(p.what)}</td><td class="note">${esc(p.borrow)}</td></tr>`).join('')}</tbody></table></div>`
  return nav + `<div class="table-wrap"><table><thead><tr><th>Outil</th><th>Prix d’entrée</th>${Object.values(FEAT).map((f) => `<th class="n">${f}</th>`).join('')}</tr></thead><tbody>${market.tools.map((t) => `<tr><td><a href="${esc(t.url)}" target="_blank" rel="noopener">${esc(t.name)}</a><br><span class="note">${esc(t.best_for)}</span></td><td class="note">${esc(t.price_entry)}</td>${Object.keys(FEAT).map((k) => `<td class="n"><span class="heat h${t.features?.[k] ?? 0}" aria-label="${['absent', 'partiel', 'fort'][t.features?.[k] ?? 0]}">${t.features?.[k] ?? 0}</span></td>`).join('')}</tr>`).join('')}</tbody></table></div>`
}

// ───────── Impression : un vrai rapport client ─────────
function printReport() {
  const r = S.report, R = r.result
  const box = $('#print')
  const tab = S.tab
  const sections = []
  sections.push(`<header class="cover"><h1>Audit SEO 360</h1><p class="big">${esc(r.target)}</p><p>${esc(sectorById(r.input.sector).label)}${r.input.city ? ' · ' + esc(r.input.city) : ''} — ${new Date(r.generatedAt).toLocaleDateString('fr-FR')}</p><p class="big">${R?.global == null ? 'Audit incomplet' : `Note : ${R.global}/100 (${R.grade})`} · mesuré à ${Math.round((R?.coverage || 0) * 100)} %</p></header>`)
  S.tab = 'synthese'; sections.push(synthese())
  S.tab = 'afaire'; const saved = new Set(S.sevs); S.sevs = new Set(['critique', 'important', 'moyen', 'faible']); const cat = S.cat; S.cat = ''; sections.push(afaire()); S.sevs = saved; S.cat = cat
  S.tab = 'budget'; sections.push(budget())
  S.tab = tab
  box.innerHTML = sections.join('<div class="pb"></div>')
  $$('details', box).forEach((d) => (d.open = true))
  $$('.actions, input, .filters', box).forEach((el) => el.remove())
  document.body.classList.add('printing')
  const done = () => { document.body.classList.remove('printing'); box.innerHTML = ''; removeEventListener('afterprint', done) }
  addEventListener('afterprint', done)
  print()
}

// ───────── Rapports externes : types vérifiés avant affichage ─────────
const SEVS = new Set(['critique', 'important', 'moyen', 'faible', 'info', 'ok'])
const KEY = /^[a-z][a-z0-9_-]{0,30}$/
const keyed = (o, fn) => Object.fromEntries(Object.entries(o || {}).filter(([k]) => KEY.test(k)).map(([k, v]) => [k, fn(v)]))
const n100 = (v) => (v == null || v === '' ? null : Number.isFinite(+v) ? Math.max(0, Math.min(100, Math.round(+v))) : null)
const str = (v, max = 2000) => (v == null ? '' : String(v).slice(0, max))
function sanitizeReport(r) {
  if (!r || typeof r !== 'object' || typeof r.target !== 'string' || !('result' in r)) throw new Error('format')
  const R = r.result
  const fnd = (f) => ({ cat: str(f.cat, 40), sev: SEVS.has(f.sev) ? f.sev : 'info', id: str(f.id, 80), title: str(f.title, 300), detail: str(f.detail, 1500), fix: str(f.fix, 1500), impact: Math.max(0, Math.min(5, +f.impact || 0)), effort: Math.max(1, Math.min(5, +f.effort || 1)), code: str(f.code, 6000), scope: f.scope === 'site' ? 'site' : undefined })
  const out = { ...r, target: str(r.target, 500), kind: ['site', 'app', 'github'].includes(r.kind) ? r.kind : 'site', generatedAt: isNaN(Date.parse(r.generatedAt)) ? new Date().toISOString() : r.generatedAt, input: { ...(r.input || {}), sector: SECTORS.some((x) => x.id === r.input?.sector) ? r.input.sector : 'autre' } }
  if (R && typeof R === 'object') {
    out.result = {
      ...R, global: n100(R.global), pageGlobal: n100(R.pageGlobal), grade: /^[A-E]$/.test(R.grade) ? R.grade : null, coverage: Math.max(0, Math.min(1, +R.coverage || 0)), incomplete: R.incomplete ? str(R.incomplete, 200) : null,
      caps: (R.caps || []).map((c) => str(c, 200)), issues: (R.issues || []).map(fnd).filter((f) => f.sev !== 'ok' && f.sev !== 'info'), passed: (R.passed || []).map(fnd), infos: (R.infos || []).map(fnd),
      scores: keyed(R.scores, (v) => ({ label: str(v?.label, 80), score: n100(v?.score), issues: Math.max(0, +v?.issues || 0), estimated: !!v?.estimated, measured: v?.measured !== false })),
      pageScores: keyed(R.pageScores, n100),
      counts: Object.fromEntries([...SEVS].map((k) => [k, Math.max(0, +R.counts?.[k] || 0)])),
    }
    // Couverture absente ou nulle : on la recalcule ; sans mesure, pas de note
    const sc = Object.values(out.result.scores)
    if (!(R.coverage > 0)) out.result.coverage = sc.length ? sc.filter((x) => x.score != null).length / sc.length : 0
    if (out.result.coverage < 0.6 && out.result.global != null) { out.result.global = null; out.result.grade = null; out.result.incomplete ||= 'rapport importé sans détail de mesure' }
  } else out.result = null
  const c = r.ctx || {}, num0 = (v) => (Number.isFinite(+v) ? +v : null)
  out.ctx = {
    ...c,
    fetch: c.fetch && { finalUrl: str(c.fetch.finalUrl, 500), status: num0(c.fetch.status), source: str(c.fetch.source, 20) },
    psi: c.psi && { scores: Object.fromEntries(Object.entries(c.psi.scores || {}).map(([k, v]) => [str(k, 20), n100(v)])), field: Object.fromEntries(Object.entries(c.psi.field || {}).map(([k, v]) => [str(k, 20), typeof v === 'string' ? str(v, 30) : num0(v)])), lab: c.psi.lab, error: c.psi.error ? str(c.psi.error, 300) : undefined, screenshot: /^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/=]+$/.test(c.psi.screenshot || '') ? c.psi.screenshot : undefined },
    page: c.page && { ...c.page, wordCount: num0(c.page.wordCount) },
    crawl: c.crawl && { pages: (c.crawl.pages || []).slice(0, 200).map((x) => ({ ...x, url: str(x.url, 500), status: num0(x.status) })), broken: (c.crawl.broken || []).slice(0, 100).map((b) => ({ url: str(b.url, 500), from: str(b.from, 500), status: num0(b.status) })) },
    llms: c.llms && { status: num0(c.llms.status), bytes: num0(c.llms.bytes) },
  }
  out.competitors = Array.isArray(r.competitors) ? r.competitors.slice(0, 5).map((x) => ({ url: str(x.url, 300), global: n100(x.global), scores: keyed(x.scores, n100), perf: n100(x.perf), lcp: num0(x.lcp), words: num0(x.words), social: (x.social || []).map((y) => str(y, 30)), terms: (x.terms || []).map((y) => str(y, 60)), llms: !!x.llms, error: x.error ? str(x.error, 300) : null })) : undefined
  return out
}

// ───────── Démarrage ─────────
const th = store.get('theme', '')
if (th) document.documentElement.dataset.theme = th
$('#theme').addEventListener('click', () => {
  const dark = document.documentElement.dataset.theme ? document.documentElement.dataset.theme === 'dark' : matchMedia('(prefers-color-scheme: dark)').matches
  document.documentElement.dataset.theme = dark ? 'light' : 'dark'; store.set('theme', document.documentElement.dataset.theme)
})
$('#f-import').addEventListener('change', async (e) => {
  const f = e.target.files[0]; if (!f) return
  try {
    const data = JSON.parse(await f.text())
    if (data?.type === 'seo360-veille') { S.veille = sanitizeVeille(data); store.set('veille', S.veille); progress(`Veille importée : ${S.veille.sujet} (${S.veille.total} publications)`, 'ok'); go('visibilite'); return }
    if (data?.type === 'seo360-bm') { if (!validateBundle(data)) throw new Error('format'); form.elements.url.value = data.url; updateKind(); run({ bundle: data }); return }
    const rep = sanitizeReport(data)
    S.report = rep; S.shared = false; refreshDerived(); syncForm(rep); remember(rep); collapseHero(true); progress(`Rapport importé : ${rep.target}`, 'ok'); go('synthese')
  } catch { progress('Fichier JSON invalide : importez un rapport produit par SEO 360 (CLI ou bouton JSON).', 'err') }
})
;(async () => {
  const h = location.hash
  if (h.startsWith('#r=')) {
    try { S.report = sanitizeReport(await decodeReport(h.slice(3))); S.shared = true; refreshDerived(); syncForm(S.report); collapseHero(true); history.replaceState(null, '', '#synthese'); progress('Rapport partagé (lecture seule). Relancez une analyse pour l’actualiser.', 'ok') } catch (err) { progress('Lien de rapport illisible : ' + err.message, 'err') }
  } else if (h === '#bm') {
    progress('En attente des données envoyées par le bouton-favori…')
    history.replaceState(null, '', '#synthese')
  } else {
    const tab = h.slice(1)
    if (TABS.some(([id]) => id === tab)) S.tab = tab
    const last = tryJ(() => sanitizeReport(store.get('last')), null)
    if (last) { S.report = last; refreshDerived(); collapseHero(true) }
  }
  if (S.report) S.gsc = store.get('gsc:' + targetKey(S.report.target), null)
  S.veille = tryJ(() => { const v = store.get('veille', null); return v ? sanitizeVeille(v) : null }, null)
  render()
})()

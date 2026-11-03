// SEO 360 — interface (vanilla JS, modules ES, aucune dépendance).
import { analyze, competitorSummary, detectKind, CATEGORIES, SEVERITY, GOALS } from './engine/index.js'
import { toMarkdown } from './engine/report.js'
import { generateHashtags } from './engine/hashtags.js'
import { planBudget } from './engine/ads.js'
import { keywordIdeas, googleSuggest, classify, INTENTS } from './engine/keywords.js'
import { CHECKLISTS, GUIDE } from './engine/checklists.js'
import { SECTORS, sectorById } from './data/sectors.js'
import market from './data/research/competitors.js'
import oss from './data/research/github-oss.js'
import bench from './data/research/benchmarks.js'

const $ = (s, el = document) => el.querySelector(s)
const $$ = (s, el = document) => [...el.querySelectorAll(s)]
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]))
const fmt = (n, d = 0) => n == null || Number.isNaN(n) ? '—' : Number(n).toLocaleString('fr-FR', { maximumFractionDigits: d, minimumFractionDigits: d })
const rng = (a, d = 0, suf = '') => a && a[0] != null ? `${fmt(a[0], d)} – ${a[1] != null ? fmt(a[1], d) : '?'}${suf}` : '—'
const store = { get(k, d) { try { const v = localStorage.getItem('seo360:' + k); return v ? JSON.parse(v) : d } catch { return d } }, set(k, v) { try { localStorage.setItem('seo360:' + k, JSON.stringify(v)) } catch {} } }
const color = (s) => s >= 85 ? 'var(--ok)' : s >= 70 ? 'var(--accent-2)' : s >= 50 ? 'var(--mid)' : 'var(--crit)'
const meter = (n) => `<span class="meter" aria-label="${n}/5">${[1, 2, 3, 4, 5].map((i) => `<i class="${i <= n ? 'on' : ''}"></i>`).join('')}</span>`

const TABS = [
  ['synthese', 'Synthèse'], ['corrections', 'Corrections'], ['plan', 'Plan d’action'], ['motscles', 'Mots-clés'], ['hashtags', 'Hashtags'],
  ['budget', 'Budget pub'], ['concurrents', 'Concurrents'], ['checklists', 'Checklists'], ['marche', 'Étude de marché'], ['guide', 'Guide 2026'],
]
const S = { report: null, tab: 'synthese', cat: null, sevs: new Set(['critique', 'important', 'moyen', 'faible']), suggestions: [], mk: 'outils', ossCat: '', toolCat: '' }

// ───────── Formulaire ─────────
const form = $('#form')
$('#f-sector').innerHTML = SECTORS.map((s) => `<option value="${s.id}">${esc(s.label)}</option>`).join('')
$('#f-goal').innerHTML = Object.entries(GOALS).map(([k, v]) => `<option value="${k}">${esc(v)}</option>`).join('')
const saved = store.get('form', {})
for (const [k, v] of Object.entries(saved)) { const el = form.elements[k]; if (el && el.type !== 'file' && k !== 'html') el.value = v }
const vals = () => {
  const o = Object.fromEntries(new FormData(form))
  delete o.f
  return { ...o, monthly: +o.monthly || 0, avgValue: +o.avgValue || 0, crawl: Math.min(50, +o.crawl || 0), local: o.local === '' ? undefined : o.local === '1' }
}
const persist = () => { const v = Object.fromEntries(new FormData(form)); delete v.html; store.set('form', v) }
form.addEventListener('input', (e) => {
  if (e.target.name === 'url') $('#kind').textContent = { site: 'Site web', app: 'Application', github: 'Dépôt GitHub' }[detectKind(e.target.value || 'x.fr')]
  persist()
  if (['sector', 'city', 'brand', 'keyword', 'lang', 'goal', 'monthly', 'avgValue', 'local'].includes(e.target.name) && ['hashtags', 'budget', 'motscles'].includes(S.tab)) render()
})
if (form.elements.url.value) $('#kind').textContent = { site: 'Site web', app: 'Application', github: 'Dépôt GitHub' }[detectKind(form.elements.url.value)]

const progress = (m, err = false) => { const p = $('#progress'); p.textContent = m; p.classList.toggle('err', err) }

function makeFetcher(v, pasted) {
  return async (url, { noFollow = false } = {}) => {
    if (pasted && sameDoc(url, pasted.url)) return { status: 200, body: pasted.html, finalUrl: url, headers: {}, redirects: [] }
    const enc = encodeURIComponent(url), t0 = performance.now()
    try {
      if (v.proxy === 'custom' && v.proxyUrl) {
        const r = await fetch(v.proxyUrl.replace('{url}', enc) + (noFollow ? '&nofollow=1' : ''))
        const headers = {}
        for (const [k, val] of r.headers) if (k.startsWith('x-orig-')) headers[k.slice(7)] = val
        const status = +(r.headers.get('x-status') || r.status)
        if (noFollow) return { status, location: r.headers.get('x-location') || '' }
        return { status, headers, body: await r.text(), finalUrl: r.headers.get('x-final-url') || url, redirects: JSON.parse(r.headers.get('x-redirects') || '[]'), timeMs: +(r.headers.get('x-time') || 0), ttfbMs: +(r.headers.get('x-ttfb') || 0) }
      }
      if (noFollow) return {}
      if (v.proxy === 'allorigins') {
        const r = await fetch(`https://api.allorigins.win/get?url=${enc}`)
        const j = await r.json()
        return { status: j.status?.http_code || (j.contents ? 200 : 0), body: j.contents || '', finalUrl: j.status?.url || url, headers: {}, redirects: [], timeMs: performance.now() - t0 }
      }
      if (v.proxy === 'codetabs') {
        const r = await fetch(`https://api.codetabs.com/v1/proxy?quest=${enc}`)
        return { status: r.status, body: await r.text(), finalUrl: url, headers: {}, redirects: [], timeMs: performance.now() - t0 }
      }
      return { status: 0, error: 'Aucun proxy' }
    } catch (e) { return { status: 0, error: 'Proxy injoignable : ' + e.message } }
  }
}
const sameDoc = (a, b) => { try { const x = new URL(a), y = new URL(/^https?:/.test(b) ? b : 'https://' + b); return x.host.replace(/^www\./, '') === y.host.replace(/^www\./, '') && x.pathname.replace(/\/$/, '') === y.pathname.replace(/\/$/, '') } catch { return false } }

form.addEventListener('submit', async (e) => {
  e.preventDefault()
  const v = vals(), target = v.url.trim()
  if (!target) return
  const btn = $('#go'); btn.disabled = true
  const kind = detectKind(target)
  const pasted = v.html?.trim() ? { url: target, html: v.html } : null
  const useFetch = kind !== 'site' || v.proxy !== 'none' || pasted
  const fetcher = makeFetcher(v, pasted)
  const input = { sector: v.sector, keyword: v.keyword, city: v.city, brand: v.brand, goal: v.goal, monthly: v.monthly, avgValue: v.avgValue, lang: v.lang, local: v.local }
  try {
    const t0 = performance.now()
    progress(kind === 'site' ? 'Analyse en cours — PageSpeed Insights prend 20 à 60 secondes…' : 'Analyse en cours…')
    const tick = setInterval(() => progress(`Analyse en cours… ${Math.round((performance.now() - t0) / 1000)} s`), 1000)
    const comps = kind === 'site' ? (v.competitors || '').split(/\s*[\n,;]\s*/).map((s) => s.trim()).filter(Boolean).slice(0, 5) : []
    const common = { fetcher: useFetch ? fetcher : null, noFetch: kind === 'site' && !useFetch, source: v.proxy === 'custom' ? 'worker' : 'proxy', psiKey: v.psiKey, githubToken: v.githubToken, input }
    const [rep, ...compReps] = await Promise.all([
      analyze(target, { ...common, kind, crawl: pasted || v.proxy === 'none' ? 0 : v.crawl }),
      ...comps.map((c) => analyze(c, { ...common, fetcher: v.proxy === 'none' ? null : fetcher, noFetch: v.proxy === 'none', kind: 'site', crawl: 0 }).then((r) => competitorSummary(c, r))),
    ])
    clearInterval(tick)
    if (comps.length) rep.competitors = compReps
    S.report = rep; S.suggestions = []; S.cat = null
    store.set('last', rep)
    const psiErr = rep.ctx?.psi?.error
    progress(rep.error ? rep.error : `Analyse terminée en ${Math.round((performance.now() - t0) / 1000)} s.${psiErr ? ' PageSpeed : ' + psiErr : ''}${kind === 'site' && !useFetch ? ' Mode PageSpeed seul : collez le HTML ou choisissez un proxy pour l’audit complet.' : ''}`, !!rep.error)
    go('synthese')
  } catch (err) {
    progress('Erreur : ' + err.message, true); console.error(err)
  } finally { btn.disabled = false }
})

$('#f-import').addEventListener('change', async (e) => {
  const f = e.target.files[0]; if (!f) return
  try { S.report = JSON.parse(await f.text()); syncForm(S.report); progress(`Rapport importé : ${S.report.target}`); go('synthese') } catch { progress('Fichier JSON invalide', true) }
})

function syncForm(r) {
  const i = r.input || {}
  for (const k of ['sector', 'keyword', 'city', 'brand', 'goal', 'monthly', 'avgValue', 'lang']) if (i[k] != null && form.elements[k]) form.elements[k].value = i[k]
  if (r.target) form.elements.url.value = r.target
  persist()
}

// ───────── Navigation ─────────
function renderTabs() {
  const n = S.report?.result ? S.report.result.counts.critique + S.report.result.counts.important : 0
  $('#tabs').innerHTML = TABS.map(([id, label]) => `<button type="button" data-tab="${id}" ${S.tab === id ? 'aria-current="page"' : ''}>${label}${id === 'corrections' && n ? `<span class="count">${n}</span>` : ''}</button>`).join('')
}
$('#tabs').addEventListener('click', (e) => { const b = e.target.closest('[data-tab]'); if (b) go(b.dataset.tab) })
function go(tab) { S.tab = tab; history.replaceState(null, '', '#' + tab); render(); $('#view').focus({ preventScroll: true }); $('#view').scrollIntoView({ behavior: 'smooth', block: 'start' }) }

function render() {
  renderTabs()
  const fn = { synthese, corrections, plan, motscles, hashtags, budget, concurrents, checklists, marche, guide }[S.tab] || synthese
  $('#view').innerHTML = fn()
  after[S.tab]?.()
}
const after = {}

const needReport = (what) => `<div class="card empty"><h2>${what}</h2><p>Lancez une analyse ci-dessus (ou importez un rapport JSON de la CLI) pour afficher cette section.</p><p>Disponibles sans analyse : <a href="#motscles" data-go="motscles">Mots-clés</a> · <a href="#hashtags" data-go="hashtags">Hashtags</a> · <a href="#budget" data-go="budget">Budget pub</a> · <a href="#checklists" data-go="checklists">Checklists</a> · <a href="#marche" data-go="marche">Étude de marché</a> · <a href="#guide" data-go="guide">Guide</a></p></div>`
document.addEventListener('click', (e) => {
  const g = e.target.closest('[data-go]'); if (g) { e.preventDefault(); go(g.dataset.go) }
  const c = e.target.closest('[data-copy]'); if (c) { copy(c.dataset.copy || c.closest('.code, .net')?.querySelector('pre, .copy-src')?.textContent || '') }
})
function copy(t) { navigator.clipboard?.writeText(t).then(() => toast('Copié')).catch(() => toast('Copie impossible')) }
function toast(m) { const d = document.createElement('div'); d.className = 'toast'; d.textContent = m; document.body.append(d); setTimeout(() => d.remove(), 1600) }
function download(name, text, type) { const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([text], { type })); a.download = name; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 2000) }
const slug = () => String(S.report?.target || 'rapport').replace(/^https?:\/\//, '').replace(/[^a-z0-9]+/gi, '-').slice(0, 50)
const exportBar = () => `<div class="actions"><button class="btn" data-act="md">Exporter Markdown</button><button class="btn" data-act="json">JSON</button><button class="btn" data-act="print">Imprimer / PDF</button></div>`
document.addEventListener('click', (e) => {
  const a = e.target.closest('[data-act]')?.dataset.act
  if (!a || !S.report) return
  if (a === 'md') download(`seo360-${slug()}.md`, toMarkdown({ ...S.report, suggestions: S.suggestions }), 'text/markdown')
  if (a === 'json') download(`seo360-${slug()}.json`, JSON.stringify(S.report, null, 1), 'application/json')
  if (a === 'print') { $$('details.issue').forEach((d) => (d.open = true)); print() }
})

// ───────── Synthèse ─────────
function ring(score, grade) {
  const r = 70, c = 2 * Math.PI * r, off = c * (1 - score / 100)
  return `<svg viewBox="0 0 170 170" role="img" aria-label="Score ${score} sur 100"><circle cx="85" cy="85" r="${r}" fill="none" stroke="var(--surface-2)" stroke-width="16"/><circle cx="85" cy="85" r="${r}" fill="none" stroke="${color(score)}" stroke-width="16" stroke-linecap="round" stroke-dasharray="${c}" stroke-dashoffset="${off}" transform="rotate(-90 85 85)"/><text x="85" y="90" text-anchor="middle" class="num">${score}</text><text x="85" y="116" text-anchor="middle" class="grade">/100 · ${grade}</text></svg>`
}
function synthese() {
  const r = S.report
  if (!r) return intro()
  const R = r.result
  if (!R) return `<div class="card empty"><h2>${esc(r.target)}</h2><p>${esc(r.error || 'Aucun résultat')}</p></div>`
  const m = R.meta || {}, c = r.ctx || {}, psi = c.psi && !c.psi.error ? c.psi : null
  const top = R.issues.slice(0, 6)
  const kpis = r.kind === 'site' ? [
    ['Critiques', R.counts.critique], ['Importants', R.counts.important], ['Points validés', R.counts.ok],
    ['Perf. mobile (Lighthouse)', psi?.scores?.performance ?? '—'], ['LCP réel', psi?.field?.LCP ? fmt(psi.field.LCP / 1000, 1) + ' s' : '—'],
    ['INP réel', psi?.field?.INP ? psi.field.INP + ' ms' : '—'], ['Mots (page)', c.page?.wordCount ?? '—'], ['Pages explorées', c.crawl?.pages?.length ?? (c.page ? 1 : 0)],
  ] : r.kind === 'github' ? [['Étoiles', fmt(m.stars)], ['Forks', fmt(m.forks)], ['Topics', m.topics?.length ?? 0], ['Langage', esc(m.language || '—')]]
    : [['Note', m.rating ? fmt(m.rating, 1) + '/5' : '—'], ['Nombre d’avis', fmt(m.count)], ['Catégorie', esc(m.genre || '—')], ['Prix', esc(m.price || '—')]]
  return `
  <div class="section-head"><div><h2>${esc(r.target)}</h2><p>${{ site: 'Site web', app: 'Application', github: 'Dépôt GitHub' }[r.kind]} · ${esc(sectorById(r.input.sector).label)}${r.input.city ? ' · ' + esc(r.input.city) : ''} · ${new Date(r.generatedAt).toLocaleString('fr-FR')}</p></div>${exportBar()}</div>
  <div class="summary">
    <div class="card ring">${ring(R.global, R.grade)}<p>${R.global >= 85 ? 'Excellent socle : place à la croissance.' : R.global >= 70 ? 'Bon niveau, quelques freins à lever.' : R.global >= 50 ? 'Des corrections importantes vont débloquer du trafic.' : 'Priorité absolue : corriger les points critiques.'}</p></div>
    <div class="card"><h3>Scores par catégorie</h3><div class="bars">${Object.entries(R.scores).map(([k, s]) => `<div class="bar"><span class="lbl"><a href="#corrections" data-cat="${k}">${esc(s.label)}</a>${s.estimated ? '<small>(estimé)</small>' : ''}</span><span class="track"><span class="fill" style="width:${s.score}%;background:${color(s.score)}"></span></span><b>${s.score}</b></div>`).join('')}</div>
      <div class="chips">${['critique', 'important', 'moyen', 'faible', 'ok'].map((s) => `<span class="chip sev-${s}">${SEVERITY[s].label} · ${R.counts[s]}</span>`).join('')}</div></div>
  </div>
  <div class="kpis">${kpis.map(([k, v]) => `<div class="kpi"><div class="v">${v}</div><div class="k">${k}</div></div>`).join('')}</div>
  <div class="cols" style="margin-top:18px">
    <div class="card"><h3>Vos 6 priorités</h3><ul class="clean">${top.map((i) => `<li><span class="chip sev-${i.sev}">${SEVERITY[i.sev].label}</span> ${esc(i.title)}<br><span class="note">${esc(i.fix)}</span></li>`).join('') || '<li>Rien de bloquant 🎉</li>'}</ul><p><a href="#corrections" data-go="corrections">Voir les ${R.issues.length} corrections →</a></p></div>
    <div class="card">${r.kind === 'site' ? siteFacts(r) : metaFacts(m)}</div>
  </div>
  ${m.bots ? `<div class="card" style="margin-top:16px"><h3>Robots des moteurs et des IA (robots.txt)</h3><div class="table-wrap"><table><thead><tr><th>Robot</th><th>Usage</th><th>Type</th><th>Accès</th></tr></thead><tbody>${m.bots.map((b) => `<tr><td><code>${esc(b.ua)}</code></td><td>${esc(b.owner)}</td><td>${b.kind}</td><td>${b.allowed ? '<span class="chip sev-ok">autorisé</span>' : '<span class="chip sev-critique">bloqué</span>'}</td></tr>`).join('')}</tbody></table></div></div>` : ''}
  ${psi?.screenshot ? `<div class="card" style="margin-top:16px"><h3>Rendu mobile (PageSpeed)</h3><img class="shot" src="${psi.screenshot}" alt="Capture mobile de la page analysée" width="412" loading="lazy"></div>` : ''}`
}
after.synthese = () => $$('[data-cat]').forEach((a) => a.addEventListener('click', (e) => { e.preventDefault(); S.cat = a.dataset.cat; go('corrections') }))
function siteFacts(r) {
  const p = r.ctx?.page, m = r.result.meta || {}
  if (!p) return `<h3>Collecte</h3><p class="note">HTML non lu (mode PageSpeed seul). Collez le code source ou choisissez un proxy dans les options pour l’audit on-page complet.</p>`
  const row = (k, v) => `<tr><th>${k}</th><td>${v || '<span class="note">—</span>'}</td></tr>`
  return `<h3>La page en bref</h3><div class="table-wrap"><table><tbody>
    ${row('Titre', esc(p.title) + (p.title ? ` <span class="note">(${p.title.length} car.)</span>` : ''))}
    ${row('Description', esc(p.metaDescription) + (p.metaDescription ? ` <span class="note">(${p.metaDescription.length} car.)</span>` : ''))}
    ${row('H1', esc(p.h?.find((h) => h.level === 1)?.text))}
    ${row('CMS / techno', esc(m.cms?.join(', ')))}
    ${row('Mesure & pixels', esc(m.trackers?.join(', ')))}
    ${row('Bandeau cookies', esc(m.cmp?.join(', ')))}
    ${row('Schema.org', esc(m.schemaTypes?.join(', ')))}
    ${row('Réseaux liés', esc(Object.keys(m.social || {}).join(', ')))}
    ${row('Sujets détectés', esc([...(m.terms?.phrases || []), ...(m.terms?.words || [])].slice(0, 6).map((t) => t.term).join(' · ')))}
  </tbody></table></div>`
}
function metaFacts(m) {
  return `<h3>Fiche</h3><div class="table-wrap"><table><tbody>${Object.entries(m).filter(([, v]) => v != null && typeof v !== 'object').map(([k, v]) => `<tr><th>${esc(k)}</th><td>${esc(v)}</td></tr>`).join('')}${m.topics ? `<tr><th>topics</th><td>${m.topics.map((t) => `<span class="chip tag">${esc(t)}</span>`).join(' ')}</td></tr>` : ''}</tbody></table></div>`
}
function intro() {
  const items = [
    ['🔧', 'Audit technique & contenu', 'Indexation, robots.txt, sitemap, canonical, titres, H1, images, maillage, mots-clés, données structurées, crawl multi-pages.'],
    ['⚡', 'Vitesse réelle', 'Core Web Vitals des vrais visiteurs (LCP, INP, CLS) et opportunités Lighthouse via PageSpeed Insights.'],
    ['🤖', 'Visibilité IA (GEO)', 'Robots ChatGPT / Perplexity / Claude autorisés ? llms.txt, FAQ, faits chiffrés, entité de marque (sameAs), Bing.'],
    ['📍', 'SEO local', 'NAP, LocalBusiness, fiche Google, ville dans les titres, avis.'],
    ['#️⃣', 'Hashtags par réseau', 'Sélection prête à copier pour Instagram, TikTok, LinkedIn, YouTube, X, Facebook, Pinterest, Threads, Bluesky, Snapchat, selon les limites 2026.'],
    ['💶', 'Budget publicitaire', 'Répartition Google / Meta / TikTok / LinkedIn…, clics, conversions et CPA estimés, budget pour votre objectif, montée en charge.'],
    ['🏁', 'Benchmark concurrents', 'Jusqu’à 5 concurrents comparés catégorie par catégorie, et ce qu’ils font mieux que vous.'],
    ['📱', 'Applications & GitHub', 'ASO App Store / Google Play, référencement d’un dépôt GitHub (topics, README, releases).'],
  ]
  const last = store.get('last')
  return `<div class="section-head"><div><h2>Ce que vous obtenez</h2><p>Une analyse, un plan d’action priorisé, et les chiffres pour décider.</p></div>${last ? `<button class="btn" id="restore">Rouvrir la dernière analyse (${esc(last.target)})</button>` : ''}</div>
  <div class="cols">${items.map(([i, t, d]) => `<div class="card"><h3>${i} ${t}</h3><p class="note" style="margin:0">${d}</p></div>`).join('')}</div>`
}
after.synthese_intro = () => {}
const _afterSyn = after.synthese
after.synthese = () => { _afterSyn(); $('#restore')?.addEventListener('click', () => { S.report = store.get('last'); syncForm(S.report); render() }) }

// ───────── Corrections ─────────
function corrections() {
  const R = S.report?.result
  if (!R) return needReport('Corrections')
  const cats = Object.entries(R.scores)
  const list = R.issues.filter((i) => (!S.cat || i.cat === S.cat) && S.sevs.has(i.sev))
  const allCats = { ...CATEGORIES, ...Object.fromEntries(cats.map(([k, v]) => [k, { label: v.label }])) }
  return `<div class="section-head"><div><h2>Corrections à faire</h2><p>Triées par gravité puis par rapport impact / effort. Cliquez pour voir comment corriger.</p></div>${exportBar()}</div>
  <div class="filters"><button class="chip tag" data-fcat="" aria-pressed="${!S.cat}">Toutes</button>${cats.map(([k, v]) => `<button class="chip tag" data-fcat="${k}" aria-pressed="${S.cat === k}">${esc(v.label)} · ${v.issues}</button>`).join('')}</div>
  <div class="filters">${['critique', 'important', 'moyen', 'faible'].map((s) => `<button class="chip sev-${s}" data-fsev="${s}" aria-pressed="${S.sevs.has(s)}">${SEVERITY[s].label} · ${R.counts[s]}</button>`).join('')}</div>
  <div class="issues">${list.map((i) => `<details class="issue ${i.sev}">
    <summary><span class="chip sev-${i.sev}">${SEVERITY[i.sev].label}</span><span class="t">${esc(i.title)}</span><span class="m">${esc(allCats[i.cat]?.label || i.cat)} · impact ${meter(i.impact)} · effort ${meter(i.effort)}</span></summary>
    <div class="body">${i.detail ? `<p>${esc(i.detail)}</p>` : ''}${i.fix ? `<div class="fix"><b>Correction :</b> ${esc(i.fix)}</div>` : ''}${i.code ? `<div class="code"><pre>${esc(i.code)}</pre><button class="btn sm" data-copy="">Copier</button></div>` : ''}</div>
  </details>`).join('') || '<p class="empty">Aucun point dans ce filtre.</p>'}</div>
  ${R.passed.length ? `<div class="card" style="margin-top:18px"><h3>Déjà bien (${R.passed.length})</h3><ul class="clean">${R.passed.map((p) => `<li><span class="chip sev-ok">OK</span> ${esc(p.title)}</li>`).join('')}</ul></div>` : ''}
  ${R.infos.length ? `<div class="card" style="margin-top:16px"><h3>À vérifier hors site</h3><ul class="clean">${R.infos.map((p) => `<li><span class="chip sev-info">Info</span> <b>${esc(p.title)}</b>${p.detail ? ` — <span class="note">${esc(p.detail)}</span>` : ''}${p.fix ? `<br><span class="note">${esc(p.fix)}</span>` : ''}</li>`).join('')}</ul></div>` : ''}`
}
after.corrections = () => {
  $$('[data-fcat]').forEach((b) => b.addEventListener('click', () => { S.cat = b.dataset.fcat || null; render() }))
  $$('[data-fsev]').forEach((b) => b.addEventListener('click', () => { const s = b.dataset.fsev; S.sevs.has(s) ? S.sevs.delete(s) : S.sevs.add(s); render() }))
}

// ───────── Plan ─────────
function plan() {
  const r = S.report
  if (!r?.plan) return needReport('Plan d’action')
  const key = 'plan:' + r.target, done = store.get(key, {})
  return `<div class="section-head"><div><h2>Plan d’action</h2><p>Cochez au fur et à mesure (sauvegardé dans ce navigateur).</p></div>${exportBar()}</div>
  <div class="stack">${r.plan.steps.map((s) => {
    const all = [...s.items.map((i) => ({ t: i.title, d: i.fix, sev: i.sev })), ...s.extra.map((t) => ({ t }))]
    const n = all.filter((_, j) => done[s.id + j]).length
    return `<div class="card step"><h3>${esc(s.title)} <span class="pct">${n}/${all.length}</span></h3><p class="why">${esc(s.why)}</p><ul class="clean check">${all.map((it, j) => `<li><label><input type="checkbox" data-plan="${s.id + j}" ${done[s.id + j] ? 'checked' : ''}><span class="${done[s.id + j] ? 'done' : ''}">${it.sev ? `<span class="chip sev-${it.sev}">${SEVERITY[it.sev].label}</span> ` : ''}${esc(it.t)}${it.d ? `<br><span class="note">${esc(it.d)}</span>` : ''}</span></label></li>`).join('')}</ul></div>`
  }).join('')}
  <div class="card"><h3>Indicateurs à suivre</h3><div class="table-wrap"><table><thead><tr><th>KPI</th><th>Aujourd’hui</th><th>Objectif</th></tr></thead><tbody>${r.plan.kpis.map((k) => `<tr><td>${esc(k.kpi)}</td><td>${esc(k.now)}</td><td>${esc(k.target)}</td></tr>`).join('')}</tbody></table></div></div></div>`
}
after.plan = () => $$('[data-plan]').forEach((c) => c.addEventListener('change', () => { const k = 'plan:' + S.report.target, d = store.get(k, {}); d[c.dataset.plan] = c.checked; store.set(k, d); render() }))

// ───────── Mots-clés ─────────
function motscles() {
  const v = vals(), terms = S.report?.result?.meta?.terms
  const seed = v.keyword || terms?.phrases?.[0]?.term || sectorById(v.sector).keywords[0]
  const k = keywordIdeas({ seed, sector: v.sector, city: v.city })
  const sug = S.suggestions
  return `<div class="section-head"><div><h2>Mots-clés</h2><p>Une page par intention. Volumes et CPC : Keyword Planner (gratuit avec un compte Google Ads) ; vos vraies requêtes : Search Console.</p></div>
  <div class="actions"><button class="btn primary" id="suggest">Suggestions Google en direct pour « ${esc(seed)} »</button></div></div>
  <div class="cols">${Object.entries(k.groups).map(([intent, list]) => `<div class="card"><h3>${intent[0].toUpperCase() + intent.slice(1)}</h3><p class="note">${esc(INTENTS[intent])}</p><div class="tags">${list.map((x) => `<span class="chip tag">${esc(x.keyword)}</span>`).join('')}</div></div>`).join('')}</div>
  ${sug.length ? `<div class="card" style="margin-top:16px"><h3>Suggestions Google réelles (${sug.length})</h3><div class="cols">${Object.keys(INTENTS).map((intent) => { const l = sug.filter((s) => classify(s) === intent); return l.length ? `<div><h4>${intent}</h4><div class="tags">${l.map((s) => `<span class="chip tag">${esc(s)}</span>`).join('')}</div></div>` : '' }).join('')}</div><p><button class="btn sm" data-copy="${esc(sug.join('\n'))}">Copier la liste</button></p></div>` : ''}
  ${terms ? `<div class="card" style="margin-top:16px"><h3>Sujets détectés dans votre page</h3><p class="note">Ce que Google et les IA « lisent » comme thème principal. S’il ne correspond pas à votre cible, réécrivez.</p><div class="tags">${[...terms.phrases, ...terms.words].slice(0, 24).map((t) => `<span class="chip tag">${esc(t.term)} · ${t.count}</span>`).join('')}</div></div>` : ''}
  <div class="card" style="margin-top:16px"><h3>Outils de volume et de tendances</h3><ul class="clean">${k.tools.map((t) => `<li><a href="${esc(t.url)}" target="_blank" rel="noopener">${esc(t.name)}</a></li>`).join('')}</ul></div>`
}
after.motscles = () => $('#suggest')?.addEventListener('click', async (e) => {
  e.target.disabled = true; e.target.textContent = 'Interrogation de Google…'
  const v = vals(), seed = v.keyword || S.report?.result?.meta?.terms?.phrases?.[0]?.term || sectorById(v.sector).keywords[0]
  S.suggestions = await googleSuggest(v.city && !seed.includes(v.city) ? seed : seed)
  if (S.report) S.report.suggestions = S.suggestions
  if (!S.suggestions.length) toast('Pas de suggestion (bloqueur de scripts ?)')
  render()
})

// ───────── Hashtags ─────────
function hashtags() {
  const v = vals(), terms = S.report?.result?.meta?.terms?.phrases?.map((t) => t.term).slice(0, 5) || []
  const extra = store.get('hkw', '')
  const h = generateHashtags({ sector: v.sector, keywords: [v.keyword, ...extra.split(',')].filter((x) => x && x.trim()), terms, city: v.city, brand: v.brand, lang: v.lang })
  const prio = h.priority
  const nets = Object.values(h.networks).sort((a, b) => (prio.indexOf(a.id) + 1 || 99) - (prio.indexOf(b.id) + 1 || 99))
  return `<div class="section-head"><div><h2>Hashtags par réseau</h2><p>${esc(h.sector)}${v.city ? ' · ' + esc(v.city) : ''} — limites et usages 2026. Réglez secteur, ville, marque et langue dans le formulaire.</p></div>
  <label style="min-width:280px">Mots-clés supplémentaires (virgules)<input id="hkw" value="${esc(extra)}" placeholder="ex. vitrine pâtissière, froid ventilé"></label></div>
  <div class="cols">${nets.map((n) => `<div class="card net"><header><h3>${esc(n.label)} ${prio.includes(n.id) ? '<span class="prio">● prioritaire pour votre secteur</span>' : ''}</h3><button class="btn sm" data-copy="${esc(n.tags.map((t) => '#' + t.camel).join(' '))}">Copier</button></header>
    <div class="tags">${n.tags.map((t) => `<span class="htag">#${esc(t.camel)}</span>`).join('') || '<span class="note">—</span>'}</div>
    ${n.reserve.length ? `<div><span class="note">Réserve (à faire tourner d’un post à l’autre) :</span><div class="tags">${n.reserve.slice(0, 10).map((t) => `<span class="htag res">#${esc(t.camel)}</span>`).join('')}</div></div>` : ''}
    ${n.rules ? `<dl><dt>Limite</dt><dd>${esc(n.rules.hashtag_limit)}</dd><dt>Conseillé</dt><dd>${esc(n.rules.recommended_count)}</dd><dt>Placement</dt><dd>${esc(n.rules.placement)}</dd><dt>Texte</dt><dd>${esc(n.rules.caption_limit)}</dd><dt>Formats</dt><dd>${esc((n.rules.best_formats || []).join(' · '))}</dd><dt>Rythme</dt><dd>${esc(n.rules.posting_frequency)}</dd><dt>Moments</dt><dd>${esc(n.rules.best_times_fr)}</dd><dt>Algorithme</dt><dd>${esc(n.rules.algorithm_2026)}</dd></dl>` : ''}
    <details><summary class="note">Modèle de légende</summary><div class="caption copy-src">${esc(n.caption)}</div><button class="btn sm" data-copy="${esc(n.caption)}">Copier la légende</button></details>
  </div>`).join('')}</div>
  <div class="cols" style="margin-top:16px">
    <div class="card"><h3>Tous les hashtags par famille</h3>${Object.entries(h.pools).filter(([, l]) => l.length).map(([g, l]) => `<p><b>${g}</b></p><div class="tags">${l.map((t) => `<span class="htag res">#${esc(t.camel)}</span>`).join('')}</div>`).join('')}</div>
    <div class="card"><h3>À ne jamais utiliser</h3><p class="note">Hashtags d’engagement artificiel ou ponctuellement restreints : signal de spam, portée réduite.</p><div class="tags">${h.banned.map((t) => `<span class="chip sev-critique">#${esc(t)}</span>`).join('')}</div>
    <h3 style="margin-top:16px">Règles d’or</h3><ul class="clean"><li>Mélange : marque + niche + local + sectoriel ; jamais que des hashtags géants.</li><li>CamelCase (#PatisserieArtisanale) : lisible par les lecteurs d’écran.</li><li>Les mots-clés dans la légende, le texte à l’écran et l’oral comptent plus que les hashtags (Instagram, TikTok).</li><li>Changez 2–3 hashtags d’un post à l’autre (réserve) ; un hashtag de marque fixe.</li><li>Mesurez : statistiques → « Découverte » / « Recherche » par publication.</li></ul></div>
  </div>`
}
after.hashtags = () => $('#hkw')?.addEventListener('change', (e) => { store.set('hkw', e.target.value); render() })

// ───────── Budget ─────────
const CH_COLORS = ['#4338ca', '#14b8a6', '#f59e0b', '#ec4899', '#0ea5e9', '#84cc16', '#a855f7', '#ef4444', '#64748b', '#10b981']
function budget() {
  const v = vals(), kind = S.report?.kind
  const t = store.get('target', 0)
  const b = planBudget({ sector: v.sector, goal: kind === 'app' ? 'telechargements' : v.goal, monthly: v.monthly || 0, local: v.local, avgValue: v.avgValue, targetConversions: t })
  const ind = (bench.google_ads_by_industry || [])
  return `<div class="section-head"><div><h2>Budget publicitaire</h2><p>${esc(b.sector)} · objectif : ${esc(b.goalLabel)} · ${b.local ? 'zone locale' : 'national'}. Modifiez budget, objectif et valeur client dans le formulaire.</p></div>
  <label style="min-width:240px">Conversions visées / mois<input id="target" type="number" min="0" value="${t || ''}" placeholder="ex. 30 demandes de devis"></label></div>
  <div class="kpis">
    <div class="kpi"><div class="v">${fmt(b.monthly)} €</div><div class="k">par mois · ${fmt(b.daily)} €/jour</div></div>
    <div class="kpi"><div class="v">${rng(b.totals.clicks)}</div><div class="k">clics estimés / mois</div></div>
    <div class="kpi"><div class="v">≈ ${fmt(b.totals.mid)}</div><div class="k">conversions / mois (fourchette ${rng(b.totals.conversions)})</div></div>
    <div class="kpi"><div class="v">≈ ${fmt(b.totals.cpaMid)} €</div><div class="k">coût par conversion (${rng(b.totals.cpa, 0, ' €')})${b.totals.roas ? ` · ROAS ${rng(b.totals.roas, 1)}${b.close < 1 ? ` (si ${Math.round(b.close * 100)} % des leads signent)` : ''}` : ''}</div></div>
  </div>
  ${b.needed ? `<div class="card" style="margin-top:14px"><b>Pour ${b.needed.target} conversions / mois :</b> prévoir <b>≈ ${fmt(b.needed.mid)} €</b> par mois (fourchette ${rng(b.needed.budget, 0, ' €')}) (à ce CPA estimé). ${(b.needed.mid || b.needed.budget[0]) > b.monthly ? 'C’est plus que le budget actuel : augmentez progressivement, ou améliorez d’abord le taux de conversion de vos pages.' : 'Votre budget suffit en théorie.'}</div>` : ''}
  <div class="card" style="margin-top:14px"><h3>Répartition conseillée</h3>
    <div class="stackbar">${b.channels.map((c, i) => `<span style="width:${(c.budget / (b.monthly || 1)) * 100}%;background:${CH_COLORS[i]}" title="${esc(c.label)}">${Math.round((c.budget / (b.monthly || 1)) * 100)} %</span>`).join('')}</div>
    <div class="legend">${b.channels.map((c, i) => `<span><i style="background:${CH_COLORS[i]}"></i>${esc(c.label)} — ${fmt(c.budget)} €</span>`).join('')}</div>
    ${b.dropped.length ? `<p class="note">Écartés à ce budget pour que chaque canal sorte de sa phase d’apprentissage : ${esc(b.dropped.join(', '))}.</p>` : ''}
    <div class="table-wrap" style="margin-top:12px"><table><thead><tr><th>Canal</th><th class="n">Budget</th><th class="n">€/jour</th><th class="n">CPC</th><th class="n">Clics</th><th class="n">Conv.</th><th class="n">CPA</th><th>Apprentissage / minimum</th></tr></thead><tbody>
      ${b.channels.map((c) => `<tr><td><b>${esc(c.label)}</b><br><span class="note">${esc(c.bestFor)}</span></td><td class="n">${fmt(c.budget)} €</td><td class="n">${c.daily} €</td><td class="n">${rng(c.cpc, 2)} €</td><td class="n">${rng(c.clicks)}</td><td class="n">${rng(c.conversions, 0)}</td><td class="n">${rng(c.cpa, 0, ' €')}</td><td class="note">${esc(c.learning)}<br>${esc(c.minimum)}</td></tr>`).join('')}
    </tbody></table></div></div>
  ${b.warnings.length ? `<div class="stack" style="margin-top:14px">${b.warnings.map((w) => `<div class="warn">${esc(w)}</div>`).join('')}</div>` : ''}
  <div class="cols3" style="margin-top:16px">${b.rampUp.map((p) => `<div class="card"><h3>${esc(p.phase)}</h3><ul class="clean">${p.actions.map((a) => `<li>• ${esc(a)}</li>`).join('')}</ul></div>`).join('')}</div>
  <div class="cols" style="margin-top:16px">
    <div class="card"><h3>SEO : budget et répartition</h3><p>${esc(b.seo.note)}</p><p class="note">${esc(b.seo.split)}</p><ul class="clean">${b.seo.items.map((i) => `<li><b>${esc(i.item)}</b> — ${esc(i.cost)}</li>`).join('')}</ul></div>
    <div class="card"><h3>Règles de budget (sources 2025–2026)</h3><ul class="clean">${b.seo.rules.map((r) => `<li class="note">• ${esc(r)}</li>`).join('')}</ul></div>
  </div>
  <div class="card" style="margin-top:16px"><h3>Repères Google Ads par secteur</h3><p class="note">${esc(bench.meta?.google_ads_dataset || '')} ${esc(bench.meta?.us_only_warning || '')}</p>
    <div class="table-wrap"><table><thead><tr><th>Secteur</th><th class="n">CTR</th><th class="n">CPC US</th><th class="n">CPC FR estimé</th><th class="n">Taux conv.</th><th class="n">Coût / lead US</th></tr></thead><tbody>
    ${ind.map((r) => `<tr class="${r.industry_fr === b.bench.industry ? 'us' : ''}"><td>${esc(r.industry_fr)}</td><td class="n">${r.ctr != null ? fmt(r.ctr * 100, 2) + ' %' : '—'}</td><td class="n">${r.cpc_usd != null ? fmt(r.cpc_usd, 2) + ' $' : '—'}</td><td class="n">${r.cpc_usd != null ? `${fmt(r.cpc_usd * 0.86 * 0.4, 2)}–${fmt(r.cpc_usd * 0.86 * 0.6, 2)} €` : '—'}</td><td class="n">${r.cvr != null ? fmt(r.cvr * 100, 2) + ' %' : '—'}</td><td class="n">${r.cpl_usd != null ? fmt(r.cpl_usd, 2) + ' $' : '—'}</td></tr>`).join('')}
    </tbody></table></div></div>
  <div class="card" style="margin-top:16px"><h3>Repères par plateforme (France / UE)</h3><div class="table-wrap"><table><thead><tr><th>Plateforme</th><th class="n">CPM</th><th class="n">CPC</th><th class="n">CTR</th><th class="n">Conv.</th><th>Minimum</th></tr></thead><tbody>
    ${(bench.platforms || []).map((p) => `<tr><td><b>${esc(p.id)}</b><br><span class="note">${esc(p.best_for)}</span></td><td class="n">${p.cpm_eur?.[0] != null ? rng(p.cpm_eur, 0, ' €') : '—'}</td><td class="n">${rng(p.cpc_eur, 2, ' €')}</td><td class="n">${p.ctr ? `${fmt(p.ctr[0] * 100, 2)}–${fmt(p.ctr[1] * 100, 2)} %` : '—'}</td><td class="n">${p.cvr ? `${fmt(p.cvr[0] * 100, 1)}–${fmt(p.cvr[1] * 100, 1)} %` : '—'}</td><td class="note">${esc(p.min_daily_budget)}</td></tr>`).join('')}
  </tbody></table></div><p class="note">Estimations : à recaler sur vos propres comptes après 2–4 semaines.</p></div>`
}
after.budget = () => $('#target')?.addEventListener('change', (e) => { store.set('target', +e.target.value || 0); render() })

// ───────── Concurrents ─────────
function concurrents() {
  const r = S.report
  if (!r?.competitors?.length) return `<div class="card empty"><h2>Benchmark concurrents</h2><p>Ajoutez jusqu’à 5 URL concurrentes dans « Concurrents, collecte et options avancées », puis relancez l’analyse.</p><p class="note">En CLI : <code>node seo/cli.mjs votre-site.fr --concurrents a.fr,b.fr</code></p></div>`
  const R = r.result
  const me = { url: r.target + ' (vous)', global: R?.global, scores: Object.fromEntries(Object.entries(R?.scores || {}).map(([k, v]) => [k, v.score])), perf: r.ctx?.psi?.scores?.performance, lcp: r.ctx?.psi?.field?.LCP, words: r.ctx?.page?.wordCount, schema: R?.meta?.schemaTypes?.join(', '), social: Object.keys(R?.meta?.social || {}), llms: r.ctx?.llms?.status === 200, bots: (R?.meta?.bots || []).filter((b) => !b.allowed).map((b) => b.ua), me: true }
  const all = [me, ...r.competitors]
  const cats = Object.keys(me.scores)
  const better = []
  for (const c of r.competitors) {
    for (const k of cats) if (c.scores[k] != null && me.scores[k] != null && c.scores[k] - me.scores[k] >= 10) better.push(`<b>${esc(c.url)}</b> vous devance en ${esc(R.scores[k].label)} (${c.scores[k]} contre ${me.scores[k]}).`)
    if (c.perf != null && me.perf != null && c.perf - me.perf >= 10) better.push(`<b>${esc(c.url)}</b> est plus rapide sur mobile (${c.perf} contre ${me.perf}).`)
    if (c.words && me.words && c.words > me.words * 1.5) better.push(`<b>${esc(c.url)}</b> a ${fmt(c.words)} mots sur sa page contre ${fmt(me.words)} : plus de contenu à indexer et à citer.`)
    const extraSocial = c.social.filter((s) => !me.social.includes(s))
    if (extraSocial.length) better.push(`<b>${esc(c.url)}</b> est relié à ${esc(extraSocial.join(', '))} (pas vous).`)
    if (c.llms && !me.llms) better.push(`<b>${esc(c.url)}</b> publie un llms.txt.`)
    if (c.schema && c.schema !== 'aucune' && (!me.schema || me.schema === '')) better.push(`<b>${esc(c.url)}</b> utilise des données structurées (${esc(c.schema)}).`)
  }
  return `<div class="section-head"><div><h2>Benchmark concurrents</h2><p>Même grille d’audit appliquée à chaque site (page d’accueil).</p></div>${exportBar()}</div>
  <div class="table-wrap"><table><thead><tr><th>Site</th><th class="n">Score</th>${cats.map((k) => `<th class="n">${esc(R.scores[k].label.split(' ')[0])}</th>`).join('')}<th class="n">Perf.</th><th class="n">LCP</th><th class="n">Mots</th><th>Schema</th><th>Réseaux</th><th>llms.txt</th></tr></thead><tbody>
    ${all.map((c) => `<tr class="${c.me ? 'us' : ''}"><td>${esc(c.url)}${c.error ? `<br><span class="note">${esc(c.error)}</span>` : ''}</td><td class="n"><b style="color:${color(c.global ?? 0)}">${c.global ?? '—'}</b></td>${cats.map((k) => `<td class="n">${c.scores?.[k] ?? '—'}</td>`).join('')}<td class="n">${c.perf ?? '—'}</td><td class="n">${c.lcp ? fmt(c.lcp / 1000, 1) + ' s' : '—'}</td><td class="n">${fmt(c.words)}</td><td class="note">${esc(c.schema || '—')}</td><td class="note">${esc((c.social || []).join(', '))}</td><td>${c.llms ? '✅' : '—'}</td></tr>`).join('')}
  </tbody></table></div>
  <div class="cols" style="margin-top:16px">
    <div class="card"><h3>Ce que vos concurrents font mieux</h3><ul class="clean">${better.map((b) => `<li>• ${b}</li>`).join('') || '<li>Vous êtes devant sur tous les axes mesurés 👏</li>'}</ul></div>
    <div class="card cmpbars"><h3>Comparaison par catégorie</h3>${cats.map((k) => `<div class="row"><h4>${esc(R.scores[k].label)}</h4>${all.map((c) => `<div class="line ${c.me ? 'me' : ''}"><span title="${esc(c.url)}">${esc(c.url.replace(/^https?:\/\//, ''))}</span><span class="track"><span class="fill" style="width:${c.scores?.[k] ?? 0}%"></span></span><b>${c.scores?.[k] ?? '—'}</b></div>`).join('')}</div>`).join('')}</div>
  </div>`
}

// ───────── Checklists ─────────
function checklists() {
  const key = 'checks:' + (S.report?.target || 'global'), done = store.get(key, {})
  const v = vals(), sector = sectorById(v.sector)
  const order = [...CHECKLISTS].sort((a, b) => score(b) - score(a))
  function score(c) { return (c.id === 'local' && (v.local ?? sector.local)) || (c.id === 'aso' && S.report?.kind === 'app') || (c.id === 'github' && S.report?.kind === 'github') || (c.id === 'ecommerce' && v.sector.startsWith('ecommerce')) ? 2 : ['technique', 'contenu', 'geo'].includes(c.id) ? 1 : 0 }
  return `<div class="section-head"><div><h2>Checklists expertes</h2><p>${S.report ? 'Pour ' + esc(S.report.target) : 'Générales'} — cochez ce qui est fait (sauvegardé localement).</p></div></div>
  <div class="cols">${order.map((c) => { const n = c.items.filter((_, i) => done[c.id + i]).length; return `<div class="card"><h3>${esc(c.title)} <span class="pct">${n}/${c.items.length}</span></h3><ul class="clean check">${c.items.map((it, i) => `<li><label><input type="checkbox" data-chk="${c.id + i}" ${done[c.id + i] ? 'checked' : ''}><span class="${done[c.id + i] ? 'done' : ''}">${esc(it)}</span></label></li>`).join('')}</ul></div>` }).join('')}</div>`
}
after.checklists = () => $$('[data-chk]').forEach((c) => c.addEventListener('change', () => { const k = 'checks:' + (S.report?.target || 'global'), d = store.get(k, {}); d[c.dataset.chk] = c.checked; store.set(k, d); render() }))

// ───────── Étude de marché ─────────
const FEAT = { audit_technique: 'Audit', mots_cles: 'Mots-clés', backlinks: 'Liens', rank_tracking: 'Positions', contenu_ia: 'Contenu', geo_ia: 'GEO / IA', local: 'Local', aso: 'ASO', hashtags_social: 'Social', ads_budget: 'Ads', benchmark_concurrents: 'Concurrents', francais: 'FR' }
const US = { name: 'SEO 360 (cette plateforme)', category: 'suite', price_entry: '0 € — open-source', best_for: 'Tout-en-un francophone : site, app, GitHub', features: { audit_technique: 2, mots_cles: 1, backlinks: 0, rank_tracking: 0, contenu_ia: 1, geo_ia: 2, local: 2, aso: 1, hashtags_social: 2, ads_budget: 2, benchmark_concurrents: 2, francais: 2 } }
function marche() {
  const sub = S.mk
  const head = `<div class="section-head"><div><h2>Étude de marché & benchmark</h2><p>Recherche du ${esc(market.generated)} : ${market.tools.length} outils commerciaux, ${oss.projects.length} projets open-source GitHub.</p></div>
  <div class="actions">${[['outils', 'Outils du marché'], ['swot', 'SWOT & positionnement'], ['oss', 'Open-source GitHub']].map(([k, l]) => `<button class="btn ${sub === k ? 'primary' : ''}" data-mk="${k}">${l}</button>`).join('')}</div></div>`
  if (sub === 'swot') return head + `<div class="cols">${[['forces', 'Forces'], ['faiblesses', 'Faiblesses'], ['opportunites', 'Opportunités'], ['menaces', 'Menaces']].map(([k, l]) => `<div class="card"><h3>${l}</h3><ul class="clean">${(market.swot[k] || []).map((x) => `<li>• ${esc(x)}</li>`).join('')}</ul></div>`).join('')}</div>
    <div class="card" style="margin-top:16px"><h3>Positionnement recommandé</h3><ol>${market.positioning.map((x) => `<li>${esc(x)}</li>`).join('')}</ol></div>
    <div class="card" style="margin-top:16px"><h3>Constats du marché</h3><ul class="clean">${market.market_insights.map((x) => `<li>• ${esc(x)}</li>`).join('')}</ul></div>
    <div class="card" style="margin-top:16px"><h3>Sources (${market.sources.length})</h3><p class="note">Tarifs relevés par recherche web (sites éditeurs non consultables depuis l’environnement de recherche) : à reconfirmer avant toute décision.</p><ul class="clean src">${market.sources.map((s) => `<li><a href="${esc(s.url)}" target="_blank" rel="noopener">${esc(s.title || s.url)}</a></li>`).join('')}</ul></div>`
  if (sub === 'oss') {
    const cats = [...new Set(oss.projects.map((p) => p.category))]
    const list = oss.projects.filter((p) => !S.ossCat || p.category === S.ossCat).sort((a, b) => b.stars - a.stars)
    return head + `<div class="filters"><button class="chip tag" data-oss="" aria-pressed="${!S.ossCat}">Tous</button>${cats.map((c) => `<button class="chip tag" data-oss="${c}" aria-pressed="${S.ossCat === c}">${esc(c)}</button>`).join('')}</div>
    <div class="table-wrap"><table><thead><tr><th>Dépôt</th><th class="n">★</th><th>Catégorie</th><th>Ce qu’il fait</th><th>Ce qu’on en retient</th><th>Licence</th></tr></thead><tbody>${list.map((p) => `<tr><td><a href="${esc(p.url)}" target="_blank" rel="noopener">${esc(p.name)}</a><br><span class="note">${esc(p.language || '')} · ${esc(p.last_push || '')}</span></td><td class="n">${fmt(p.stars)}</td><td>${esc(p.category)}</td><td>${esc(p.what)}</td><td class="note">${esc(p.borrow)}</td><td class="note">${esc(p.license || '—')}</td></tr>`).join('')}</tbody></table></div>
    <div class="cols" style="margin-top:16px"><div class="card"><h3>Ce que l’open-source ne couvre pas</h3><ul class="clean">${oss.feature_gaps.map((x) => `<li>• ${esc(x)}</li>`).join('')}</ul></div><div class="card"><h3>Enseignements</h3><ul class="clean">${oss.top_insights.map((x) => `<li>• ${esc(x)}</li>`).join('')}</ul></div></div>
    <p class="note">${esc(oss.method)}</p>`
  }
  const cats = [...new Set(market.tools.map((t) => t.category))]
  const tools = [US, ...market.tools.filter((t) => !S.toolCat || t.category === S.toolCat)]
  return head + `<div class="filters"><button class="chip tag" data-tool="" aria-pressed="${!S.toolCat}">Tous</button>${cats.map((c) => `<button class="chip tag" data-tool="${c}" aria-pressed="${S.toolCat === c}">${esc(c)}</button>`).join('')}</div>
  <div class="table-wrap"><table><thead><tr><th>Outil</th><th>Prix d’entrée</th>${Object.values(FEAT).map((f) => `<th class="n">${f}</th>`).join('')}</tr></thead><tbody>
  ${tools.map((t) => `<tr class="${t === US ? 'us' : ''}"><td>${t.url ? `<a href="${esc(t.url)}" target="_blank" rel="noopener">${esc(t.name)}</a>` : esc(t.name)}<br><span class="note">${esc(t.best_for)}</span></td><td class="note">${esc(t.price_entry)}</td>${Object.keys(FEAT).map((k) => `<td class="n"><span class="heat h${t.features?.[k] ?? 0}" title="${['absent', 'partiel', 'fort'][t.features?.[k] ?? 0]}">${t.features?.[k] ?? 0}</span></td>`).join('')}</tr>`).join('')}
  </tbody></table></div><p class="note">${esc(market.feature_legend)} — notes d’experts, cohérentes entre outils. SEO 360 : pas de base de liens ni de suivi de positions (s’appuie sur Search Console) ; notes « 1 » = partiel.</p>
  <div class="cols" style="margin-top:16px">${market.tools.slice(0, 8).map((t) => `<div class="card"><h3>${esc(t.name)} <span class="note">${esc(t.price_entry)}</span></h3><p><b>+</b> ${esc(t.strengths.join(' · '))}</p><p><b>−</b> ${esc(t.weaknesses.join(' · '))}</p></div>`).join('')}</div>`
}
after.marche = () => {
  $$('[data-mk]').forEach((b) => b.addEventListener('click', () => { S.mk = b.dataset.mk; render() }))
  $$('[data-oss]').forEach((b) => b.addEventListener('click', () => { S.ossCat = b.dataset.oss; render() }))
  $$('[data-tool]').forEach((b) => b.addEventListener('click', () => { S.toolCat = b.dataset.tool; render() }))
}

// ───────── Guide ─────────
function guide() {
  return `<div class="section-head"><div><h2>Tout ce qu’il faut savoir en 2026</h2><p>SEO, SEA, réseaux sociaux, IA : l’essentiel, sourcé.</p></div></div>
  <div class="stack">${GUIDE.map((g) => `<div class="card"><h3>${esc(g.title)}</h3><ul class="clean">${g.body.map((b) => `<li>• ${esc(b)}</li>`).join('')}</ul></div>`).join('')}
  <div class="card"><h3>Faits sourcés</h3><div class="table-wrap"><table><tbody>${(bench.seo_facts || []).map((f) => `<tr><th>${esc(f.topic)}</th><td>${esc(f.fact)}${f.source ? `<br><a class="src" href="${esc(f.source)}" target="_blank" rel="noopener">source</a>` : ''}</td></tr>`).join('')}</tbody></table></div></div>
  <div class="card"><h3>Sources des benchmarks (${(bench.sources || []).length})</h3><p class="note">${esc(bench.meta?.method || '')}</p><ul class="clean src">${(bench.sources || []).map((s) => `<li><a href="${esc(s.url)}" target="_blank" rel="noopener">${esc(s.title || s.url)}</a></li>`).join('')}</ul></div></div>`
}

// ───────── Thème & démarrage ─────────
const th = store.get('theme', '')
if (th) document.documentElement.dataset.theme = th
$('#theme').addEventListener('click', () => {
  const dark = document.documentElement.dataset.theme ? document.documentElement.dataset.theme === 'dark' : matchMedia('(prefers-color-scheme: dark)').matches
  document.documentElement.dataset.theme = dark ? 'light' : 'dark'; store.set('theme', document.documentElement.dataset.theme)
})
const h = location.hash.slice(1)
if (TABS.some(([id]) => id === h)) S.tab = h
render()

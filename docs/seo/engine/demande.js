// Demande réelle : ce que les gens tapent vraiment, d'après 4 autocomplétions gratuites et sans clé
// (Google, YouTube, Amazon.fr, DuckDuckGo), avec des variantes (questions, a…z), plus les tendances
// Google du jour en France. Rien n'est inventé : chaque idée garde la liste des sources qui l'ont donnée.
// Aucune de ces sources ne donne de volume : une idée vue par plusieurs sources est plus sûre, pas « plus cherchée ».
import { classify } from './keywords.js'

export const SOURCES = {
  google: { label: 'Google', why: 'recherches web' },
  youtube: { label: 'YouTube', why: 'recherches vidéo (titres, hashtags vidéo)' },
  amazon: { label: 'Amazon.fr', why: 'intentions d’achat' },
  duckduckgo: { label: 'DuckDuckGo', why: 'deuxième moteur web, confirme Google' },
}
const enc = encodeURIComponent
const URLS = {
  google: (q) => `https://suggestqueries.google.com/complete/search?client=firefox&hl=fr&gl=fr&q=${enc(q)}`,
  youtube: (q) => `https://suggestqueries.google.com/complete/search?client=firefox&ds=yt&hl=fr&gl=fr&q=${enc(q)}`,
  amazon: (q) => `https://completion.amazon.fr/api/2017/suggestions?mid=A13V1IB3VIYZZH&alias=aps&lop=fr_FR&prefix=${enc(q)}`,
  duckduckgo: (q) => `https://duckduckgo.com/ac/?kl=fr-fr&q=${enc(q)}`,
}
// Navigateur : seules Google et YouTube répondent en JSONP ; Amazon, DuckDuckGo et Tendances refusent (pas de CORS).
const JSONP = {
  google: (q) => `https://suggestqueries.google.com/complete/search?client=youtube&hl=fr&gl=fr&q=${enc(q)}`,
  youtube: (q) => `https://suggestqueries.google.com/complete/search?client=youtube&ds=yt&hl=fr&gl=fr&q=${enc(q)}`,
}
export const BROWSER_SOURCES = Object.keys(JSONP)

// Chaque source renvoie un format différent ; on n'en garde que le texte des suggestions.
export function parseSuggest(source, text) {
  let j
  try { j = typeof text === 'string' ? JSON.parse(text) : text } catch { return [] }
  if (source === 'amazon') return (j?.suggestions || []).map((s) => s?.value).filter((v) => typeof v === 'string')
  if (source === 'duckduckgo') return (Array.isArray(j) ? j : []).map((s) => s?.phrase).filter((v) => typeof v === 'string')
  return (Array.isArray(j?.[1]) ? j[1] : []).map((s) => (Array.isArray(s) ? s[0] : s)).filter((v) => typeof v === 'string')
}

const QUESTION_PREFIXES = ['comment choisir', 'comment', 'pourquoi', 'quelle', 'quel', 'combien coûte', 'prix', 'meilleur']
const QUESTION_SUFFIXES = ['comment', 'pourquoi', 'quel', 'ou']
const LETTERS = 'abcdefghijklmnopqrstuvwxyz'.split('')
// Variantes : la base, les questions (avant et après la base), et « base + a…z » (la méthode des outils de mots-clés).
export function variantQueries(seed, { letters = true, questions = true } = {}) {
  const b = String(seed || '').trim().replace(/\s+/g, ' ')
  if (!b) return []
  return [...new Set([b, ...(questions ? [...QUESTION_PREFIXES.map((p) => `${p} ${b}`), ...QUESTION_SUFFIXES.map((s) => `${b} ${s}`)] : []), ...(letters ? LETTERS.map((l) => `${b} ${l}`) : [])])]
}

export const fold = (s) => String(s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, ' ').trim()
const accents = (s) => (String(s).match(/[À-ſ]/g) || []).length
export const isQuestion = (s) => /\?|^(comment|pourquoi|quel(le)?s?|combien|où|ou trouver|qui|quand|est-ce|peut-on|faut-il|que faire|quoi)\b/i.test(String(s).trim())

// Fusionne les réponses de toutes les sources : une idée = un texte (sans accents ni ponctuation pour comparer),
// avec la liste des sources qui l'ont proposée. La graphie affichée est celle qui a le plus d'accents.
export function mergeSuggestions(bySource, seed = '') {
  const map = new Map(), self = fold(seed)
  for (const [source, list] of Object.entries(bySource)) for (const raw of list || []) {
    const text = String(raw).trim().replace(/\s+/g, ' ')
    const key = fold(text)
    if (!key || key === self || key.length < 3) continue
    const cur = map.get(key) || { keyword: text, sources: [] }
    if (accents(text) > accents(cur.keyword)) cur.keyword = text
    if (!cur.sources.includes(source)) cur.sources.push(source)
    map.set(key, cur)
  }
  // « Voisine » : la suggestion ne contient pas tous les mots du sujet (« combien coûte un site vitrine » pour
  // « vitrine réfrigérée »). On compare les débuts de mots (5 lettres) pour accepter « réfrigérées », « frigorifique » non.
  const stems = fold(seed).split(' ').filter((w) => w.length >= 3 && !STOP.has(w)).map((w) => w.slice(0, 5))
  const onTopic = (k) => { const ws = fold(k).split(' '); return stems.every((s) => ws.some((w) => w.startsWith(s))) }
  const items = [...map.values()].map((x) => { const f = foreignOf(x.keyword); return { ...x, intent: intentOf(x.keyword), question: isQuestion(x.keyword), ...(f ? { pays: f } : {}), ...(onTopic(x.keyword) ? {} : { voisine: true }) } })
  // Vues par le plus de sources d'abord, puis ordre d'arrivée (l'autocomplétion classe déjà par popularité) ; autres pays à la fin.
  return items.map((x, i) => ({ x, i })).sort((a, b) => !!a.x.pays - !!b.x.pays || b.x.sources.length - a.x.sources.length || a.i - b.i).map((o) => o.x)
}

// Intention : classify() range par défaut tout en « informationnel » ; ici, sans signe de question ou de guide,
// une suggestion est une « variante » (type, usage, matière) : une page, une section ou un filtre par variante.
const INFO = /\b(comment|pourquoi|guide|tuto|tutoriel|fabrication|fabriquer|reglage|regler|norme|normes|temperature|entretien|nettoyage|nettoyer|panne|fonctionnement|definition|difference|schema|plan|dimension|dimensions|taille|consommation|reparation|reparer|installation|installer|choisir|quel|quelle|quels|quelles|combien)\b/
export function intentOf(k) {
  const c = classify(k)
  if (c !== 'informationnel') return c
  return isQuestion(k) || INFO.test(fold(k)) ? 'informationnel' : 'variante'
}
// Recherches d'un autre pays : mises de côté (un site français ne vise pas « prix … tunisie »).
const FOREIGN = { tunisie: 'Tunisie', tunis: 'Tunisie', maroc: 'Maroc', casablanca: 'Maroc', algerie: 'Algérie', alger: 'Algérie', dz: 'Algérie', ouedkniss: 'Algérie', senegal: 'Sénégal', dakar: 'Sénégal', cameroun: 'Cameroun', abidjan: 'Côte d’Ivoire', belgique: 'Belgique', suisse: 'Suisse', canada: 'Canada', quebec: 'Canada', liban: 'Liban', madagascar: 'Madagascar' }
const foreignOf = (k) => fold(k).split(' ').map((w) => FOREIGN[w]).find(Boolean) || null

async function pool(tasks, n) {
  const out = new Array(tasks.length); let k = 0
  await Promise.all(Array.from({ length: Math.min(n, tasks.length) }, async () => { while (k < tasks.length) { const i = k++; out[i] = await tasks[i]() } }))
  return out
}

// Collecte : chaque source interrogée sur toutes les variantes, quelques requêtes à la fois par source.
// fetchImpl (Node) : toutes les sources. Sans fetchImpl (navigateur) : Google et YouTube en JSONP.
export async function collectDemand(seed, { fetchImpl, sources, letters = true, concurrency = 4, timeout = 6000, onProgress } = {}) {
  const browser = !fetchImpl
  const want = (sources || Object.keys(SOURCES)).filter((s) => SOURCES[s] && (!browser || JSONP[s]))
  const queries = variantQueries(seed, { letters })
  const status = {}, bySource = {}
  await Promise.all(want.map(async (src) => {
    let ok = 0, fail = 0, lastErr = ''
    const one = (q) => async () => {
      try {
        if (browser) { const l = await jsonp(JSONP[src](q), timeout); if (l === null) throw new Error('pas de réponse'); ok++; return l }
        const r = await fetchImpl(URLS[src](q), { headers: { 'user-agent': 'Mozilla/5.0', accept: 'application/json,*/*' }, signal: AbortSignal.timeout(timeout) })
        if (!r.ok) throw new Error(`HTTP ${r.status}`)
        const l = parseSuggest(src, await r.text()); ok++; return l
      } catch (e) { fail++; lastErr = String(e?.message || e).slice(0, 80); return [] }
    }
    const res = await pool(queries.map(one), concurrency)
    bySource[src] = res.flat()
    status[src] = { label: SOURCES[src].label, ok: ok > 0, requetes: queries.length, reponses: ok, echecs: fail, suggestions: new Set(bySource[src].map(fold)).size, ...(ok ? {} : { erreur: lastErr || 'aucune réponse' }) }
    onProgress?.(`${SOURCES[src].label} : ${status[src].suggestions} suggestions`)
  }))
  const skipped = Object.keys(SOURCES).filter((s) => !want.includes(s))
  return summarizeDemand({ seed, queries: queries.length, sources: status, skipped: browser ? skipped : [], items: mergeSuggestions(bySource, seed) })
}
// Regroupements calculés une fois (rapport, interface, Markdown) ; les recherches d'autres pays sont à part.
export function summarizeDemand({ seed, queries, sources, skipped = [], items, generatedAt = new Date().toISOString() }) {
  const fr = items.filter((x) => !x.pays && !x.voisine)
  return {
    type: 'seo360-demande', seed: String(seed).trim(), generatedAt, queries, sources, skipped, items,
    questions: fr.filter((x) => x.question),
    confirmed: fr.filter((x) => x.sources.length >= 2),
    byIntent: fr.reduce((a, x) => ((a[x.intent] ||= []).push(x), a), {}),
    nearby: items.filter((x) => !x.pays && x.voisine),
    foreign: items.filter((x) => x.pays),
  }
}
export const INTENT_LABELS = {
  variante: 'Variantes du produit ou du service : une page, une section ou un filtre par variante',
  transactionnel: 'Prêt à acheter : pages produits, prix, devis, Google Ads',
  commercial: 'Compare avant d’acheter : comparatifs, avis',
  local: 'Recherche locale : fiche Google, pages ville',
  informationnel: 'À écrire : guides, FAQ, vidéos explicatives',
}

// Google Tendances du jour (flux RSS public) : ce qui monte aujourd'hui en France.
const decodeXml = (s) => String(s || '').replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1').replace(/&apos;/g, "'").replace(/&quot;/g, '"').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&#(\d+);/g, (_, n) => String.fromCharCode(+n)).replace(/&amp;/g, '&').trim()
const tag = (xml, t) => decodeXml((xml.match(new RegExp(`<${t}>([\\s\\S]*?)</${t}>`)) || [])[1])
export function parseTrendsRss(xml) {
  return [...String(xml || '').matchAll(/<item>([\s\S]*?)<\/item>/g)].map(([, it]) => ({
    title: tag(it, 'title'), traffic: tag(it, 'ht:approx_traffic'), date: (() => { const d = Date.parse(tag(it, 'pubDate')); return isNaN(d) ? '' : new Date(d).toISOString() })(),
    news: [...it.matchAll(/<ht:news_item>([\s\S]*?)<\/ht:news_item>/g)].map(([, n]) => ({ title: tag(n, 'ht:news_item_title'), url: tag(n, 'ht:news_item_url'), source: tag(n, 'ht:news_item_source') })).filter((n) => n.title).slice(0, 3),
  })).filter((x) => x.title)
}
const STOP = new Set('les des une pour avec sur dans par aux du de la le un et en au est pas plus vos nos ses son sa'.split(' '))
// Une tendance est « liée » si un mot significatif du sujet (4 lettres ou plus) apparaît dans son titre ou ses articles.
export function relatedTrends(trends, words = []) {
  const ws = [...new Set(words.flatMap((w) => fold(w).split(' ')).filter((w) => w.length >= 4 && !STOP.has(w)))]
  if (!ws.length) return []
  return trends.map((t) => ({ t, hay: ' ' + fold([t.title, ...t.news.map((n) => n.title)].join(' ')) + ' ' }))
    .map(({ t, hay }) => ({ ...t, match: ws.filter((w) => hay.includes(' ' + w)) })).filter((t) => t.match.length)
}
export async function trendsFR({ fetchImpl, geo = 'FR', words = [], timeout = 8000 } = {}) {
  if (!fetchImpl) return { ok: false, erreur: 'Tendances lisibles seulement en ligne de commande (pas de CORS)' }
  try {
    const r = await fetchImpl(`https://trends.google.com/trending/rss?geo=${enc(geo)}`, { headers: { 'user-agent': 'Mozilla/5.0' }, signal: AbortSignal.timeout(timeout) })
    if (!r.ok) return { ok: false, erreur: `HTTP ${r.status}` }
    const items = parseTrendsRss(await r.text())
    return { ok: items.length > 0, geo, generatedAt: new Date().toISOString(), items, related: relatedTrends(items, words), ...(items.length ? {} : { erreur: 'flux vide' }) }
  } catch (e) { return { ok: false, erreur: String(e?.message || e).slice(0, 80) } }
}

// Fichier importé ou rapport relu : on ne garde que des textes bornés, des sources connues, et on recalcule les groupes.
const s = (v, n) => String(v ?? '').replace(/[\u0000-\u001f]/g, ' ').slice(0, n)
const httpUrl = (u) => (/^https?:\/\/[^\s"'<>]+$/i.test(String(u || '')) ? s(u, 400) : '')
const INTENTS = new Set(Object.keys(INTENT_LABELS))
export function sanitizeDemande(d) {
  if (!d || typeof d !== 'object' || !Array.isArray(d.items)) return null
  const items = d.items.slice(0, 600).filter((x) => x && typeof x.keyword === 'string').map((x) => ({
    keyword: s(x.keyword, 160), sources: (Array.isArray(x.sources) ? x.sources : []).filter((k) => SOURCES[k]).slice(0, 4),
    intent: INTENTS.has(x.intent) ? x.intent : intentOf(x.keyword), question: isQuestion(x.keyword),
    ...(x.pays ? { pays: s(x.pays, 40) } : {}), ...(x.voisine ? { voisine: true } : {}),
  })).filter((x) => x.keyword.trim() && x.sources.length)
  const sources = Object.fromEntries(Object.entries(d.sources || {}).filter(([k]) => SOURCES[k]).map(([k, v]) => [k, { label: SOURCES[k].label, ok: !!v?.ok, requetes: +v?.requetes || 0, reponses: +v?.reponses || 0, echecs: +v?.echecs || 0, suggestions: +v?.suggestions || 0, ...(v?.erreur ? { erreur: s(v.erreur, 80) } : {}) }]))
  return summarizeDemand({ seed: s(d.seed, 120), queries: Math.max(0, +d.queries || 0), sources, skipped: (d.skipped || []).filter((k) => SOURCES[k]), items, generatedAt: isNaN(Date.parse(d.generatedAt)) ? new Date().toISOString() : d.generatedAt })
}
export function sanitizeTrends(t) {
  if (!t || typeof t !== 'object') return null
  if (!t.ok) return { ok: false, erreur: s(t.erreur || 'indisponible', 80) }
  const item = (x) => ({ title: s(x?.title, 120), traffic: s(x?.traffic, 20), date: isNaN(Date.parse(x?.date)) ? '' : x.date, news: (x?.news || []).slice(0, 3).map((n) => ({ title: s(n?.title, 200), url: httpUrl(n?.url), source: s(n?.source, 60) })), ...(Array.isArray(x?.match) ? { match: x.match.slice(0, 5).map((m) => s(m, 40)) } : {}) })
  return { ok: true, geo: s(t.geo || 'FR', 4), generatedAt: isNaN(Date.parse(t.generatedAt)) ? '' : t.generatedAt, items: (t.items || []).slice(0, 30).map(item).filter((x) => x.title), related: (t.related || []).slice(0, 30).map(item).filter((x) => x.title) }
}

// Liste Google seule, pour les anciens rapports et l'affichage existant (report.suggestions).
export const googleList = (d) => (d?.items || []).filter((x) => x.sources.includes('google')).map((x) => x.keyword).slice(0, 60)

export function demandeMarkdown(d, trends) {
  const L = []
  if (d?.items) {
    const src = Object.entries(d.sources).map(([, s]) => s.ok ? `${s.label} (${s.suggestions})` : `${s.label} : indisponible (${s.erreur})`).join(' · ')
    L.push(`## Demande réelle autour de « ${d.seed} »`, '', `_${d.items.length} idées distinctes, tirées de ${d.queries} variantes de recherche le ${d.generatedAt.slice(0, 10)}. Sources : ${src}. Ces autocomplétions ne donnent **aucun volume** : une idée vue par 2 sources ou plus est plus sûre, pas forcément plus cherchée. Les volumes viennent de Search Console ou de Keyword Planner._`, '')
    if (d.confirmed.length) L.push(`**Confirmées par 2 sources ou plus** (${d.confirmed.length}) :`, '', ...d.confirmed.slice(0, 25).map((x) => `- ${x.keyword} — ${x.sources.map((s) => SOURCES[s].label).join(', ')}`), '')
    if (d.questions.length) L.push(`**Vraies questions** (pour la FAQ et les guides) :`, '', ...d.questions.slice(0, 20).map((x) => `- ${x.keyword} (${x.sources.map((s) => SOURCES[s].label).join(', ')})`), '')
    for (const s of ['youtube', 'amazon']) {
      const only = d.items.filter((x) => x.sources.includes(s) && !x.pays).slice(0, 15)
      if (only.length) L.push(`**Sur ${SOURCES[s].label}** (${SOURCES[s].why}) : ${only.map((x) => x.keyword).join(' · ')}`, '')
    }
    for (const i of Object.keys(INTENT_LABELS)) {
      const l = d.byIntent[i]
      if (l?.length) L.push(`**${i[0].toUpperCase() + i.slice(1)}** (${l.length}) — ${INTENT_LABELS[i]} : ${l.slice(0, 20).map((x) => x.keyword).join(' · ')}`, '')
    }
    if (d.nearby?.length) L.push(`**Recherches voisines** (sans tous les mots du sujet : à trier à la main) : ${d.nearby.slice(0, 20).map((x) => x.keyword).join(' · ')}`, '')
    if (d.foreign?.length) L.push(`_Mises de côté (recherches d’un autre pays) : ${d.foreign.slice(0, 10).map((x) => `${x.keyword} (${x.pays})`).join(' · ')}._`, '')
  }
  if (trends) {
    if (!trends.ok) L.push(`_Google Tendances indisponible : ${trends.erreur}._`, '')
    else {
      L.push(`## Tendances Google du jour (France, ${trends.generatedAt.slice(0, 10)})`, '')
      L.push(trends.related.length ? `**Liées à ton sujet** : ${trends.related.map((t) => `${t.title} (${t.traffic}, mot « ${t.match.join(', ')} »)`).join(' · ')}` : '_Aucune tendance du jour n’est liée à ton sujet : c’est normal pour un métier de niche. À regarder pour réagir vite sur les réseaux, pas pour le référencement._', '')
      L.push(`Les plus cherchées : ${trends.items.slice(0, 10).map((t) => `${t.title} (${t.traffic})`).join(' · ')}`, '')
    }
  }
  return L.join('\n')
}

function jsonp(url, timeout) {
  return new Promise((resolve) => {
    const cb = '__dm' + Math.random().toString(36).slice(2)
    const s = document.createElement('script')
    let done = false
    const end = (v) => { if (done) return; done = true; delete window[cb]; s.remove(); resolve(v) }
    window[cb] = (data) => end((data?.[1] || []).map((x) => (Array.isArray(x) ? x[0] : x)).filter((v) => typeof v === 'string'))
    s.src = url + '&callback=' + cb
    s.onerror = () => end(null)
    setTimeout(() => end(null), timeout)
    document.head.appendChild(s)
  })
}

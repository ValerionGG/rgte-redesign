// Veille sociale : analyse des résultats d'Agent Reach (https://github.com/Panniantong/Agent-Reach)
// — Reddit, YouTube, X, GitHub, web — pour en tirer des données RÉELLES : questions que posent les gens,
// hashtags vraiment utilisés, sujets récurrents, contenus qui marchent, mentions de la marque.
// Format d'entrée (sortie JSON d'Agent Reach) : { ok, channel, action, backend, items: [{ title, url, author,
// published_at, text, raw }], error: { code, message, hint } }.
import { topTerms } from './html.js'
import { toTag } from './hashtags.js'

const Q_START = /^(comment|pourquoi|quel(le)?s?|combien|où|quand|est-ce|faut-il|peut-on|doit-on|qui|quoi|how|what|why|which|where|when|can|should|is|are|does|do|best|meilleur(e)?s?)\b/i
const STOP_ERRORS = new Set(['NEED_LOGIN', 'RATE_LIMITED', 'PLATFORM_BLOCKED', 'BUSY', 'NEED_SETUP', 'UPSTREAM_BROKEN', 'TIMEOUT'])

const clean = (s) => String(s ?? '').replace(/\s+/g, ' ').trim()
const num = (...v) => { for (const x of v) { const n = Number(x); if (Number.isFinite(n) && n >= 0) return n } return 0 }

// Engagement brut, quelle que soit la plateforme (score Reddit, vues YouTube, likes X, étoiles GitHub…)
export function engagement(item) {
  const r = item?.raw || {}
  return num(r.score, r.ups) + 2 * num(r.num_comments, r.comments, r.reply_count) + num(r.like_count, r.likes, r.favorite_count) + num(r.retweet_count) * 2 + num(r.view_count, r.views) / 100 + num(r.stargazers_count, r.stars) * 5
}

// Questions : titres ou premières phrases interrogatives (de vraies formulations d'internautes)
export function extractQuestions(item) {
  const out = []
  const title = clean(item.title)
  if (title && (title.endsWith('?') || Q_START.test(title))) out.push(title)
  for (const s of clean(item.text).slice(0, 1500).split(/(?<=[?.!])\s+/)) {
    if (s.endsWith('?') && s.length >= 25 && s.length <= 180) out.push(s)
    if (out.length >= 3) break
  }
  return out
}

// [tag normalisé, forme d'origine] par hashtag distinct d'un texte
function rawHashtags(text) {
  const out = new Map()
  for (const m of String(text || '').matchAll(/(^|[^\p{L}\p{N}_&#/])#([\p{L}][\p{L}\p{N}_]{1,40})/gu)) {
    const t = toTag(m[2])
    if (t.length >= 2 && !out.has(t)) out.set(t, m[2])
  }
  return [...out]
}
export const extractHashtags = (text) => rawHashtags(text).map(([t]) => t)

export function analyzeVeille(results, { sujet = '', marque = '' } = {}) {
  const sources = [], items = [], seen = new Set()
  for (const r of results || []) {
    if (!r || typeof r !== 'object') continue
    const src = { channel: clean(r.channel), action: clean(r.action), query: clean(r.query || r.meta?.query || ''), backend: clean(r.backend), ok: !!r.ok, count: Array.isArray(r.items) ? r.items.length : 0 }
    if (!r.ok) src.error = { code: clean(r.error?.code), message: clean(r.error?.message).slice(0, 300), hint: clean(r.error?.hint).slice(0, 300) }
    sources.push(src)
    if (r.ok && Array.isArray(r.items)) for (const it of r.items.slice(0, 100)) {
      const url = clean(it.url), key = url || `${src.channel}:${clean(it.title)}`
      if (seen.has(key)) continue // la même publication trouvée par deux requêtes ne compte qu'une fois
      seen.add(key)
      items.push({ ...it, channel: src.channel, title: clean(it.title).slice(0, 300), text: clean(it.text).slice(0, 5000), url })
    }
  }
  // Questions dédupliquées, classées par engagement de leur source
  const qmap = new Map()
  for (const it of items) for (const q of extractQuestions(it)) {
    const k = q.toLowerCase().replace(/[^\p{L}\p{N} ]/gu, '').slice(0, 120)
    if (!qmap.has(k) || qmap.get(k).score < engagement(it)) qmap.set(k, { question: q, url: it.url, channel: it.channel, score: engagement(it) })
  }
  const questions = [...qmap.values()].sort((a, b) => b.score - a.score).slice(0, 40)
  // Hashtags observés : nombre de publications distinctes qui les utilisent
  const hmap = new Map()
  for (const it of items) for (const [t, raw] of rawHashtags(`${it.title} ${it.text}`)) {
    const h = hmap.get(t) || { tag: t, camel: t, count: 0, channels: new Set() }
    // On garde la casse d'origine quand elle sépare les mots (#PatisserieLyon), sans en inventer
    if (/[a-zà-ÿ][A-ZÀ-Ý]/.test(raw)) h.camel = toTag(raw) === t ? raw.normalize('NFD').replace(/[\u0300-\u036f]/g, '') : h.camel
    h.count++; h.channels.add(it.channel); hmap.set(t, h)
  }
  const hashtags = [...hmap.values()].map((h) => ({ ...h, channels: [...h.channels] })).sort((a, b) => b.count - a.count).slice(0, 40)
  const termes = topTerms(items.map((it) => `${it.title}. ${it.text.slice(0, 600)}`.replace(/#[\p{L}\p{N}_]+/gu, ' ')).join(' . '), 20)
  const top = items.slice().sort((a, b) => engagement(b) - engagement(a)).slice(0, 15).map((it) => ({ title: it.title, url: it.url, channel: it.channel, author: clean(it.author).slice(0, 80), date: clean(it.published_at).slice(0, 10), engagement: Math.round(engagement(it)) }))
  const brand = clean(marque).toLowerCase()
  const mentions = brand ? items.filter((it) => `${it.title} ${it.text}`.toLowerCase().includes(brand)).slice(0, 20).map((it) => ({ title: it.title, url: it.url, channel: it.channel })) : []
  const bloquees = sources.filter((s) => !s.ok && (STOP_ERRORS.has(s.error?.code) || s.error?.code === 'UNSUPPORTED'))
  return {
    type: 'seo360-veille', version: 1, generatedAt: new Date().toISOString(), sujet: clean(sujet), marque: clean(marque),
    sources, total: items.length, questions, hashtags, termes, top, mentions,
    recommandations: recommandations({ questions, hashtags, termes, top, mentions, sources, bloquees, marque: brand }),
  }
}

function recommandations({ questions, hashtags, termes, top, mentions, bloquees, marque }) {
  const out = []
  if (questions.length) out.push(`Créez une FAQ (et des intertitres en question) avec les ${Math.min(8, questions.length)} questions les plus engageantes : ce sont les formulations réelles des internautes, celles que les IA reprennent.`)
  if (hashtags.length) out.push(`Hashtags réellement utilisés sur le sujet : ${hashtags.slice(0, 8).map((h) => '#' + h.camel).join(' ')}. Gardez ceux qui reviennent dans plusieurs publications et collent à votre niche.`)
  const phrases = (termes.phrases || []).map((t) => t.term).filter((t) => !marque || !t.includes(marque)).slice(0, 6)
  if (phrases.length) out.push(`Expressions récurrentes à intégrer dans vos pages et légendes : ${phrases.join(' · ')}.`)
  const yt = top.filter((t) => t.channel === 'youtube').slice(0, 3)
  if (yt.length) out.push(`Vidéos qui marchent sur ce sujet (inspirez-vous des titres) : ${yt.map((t) => `« ${t.title} »`).join(' ; ')}.`)
  if (marque) out.push(mentions.length ? `${mentions.length} mention(s) de votre marque trouvée(s) : répondez-y et citez les avis positifs sur votre site.` : 'Aucune mention de votre marque trouvée : cherchez à être cité (réponses utiles sur Reddit, vidéos, comparatifs) — les IA s’appuient beaucoup sur ces sources.')
  if (bloquees.length) out.push(`Sources non lues : ${bloquees.map((s) => `${s.channel} (${s.error.code}${s.error.hint ? ' : ' + s.error.hint : ''})`).join(' ; ')}. Suivez l’indication (connexion par vous-même, attente) sans relancer en boucle.`)
  return out
}

// Ajoute des hashtags observés au générateur (ils deviennent prioritaires s'ils reviennent plusieurs fois)
export const observedForHashtags = (veille, min = 2) => (veille?.hashtags || []).filter((h) => h.count >= min).map((h) => ({ tag: h.tag, camel: h.camel || h.tag }))

export function veilleMarkdown(v) {
  const L = [`# Veille sociale — ${v.sujet || 'sujet'}`, '', `${new Date(v.generatedAt).toLocaleString('fr-FR')} · ${v.total} publications lues via Agent Reach`, '']
  L.push('| Source | Requête | Résultat |', '|---|---|---|', ...v.sources.map((s) => `| ${s.channel} ${s.action} | ${s.query} | ${s.ok ? s.count + ' résultats' : `**${s.error?.code || 'erreur'}** — ${s.error?.hint || s.error?.message || ''}`} |`), '')
  if (v.recommandations.length) L.push('## À faire', '', ...v.recommandations.map((r) => `- ${r}`), '')
  if (v.questions.length) L.push('## Questions des internautes', '', ...v.questions.slice(0, 25).map((q) => `- ${q.question} — ${q.channel} ${q.url}`), '')
  if (v.hashtags.length) L.push('## Hashtags observés', '', v.hashtags.slice(0, 30).map((h) => `#${h.camel} (${h.count})`).join(' · '), '')
  if (v.termes.phrases?.length) L.push('## Expressions récurrentes', '', v.termes.phrases.map((t) => `${t.term} (${t.count})`).join(' · '), '')
  if (v.top.length) L.push('## Publications qui marchent', '', ...v.top.map((t) => `- [${t.channel}] ${t.title} — ${t.url}`), '')
  if (v.mentions.length) L.push('## Mentions de la marque', '', ...v.mentions.map((m) => `- [${m.channel}] ${m.title} — ${m.url}`), '')
  return L.join('\n')
}

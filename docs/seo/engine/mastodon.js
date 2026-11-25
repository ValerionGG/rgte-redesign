// Hashtags réellement employés, lus sur Mastodon (API publique, sans clé ni connexion) : pour chaque tag de départ,
// les dernières publications, et les hashtags qui reviennent avec lui (cooccurrence). On compte des COMPTES distincts,
// pas des publications : un seul compte très actif ne fait pas une tendance. Les robots déclarés sont ignorés.
// Mastodon n'est pas Instagram ni TikTok : c'est une preuve d'usage réel en français, pas une mesure de popularité.
import { toTag } from './hashtags.js'
import { BANNED_HASHTAGS } from '../data/sectors.js'

export const DEFAULT_INSTANCE = 'mastodon.social'
const BAN = new Set(BANNED_HASHTAGS)
const okHost = (h) => /^[a-z0-9.-]+\.[a-z]{2,}$/i.test(String(h || ''))

// Graphie d'origine (#VitrineRéfrigérée) : Mastodon renvoie le tag en minuscules, le HTML garde la casse.
function displayCase(html) {
  const out = new Map()
  for (const m of String(html || '').matchAll(/#<span>([^<]{2,60})<\/span>/g)) { const t = toTag(m[1]); if (t && !out.has(t)) out.set(t, m[1]) }
  return out
}

// Analyse des publications d'un tag (fonction pure, testable sans réseau).
// Seules les publications en français (ou sans langue déclarée) et de moins de 2 ans comptent pour les cooccurrences :
// sinon « #croissant » ramène #coffee et #drawing, et « #surmesure » des publications de 2020.
export function analyzeTagPosts(seedTag, posts, { now = Date.now(), maxAgeDays = 730 } = {}) {
  const seed = toTag(seedTag), seen = new Set(), accounts = new Set(), co = new Map()
  let newest = 0, oldest = Infinity, bots = 0, kept = 0, used = 0
  for (const raw of Array.isArray(posts) ? posts : []) {
    const p = raw?.reblog || raw
    if (!p || typeof p !== 'object' || seen.has(p.uri || p.id)) continue
    seen.add(p.uri || p.id)
    if (p.account?.bot) { bots++; continue }
    const acct = String(p.account?.acct || p.account?.id || '')
    const t = Date.parse(p.created_at)
    if (!isNaN(t)) { newest = Math.max(newest, t); oldest = Math.min(oldest, t) }
    kept++; if (acct) accounts.add(acct)
    const fr = !p.language || /^fr/i.test(p.language), fresh = !isNaN(t) && now - t <= maxAgeDays * 864e5
    if (!fr || !fresh) continue
    used++
    const cases = displayCase(p.content)
    const tags = [...new Set((p.tags || []).map((x) => toTag(x?.name)).filter(Boolean))]
    for (const tag of tags) {
      if (tag === seed || BAN.has(tag) || tag.length < 3 || tag.length > 30 || /^\d+$/.test(tag)) continue
      const c = co.get(tag) || { tag, camel: '', comptes: new Set(), publications: 0 }
      c.publications++; if (acct) c.comptes.add(acct)
      if (!c.camel && cases.get(tag)) c.camel = cases.get(tag)
      co.set(tag, c)
    }
  }
  const days = kept && isFinite(oldest) ? Math.max(1, Math.round((Math.min(newest, now) - oldest) / 864e5)) : null
  return {
    tag: seed, publications: kept, retenues: used, comptes: accounts.size, robots: bots,
    plusRecente: newest ? new Date(newest).toISOString() : null, plusAncienne: isFinite(oldest) ? new Date(oldest).toISOString() : null, jours: days,
    cooccurrents: [...co.values()].map((c) => ({ tag: c.tag, camel: c.camel || c.tag, comptes: c.comptes.size, publications: c.publications }))
      .sort((a, b) => b.comptes - a.comptes || b.publications - a.publications || a.tag.localeCompare(b.tag)),
  }
}

// Tags de départ : le mot-clé entier, puis les hashtags « niche » du secteur (au plus 6, sans doublon).
export function seedTags({ keyword = '', keywords = [], sectorTags = [] } = {}) {
  const out = []
  for (const k of [keyword, ...keywords, ...sectorTags]) { const t = toTag(k); if (t && t.length >= 3 && t.length <= 30 && !BAN.has(t) && !out.includes(t)) out.push(t) }
  return out.slice(0, 6)
}

// Lecture : 2 pages de 40 publications par tag au plus, une requête à la fois (on reste poli avec l'instance).
export async function collectMastodon(seeds, { fetchImpl = globalThis.fetch, instance = DEFAULT_INSTANCE, pages = 2, timeout = 8000, onProgress } = {}) {
  if (!okHost(instance)) return { ok: false, erreur: 'instance invalide' }
  if (typeof fetchImpl !== 'function') return { ok: false, erreur: 'pas d’accès réseau ici' }
  const tags = [], errors = []
  for (const seed of seeds) {
    let url = `https://${instance}/api/v1/timelines/tag/${encodeURIComponent(seed)}?limit=40`, posts = []
    try {
      for (let i = 0; i < pages && url; i++) {
        const r = await fetchImpl(url, { headers: { accept: 'application/json' }, signal: AbortSignal.timeout(timeout) })
        if (!r.ok) throw new Error(`HTTP ${r.status}`)
        const j = JSON.parse(await r.text())
        if (!Array.isArray(j)) throw new Error('réponse inattendue')
        posts = posts.concat(j)
        const next = (r.headers?.get?.('link') || '').match(/<([^>]+)>;\s*rel="next"/)
        url = j.length === 40 && next && next[1].startsWith(`https://${instance}/`) ? next[1] : null
      }
      const a = analyzeTagPosts(seed, posts)
      tags.push(a); onProgress?.(`#${seed} : ${a.publications} publications, ${a.comptes} comptes`)
    } catch (e) { errors.push({ tag: seed, erreur: String(e?.message || e).slice(0, 80) }); onProgress?.(`#${seed} : illisible (${String(e?.message || e).slice(0, 40)})`) }
  }
  return summarizeMastodon({ instance, tags, errors })
}

// Fusion des tags de départ : un hashtag cooccurrent est « observé » s'il revient chez 2 comptes distincts ou plus.
export function summarizeMastodon({ instance = DEFAULT_INSTANCE, tags = [], errors = [], generatedAt = new Date().toISOString(), min = 2 }) {
  const seeds = new Set(tags.map((t) => t.tag)), all = new Map()
  for (const t of tags) for (const c of t.cooccurrents) {
    if (seeds.has(c.tag)) continue
    const x = all.get(c.tag) || { tag: c.tag, camel: c.camel, comptes: 0, publications: 0, avec: [] }
    x.comptes = Math.max(x.comptes, c.comptes); x.publications += c.publications; x.avec.push(t.tag)
    if (x.camel === x.tag && c.camel !== c.tag) x.camel = c.camel
    all.set(c.tag, x)
  }
  const observes = [...all.values()].filter((x) => x.comptes >= min).sort((a, b) => b.comptes - a.comptes || b.avec.length - a.avec.length || b.publications - a.publications)
  return {
    type: 'seo360-mastodon', ok: tags.length > 0, instance, generatedAt, tags, errors, observes,
    vivants: tags.filter((t) => t.comptes >= min).map((t) => t.tag), vides: tags.filter((t) => !t.publications).map((t) => t.tag),
  }
}

// Pour generateHashtags : d'abord les tags de départ réellement employés, puis les cooccurrents les plus sûrs
// (3 comptes ou plus, ou vus avec 2 tags de départ). Les autres restent dans la liste, à trier à la main.
export function observedFromMastodon(m, max = 12) {
  if (!m?.ok) return []
  const camelOf = (tag) => { for (const t of m.tags) for (const c of t.cooccurrents) if (c.tag === tag && c.camel !== c.tag) return c.camel; return '' }
  return [...m.tags.filter((t) => m.vivants.includes(t.tag)).sort((a, b) => b.comptes - a.comptes).map((t) => ({ tag: t.tag, camel: camelOf(t.tag) || t.tag, src: 'mastodon', comptes: t.comptes })),
    ...m.observes.filter((x) => x.comptes >= 3 || x.avec.length >= 2).map((x) => ({ tag: x.tag, camel: x.camel, src: 'mastodon', comptes: x.comptes }))].slice(0, max)
}

const s = (v, n) => String(v ?? '').replace(/[\u0000-\u001f]/g, ' ').slice(0, n)
const n0 = (v) => Math.max(0, Math.min(1e6, Math.round(+v) || 0))
const iso = (v) => (v && !isNaN(Date.parse(v)) ? new Date(Date.parse(v)).toISOString() : null)
const tagOk = (t) => /^[a-z0-9_]{2,30}$/.test(String(t || ''))
// Fichier importé ou rapport relu : tags limités à [a-z0-9_], textes bornés, groupes recalculés.
export function sanitizeMastodon(m) {
  if (!m || typeof m !== 'object' || !Array.isArray(m.tags)) return null
  const tags = m.tags.slice(0, 10).filter((t) => tagOk(t?.tag)).map((t) => ({
    tag: t.tag, publications: n0(t.publications), retenues: t.retenues == null ? null : n0(t.retenues), comptes: n0(t.comptes), robots: n0(t.robots), plusRecente: iso(t.plusRecente), plusAncienne: iso(t.plusAncienne), jours: t.jours == null ? null : n0(t.jours),
    cooccurrents: (t.cooccurrents || []).slice(0, 200).filter((c) => tagOk(c?.tag)).map((c) => ({ tag: c.tag, camel: /^[\p{L}\p{N}_]{2,40}$/u.test(c.camel || '') ? c.camel : c.tag, comptes: n0(c.comptes), publications: n0(c.publications) })),
  }))
  return summarizeMastodon({ instance: okHost(m.instance) ? m.instance : DEFAULT_INSTANCE, tags, errors: (m.errors || []).slice(0, 10).map((e) => ({ tag: s(e?.tag, 30), erreur: s(e?.erreur, 80) })), generatedAt: iso(m.generatedAt) || new Date().toISOString() })
}

export function mastodonMarkdown(m) {
  if (!m) return ''
  if (!m.ok) return `_Hashtags observés sur Mastodon : indisponibles (${m.erreur || m.errors?.map((e) => `#${e.tag} ${e.erreur}`).join(', ') || 'aucune réponse'})._\n`
  const L = [`## Hashtags observés sur Mastodon (${m.instance}, ${m.generatedAt.slice(0, 10)})`, '',
    '_Lu dans les dernières publications publiques de chaque tag de départ. « Comptes » = nombre de comptes différents (robots exclus) : c’est une preuve d’usage réel, pas une mesure de popularité sur Instagram ou TikTok. Les hashtags employés avec eux ne viennent que des publications en français de moins de 2 ans._', '',
    '| Tag de départ | Publications lues | Comptes | En français, < 2 ans | Période |', '|---|---:|---:|---:|---|',
    ...m.tags.map((t) => `| #${t.tag} | ${t.publications} | ${t.comptes} | ${t.retenues ?? '—'} | ${t.publications ? `${(t.plusAncienne || '').slice(0, 10)} → ${(t.plusRecente || '').slice(0, 10)}` : 'aucune publication'} |`), '']
  if (m.errors.length) L.push(`_Illisibles : ${m.errors.map((e) => `#${e.tag} (${e.erreur})`).join(', ')}._`, '')
  L.push(m.observes.length ? `**Employés avec eux par 2 comptes ou plus** : ${m.observes.slice(0, 25).map((x) => `#${x.camel} (${x.comptes} comptes)`).join(' · ')}` : '_Aucun hashtag ne revient chez 2 comptes différents : le sujet est trop rare sur Mastodon pour en tirer des hashtags. Les hashtags proposés restent des suggestions à vérifier sur chaque réseau._', '')
  if (m.vides.length) L.push(`_Sans aucune publication : ${m.vides.map((t) => '#' + t).join(' ')} (personne ne s’en sert sur Mastodon)._`, '')
  return L.join('\n')
}

// Dérive après refonte ou migration : compare deux rapports SEO 360 (avant / après) page par page.
// Règles classées : critique (perte de trafic quasi certaine), alerte (à corriger vite), info (à vérifier).
// node seo/cli.mjs <url> --avant ancien-rapport.json
const fold = (s) => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
const words = (s) => new Set(fold(s).split(/[^a-z0-9]+/).filter((w) => w.length > 2))
export function similarity(a, b) {
  const A = words(a), B = words(b)
  if (!A.size && !B.size) return 1
  let inter = 0
  for (const w of A) if (B.has(w)) inter++
  return inter / (A.size + B.size - inter)
}
export const normUrl = (u) => { try { const x = new URL(u); x.hash = ''; return (x.host.replace(/^www\./, '') + x.pathname.replace(/\/$/, '') + x.search).toLowerCase() } catch { return String(u || '').toLowerCase() } }

// Pages d'un rapport : crawl + page principale (champs résumés par collect.js)
function pagesOf(rep) {
  const m = new Map()
  for (const p of rep?.ctx?.crawl?.pages || []) if (p?.url) m.set(normUrl(p.url), p)
  const main = rep?.ctx?.page, url = rep?.ctx?.fetch?.finalUrl || rep?.target
  if (main && url) {
    const k = normUrl(url), prev = m.get(k) || {}
    const noindex = (rep.result?.issues || []).some((i) => i.id === 'noindex')
    m.set(k, { url, status: prev.status ?? rep.ctx.fetch?.status ?? 200, title: main.title ?? prev.title ?? '', description: main.metaDescription ?? prev.description ?? '', h1: (main.h || []).find((h) => h.level === 1)?.text ?? prev.h1 ?? '', words: main.wordCount ?? prev.words, canonical: (Array.isArray(main.canonical) ? main.canonical[0] : main.canonical) ?? prev.canonical ?? '', noindex: prev.noindex || noindex, schema: main.jsonLdCount ?? prev.schema, main: true })
  }
  return m
}
const issueIds = (rep) => new Set((rep?.result?.issues || []).map((i) => i.id))

export function compareReports(before, after) {
  const items = [], A = pagesOf(before), B = pagesOf(after)
  const push = (level, url, rule, avant = '', apres = '') => items.push({ level, url, rule, avant: String(avant ?? '').slice(0, 200), apres: String(apres ?? '').slice(0, 200) })
  // Règles de site
  const ib = issueIds(before), ia = issueIds(after)
  for (const [id, label] of [['robots-all', 'robots.txt interdit maintenant tout le site'], ['robots-block', 'robots.txt bloque maintenant Googlebot'], ['noindex', 'La page principale est passée en noindex'], ['https', 'Le site n’est plus servi en HTTPS'], ['canonical-host', 'La canonical pointe vers un autre domaine']]) if (ia.has(id) && !ib.has(id)) push('critique', after?.target || '', label)
  const sb = before?.ctx?.sitemap?.status, sa = after?.ctx?.sitemap?.status
  if (sb === 200 && sa && sa !== 200) push('alerte', after?.target || '', 'Le sitemap a disparu', `statut ${sb}`, `statut ${sa}`)
  // Règles par page (pages présentes dans les deux rapports)
  let compared = 0
  for (const [k, p] of A) {
    const q = B.get(k)
    if (!q) continue
    compared++
    if (p.status === 200 && q.status >= 400) { push('critique', q.url, `Page en erreur ${q.status}`, '200', q.status); continue }
    if (p.status === 200 && q.status >= 300 && q.status < 400) push('info', q.url, 'Page redirigée : vérifiez que la redirection est en 301 vers l’équivalent exact', '200', q.status)
    if (!p.noindex && q.noindex) push('critique', q.url, 'noindex ajouté')
    if (p.title && !q.title) push('critique', q.url, 'Title supprimé', p.title, '')
    else if (p.title && q.title && similarity(p.title, q.title) < 0.5) push('info', q.url, 'Title très modifié', p.title, q.title)
    const cb = normUrl(p.canonical || ''), ca = normUrl(q.canonical || '')
    if (p.canonical && !q.canonical) push('alerte', q.url, 'Canonical retirée', p.canonical, '')
    else if (p.canonical && q.canonical && cb !== ca) push('alerte', q.url, 'Canonical modifiée', p.canonical, q.canonical)
    if (p.schema > 0 && !q.schema) push('alerte', q.url, 'Données structurées supprimées', `${p.schema} bloc(s)`, '0')
    if (p.h1 && !q.h1) push('alerte', q.url, 'H1 supprimé', p.h1, '')
    else if (p.h1 && q.h1 && similarity(p.h1, q.h1) < 0.5) push('info', q.url, 'H1 très modifié', p.h1, q.h1)
    if (p.words >= 100 && q.words != null && q.words < p.words * 0.7) push('alerte', q.url, `Contenu réduit de ${Math.round((1 - q.words / p.words) * 100)} %`, `${p.words} mots`, `${q.words} mots`)
  }
  // Pages disparues du nouveau crawl : seulement si le nouveau crawl est au moins aussi large
  const crawledB = after?.ctx?.crawl?.pages?.length || 0, crawledA = before?.ctx?.crawl?.pages?.length || 0
  if (crawledB >= crawledA && crawledA) for (const [k, p] of A) if (!B.has(k) && p.status === 200) push('info', p.url, 'Page introuvable dans le nouveau crawl : vérifiez qu’elle existe ou qu’une redirection 301 la remplace')
  const order = { critique: 0, alerte: 1, info: 2 }
  items.sort((a, b) => order[a.level] - order[b.level])
  const counts = { critique: 0, alerte: 0, info: 0 }
  for (const i of items) counts[i.level]++
  const gb = before?.result?.global, ga = after?.result?.global
  return {
    avant: before?.generatedAt || '', apres: after?.generatedAt || '', pagesCompared: compared, counts, items: items.slice(0, 200),
    note: gb != null && ga != null ? `Note ${gb} → ${ga}.` : '',
    verdict: counts.critique ? `${counts.critique} problème(s) critique(s) : à corriger immédiatement (perte de trafic probable).` : counts.alerte ? `${counts.alerte} alerte(s) à corriger cette semaine.` : compared ? 'Aucune dérive importante détectée sur les pages comparées.' : 'Aucune page commune aux deux rapports : comparez deux audits du même site (même URL de départ, crawl activé).',
  }
}

export function driftMarkdown(d) {
  const L = ['## Dérive après refonte', '', `**${d.verdict}** ${d.note}`, '', `${d.pagesCompared} page(s) comparée(s) · ${d.counts.critique} critique(s) · ${d.counts.alerte} alerte(s) · ${d.counts.info} info(s)`, '']
  if (d.items.length) L.push('| Gravité | Page | Changement | Avant | Après |', '|---|---|---|---|---|', ...d.items.slice(0, 60).map((i) => `| ${i.level} | ${i.url} | ${i.rule} | ${i.avant.replace(/\|/g, '/')} | ${i.apres.replace(/\|/g, '/')} |`), '')
  return L.join('\n')
}

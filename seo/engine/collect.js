// Collecte : page, robots.txt, sitemap, llms.txt, variantes http/www, mini-crawl.
// Le « fetcher » est injecté : Node (cli.mjs) ou proxy CORS (navigateur).
import { extract } from './html.js'
import { parseRobots } from './robots.js'

export async function collect(rawUrl, fetcher, opts = {}) {
  const url = normalizeInput(rawUrl)
  const ctx = { input: { ...(opts.input || {}), url }, collectedAt: new Date().toISOString(), source: opts.source || 'node' }
  const res = await fetcher(url)
  ctx.fetch = { url, finalUrl: res.finalUrl || url, status: res.status, headers: res.headers || {}, redirects: res.redirects || [], timeMs: res.timeMs, ttfbMs: res.ttfbMs, error: res.error, source: opts.source || 'node', bytes: res.body?.length || 0 }
  if (res.body) {
    ctx.page = extract(res.body, ctx.fetch.finalUrl)
    ctx.rawHead = res.body.slice(0, 20000)
  }
  let origin
  try { origin = new URL(ctx.fetch.finalUrl).origin } catch { return ctx }
  const side = await Promise.all([
    fetcher(origin + '/robots.txt').catch((e) => ({ error: String(e) })),
    fetcher(origin + '/llms.txt').catch((e) => ({ error: String(e) })),
    opts.variants !== false ? variants(url, fetcher) : null,
  ])
  const [rb, llms, http] = side
  ctx.robots = { status: rb.status || 0, body: rb.status === 200 && !/<html/i.test(rb.body || '') ? rb.body : null }
  ctx.llms = { status: llms.status === 200 && !/<html/i.test((llms.body || '').slice(0, 500)) ? 200 : (llms.status || 0), bytes: llms.body?.length || 0 }
  if (http) ctx.http = http
  const robots = ctx.robots.body ? parseRobots(ctx.robots.body) : { sitemaps: [] }
  ctx.sitemap = await sitemap(robots.sitemaps[0] || origin + '/sitemap.xml', fetcher, origin)
  if (ctx.sitemap.status !== 200 && !robots.sitemaps.length) {
    const alt = await sitemap(origin + '/sitemap_index.xml', fetcher, origin)
    if (alt.status === 200) ctx.sitemap = alt
  }
  if (opts.crawl > 1 && ctx.page) ctx.crawl = await crawl(ctx, fetcher, opts.crawl, opts.onProgress)
  return ctx
}

export function normalizeInput(u) {
  u = String(u || '').trim()
  if (!/^https?:\/\//i.test(u)) u = 'https://' + u
  try { return new URL(u).href } catch { return u }
}

async function variants(url, fetcher) {
  const out = {}
  try {
    const U = new URL(url)
    const httpUrl = 'http://' + U.host + '/'
    const r = await fetcher(httpUrl, { noFollow: true })
    if (r.status) out.httpRedirects = r.status >= 300 && r.status < 400 && /^https:/.test(r.location || '')
    const other = U.hostname.startsWith('www.') ? U.hostname.slice(4) : 'www.' + U.hostname
    const r2 = await fetcher(`https://${other}/`, { noFollow: true })
    if (r2.status >= 300 && r2.status < 400) out.wwwConsistent = true
    else if (r2.status === 200) { out.wwwConsistent = false; out.wwwDetail = `https://${other}/ répond 200 au lieu de rediriger` }
  } catch {}
  return out
}

export async function sitemap(url, fetcher, origin) {
  const r = await fetcher(url).catch(() => ({}))
  const out = { url, status: r.status || 0, count: 0 }
  if (r.status !== 200 || !r.body || !/<(urlset|sitemapindex)/i.test(r.body)) { out.status = r.status === 200 ? 415 : out.status; return out }
  out.isIndex = /<sitemapindex/i.test(r.body)
  const locs = [...r.body.matchAll(/<loc>\s*(?:<!\[CDATA\[)?\s*([^<\]]+?)\s*(?:\]\]>)?\s*<\/loc>/gi)].map((m) => m[1].trim())
  out.count = locs.length
  out.noLastmod = !/<lastmod>/i.test(r.body)
  const foreign = locs.find((l) => { try { return new URL(l).origin !== origin } catch { return true } })
  if (foreign) out.foreignHost = foreign
  out.sample = locs.slice(0, 200)
  if (out.isIndex && locs[0]) {
    const child = await fetcher(locs[0]).catch(() => ({}))
    if (child.status === 200) out.sample = [...(child.body || '').matchAll(/<loc>\s*(?:<!\[CDATA\[)?\s*([^<\]]+?)\s*(?:\]\]>)?\s*<\/loc>/gi)].map((m) => m[1].trim()).slice(0, 200)
  }
  return out
}

// Exploration en largeur des liens internes (+ URL du sitemap), limite N pages.
export async function crawl(ctx, fetcher, max = 20, onProgress) {
  const start = ctx.fetch.finalUrl, origin = new URL(start).origin
  const seen = new Map(), queue = [], broken = []
  const pages = [{ url: start, status: ctx.fetch.status, ...summary(ctx.page), depth: 0, timeMs: ctx.fetch.timeMs }]
  seen.set(clean(start), 0)
  const enqueue = (href, from, depth) => {
    if (!href) return
    let U; try { U = new URL(href) } catch { return }
    if (U.origin !== origin || /\.(pdf|jpe?g|png|webp|gif|svg|zip|mp4|mp3|docx?|xlsx?|css|js|xml|ico)$/i.test(U.pathname)) return
    const k = clean(U.href)
    if (seen.has(k)) return
    seen.set(k, depth); queue.push({ url: k, from, depth })
  }
  for (const l of ctx.page.links) if (l.internal) enqueue(l.href, start, 1)
  for (const s of (ctx.sitemap?.sample || []).slice(0, max)) enqueue(s, 'sitemap', 1)
  const CONC = 4
  while (queue.length && pages.length < max) {
    const batch = queue.splice(0, Math.min(CONC, max - pages.length))
    const results = await Promise.all(batch.map(async (q) => ({ q, r: await fetcher(q.url).catch((e) => ({ error: String(e) })) })))
    for (const { q, r } of results) {
      if (!r.status || r.status >= 400) { broken.push({ url: q.url, from: q.from, status: r.status || 'erreur' }); pages.push({ url: q.url, status: r.status || 0, depth: q.depth }); continue }
      const isHtml = /<html|<!doctype/i.test((r.body || '').slice(0, 1000))
      if (!isHtml) continue
      const pg = extract(r.body, r.finalUrl || q.url)
      pages.push({ url: q.url, status: r.status, ...summary(pg), depth: q.depth, timeMs: r.timeMs })
      for (const l of pg.links) if (l.internal) enqueue(l.href, q.url, q.depth + 1)
    }
    onProgress?.(pages.length, max)
  }
  return { pages, broken, discovered: seen.size }
}

function summary(p) {
  if (!p) return {}
  return {
    title: p.title || '', description: p.metaDescription || '', h1: p.headings.find((h) => h.level === 1)?.text || '',
    words: p.wordCount, canonical: p.canonical[0] || '', noindex: /noindex/.test(p.robots || ''), images: p.images.length,
    imagesNoAlt: p.images.filter((i) => i.alt === null).length, schema: p.jsonLd.length,
  }
}
const clean = (u) => { try { const x = new URL(u); x.hash = ''; return x.href } catch { return u } }

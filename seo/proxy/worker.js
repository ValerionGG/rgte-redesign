// Proxy CORS minimal pour SEO 360 (Cloudflare Workers, offre gratuite).
// Déploiement : npx wrangler deploy seo/proxy/worker.js --name seo-proxy   (ou copier-coller dans le tableau de bord)
// Puis dans l'interface : « Mon proxy » → https://seo-proxy.<vous>.workers.dev/?url={url}
// Il suit les redirections lui-même pour les exposer (X-Redirects) et relaie les en-têtes d'origine (X-Orig-*).
// ALLOWED_ORIGIN : restreignez à votre domaine pour éviter qu'un tiers utilise votre proxy.
const ALLOWED_ORIGIN = '*'
const UA = 'Mozilla/5.0 (compatible; SEO360-Audit/1.0)'

export default {
  async fetch(req) {
    const cors = { 'Access-Control-Allow-Origin': ALLOWED_ORIGIN, 'Access-Control-Expose-Headers': '*', 'Access-Control-Allow-Methods': 'GET, OPTIONS' }
    if (req.method === 'OPTIONS') return new Response(null, { headers: cors })
    const q = new URL(req.url).searchParams
    let target = q.get('url')
    if (!target || !/^https?:\/\//i.test(target)) return new Response('Paramètre ?url= requis', { status: 400, headers: cors })
    const host = new URL(target).hostname
    if (/^(localhost|127\.|10\.|192\.168\.|169\.254\.|\[?::1)/.test(host)) return new Response('Hôte interdit', { status: 403, headers: cors })
    const noFollow = q.get('nofollow') === '1'
    const redirects = []
    const t0 = Date.now()
    let res, ttfb
    for (let i = 0; i < 10; i++) {
      res = await fetch(target, { redirect: 'manual', headers: { 'User-Agent': UA, 'Accept-Language': 'fr-FR,fr;q=0.9' } })
      ttfb ??= Date.now() - t0
      const loc = res.headers.get('location')
      if (res.status >= 300 && res.status < 400 && loc && !noFollow) { redirects.push({ url: target, status: res.status }); target = new URL(loc, target).href; continue }
      break
    }
    const h = new Headers(cors)
    for (const [k, v] of res.headers) if (!/^(set-cookie|content-length|content-encoding|transfer-encoding|connection)$/i.test(k)) h.set('x-orig-' + k, v)
    if (res.headers.get('content-encoding')) h.set('x-orig-content-encoding', res.headers.get('content-encoding'))
    h.set('x-status', String(res.status)); h.set('x-final-url', target); h.set('x-redirects', JSON.stringify(redirects))
    h.set('x-time', String(Date.now() - t0)); h.set('x-ttfb', String(ttfb))
    if (res.headers.get('location')) h.set('x-location', new URL(res.headers.get('location'), target).href)
    h.set('content-type', 'text/plain; charset=utf-8')
    return new Response(noFollow ? '' : await res.text(), { status: 200, headers: h })
  },
}

// Proxy CORS personnel pour SEO 360 (Cloudflare Workers, offre gratuite).
// Déploiement : npx wrangler deploy seo/proxy/worker.js --name seo-proxy   (ou copier-coller dans le tableau de bord)
// Puis dans SEO 360 : « Plus d’options » → « Mon proxy » → https://seo-proxy.<vous>.workers.dev/?url={url}
//
// Sécurité :
// - ALLOWED_ORIGINS : seules ces pages peuvent l'appeler depuis un navigateur (sinon 403).
// - PROXY_KEY (variable secrète facultative) : exige ?k=… — protège aussi contre les appels hors navigateur (curl).
// - Adresses privées refusées, revérifiées à CHAQUE redirection ; 5 Mo et 20 s maximum par page.
const ALLOWED_ORIGINS = ['https://valeriongg.github.io', 'http://localhost:8000', 'http://127.0.0.1:8000']
const UA = 'Mozilla/5.0 (compatible; SEO360-Audit/2.0; +https://github.com/valeriongg/rgte-redesign)'
const MAX_BYTES = 5 * 1024 * 1024

const PRIVATE = [
  /^localhost$/i, /\.local$/i, /\.internal$/i, /^0\./, /^10\./, /^127\./, /^169\.254\./, /^192\.168\./, /^100\.(6[4-9]|[7-9]\d|1[01]\d|12[0-7])\./,
  /^172\.(1[6-9]|2\d|3[01])\./, /^\[?::1?\]?$/, /^\[?f[cd][0-9a-f]{2}:/i, /^\[?fe80:/i, /^\[?::ffff:/i, /^0x/i, /^\d+$/,
]
const isPrivate = (host) => PRIVATE.some((re) => re.test(host))

export default {
  async fetch(req, env) {
    const origin = req.headers.get('Origin') || ''
    const allow = ALLOWED_ORIGINS.includes(origin) ? origin : ''
    const cors = { 'Access-Control-Allow-Origin': allow || 'null', 'Vary': 'Origin', 'Access-Control-Expose-Headers': '*', 'Access-Control-Allow-Methods': 'GET, OPTIONS' }
    const fail = (status, msg) => new Response(msg, { status, headers: { ...cors, 'content-type': 'text/plain; charset=utf-8' } })
    if (req.method === 'OPTIONS') return new Response(null, { status: allow ? 204 : 403, headers: cors })
    if (req.method !== 'GET') return fail(405, 'Méthode non autorisée')
    if (!allow) return fail(403, 'Origine non autorisée')
    const q = new URL(req.url).searchParams
    if (env?.PROXY_KEY && q.get('k') !== env.PROXY_KEY) return fail(403, 'Clé invalide')
    let target = q.get('url')
    if (!target || !/^https?:\/\//i.test(target)) return fail(400, 'Paramètre ?url= requis (http ou https)')
    const noFollow = q.get('nofollow') === '1'
    const redirects = []
    const t0 = Date.now()
    try {
      let res, ttfb
      for (let i = 0; i < 10; i++) {
        const host = new URL(target).hostname
        if (isPrivate(host)) return fail(403, 'Adresse interdite')
        res = await fetch(target, { redirect: 'manual', headers: { 'User-Agent': UA, 'Accept-Language': 'fr-FR,fr;q=0.9' }, signal: AbortSignal.timeout(20000) })
        ttfb ??= Date.now() - t0
        const loc = res.headers.get('location')
        if (res.status >= 300 && res.status < 400 && loc && !noFollow) { redirects.push({ url: target, status: res.status }); target = new URL(loc, target).href; continue }
        break
      }
      const h = new Headers(cors)
      for (const [k, v] of res.headers) if (!/^(set-cookie|content-length|transfer-encoding|connection)$/i.test(k)) h.set('x-orig-' + k, v)
      h.set('x-status', String(res.status)); h.set('x-final-url', target); h.set('x-redirects', JSON.stringify(redirects))
      h.set('x-time', String(Date.now() - t0)); h.set('x-ttfb', String(ttfb))
      if (res.headers.get('location')) h.set('x-location', new URL(res.headers.get('location'), target).href)
      h.set('content-type', 'text/plain; charset=utf-8')
      if (noFollow) return new Response('', { status: 200, headers: h })
      const reader = res.body?.getReader(), chunks = []
      let size = 0
      while (reader) {
        const { done, value } = await reader.read()
        if (done) break
        size += value.length
        if (size > MAX_BYTES) { await reader.cancel(); h.set('x-truncated', '1'); break }
        chunks.push(value)
      }
      return new Response(new Blob(chunks), { status: 200, headers: h })
    } catch (e) {
      return fail(502, 'Erreur de récupération : ' + (e?.name === 'TimeoutError' ? 'délai dépassé' : 'site injoignable'))
    }
  },
}

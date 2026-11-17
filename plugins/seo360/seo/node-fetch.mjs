// Lecture des pages en Node (ligne de commande et sous-commandes) : accès direct, identité du robot, lecture de
// secours par Jina Reader quand le réseau ne joint pas le site, et fichiers fournis (--html, --robots).
import { decodeBody } from './engine/decode.js'
import { blockedReason } from './engine/collect.js'

// Par défaut, un agent de navigateur : beaucoup de pare-feu refusent les robots inconnus (on le détecte et le signale).
const UAS = {
  navigateur: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36',
  seo360: 'Mozilla/5.0 (compatible; SEO360-Audit/2.0; +https://github.com/valeriongg/rgte-redesign)',
}
const MAX_BYTES = 5 * 1024 * 1024

const sameDoc = (a, b) => { try { const x = new URL(a), y = new URL(/^https?:/i.test(b) ? b : 'https://' + b); return x.host.replace(/^www\./, '') === y.host.replace(/^www\./, '') && x.pathname.replace(/\/$/, '') === y.pathname.replace(/\/$/, '') } catch { return false } }
const NETWORK_ERR = /ENOTFOUND|EAI_AGAIN|ECONNREFUSED|ECONNRESET|ETIMEDOUT|EHOSTUNREACH|ENETUNREACH|UND_ERR|fetch failed|Délai dépassé|proxy|tunnel|certificate|CERT_/i

// ua : auto | seo360 | navigateur ; lecture : auto | direct | jina ; html, robots : contenus fournis ; target : la page que html remplace
export function makeNodeFetcher({ ua = 'auto', lecture = 'auto', html = null, robots = null, target = '' } = {}) {
  const viaJina = new Set() // hôtes injoignables en direct : lus par Jina pour toute la suite

  // Par défaut : on se présente comme « SEO360-Audit » ; si le site refuse les robots inconnus, on réessaie
  // une fois en navigateur et le rapport le signale (constat « ua-fallback »).
  async function fetcher(url, o = {}) {
    if (html && !o.noFollow && target && sameDoc(url, target)) return { status: 200, body: html, finalUrl: url, headers: {}, redirects: [], via: 'paste' }
    if (robots && !o.noFollow && /\/robots\.txt$/i.test(url)) return { status: 200, body: robots, finalUrl: url, headers: {}, redirects: [] }
    const host = (() => { try { return new URL(url).host } catch { return '' } })()
    if (lecture === 'jina' || viaJina.has(host)) return o.noFollow ? {} : jinaRead(url)
    const r = await direct(url, o)
    if (lecture === 'auto' && !r.status && NETWORK_ERR.test(r.error || '')) { viaJina.add(host); return o.noFollow ? {} : jinaRead(url) }
    return r
  }
  async function direct(url, o) {
    if (ua === 'navigateur') return fetchAs(url, UAS.navigateur, o)
    const r = await fetchAs(url, UAS.seo360, o)
    if (ua === 'auto' && !o.noFollow && blockedReason(r)) {
      const r2 = await fetchAs(url, UAS.navigateur, o)
      if (!blockedReason(r2)) return { ...r2, uaFallback: true }
    }
    return r
  }
  // Jina Reader (r.jina.ai) en mode JSON : vrai code HTTP, adresse finale, domaine introuvable signalé.
  // Sans clé : 20 lectures par minute ; on en garde 2 de marge et une page en trop passe son tour (« non lue »).
  const JINA = process.env.SEO360_JINA || 'https://r.jina.ai/' // réglable pour les tests ou un service compatible
  const jinaTimes = []
  async function jinaRead(url) {
    const now = Date.now()
    while (jinaTimes.length && now - jinaTimes[0] >= 60000) jinaTimes.shift()
    if (jinaTimes.length >= 18) return { status: 0, error: 'Jina Reader : 20 lectures par minute atteintes' }
    jinaTimes.push(now)
    const text = /\.txt$/i.test((() => { try { return new URL(url).pathname } catch { return '' } })())
    const ctrl = new AbortController(), timer = setTimeout(() => ctrl.abort(), 25000)
    try {
      // Sans clé, Jina refuse parfois une adresse IP (401 « bad IP reputation ») : 2 nouvelles tentatives, puis message clair
      const key = process.env.JINA_API_KEY || ''
      const headers = { Accept: 'application/json', 'X-Return-Format': text ? 'text' : 'html', ...(key ? { Authorization: 'Bearer ' + key } : {}) }
      let r, j
      for (let i = 0; i < 3; i++) { r = await fetch(JINA + url, { headers, signal: ctrl.signal }); j = await r.json().catch(() => null); if (r.status !== 401 || key) break; await new Promise((ok) => setTimeout(ok, 400)) }
      if (r.status === 401) return { status: 0, error: 'Jina Reader refuse ce réseau sans clé : définissez JINA_API_KEY (clé gratuite sur jina.ai/reader), ou fournissez la page avec --html' }
      if (r.status === 422 && /could not be resolved/i.test(j?.message || '')) return { status: 0, error: 'nom de domaine introuvable (vérifiez l’orthographe de l’adresse)' }
      if (!r.ok || !j?.data) return { status: 0, error: 'Jina Reader : réponse ' + r.status }
      const d = j.data, body = String((text ? d.text : d.html) ?? '')
      return { status: Number(d.httpStatus) || (body ? 200 : 0), body, finalUrl: d.finalUrl || d.url || url, headers: {}, redirects: [], via: 'jina' }
    } catch (e) {
      return { status: 0, error: e.name === 'AbortError' ? 'Délai dépassé (Jina Reader)' : 'Jina Reader injoignable : ' + (e.cause?.code || e.message) }
    } finally { clearTimeout(timer) }
  }

  // Lecture bornée (5 Mo) avec délai global de 25 s (en-têtes ET corps), décodage selon l'encodage déclaré.
  async function fetchAs(url, UA, { noFollow = false } = {}) {
    const redirects = []
    let cur = url, res, ttfb
    const t0 = performance.now(), ctrl = new AbortController(), timer = setTimeout(() => ctrl.abort(), 25000)
    try {
      for (let i = 0; i < 10; i++) {
        res = await fetch(cur, { redirect: 'manual', signal: ctrl.signal, headers: { 'User-Agent': UA, 'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8', 'Accept-Language': 'fr-FR,fr;q=0.9,en;q=0.6' } })
        ttfb ??= performance.now() - t0
        const loc = res.headers.get('location')
        if (res.status >= 300 && res.status < 400 && loc) {
          if (noFollow) return { status: res.status, location: new URL(loc, cur).href, headers: Object.fromEntries(res.headers) }
          redirects.push({ url: cur, status: res.status }); cur = new URL(loc, cur).href; continue
        }
        break
      }
      const reader = res.body?.getReader(), chunks = []
      let size = 0, truncated = false
      while (reader) {
        const { done, value } = await reader.read()
        if (done) break
        size += value.length
        if (size > MAX_BYTES) { truncated = true; await reader.cancel(); break }
        chunks.push(value)
      }
      const buf = new Uint8Array(Buffer.concat(chunks.map((c) => Buffer.from(c))))
      const headers = Object.fromEntries(res.headers)
      return { status: res.status, headers, body: decodeBody(buf, headers['content-type']), finalUrl: cur, redirects, timeMs: performance.now() - t0, ttfbMs: ttfb, truncated }
    } catch (e) {
      return { status: 0, error: e.name === 'AbortError' ? 'Délai dépassé (25 s)' : (e.cause?.code || e.message), finalUrl: cur, redirects }
    } finally { clearTimeout(timer) }
  }
  return fetcher
}

// Lecture d'un JSON public (API App Store, registre des entreprises), avec la même lecture de secours réseau exclue :
// ces API répondent en JSON, Jina ne sert pas ici.
export async function fetchJson(url, { timeout = 15000 } = {}) {
  const ctrl = new AbortController(), t = setTimeout(() => ctrl.abort(), timeout)
  try {
    const r = await fetch(url, { headers: { Accept: 'application/json', 'User-Agent': UAS.seo360 }, signal: ctrl.signal })
    if (!r.ok) throw new Error('réponse ' + r.status)
    return await r.json()
  } finally { clearTimeout(t) }
}

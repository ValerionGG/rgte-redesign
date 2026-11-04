// Lien de partage sans serveur : le rapport (allégé) est compressé dans l'ancre de l'URL (#r=…).
// Rien n'est envoyé à un serveur : l'ancre ne quitte pas le navigateur de la personne qui ouvre le lien.
// Mots-clés, hashtags, budget et plan sont recalculés à l'ouverture à partir des paramètres.

const b64url = (bytes) => {
  let s = ''
  for (let i = 0; i < bytes.length; i += 0x8000) s += String.fromCharCode(...bytes.subarray(i, i + 0x8000))
  return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}
const unb64url = (s) => {
  const b = atob(s.replace(/-/g, '+').replace(/_/g, '/'))
  const out = new Uint8Array(b.length)
  for (let i = 0; i < b.length; i++) out[i] = b.charCodeAt(i)
  return out
}

async function pipe(bytes, stream) {
  const res = new Response(new Blob([bytes]).stream().pipeThrough(stream))
  return new Uint8Array(await res.arrayBuffer())
}

// Ne garde que ce qui sert à réafficher le rapport.
export function slimForShare(r) {
  const R = r.result
  return {
    v: 2, target: r.target, kind: r.kind, generatedAt: r.generatedAt, input: { ...r.input, githubToken: undefined, psiKey: undefined },
    result: R && {
      global: R.global, grade: R.grade, coverage: R.coverage, incomplete: R.incomplete, caps: R.caps, scores: R.scores, pageScores: R.pageScores, counts: R.counts,
      issues: R.issues.map(({ cat, sev, id, title, detail, fix, impact, effort, code, scope }) => ({ cat, sev, id, title, detail: (detail || '').slice(0, 400), fix, impact, effort, code: (code || '').slice(0, 1500), scope })),
      passed: R.passed.map(({ cat, id, title }) => ({ cat, id, title, sev: 'ok' })),
      infos: R.infos.map(({ cat, id, title, detail, fix }) => ({ cat, id, title, detail: (detail || '').slice(0, 300), fix, sev: 'info' })),
      meta: { ...R.meta, bots: R.meta?.bots?.map(({ ua, owner, kind, allowed }) => ({ ua, owner, kind, allowed })), terms: R.meta?.terms },
    },
    ctx: r.ctx && { fetch: r.ctx.fetch && { finalUrl: r.ctx.fetch.finalUrl, status: r.ctx.fetch.status, source: r.ctx.fetch.source }, page: r.ctx.page, psi: r.ctx.psi && { scores: r.ctx.psi.scores, field: r.ctx.psi.field, lab: r.ctx.psi.lab, error: r.ctx.psi.error }, crawl: r.ctx.crawl && { pages: r.ctx.crawl.pages.slice(0, 30), broken: r.ctx.crawl.broken.slice(0, 20) }, llms: r.ctx.llms },
    competitors: r.competitors,
  }
}

export async function encodeReport(r) {
  const json = new TextEncoder().encode(JSON.stringify(slimForShare(r)))
  return b64url(await pipe(json, new CompressionStream('deflate-raw')))
}

// Décompression bornée (protège contre un lien piégé qui gonflerait à plusieurs Go).
export async function decodeReport(s, maxBytes = 3_000_000) {
  if (s.length > 400_000) throw new Error('Lien trop long')
  const reader = new Blob([unb64url(s)]).stream().pipeThrough(new DecompressionStream('deflate-raw')).getReader()
  const chunks = []
  let total = 0
  for (;;) {
    const { done, value } = await reader.read()
    if (done) break
    total += value.length
    if (total > maxBytes) { await reader.cancel(); throw new Error('Rapport trop volumineux') }
    chunks.push(value)
  }
  const bytes = new Uint8Array(total)
  let o = 0
  for (const c of chunks) { bytes.set(c, o); o += c.length }
  return JSON.parse(new TextDecoder().decode(bytes))
}

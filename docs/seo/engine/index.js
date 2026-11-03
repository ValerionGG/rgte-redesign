// Orchestration : une URL (site), un lien d'app ou un dépôt GitHub → rapport complet.
import { collect } from './collect.js'
import { audit, CATEGORIES, SEVERITY } from './audit.js'
import { runPSI } from './psi.js'
import { actionPlan } from './plan.js'
import { generateHashtags } from './hashtags.js'
import { keywordIdeas } from './keywords.js'
import { planBudget, GOALS } from './ads.js'
import { fetchRepo, auditRepo, parseRepo, GH_CATS } from './github.js'
import { parseStoreUrl, lookupIOS, auditIOS, auditPlayHtml, ASO_CATS } from './appstore.js'
import { sectorById } from '../data/sectors.js'

export { CATEGORIES, SEVERITY, GOALS, GH_CATS, ASO_CATS }

// Résumé comparable d'un concurrent
export function competitorSummary(url, rep) {
  const R = rep.result, p = rep.ctx?.page
  return {
    url, global: R?.global ?? null, scores: R ? Object.fromEntries(Object.entries(R.scores).map(([k, v]) => [k, v.score])) : {},
    perf: rep.ctx?.psi?.scores?.performance ?? null, lcp: rep.ctx?.psi?.field?.LCP ?? null, words: p?.wordCount ?? null,
    title: p?.title || '', schema: R?.meta?.schemaTypes?.join(', ') || (p ? 'aucune' : '—'), social: Object.keys(R?.meta?.social || {}),
    trackers: R?.meta?.trackers || [], cms: R?.meta?.cms || [], issues: R?.issues?.length ?? null, error: rep.error || rep.ctx?.fetch?.error || null,
    llms: rep.ctx?.llms?.status === 200, bots: (R?.meta?.bots || []).filter((b) => !b.allowed).map((b) => b.ua),
  }
}

export function detectKind(u) {
  if (parseStoreUrl(u)) return 'app'
  if (/github\.com\/[^/]+\/[^/]+/i.test(u) || /^[\w.-]+\/[\w.-]+$/.test(String(u).trim())) return 'github'
  return 'site'
}

export async function analyze(target, o = {}) {
  const input = { sector: 'autre', goal: 'leads', monthly: 1000, lang: 'fr', ...o.input }
  const kind = o.kind || detectKind(target)
  const sector = sectorById(input.sector)
  const local = input.local ?? sector.local
  const report = { version: 1, generatedAt: new Date().toISOString(), target, kind, input: { ...input, local } }
  const progress = o.onProgress || (() => {})

  if (kind === 'site') {
    progress('Récupération de la page, robots.txt, sitemap, llms.txt…')
    const tasks = [o.noFetch ? Promise.resolve({ input: { ...input, local, url: normalize(target) }, fetch: { url: normalize(target), finalUrl: normalize(target), source: 'psi' } }) : collect(target, o.fetcher, { input: { ...input, local }, crawl: o.crawl || 0, source: o.source, onProgress: (n, m) => progress(`Exploration : ${n}/${m} pages`) })]
    if (o.psi !== false) tasks.push(runPSI(normalize(target), { key: o.psiKey, strategy: 'mobile', fetchImpl: o.fetchImpl }))
    const [ctx, psi] = await Promise.all(tasks)
    if (psi) ctx.psi = psi
    progress('Analyse…')
    report.ctx = slim(ctx)
    report.result = audit(ctx)
  } else if (kind === 'github') {
    progress('Lecture du dépôt GitHub…')
    const d = await fetchRepo(target, { token: o.githubToken, fetchImpl: o.fetchImpl })
    if (d.error) report.error = d.error
    else { report.result = auditRepo(d); report.repo = { name: d.repo.full_name, stars: d.repo.stargazers_count, topics: d.repo.topics } }
  } else if (kind === 'app') {
    const s = parseStoreUrl(target)
    progress(s.store === 'ios' ? 'Lecture de la fiche App Store…' : 'Lecture de la fiche Google Play…')
    if (s.store === 'ios') {
      const a = await lookupIOS(s.id, s.country, { fetchImpl: o.fetchImpl })
      if (!a) report.error = 'Application introuvable sur l’App Store (vérifiez le pays de la boutique).'
      else report.result = auditIOS(a, { keyword: input.keyword })
    } else {
      const r = o.fetcher ? await o.fetcher(`https://play.google.com/store/apps/details?id=${s.id}&hl=fr&gl=FR`) : null
      if (!r?.body) report.error = 'Fiche Google Play illisible sans proxy (utilisez la CLI ou un proxy CORS).'
      else report.result = auditPlayHtml(r.body, { keyword: input.keyword })
    }
  }

  const terms = report.result?.meta?.terms?.phrases?.map((t) => t.term).slice(0, 5) || []
  const kws = [input.keyword, ...(input.keywords || [])].filter(Boolean)
  report.hashtags = generateHashtags({ sector: input.sector, keywords: kws, terms, city: input.city, region: input.region, brand: input.brand, lang: input.lang })
  report.keywords = keywordIdeas({ seed: input.keyword || terms[0] || '', sector: input.sector, city: input.city })
  report.budget = planBudget({ sector: input.sector, goal: kind === 'app' ? 'telechargements' : input.goal, monthly: +input.monthly || 1000, local, avgValue: +input.avgValue || 0, targetConversions: +input.targetConversions || 0 })
  report.plan = actionPlan(report.result, { local, hasAds: (+input.monthly || 0) > 0, kind })
  return report
}

const normalize = (u) => (/^https?:/i.test(u) ? u : 'https://' + String(u).trim())

// On ne garde pas le HTML brut dans le rapport (poids), seulement les éléments utiles.
function slim(ctx) {
  const p = ctx.page
  return {
    fetch: ctx.fetch, http: ctx.http, sitemap: ctx.sitemap && { ...ctx.sitemap, sample: (ctx.sitemap.sample || []).slice(0, 20) }, llms: ctx.llms,
    robots: ctx.robots && { status: ctx.robots.status, body: (ctx.robots.body || '').slice(0, 4000) },
    psi: ctx.psi && { ...ctx.psi, screenshot: undefined }, crawl: ctx.crawl,
    page: p && {
      title: p.title, metaDescription: p.metaDescription, lang: p.lang, canonical: p.canonical, h: p.headings.slice(0, 40), wordCount: p.wordCount,
      images: p.images.length, imagesNoAlt: p.images.filter((i) => i.alt === null).length, links: p.links.length, og: p.og, twitter: p.twitter,
      jsonLdCount: p.jsonLd.length, htmlKb: Math.round(p.htmlBytes / 1024), scripts: p.scripts.length, hreflang: p.hreflang,
    },
  }
}

export { parseRepo, parseStoreUrl }

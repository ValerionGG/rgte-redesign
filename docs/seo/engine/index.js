// Orchestration : une URL (site), un lien d'app ou un dépôt GitHub → rapport complet.
import { collect } from './collect.js'
import { audit, CATEGORIES, SEVERITY } from './audit.js'
import { runPSI } from './psi.js'
import { actionPlan } from './plan.js'
import { generateHashtags } from './hashtags.js'
import { keywordIdeas } from './keywords.js'
import { planBudget, preSpendChecks, GOALS } from './ads.js'
import { fetchRepo, auditRepo, parseRepo, GH_CATS } from './github.js'
import { parseStoreUrl, lookupIOS, auditIOS, auditPlayHtml, ASO_CATS } from './appstore.js'
import { sectorById } from '../data/sectors.js'

export { CATEGORIES, SEVERITY, GOALS, GH_CATS, ASO_CATS }

// Résumé comparable d'un concurrent : mêmes conditions pour tous (page d'accueil, sans l'exploration multi-pages)
export function competitorSummary(url, rep) {
  const R = rep.result, p = rep.ctx?.page
  return {
    url, global: R?.pageGlobal ?? null, scores: R?.pageScores || {}, terms: R?.meta?.terms?.words?.map((t) => t.term) || [],
    perf: rep.ctx?.psi?.scores?.performance ?? null, lcp: rep.ctx?.psi?.field?.LCP ?? null, words: p?.wordCount ?? null,
    title: p?.title || '', schema: R?.meta?.schemaTypes?.join(', ') || (p ? 'aucune' : '—'), social: Object.keys(R?.meta?.social || {}),
    trackers: R?.meta?.trackers || [], cms: R?.meta?.cms || [], issues: R?.issues?.length ?? null, error: rep.error || R?.incomplete || null,
    llms: rep.ctx?.llms?.status === 200, bots: (R?.meta?.bots || []).filter((b) => !b.allowed).map((b) => b.ua),
  }
}

// « rgte.fr » est un site, « monsite.fr/contact » aussi ; « owner/repo » (sans point dans owner) est un dépôt GitHub.
export function detectKind(u) {
  u = String(u || '').trim()
  if (parseStoreUrl(u)) return 'app'
  if (/^(https?:\/\/)?(www\.)?github\.com\/[^/]+\/[^/?#]+/i.test(u) || /^[A-Za-z0-9-]+\/[A-Za-z0-9_.-]+$/.test(u)) return 'github'
  return 'site'
}

export async function analyze(target, o = {}) {
  const input = { sector: 'autre', goal: 'leads', monthly: null, lang: 'fr', ...o.input }
  const kind = o.kind || detectKind(target)
  const sector = sectorById(input.sector)
  const local = input.local ?? sector.local
  const report = { version: 2, generatedAt: new Date().toISOString(), target, kind, input: { ...input, local } }
  const progress = o.onProgress || (() => {})

  if (kind === 'site') {
    const tasks = [o.noFetch ? Promise.resolve({ input: { ...input, local, url: normalize(target) }, fetch: { url: normalize(target), finalUrl: normalize(target), source: 'psi' } }) : collect(target, o.fetcher, { input: { ...input, local }, crawl: o.crawl || 0, source: o.source, rendered: o.rendered, onProgress: (n, m) => progress(`Exploration : ${n}/${m} pages`) })]
    progress(o.psi === false ? 'Lecture de la page, robots.txt et sitemap' : o.noFetch ? 'Mesure de la vitesse (PageSpeed, 20 à 60 s)' : 'Lecture de la page, robots.txt, sitemap et mesure de la vitesse (20 à 60 s)')
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
      if (!r?.body || r.status !== 200) report.error = r?.status === 404 ? 'Application introuvable sur Google Play.' : 'Fiche Google Play illisible ici (utilisez la ligne de commande).'
      else report.result = auditPlayHtml(r.body, { keyword: input.keyword })
    }
  }

  const terms = report.result?.meta?.terms?.phrases?.map((t) => t.term).slice(0, 5) || []
  const kws = [input.keyword, ...(input.keywords || [])].filter(Boolean)
  report.hashtags = generateHashtags({ sector: input.sector, keywords: kws, terms, city: input.city, region: input.region, brand: input.brand, lang: input.lang })
  report.keywords = keywordIdeas({ seed: input.keyword || terms[0] || '', sector: input.sector, city: input.city, local })
  report.budget = planBudget({ sector: input.sector, goal: kind === 'app' ? 'telechargements' : input.goal, monthly: input.monthly == null || input.monthly === '' ? null : +input.monthly, local, avgValue: +input.avgValue || 0, margin: input.margin, closeRate: input.closeRate, targetConversions: +input.targetConversions || 0 })
  report.budget.checks = preSpendChecks(report)
  report.plan = actionPlan(report.result, { local, hasAds: +input.monthly > 0, kind })
  return report
}

const normalize = (u) => (/^https?:/i.test(u) ? u : 'https://' + String(u).trim())

// On ne garde pas le HTML brut dans le rapport (poids), seulement les éléments utiles.
export function slim(ctx) {
  const p = ctx.page
  return {
    fetch: ctx.fetch, http: ctx.http, sitemap: ctx.sitemap && { ...ctx.sitemap, sample: (ctx.sitemap.sample || []).slice(0, 20) }, llms: ctx.llms,
    robots: ctx.robots && { status: ctx.robots.status, body: (ctx.robots.body || '').slice(0, 4000) },
    psi: ctx.psi && { ...ctx.psi, screenshot: undefined }, crawl: ctx.crawl,
    page: p && {
      title: p.title, metaDescription: p.metaDescription, lang: p.lang, canonical: p.canonical, h: p.headings.slice(0, 40), wordCount: p.wordCount,
      images: p.images.length, imagesNoAlt: p.images.filter((i) => i.alt === null).length, links: p.links.length, og: p.og, twitter: p.twitter,
      jsonLdCount: p.jsonLd.length, htmlKb: Math.round(p.htmlBytes / 1024), scripts: p.scripts.length, hreflang: p.hreflang,
      intro: p.paragraphs.find((t) => t.length >= 60 && !/cookie|javascript/i.test(t)) || '', icons: p.icons,
      firstImage: p.images.find((i) => i.src && !/1x1|pixel|logo|icon|\.svg/i.test(i.src))?.src || '',
      imagesSample: p.images.filter((i) => i.src).slice(0, 6).map((i) => i.src), noAltSample: p.images.filter((i) => i.src && i.alt === null && !i.decorative).slice(0, 8).map((i) => i.src),
      mixedSample: [...p.images.map((i) => i.src), ...p.scripts.map((x) => x.src), ...p.stylesheets, ...p.iframes].filter((x) => /^http:\/\//.test(x || '')).slice(0, 10),
      navLinks: [...new Map(p.links.filter((l) => l.internal && l.text && l.text.length < 60 && !/^(tel|mailto):/.test(l.raw || '')).map((l) => [l.href, { text: l.text, href: l.href }])).values()].slice(0, 12),
    },
  }
}

export { parseRepo, parseStoreUrl }

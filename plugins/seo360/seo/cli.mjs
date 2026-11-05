#!/usr/bin/env node
// SEO 360 — audit complet en ligne de commande (Node ≥ 18, aucune dépendance).
// Exemples :
//   node seo/cli.mjs https://www.exemple.fr --secteur boulangerie --ville Lyon --mot-cle "pâtisserie lyon" --budget 1500
//   node seo/cli.mjs https://www.exemple.fr --crawl 30 --concurrents concurrent1.fr,concurrent2.fr --sortie rapports/
//   node seo/cli.mjs https://apps.apple.com/fr/app/x/id123456789
//   node seo/cli.mjs owner/repo           (dépôt GitHub)
import { writeFileSync, mkdirSync } from 'node:fs'
import { join } from 'node:path'
import { analyze, competitorSummary, detectKind } from './engine/index.js'
import { toMarkdown } from './engine/report.js'
import { googleSuggest } from './engine/keywords.js'
import { decodeBody } from './engine/decode.js'
import { blockedReason } from './engine/collect.js'
import { SECTORS } from './data/sectors.js'
import { GOALS } from './engine/ads.js'

// Par défaut, un agent de navigateur : beaucoup de pare-feu refusent les robots inconnus (on le détecte et le signale).
const UAS = {
  navigateur: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36',
  seo360: 'Mozilla/5.0 (compatible; SEO360-Audit/2.0; +https://github.com/valeriongg/rgte-redesign)',
}
const MAX_BYTES = 5 * 1024 * 1024

const args = process.argv.slice(2)

// ───────── Sous-commandes : veille sociale (Agent Reach), Search Console, calendrier ─────────
const SUB = { veille: './veille-cli.mjs', gsc: './gsc-cli.mjs', calendrier: './calendrier-cli.mjs', budget: './budget-cli.mjs', hashtags: './hashtags-cli.mjs', outils: './outils-cli.mjs' }
if (SUB[args[0]]) {
  await import(SUB[args[0]]).then((m) => m.main(args.slice(1)))
  process.exit(process.exitCode || 0)
}
const opt = (names, def) => { for (const n of [].concat(names)) { const i = args.indexOf('--' + n); if (i >= 0) return args[i + 1] && !args[i + 1].startsWith('--') ? args[i + 1] : true } return def }
const target = args.find((a, i) => !a.startsWith('--') && !(i > 0 && args[i - 1].startsWith('--') && !['--no-psi', '--json', '--quiet', '--local', '--national'].includes(args[i - 1])))

if (!target || opt(['help', 'aide'])) {
  console.log(`SEO 360 — audit SEO, GEO, ASO, hashtags et budget pub

Usage : node seo/cli.mjs <url | lien App Store/Play | owner/repo> [options]
        node seo/cli.mjs veille "<sujet>" [--sources reddit,youtube,web] [--marque X]   (veille via Agent Reach)
        node seo/cli.mjs gsc <export.zip> [--avant <export-precedent.zip>] [--marque X]   (diagnostic Search Console)
        node seo/cli.mjs calendrier [année] [--secteur <id>] [--alsace] [--sortie dossier]   (temps forts français)
        node seo/cli.mjs budget --secteur <id> [--objectif leads] [--budget €] [--valeur €] [--marge %]   (budget pub seul)
        node seo/cli.mjs hashtags --secteur <id> [--mot-cle "a, b"] [--ville X] [--marque X]   (hashtags seuls)
        node seo/cli.mjs outils [--rapport site.json | --secteur <id> --local]   (outils gratuits et payants + guides)

  --secteur <id>        ${SECTORS.map((s) => s.id).join(', ')}
  --mot-cle "<texte>"   mot-clé principal visé
  --ville <ville>       ville (SEO local + hashtags locaux)
  --marque <nom>        nom de marque
  --objectif <id>       ${Object.keys(GOALS).join(', ')}
  --budget <€/mois>     budget publicitaire mensuel (vide = minimum pour tester)
  --valeur <€>          panier moyen / valeur d'un client (ROAS)
  --objectif-conv <n>   conversions visées par mois (budget nécessaire)
  --marge <%>           votre marge (défaut selon l'objectif)
  --signature <%>       part des contacts qui deviennent clients (leads)
  --cpc <€>             votre CPC réel Google (Keyword Planner)
  --volume <n>          recherches mensuelles de vos mots-clés (plafonne Google Search)
  --veille [sources]    ajoute la veille sociale Agent Reach sur le mot-clé (défaut : reddit,youtube,web)
  --ua auto|seo360|navigateur  identité du robot (défaut auto : SEO360-Audit, puis navigateur si le site refuse)
  --local / --national  forcer le mode local
  --langue fr|en|both   langue des hashtags
  --crawl <n>           explorer n pages du site (défaut 15, 0 = page seule)
  --avant <rapport.json>  comparer à un audit précédent (refonte, migration) : critique / alerte / info
  --concurrents a,b,c   URL concurrentes à comparer
  --psi-key <clé>       clé API PageSpeed Insights (ou variable PSI_KEY)
  --no-psi              ne pas lancer PageSpeed Insights
  --github-token <t>    jeton GitHub (ou GITHUB_TOKEN) pour les dépôts
  --sortie <dossier>    dossier des rapports (défaut ./rapports-seo)
  --json                afficher le JSON complet sur la sortie standard
`)
  process.exit(target ? 0 : 1)
}

const UA_CHOICE = opt('ua', 'auto')

// Par défaut : on se présente comme « SEO360-Audit » ; si le site refuse les robots inconnus, on réessaie
// une fois en navigateur et le rapport le signale (constat « ua-fallback »).
async function fetcher(url, o = {}) {
  if (UA_CHOICE === 'navigateur') return fetchAs(url, UAS.navigateur, o)
  const r = await fetchAs(url, UAS.seo360, o)
  if (UA_CHOICE === 'auto' && !o.noFollow && blockedReason(r)) {
    const r2 = await fetchAs(url, UAS.navigateur, o)
    if (!blockedReason(r2)) return { ...r2, uaFallback: true }
  }
  return r
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

const input = {
  sector: opt('secteur', 'autre'), keyword: opt(['mot-cle', 'keyword'], '') || '', city: opt('ville', '') || '', brand: opt('marque', '') || '',
  goal: opt('objectif', 'leads'), monthly: opt('budget', null) == null ? null : +opt('budget'), avgValue: +opt('valeur', 0), targetConversions: +opt('objectif-conv', 0), lang: opt('langue', 'fr'),
  margin: opt('marge', null) == null ? null : +opt('marge') / 100, closeRate: opt('signature', null) == null ? null : +opt('signature') / 100,
}
if (opt('local')) input.local = true
if (opt('national')) input.local = false
if (!SECTORS.some((s) => s.id === input.sector)) { console.error(`Secteur inconnu : ${input.sector}`); process.exit(1) }

const quiet = opt('json')
const log = (...a) => { if (!quiet) console.error(...a) }
const common = { fetcher, fetchImpl: fetch, psi: !opt('no-psi'), psiKey: opt('psi-key', process.env.PSI_KEY || ''), githubToken: opt('github-token', process.env.GITHUB_TOKEN || ''), source: 'node' }

log(`\n🔎 SEO 360 — ${target} (${detectKind(target)})`)
const report = await analyze(target, { ...common, input, crawl: +opt('crawl', 15), onProgress: (m) => log('  · ' + m) })
if (report.kind === 'site' && (input.keyword || report.keywords?.base)) {
  log('  · Suggestions Google…')
  report.suggestions = await googleSuggest(input.keyword || report.keywords.base, { fetchImpl: fetch }).catch((e) => { report.suggestionsError = String(e?.message || e).slice(0, 120); return [] })
  if (report.suggestionsError) log('  ⚠ Suggestions Google indisponibles : les idées de mots-clés ci-dessous sont des gabarits, sans preuve de demande.')
}
const comps = String(opt('concurrents', '') || '').split(',').map((s) => s.trim()).filter(Boolean)
if (comps.length) {
  report.competitors = []
  for (const c of comps) {
    log(`  · Concurrent : ${c}`)
    const rep = await analyze(c, { ...common, input, crawl: 0, kind: 'site' })
    report.competitors.push(competitorSummary(c, rep))
  }
}

const out = opt('sortie', 'rapports-seo')
mkdirSync(out, { recursive: true })
const slug = String(target).replace(/^https?:\/\//, '').replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '').slice(0, 60)
// Veille sociale (Agent Reach) sur le mot-clé : questions réelles et hashtags observés dans le rapport
if (opt('veille')) {
  const { collectVeille, INSTALL_HELP } = await import('./veille-cli.mjs')
  const { analyzeVeille, observedForHashtags } = await import('./engine/veille.js')
  const { generateHashtags } = await import('./engine/hashtags.js')
  const sujet = input.keyword || report.keywords?.base || ''
  const srcOpt = opt('veille')
  const got = await collectVeille({ sujet, sources: typeof srcOpt === 'string' ? srcOpt.split(',') : undefined, marque: input.brand, bin: opt('agent-reach', process.env.AGENT_REACH_BIN || 'agent-reach'), log })
  if (got.missing) log('\n' + INSTALL_HELP)
  else {
    report.veille = analyzeVeille(got.results, { sujet, marque: input.brand })
    const terms = report.result?.meta?.terms?.phrases?.map((t) => t.term).slice(0, 5) || []
    report.hashtags = generateHashtags({ sector: input.sector, keywords: [input.keyword].filter(Boolean), terms, city: input.city, brand: input.brand, lang: input.lang, observed: observedForHashtags(report.veille) })
  }
}
if (opt('cpc') || opt('volume')) {
  const { planBudget, preSpendChecks } = await import('./engine/ads.js')
  report.budget = planBudget({ sector: input.sector, goal: report.kind === 'app' ? 'telechargements' : input.goal, monthly: input.monthly, local: report.input.local, avgValue: input.avgValue, margin: input.margin, closeRate: input.closeRate, targetConversions: input.targetConversions, searchVolume: +opt('volume', 0), cpcOverride: +opt('cpc', 0) })
  report.budget.checks = preSpendChecks(report)
}
// Refonte ou migration : comparaison avec un rapport précédent (critique / alerte / info)
if (typeof opt('avant') === 'string') {
  const { readFileSync } = await import('node:fs')
  const { compareReports } = await import('./engine/drift.js')
  try {
    const old = JSON.parse(readFileSync(opt('avant'), 'utf8'))
    if (!old || typeof old !== 'object' || !old.target || !(old.result || old.ctx)) throw new Error('ce fichier n’est pas un rapport SEO 360 (.json)')
    report.drift = compareReports(old, report)
  } catch (e) { log(`\n⚠️  --avant ignoré : ${e.message}`) }
}
const md = toMarkdown(report)
writeFileSync(join(out, `${slug}.md`), md)
writeFileSync(join(out, `${slug}.json`), JSON.stringify(report, null, 1))

if (quiet) { console.log(JSON.stringify(report, null, 1)); process.exit(0) }
const R = report.result
if (report.error) log(`\n⚠️  ${report.error}`)
if (R) {
  if (R.incomplete) log(`\n⚠️  Audit incomplet : ${R.incomplete}. Pas de note globale.`)
  else log(`\nNote : ${R.global}/100 (${R.grade}) · contrôles mesurés : ${Math.round(R.coverage * 100)} %${R.caps?.length ? ' · plafonnée : ' + R.caps.join(' ; ') : ''}`)
  for (const s of Object.values(R.scores)) log(`  ${s.score == null ? '  —' : String(s.score).padStart(3)}  ${s.label}${s.estimated ? ' (estimé)' : ''}`)
  if (report.plan?.week?.length) { log('\nVos 3 actions cette semaine :'); for (const i of report.plan.week) log(`  • ${i.title} (${i.who}${i.time ? ', ' + i.time : ''})`) }
  if (report.drift) log(`\nDérive après refonte : ${report.drift.verdict}${report.drift.items.length ? '\n' + report.drift.items.filter((i) => i.level !== 'info').slice(0, 8).map((i) => `  [${i.level}] ${i.rule} — ${i.url}`).join('\n') : ''}`)
  if (report.budget?.verdict) log(`\nPublicité : ${report.budget.verdict.text}${report.budget.checks?.blocked ? `\n  ⚠️  ${report.budget.checks.message}` : ''}`)
}
log(`\n📄 Rapport : ${join(out, slug + '.md')}\n🧾 Données : ${join(out, slug + '.json')} (importable dans l’interface web)`)
const firstFix = report.plan?.week?.[0]
log(`\nProchaine étape : ${firstFix ? `« ${firstFix.title} » (${firstFix.who}${firstFix.time ? ', ' + firstFix.time : ''}), puis relancez l’audit avec --avant ${join(out, slug + '.json')} pour vérifier.` : report.kind === 'site' ? `importez votre export Search Console : node seo/cli.mjs gsc <export.zip>.` : 'appliquez le plan du rapport, puis relancez l’audit.'}\n`)

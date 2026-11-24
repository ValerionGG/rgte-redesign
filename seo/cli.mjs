#!/usr/bin/env node
// SEO 360 — audit complet en ligne de commande (Node ≥ 18, aucune dépendance).
// Exemples :
//   node seo/cli.mjs https://www.exemple.fr --secteur boulangerie --ville Lyon --mot-cle "pâtisserie lyon" --budget 1500
//   node seo/cli.mjs https://www.exemple.fr --crawl 30 --concurrents concurrent1.fr,concurrent2.fr --sortie rapports/
//   node seo/cli.mjs https://apps.apple.com/fr/app/x/id123456789
//   node seo/cli.mjs owner/repo           (dépôt GitHub)
import { writeFileSync, mkdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { analyze, competitorSummary, detectKind } from './engine/index.js'
import { toMarkdown } from './engine/report.js'
import { collectDemand, trendsFR, googleList } from './engine/demande.js'
import { sectorById } from './data/sectors.js'
import { makeNodeFetcher } from './node-fetch.mjs'
import { SECTORS } from './data/sectors.js'
import { GOALS, defaultGoal } from './engine/ads.js'

// Réseau à proxy (session cloud, entreprise) : le fetch de Node ignore HTTPS_PROXY sauf avec NODE_USE_ENV_PROXY=1
// (Node 22.21+ ou 24+). On se relance une fois avec cette variable pour que toutes les lectures passent par le proxy.
{
  const [maj, min] = process.versions.node.split('.').map(Number)
  if ((process.env.HTTPS_PROXY || process.env.https_proxy) && !process.env.NODE_USE_ENV_PROXY && (maj >= 24 || (maj === 22 && min >= 21))) {
    const { spawnSync } = await import('node:child_process')
    const r = spawnSync(process.execPath, process.argv.slice(1), { stdio: 'inherit', env: { ...process.env, NODE_USE_ENV_PROXY: '1', NODE_NO_WARNINGS: '1' } })
    process.exit(r.status ?? 1)
  }
}


const args = process.argv.slice(2)

// ───────── Sous-commandes : veille sociale (Agent Reach), Search Console, calendrier ─────────
const SUB = { demande: './demande-cli.mjs', veille: './veille-cli.mjs', gsc: './gsc-cli.mjs', calendrier: './calendrier-cli.mjs', budget: './budget-cli.mjs', hashtags: './hashtags-cli.mjs', outils: './outils-cli.mjs', fiche: './fiche-cli.mjs', presence: './presence-cli.mjs' }
if (SUB[args[0]]) {
  await import(SUB[args[0]]).then((m) => m.main(args.slice(1)))
  process.exit(process.exitCode || 0)
}
const opt = (names, def) => { for (const n of [].concat(names)) { const i = args.indexOf('--' + n); if (i >= 0) return args[i + 1] && !args[i + 1].startsWith('--') ? args[i + 1] : true } return def }
const target = args.find((a, i) => !a.startsWith('--') && !(i > 0 && args[i - 1].startsWith('--') && !['--no-psi', '--json', '--quiet', '--local', '--national', '--sans-demande'].includes(args[i - 1])))

if (!target || opt(['help', 'aide'])) {
  console.log(`SEO 360 — audit SEO, GEO, ASO, hashtags et budget pub

Usage : node seo/cli.mjs <url | lien App Store/Play | owner/repo> [options]
        node seo/cli.mjs demande "<mot-clé>" [--sources google,youtube,amazon,duckduckgo]   (ce que les gens tapent vraiment + tendances du jour)
        node seo/cli.mjs veille "<sujet>" [--sources reddit,youtube,web] [--marque X]   (veille via Agent Reach)
        node seo/cli.mjs gsc <export.zip> [--avant <export-precedent.zip>] [--marque X]   (diagnostic Search Console)
        node seo/cli.mjs calendrier [année] [--secteur <id>] [--alsace] [--sortie dossier]   (temps forts français)
        node seo/cli.mjs budget --secteur <id> [--objectif leads] [--budget €] [--valeur €] [--marge %]   (budget pub seul)
        node seo/cli.mjs hashtags --secteur <id> [--mot-cle "a, b"] [--ville X] [--marque X]   (hashtags seuls)
        node seo/cli.mjs outils [--rapport site.json | --secteur <id> --local]   (outils gratuits et payants + guides)
        node seo/cli.mjs presence <site> [--concurrents a,b] [--marque X]   (réseaux, apps, avis, registre ; vous contre vos concurrents)
        node seo/cli.mjs fiche --store apple|play --nom … --sous-titre … --mots-cles …   (contrôle d'une fiche de store avant envoi)

  --secteur <id>        sans ce choix, le secteur est deviné d'après la page. Valeurs : ${SECTORS.map((s) => s.id).join(', ')}
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
  --sans-demande        ne pas interroger les autocomplétions (Google, YouTube, Amazon, DuckDuckGo) ni les tendances
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
  --html <fichier>      code HTML de la page, déjà récupéré (pas d'accès au site ou page protégée)
  --robots <fichier>    contenu du robots.txt, déjà récupéré
  --lecture auto|direct|jina  auto (défaut) : accès direct, puis Jina Reader si le réseau ne joint pas le site
  --json                afficher le JSON complet sur la sortie standard
`)
  process.exit(target ? 0 : 1)
}

const UA_CHOICE = opt('ua', 'auto')
// Lecture : « auto » = accès direct, puis Jina Reader pour un site que le réseau empêche de joindre (bac à sable,
// session cloud filtrée) ; « direct » = jamais de service tiers ; « jina » = toujours Jina Reader.
const LECTURE = String(opt('lecture', 'auto'))
// Code de la page et robots.txt fournis en fichiers (récupérés par Claude, ou « Afficher le code source ») : lus tels quels
const readOpt = (name) => { const f = opt(name, null); if (!f || f === true) return null; try { return readFileSync(f, 'utf8') } catch (e) { console.error(`Fichier illisible (--${name}) : ${f}`); process.exit(1) } }
const HTML_FILE = readOpt('html'), ROBOTS_FILE = readOpt('robots')
const fetcher = makeNodeFetcher({ ua: UA_CHOICE, lecture: LECTURE, html: HTML_FILE, robots: ROBOTS_FILE, target })

const input = {
  sector: opt('secteur', '') || '', keyword: opt(['mot-cle', 'keyword'], '') || '', city: opt('ville', '') || '', brand: opt('marque', '') || '',
  goal: opt('objectif', null) || (opt('secteur', '') ? defaultGoal(opt('secteur', '')) : ''), monthly: opt('budget', null) == null ? null : +opt('budget'), avgValue: +opt('valeur', 0), targetConversions: +opt('objectif-conv', 0), lang: opt('langue', 'fr'),
  margin: opt('marge', null) == null ? null : +opt('marge') / 100, closeRate: opt('signature', null) == null ? null : +opt('signature') / 100,
}
if (opt('local')) input.local = true
if (opt('national')) input.local = false
if (input.sector && !SECTORS.some((s) => s.id === input.sector)) { console.error(`Secteur inconnu : ${input.sector}`); process.exit(1) }

const quiet = opt('json')
const log = (...a) => { if (!quiet) console.error(...a) }
const common = { fetcher, fetchImpl: fetch, psi: !opt('no-psi'), psiKey: opt('psi-key', process.env.PSI_KEY || ''), githubToken: opt('github-token', process.env.GITHUB_TOKEN || ''), source: 'node' }

log(`\n🔎 SEO 360 — ${target} (${detectKind(target)})`)
const report = await analyze(target, { ...common, input, crawl: +opt('crawl', 15), onProgress: (m) => log('  · ' + m) })
// Secteur deviné d'après la page quand --secteur manque : la suite (veille, budget) l'utilise aussi
Object.assign(input, { sector: report.input.sector, goal: report.input.goal })
if (report.input.sectorGuessed) log(`  · Secteur deviné : ${report.input.sectorGuessed} (--secteur pour le changer)`)
else if (report.input.sectorUnknown) log('  · Secteur non reconnu : « autre » par défaut (précisez --secteur pour des mots-clés, hashtags et budgets plus justes)')
// Demande réelle : 4 autocomplétions sur une quarantaine de variantes, et les tendances Google du jour
if (report.kind === 'site' && (input.keyword || report.keywords?.base) && !opt('sans-demande')) {
  const seed = input.keyword || report.keywords.base
  log(`  · Demande réelle autour de « ${seed} » (Google, YouTube, Amazon, DuckDuckGo, tendances)…`)
  const [d, t] = await Promise.all([
    collectDemand(seed, { fetchImpl: fetch, onProgress: (m) => log('    ' + m) }).catch((e) => ({ error: String(e?.message || e).slice(0, 120) })),
    trendsFR({ fetchImpl: fetch, words: [seed, ...sectorById(input.sector).keywords.slice(0, 6)] }),
  ])
  if (d.items) { report.demande = d; report.suggestions = googleList(d) }
  if (!d.items || !d.sources.google?.ok) report.suggestionsError = d.error || d.sources?.google?.erreur || 'aucune réponse'
  report.tendances = t
  if (!d.items?.length) log('  ⚠ Autocomplétions indisponibles : les idées de mots-clés ci-dessous sont des gabarits, sans preuve de demande.')
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
  else log(`\nNote : ${R.global}/100 (${R.grade}) · part mesurée : ${Math.round(R.coverage * 100)} %${R.caps?.length ? ' · plafonnée : ' + R.caps.join(' ; ') : ''}`)
  for (const s of Object.values(R.scores)) log(`  ${s.score == null ? '  —' : String(s.score).padStart(3)}  ${s.label}${s.estimated ? ' (estimé)' : ''}`)
  if (report.plan?.week?.length) { log('\nVos 3 actions cette semaine :'); for (const i of report.plan.week) log(`  • ${i.title} (${i.who}${i.time ? ', ' + i.time : ''})`) }
  if (report.drift) log(`\nDérive après refonte : ${report.drift.verdict}${report.drift.items.length ? '\n' + report.drift.items.filter((i) => i.level !== 'info').slice(0, 8).map((i) => `  [${i.level}] ${i.rule} — ${i.url}`).join('\n') : ''}`)
  const df = report.drift
  if (df && (df.fixed?.length || df.added?.length)) log(`${df.note ? df.note + ' ' : ''}Corrigés et vérifiés : ${df.fixed.length}${df.fixed.length ? ' (' + df.fixed.slice(0, 5).map((x) => x.title).join(' ; ') + ')' : ''} · nouveaux : ${df.added.length}${df.added.length ? ' (' + df.added.slice(0, 3).map((x) => x.title).join(' ; ') + ')' : ''}`)
  if (report.budget?.verdict) log(`\nPublicité : ${report.budget.verdict.text}${report.budget.checks?.blocked ? `\n  ⚠️  ${report.budget.checks.message}` : ''}`)
}
log(`\n📄 Rapport : ${join(out, slug + '.md')}\n🧾 Données : ${join(out, slug + '.json')} (importable dans l’interface web)`)
const firstFix = report.plan?.week?.[0]
log(`\nProchaine étape : ${firstFix ? `« ${firstFix.title} » (${firstFix.who}${firstFix.time ? ', ' + firstFix.time : ''}), puis relancez l’audit avec --avant ${join(out, slug + '.json')} pour vérifier.` : report.kind === 'site' ? `importez votre export Search Console : node seo/cli.mjs gsc <export.zip>.` : 'appliquez le plan du rapport, puis relancez l’audit.'}\n`)

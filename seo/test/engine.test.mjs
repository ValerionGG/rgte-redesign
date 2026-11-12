// Tests du moteur : NO_PROXY=127.0.0.1 node --test seo/test/engine.test.mjs
// Inclut les « pages pièges » relevées par l'audit du conseil (note honnête, faux positifs, robustesse).
import { test, before, after } from 'node:test'
import assert from 'node:assert/strict'
import http from 'node:http'
import { readFileSync, existsSync, writeFileSync } from 'node:fs'
import { extract, topTerms } from '../engine/html.js'
import { parseRobots, allowed, botMatrix, BOTS } from '../engine/robots.js'
import { scoreBlocks } from '../engine/citability.js'
import { compareReports } from '../engine/drift.js'
import { recommendTools, toolsMarkdown, TOOLS } from '../engine/outils.js'
import { analyze, detectKind, competitorSummary } from '../engine/index.js'
import { toMarkdown } from '../engine/report.js'
import { generateHashtags } from '../engine/hashtags.js'
import { keywordIdeas } from '../engine/keywords.js'
import { planBudget, preSpendChecks } from '../engine/ads.js'
import { auditRepo } from '../engine/github.js'
import { auditIOS, auditPlayHtml, parseStoreUrl } from '../engine/appstore.js'
import { buildFixes, suggestTitle, facts } from '../engine/fixes.js'
import { parseGsc, opportunities, readGscFile, readGscFiles, parseGscFiles, analyzeGsc, brandTerms, isBrand, detectDrop } from '../engine/gsc.js'
import { easter, soldes, calendar, calendarIcs, calendarCsv, upcoming, nthWeekday } from '../engine/calendar.js'
import { encodeReport, decodeReport } from '../engine/share.js'
import { bookmarkletCode, validateBundle, bundleFetcher } from '../engine/bookmarklet.js'
import { decodeBody } from '../engine/decode.js'
import { analyzeVeille, extractHashtags, observedForHashtags, veilleMarkdown } from '../engine/veille.js'
import { collectVeille } from '../veille-cli.mjs'
import { execFileSync, spawnSync, execFile } from 'node:child_process'
import { mkdtempSync, readdirSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

// ───────── Faux site servi en HTTP local ─────────
const root = new URL('./fixtures/site/', import.meta.url)
let server, origin
before(async () => {
  server = http.createServer((req, res) => {
    const path = req.url.split('?')[0]
    const file = new URL('.' + (path === '/' ? '/index.html' : path), root)
    if (!existsSync(file)) { res.writeHead(404); return res.end('not found') }
    res.writeHead(200, { 'Content-Type': path.endsWith('.xml') ? 'application/xml' : path.endsWith('.txt') ? 'text/plain' : 'text/html; charset=utf-8' })
    res.end(readFileSync(file, 'utf8').replaceAll('{{ORIGIN}}', origin))
  })
  await new Promise((r) => server.listen(0, '127.0.0.1', r))
  origin = `http://127.0.0.1:${server.address().port}`
})
after(() => server.close())
const netFetcher = async (url, { noFollow } = {}) => {
  const r = await fetch(url, { redirect: 'manual' })
  if (noFollow) return { status: r.status, location: r.headers.get('location') }
  return { status: r.status, headers: Object.fromEntries(r.headers), body: await r.text(), finalUrl: url, redirects: [], timeMs: 5 }
}

// ───────── Sites virtuels (sans réseau) ─────────
const vfetch = (pages) => async (url, { noFollow } = {}) => {
  if (noFollow) return {}
  const p = pages[url]
  if (!p) return { status: 404, body: 'not found', headers: {} }
  return { status: p.status ?? 200, headers: p.headers ?? { 'content-type': 'text/html; charset=utf-8' }, body: p.body ?? '', finalUrl: url, redirects: [] }
}
const O = 'https://www.maison-exemple.fr'
const words = (n, w = 'pâtisserie artisanale entremets fraises chocolat') => Array.from({ length: n }, (_, i) => w.split(' ')[i % 5]).join(' ')
const page = ({ head = '', body = '', title = 'Pâtisserie artisanale à Lyon | Maison Exemple' } = {}) => `<!doctype html><html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${title}</title>${head}</head><body>${body}</body></html>`
const site = (html, extra = {}) => ({ [O + '/']: { body: html }, [O + '/robots.txt']: { body: 'User-agent: *\nAllow: /\nSitemap: ' + O + '/sitemap.xml', headers: { 'content-type': 'text/plain' } }, [O + '/sitemap.xml']: { body: `<urlset><url><loc>${O}/</loc><lastmod>2026-10-01</lastmod></url></urlset>`, headers: { 'content-type': 'application/xml' } }, ...extra })
const run = (pages, input = {}, o = {}) => analyze(O + '/', { fetcher: vfetch(pages), psi: false, crawl: 0, input: { sector: 'boulangerie', city: 'Lyon', ...input }, ...o })

const GOOD = page({
  head: `<meta name="description" content="Pâtisserie artisanale à Lyon depuis 1998 : entremets, tartes et gâteaux d’anniversaire sur commande. Retrait en boutique ou livraison. Appelez-nous.">
  <link rel="canonical" href="${O}/"><meta name="robots" content="index, follow, max-image-preview:large"><meta name="msvalidate.01" content="x">
  <meta property="og:type" content="website"><meta property="og:title" content="Pâtisserie artisanale à Lyon"><meta property="og:description" content="Entremets et gâteaux"><meta property="og:image" content="${O}/og.jpg"><meta property="og:url" content="${O}/"><meta name="twitter:card" content="summary_large_image">
  <link rel="icon" href="/favicon.svg"><link rel="apple-touch-icon" href="/apple.png"><script defer data-domain="maison-exemple.fr" src="https://plausible.io/js/script.js"></script>
  <script type="application/ld+json">{"@context":"https://schema.org","@type":"Bakery","name":"Maison Exemple","url":"${O}/","telephone":"+33 4 78 00 00 00","image":"${O}/og.jpg","sameAs":["https://www.instagram.com/maisonexemple"],"address":{"@type":"PostalAddress","streetAddress":"12 rue de la Paix","postalCode":"69001","addressLocality":"Lyon"},"openingHoursSpecification":[{"@type":"OpeningHoursSpecification","dayOfWeek":["Tuesday"],"opens":"08:00","closes":"19:00"}]}</script>`,
  body: `<header><nav><a href="/">Accueil</a> <a href="/gateaux">Nos gâteaux</a> <a href="/entremets">Entremets</a> <a href="/commande">Commander</a> <a href="/a-propos">À propos</a> <a href="/contact">Contact</a></nav></header>
  <main><h1>Pâtisserie artisanale à Lyon</h1><p>Depuis 1998, plus de 2 000 clients nous confient leurs gâteaux. ${words(200)}</p>
  <img src="/hero.webp" alt="Entremets aux fraises" width="1600" height="900" fetchpriority="high">
  <h2>Combien coûte un gâteau d’anniversaire ?</h2><p>Comptez 4 € par part. ${words(150)}</p>
  <h2>Quels sont les délais de commande ?</h2><p>48 h pour un entremets. ${words(150)}</p>
  <img src="/tarte.webp" alt="Tarte aux fraises" width="800" height="600" loading="lazy"></main>
  <footer><address>Maison Exemple, 12 rue de la Paix, 69001 Lyon — <a href="tel:+33478000000">04 78 00 00 00</a></address>
  <a href="https://maps.app.goo.gl/abc">Itinéraire</a> <a href="https://www.instagram.com/maisonexemple" aria-label="Instagram">IG</a> <a href="/mentions-legales">Mentions légales</a> <a href="/confidentialite">Confidentialité</a></footer>`,
})
const GOOD_HEADERS = { 'content-type': 'text/html; charset=utf-8', 'content-encoding': 'br', 'strict-transport-security': 'max-age=31536000', 'x-content-type-options': 'nosniff', 'cache-control': 'max-age=300' }

// ───────── Extraction ─────────
test('extract : balises, titres, liens, images, JSON-LD', () => {
  const p = extract(readFileSync(new URL('index.html', root), 'utf8'), 'https://ex.fr/')
  assert.equal(p.lang, 'fr'); assert.equal(p.title, 'Pâtisserie'); assert.equal(p.headings[0].text, 'Pâtisserie artisanale à Lyon')
  assert.equal(p.images.length, 10); assert.equal(p.images.filter((i) => i.alt === null).length, 9)
  assert.equal(p.jsonLd.length, 1); assert.equal(p.jsonLdErrors.length, 1)
  assert.ok(!p.text.includes('dataLayer'), 'le JS ne doit pas être compté comme texte')
})
test('extract : mots séparés entre liens, logo cliquable lu par son alt, titres imbriqués, pas de coût quadratique', () => {
  const p = extract('<nav><a href=/>Accueil</a><a href=/g>Nos gâteaux</a></nav><a href=/><img src=logo.png alt="Maison Test"></a><h1>Titre<h2>Sous</h2><p><span>P</span>âtisserie</p>', 'https://ex.fr/')
  assert.ok(p.text.includes('Accueil Nos gâteaux')); assert.ok(p.text.includes('Pâtisserie'))
  assert.deepEqual(p.links.map((l) => l.text), ['Accueil', 'Nos gâteaux', 'Maison Test'])
  assert.deepEqual(p.headings.map((h) => h.text), ['Titre', 'Sous'])
  const t = Date.now(); extract('<body>' + '<a href=/x>lien '.repeat(4000), 'https://ex.fr/'); assert.ok(Date.now() - t < 1000)
})
test('decodeBody : ISO-8859-1 et UTF-8', () => {
  const latin = new Uint8Array([...Buffer.from('<meta charset="iso-8859-1"><title>P'), 0xe2, ...Buffer.from('tisserie</title>')])
  assert.ok(decodeBody(latin).includes('Pâtisserie'))
  assert.ok(decodeBody(new TextEncoder().encode('Café'), 'text/html; charset=utf-8').includes('Café'))
})

// ───────── Robots ─────────
test('robots.txt : groupes et règle la plus longue', () => {
  const r = parseRobots('User-agent: *\nDisallow: /private\nAllow: /private/ok\n\nUser-agent: GPTBot\nDisallow: /')
  assert.equal(allowed(r, 'Googlebot', '/private/x').allowed, false); assert.equal(allowed(r, 'Googlebot', '/private/ok/1').allowed, true)
  assert.equal(allowed(r, 'GPTBot', '/').allowed, false); assert.equal(allowed(r, 'OAI-SearchBot', '/').allowed, true)
})

// ───────── Note honnête ─────────
test('note : une page bien optimisée obtient au moins 85', async () => {
  const rep = await run(site(GOOD, { [O + '/']: { body: GOOD, headers: GOOD_HEADERS }, [O + '/llms.txt']: { body: '# Maison Exemple\n> Pâtisserie à Lyon, entremets et gâteaux sur commande.', headers: { 'content-type': 'text/plain' } } }), { keyword: 'pâtisserie artisanale', brand: 'Maison Exemple' })
  const R = rep.result
  assert.equal(R.incomplete, null); assert.ok(R.coverage >= 0.9, 'couverture ' + R.coverage)
  assert.ok(R.global >= 85, `note ${R.global} — ${R.issues.map((i) => i.id).join(', ')}`)
  assert.equal(R.counts.critique, 0)
})
test('note : rien de lu → pas de note (PageSpeed seul, proxy en panne, pare-feu, page de défi)', async () => {
  const psiOnly = await analyze(O + '/', { noFetch: true, psi: false, input: { sector: 'boulangerie' } })
  assert.equal(psiOnly.result.global, null); assert.ok(psiOnly.result.incomplete)
  const down = await analyze(O + '/', { fetcher: async () => ({ status: 0, unknown: true }), psi: false, source: 'proxy', input: { sector: 'boulangerie' } })
  assert.equal(down.result.global, null); assert.ok(!down.result.issues.some((i) => i.id === 'fetch-error'), 'un proxy en panne n’est pas une erreur du site')
  const waf = await run({ [O + '/']: { status: 403, body: '<html>Forbidden</html>' } })
  assert.equal(waf.result.global, null); assert.ok(waf.result.infos.some((i) => i.id === 'blocked'))
  const chal = await run({ [O + '/']: { body: '<html><title>Just a moment...</title><div id="cf-chl-widget"></div></html>' } })
  assert.equal(chal.result.global, null)
})
test('note : plafonds (noindex, robots none, canonical vers un autre domaine, coquille JavaScript, page vide)', async () => {
  const withHead = (h) => GOOD.replace('<link rel="canonical"', h + '<link rel="canonical"')
  const noindex = await run(site(withHead('<meta name="robots" content="noindex">').replace('index, follow, max-image-preview:large', 'noindex')))
  assert.ok(noindex.result.global <= 30, 'noindex ' + noindex.result.global); assert.ok(noindex.result.caps.length)
  const none = await run(site(GOOD.replace('index, follow, max-image-preview:large', 'none')))
  assert.ok(none.result.issues.some((i) => i.id === 'noindex') && none.result.issues.some((i) => i.id === 'nofollow'))
  const preprod = await run(site(GOOD.replace(`<link rel="canonical" href="${O}/">`, '<link rel="canonical" href="https://preprod.agence.com/">')))
  assert.ok(preprod.result.issues.some((i) => i.id === 'canonical-host')); assert.ok(preprod.result.global <= 40)
  const spa = await run(site(page({ body: '<div id="root"></div><script src="/a.js"></script><script src="/b.js"></script>' })), {}, { rendered: { wordCount: 600 } })
  assert.ok(spa.result.issues.some((i) => i.id === 'js-render' && i.sev === 'critique')); assert.ok(spa.result.global <= 40)
  const construction = await run(site(page({ body: '<h1>Site en construction</h1>' })))
  assert.ok(construction.result.scores.contenu.score <= 40)
  assert.ok(construction.result.global < 70, 'page vide ' + construction.result.global)
})
test('robots.txt : « * bloqué mais Googlebot autorisé » n’est pas « tout le site bloqué » ; pas de double comptage', async () => {
  const star = await run({ ...site(GOOD), [O + '/robots.txt']: { body: 'User-agent: *\nDisallow: /\n\nUser-agent: Googlebot\nAllow: /', headers: {} } })
  assert.ok(!star.result.issues.some((i) => i.id === 'robots-all')); assert.ok(star.result.issues.some((i) => i.id === 'robots-star'))
  const all = await run({ ...site(GOOD), [O + '/robots.txt']: { body: 'User-agent: *\nDisallow: /', headers: {} } })
  assert.equal(all.result.issues.filter((i) => /^robots-(all|block)$/.test(i.id)).length, 1)
})

// ───────── Faux positifs corrigés ─────────
test('faux positifs : sous-types LocalBusiness, logo cliquable, téléphone +33, en-uk, URL %E9, statut inconnu', async () => {
  const plumber = await run(site(GOOD.replace('"@type":"Bakery"', '"@type":"Plumber"')), { sector: 'btp' })
  assert.ok(!plumber.result.issues.some((i) => i.id === 'localbusiness' || i.id === 'schema-org'))
  const logo = await run(site(GOOD.replace('<header><nav>', '<header><a href="/"><img src="/logo.png" alt="Maison Exemple" width="100" height="40"></a><nav>')))
  assert.ok(!logo.result.issues.some((i) => i.id === 'empty-links'))
  const p33 = await run(site(GOOD.replace('<a href="tel:+33478000000">04 78 00 00 00</a>', 'Tél. +33 4 78 00 00 00')))
  const tel = p33.result.issues.find((i) => i.id === 'tel'); assert.ok(tel && tel.sev === 'faible', 'numéro détecté, seulement non cliquable')
  assert.equal(p33.result.meta.phone, '+33 4 78 00 00 00')
  const uk = await run(site(GOOD.replace('<link rel="canonical"', `<link rel="alternate" hreflang="en-uk" href="${O}/en/"><link rel="alternate" hreflang="fr-fr" href="${O}/"><link rel="alternate" hreflang="x-default" href="${O}/"><link rel="canonical"`)))
  assert.ok(uk.result.issues.some((i) => i.id === 'hreflang-code'))
  const pct = await analyze(O + '/caf%E9', { fetcher: vfetch({ [O + '/caf%E9']: { body: GOOD } }), psi: false, input: { sector: 'boulangerie' } })
  assert.ok(pct.result)
  const unknown = await analyze(O + '/', { fetcher: async (u) => (u === O + '/' ? { status: 200, body: GOOD, headers: {} } : { status: 0 }), psi: false, source: 'proxy', input: { sector: 'boulangerie' } })
  const ids = unknown.result.issues.map((i) => i.id)
  assert.ok(!ids.includes('sitemap') && !ids.includes('robots-missing')); assert.ok(unknown.result.infos.some((i) => i.id === 'sitemap-unknown'))
})
test('analyse du faux site HTTP (crawl, liens cassés, robots IA, couverture)', async () => {
  const rep = await analyze(origin + '/', { fetcher: netFetcher, psi: false, crawl: 5, input: { sector: 'boulangerie', city: 'Lyon', keyword: 'pâtisserie lyon', brand: 'Maison Test', monthly: 1200 } })
  const ids = rep.result.issues.map((i) => i.id)
  for (const id of ['description', 'alt', 'jsonld-error', 'robots-ai-search', 'broken', 'dup-title', 'heading-order', 'cmp', 'legal', 'labels', 'buttons', 'og', 'https']) assert.ok(ids.includes(id), `constat attendu : ${id}`)
  assert.ok(rep.result.global > 0 && rep.result.global < 80)
  assert.ok(rep.result.issues.filter((i) => i.scope === 'site').length >= 1, 'constats du crawl marqués « site »')
  const md = toMarkdown(rep)
  assert.ok(md.includes('Vos 3 actions cette semaine') && md.includes('## Budget publicitaire'))
  const fx = buildFixes(rep), covered = rep.result.issues.filter((i) => fx[i.id] || i.code).length
  assert.ok(covered / rep.result.issues.length >= 0.7, `correctifs prêts : ${covered}/${rep.result.issues.length}`)
  const c = competitorSummary(origin, rep)
  assert.equal(c.global, rep.result.pageGlobal)
})

// ───────── Saisie, plan, correctifs ─────────
test('routage de la saisie : un domaine nu est un site', () => {
  for (const [u, k] of [['rgte.fr', 'site'], ['www.rgte.fr', 'site'], ['monsite.fr/contact', 'site'], ['owner/repo', 'github'], ['https://github.com/a/b', 'github'], ['https://apps.apple.com/fr/app/x/id123456789', 'app'], ['https://play.google.com/store/apps/details?id=com.a.b', 'app']]) assert.equal(detectKind(u), k, u)
})
test('plan : les critiques passent cette semaine, avec qui et combien de temps', async () => {
  const rep = await analyze(origin + '/', { fetcher: netFetcher, psi: false, crawl: 0, input: { sector: 'boulangerie', city: 'Lyon' } })
  const week = rep.plan.steps[0].items
  for (const c of rep.result.issues.filter((i) => i.sev === 'critique')) assert.ok(week.some((w) => w.id === c.id), 'critique en semaine 1 : ' + c.id)
  assert.equal(rep.plan.week.length, 3); assert.ok(rep.plan.week.every((w) => w.who))
  assert.ok(rep.plan.steps[0].extra.some((x) => /Google Business Profile/.test(x.title)), 'fiche Google dès la semaine 1 (local)')
})
test('correctifs : construits avec les données de la page', async () => {
  const rep = await run(site(GOOD), { brand: 'Maison Exemple' })
  const f = facts(rep)
  assert.ok(suggestTitle(f).length <= 60)
  rep.result.issues.push({ id: 'schema-none', cat: 'donnees', sev: 'important', title: 'x', impact: 4, effort: 1 })
  const fx = buildFixes(rep)
  assert.ok(fx['schema-none'].value.includes('+33 4 78 00 00 00') && fx['schema-none'].value.includes('instagram.com/maisonexemple'))
})

// ───────── Hashtags & mots-clés ─────────
test('hashtags : limites par réseau, rien de banni, local précis, expression entière', () => {
  const h = generateHashtags({ sector: 'boulangerie', keywords: ['pâtisserie lyon'], city: 'Lyon', brand: 'Maison Test' })
  assert.ok(h.networks.instagram.tags.length <= 5); assert.equal(h.networks.threads.tags.length, 1)
  const all = Object.values(h.networks).flatMap((n) => n.tags.map((t) => t.tag))
  assert.ok(!all.includes('followforfollow') && !all.includes('meilleurouvrierdefrance') && !all.some((t) => t.includes('paris')))
  assert.ok(all.every((t) => /^[a-z0-9_]+$/.test(t)))
  const g = generateHashtags({ sector: 'equipement-pro', keywords: ['vitrine réfrigérée sur mesure'], brand: 'RGTE' })
  assert.ok(g.networks.instagram.tags.some((t) => t.camel === 'VitrineRefrigereeSurMesure'))
})
test('mots-clés : pas de doublons de ville ni de modificateur', () => {
  const k = keywordIdeas({ seed: 'pâtisserie lyon', sector: 'boulangerie', city: 'Lyon' })
  const all = Object.values(k.groups).flat().map((x) => x.keyword.toLowerCase())
  assert.ok(!all.some((x) => /lyon.*lyon/.test(x)))
  const k2 = keywordIdeas({ seed: 'vitrine réfrigérée sur mesure', sector: 'equipement-pro' })
  assert.ok(!Object.values(k2.groups).flat().some((x) => /sur mesure sur mesure|devis prix|fabricant prix/.test(x.keyword)))
  assert.ok(!k2.groups.local, 'pas d’intention locale pour un fabricant national')
})

// ───────── Budget ─────────
test('budget : verdict, minimum par canal, budget conseillé, campagnes App, CPC réel, plafond de demande', () => {
  const tot = (b) => b.channels.reduce((s, c) => s + c.budget, 0)
  const rgte = planBudget({ sector: 'equipement-pro', goal: 'leads', monthly: 1000, avgValue: 12000, margin: 0.4, closeRate: 0.1 })
  assert.equal(rgte.verdict.level, 'ok'); assert.equal(tot(rgte), 1000)
  assert.equal(planBudget({ sector: 'equipement-pro', goal: 'leads', monthly: 1000, avgValue: 12000 }).verdict.level, 'test', 'marge supposée : pas de « Rentable » ferme')
  assert.ok(!rgte.channels.some((c) => c.id === 'linkedin'), 'LinkedIn écarté sous 1 500 €/mois')
  const pat = planBudget({ sector: 'boulangerie', goal: 'leads', avgValue: 45 })
  assert.ok(pat.recommendedUsed && pat.monthly > 0); assert.equal(pat.verdict.level, 'non')
  assert.equal(planBudget({ sector: 'boulangerie', goal: 'leads', monthly: 800 }).verdict.level, 'inconnu')
  const app = planBudget({ sector: 'app-mobile', goal: 'telechargements', monthly: 2000 })
  assert.ok(app.channels.some((c) => c.id === 'google_app') && !app.channels.some((c) => c.id === 'google_pmax'))
  const band = planBudget({ sector: 'ecommerce', goal: 'ventes', monthly: 3000, avgValue: 60 }).totals.band
  assert.ok(band[1] / band[0] < 2.2, 'fourchette resserrée (±35 %)')
  const cpc = planBudget({ sector: 'equipement-pro', goal: 'leads', monthly: 1000, cpcOverride: 6 })
  assert.ok(Math.abs(cpc.channels[0].cpc[0] - 4.8) < 1e-9)
  const cap = planBudget({ sector: 'restaurant', goal: 'leads', monthly: 5000, searchVolume: 200 })
  assert.ok(cap.warnings.some((w) => /plus assez de recherches/.test(w)))
})

// ───────── Search Console, partage, bouton-favori ─────────
test('Search Console : CSV français et ZIP', async () => {
  const csv = '﻿Requêtes les plus fréquentes,Clics,Impressions,CTR,Position\nvitrine réfrigérée,12,900,"1,33 %",7.4\nrgte,80,200,40%,1.0\n'
  const p = parseGsc(csv); assert.equal(p.rows.length, 2); assert.ok(Math.abs(p.rows[0].ctr - 0.0133) < 1e-9)
  const opp = opportunities(p); assert.equal(opp[0].key, 'vitrine réfrigérée'); assert.ok(opp[0].gain > 0)
  const zip = readFileSync(new URL('./fixtures/gsc.zip', import.meta.url))
  const z = await readGscFile(zip); assert.match(z.name, /Requ/); assert.ok(parseGsc(z.text).rows.length >= 3)
})
test('Search Console : ZIP complet, marque, comparaison, chute datée, liens', async () => {
  const load = async (f) => parseGscFiles(await readGscFiles(readFileSync(new URL('./fixtures/' + f, import.meta.url)), f))
  const cur = await load('gsc-complet.zip'), prev = await load('gsc-precedent.zip'), liens = await load('liens.zip')
  assert.deepEqual(Object.keys(cur.perf).sort(), ['appareils', 'dates', 'pages', 'pays', 'requetes'])
  assert.deepEqual(Object.keys(liens.liens).sort(), ['ancres', 'pages', 'sites'])
  cur.liens = liens.liens
  const a = analyzeGsc({ cur, prev, brand: 'Maison Exemple', domain: 'www.maison-exemple.fr' })
  assert.ok(Math.abs(a.months - 90 / 30.44) < 0.01, 'période lue dans la courbe quotidienne')
  assert.ok(a.brand.share > 0.7 && a.brand.share < 0.73, 'part de marque ' + a.brand.share)
  assert.ok(!a.opportunities.some((o) => /maison exemple/.test(o.key)), 'marque exclue des opportunités')
  assert.equal(a.compare.pages.perdants[0].key, 'https://www.maison-exemple.fr/vitrines-refrigerees')
  assert.match(a.compare.pages.perdants[0].cause, /résumé IA/)
  assert.match(a.compare.pages.disparus[0].cause, /Disparue/)
  assert.ok(a.compare.horsMarque.evolution < -0.3)
  assert.equal(a.drop.date, '2026-09-28'); assert.ok(a.drop.updates.some((u) => u.id === 'spam-2026-09'))
  assert.match(a.actions[0], /ne suffit pas : vos positions n’ont pas bougé/)
  assert.equal(a.liens.nbSites, 4); assert.ok(a.liens.alerts.some((x) => /ancre « mot-clé »/.test(x)))
  const l2 = analyzeGsc({ cur: { perf: {}, liens: liens.liens, filtres: [] }, prev: { perf: {}, liens: { sites: { type: 'sites', rows: [...liens.liens.sites.rows, { key: 'presse-locale.fr', links: 3 }] } } } }).liens
  assert.deepEqual(l2.perdus.map((x) => x.key), ['presse-locale.fr']); assert.match(l2.alerts[0], /perdu/)
  assert.ok(a.hidden > 0.5, 'part masquée par Search Console signalée')
  // Mode « comparer » de Search Console : deux colonnes par mesure dans un seul fichier
  const cmp = parseGsc('Requêtes les plus fréquentes,Clics (3 derniers mois),Clics (3 mois précédents),Impressions (3 derniers mois),Impressions (3 mois précédents),CTR (3 derniers mois),CTR (3 mois précédents),Position (3 derniers mois),Position (3 mois précédents)\nvitrine,10,40,1000,1000,1%,4%,5,5\n')
  assert.ok(cmp.compare); assert.equal(cmp.rows[0].clicks, 10); assert.equal(cmp.rows[0].prev.clicks, 40)
  const b = analyzeGsc({ cur: { perf: { requetes: cmp }, liens: {}, filtres: [] } })
  assert.equal(b.compare.requetes.perdants[0].delta, -30); assert.match(b.compare.requetes.perdants[0].cause, /résumé IA/)
  // Marque : nom et domaine, sans faux positif
  const t = brandTerms({ brand: 'Maison Exemple', domain: 'https://shop.maison-exemple.co.uk/' })
  assert.ok(isBrand('maison exemple lyon', t) && isBrand('maisonexemple avis', t) && !isBrand('maison de campagne', t))
  assert.equal(detectDrop([{ key: '2026-01-01', clicks: 5 }]), null)
  // Ligne de commande
  const out = mkdtempSync(join(tmpdir(), 'gsc-'))
  const r = spawnSync(process.execPath, [new URL('../cli.mjs', import.meta.url).pathname, 'gsc', new URL('./fixtures/gsc-complet.zip', import.meta.url).pathname, '--avant', new URL('./fixtures/gsc-precedent.zip', import.meta.url).pathname, '--sortie', out], { encoding: 'utf8' })
  assert.equal(r.status, 0, r.stderr); assert.match(r.stdout, /## Chute détectée/); assert.match(r.stdout, /maison-exemple\.fr/); assert.match(r.stderr, /Prochaine étape/)
})
test('calendrier : dates calculées (Pâques, fête des mères, soldes, ponts), CSV et .ics', () => {
  assert.equal(easter(2027).toISOString().slice(0, 10), '2027-03-28')
  assert.equal(easter(2028).toISOString().slice(0, 10), '2028-04-16')
  const c28 = calendar(2028, { sector: 'boulangerie' })
  assert.equal(c28.tempsForts.find((m) => m.label === 'Fête des mères').date, '2028-05-28')
  // 2039 : le dernier dimanche de mai est la Pentecôte → fête des mères le 1er dimanche de juin
  assert.equal(nthWeekday(2039, 5, 0, -1).getTime(), easter(2039).getTime() + 49 * 86400000)
  assert.equal(calendar(2039, { sector: 'beaute' }).tempsForts.find((m) => m.label === 'Fête des mères').date, '2039-06-05')
  assert.equal(soldes(2027).hiver.start, '2027-01-06'); assert.equal(soldes(2028).hiver.start, '2028-01-12')
  assert.equal(soldes(2027).ete.start, '2027-06-23'); assert.equal(soldes(2028).ete.start, '2028-06-28'); assert.equal(soldes(2027).hiver.end, '2027-02-02')
  assert.equal(calendar(2026, { sector: 'ecommerce' }).tempsForts.find((m) => m.label === 'Black Friday').date, '2026-11-27')
  assert.ok(calendar(2026, { alsace: true }).feries.some((f) => f.label.startsWith('Vendredi saint')))
  assert.ok(!calendar(2026).feries.some((f) => f.label.startsWith('Vendredi saint')))
  assert.equal(c28.feries.find((f) => f.label === 'Ascension').pont, '2028-05-26')
  const ics = calendarIcs(c28); assert.match(ics, /^BEGIN:VCALENDAR\r\n/); assert.ok(ics.includes('DTSTART;VALUE=DATE:2028'))
  assert.ok(calendarCsv(c28).startsWith('\uFEFFdate;temps_fort;action;canal;responsable;statut;notes\r\n'))
  const up = upcoming(new Date('2026-11-05T12:00:00Z'), { days: 60, sector: 'boulangerie' })
  assert.equal(up.filter((m) => m.label === 'Noël').length, 1); assert.ok(up.find((m) => m.label === 'Noël').ferie)
  const r = spawnSync(process.execPath, [new URL('../cli.mjs', import.meta.url).pathname, 'calendrier', '2027', '--secteur', 'restaurant'], { encoding: 'utf8' })
  assert.equal(r.status, 0, r.stderr); assert.match(r.stdout, /Beaujolais nouveau/); assert.match(r.stdout, /jeu\. 18 nov\./)
})
test('dérive après refonte : noindex, canonical, données structurées, contenu, pages en erreur', () => {
  const pg = (url, o = {}) => ({ url, status: 200, title: 'Vitrines réfrigérées sur mesure à Lyon', h1: 'Vitrines réfrigérées', words: 600, canonical: url, noindex: false, schema: 2, ...o })
  const before = { target: 'https://x.fr/', generatedAt: '2026-10-01T00:00:00Z', result: { global: 82, issues: [] }, ctx: { sitemap: { status: 200 }, crawl: { pages: [pg('https://x.fr/'), pg('https://x.fr/a'), pg('https://x.fr/b'), pg('https://x.fr/c'), pg('https://x.fr/d')] } } }
  const after = { target: 'https://x.fr/', generatedAt: '2026-11-01T00:00:00Z', result: { global: 61, issues: [{ id: 'robots-all' }] }, ctx: { sitemap: { status: 404 }, crawl: { pages: [pg('https://www.x.fr/', { title: 'Accueil' }), pg('https://x.fr/a', { noindex: true }), pg('https://x.fr/b', { canonical: 'https://x.fr/', schema: 0 }), pg('https://x.fr/c', { status: 404 }), pg('https://x.fr/d', { words: 200, h1: '' }), pg('https://x.fr/e')] } } }
  const d = compareReports(before, after)
  const has = (level, re) => d.items.some((i) => i.level === level && re.test(i.rule))
  assert.ok(has('critique', /robots\.txt interdit/)); assert.ok(has('critique', /noindex ajouté/)); assert.ok(has('critique', /erreur 404/))
  assert.ok(has('alerte', /Canonical modifiée/)); assert.ok(has('alerte', /Données structurées supprimées/)); assert.ok(has('alerte', /Contenu réduit de 67 %/)); assert.ok(has('alerte', /H1 supprimé/)); assert.ok(has('alerte', /sitemap/))
  assert.ok(has('info', /Title très modifié/), 'www. et / final normalisés : même page')
  assert.equal(d.items[0].level, 'critique'); assert.match(d.verdict, /critique/)
  assert.match(toMarkdown({ ...after, kind: 'site', input: {}, result: null, drift: d }), /## Dérive après refonte/)
  assert.equal(compareReports(before, { ...before }).counts.critique, 0)
})
test('citabilité par bloc et robots IA en 3 niveaux, Content-Signal', async () => {
  const blocks = extract(page({ body: '<h2>Combien coûte une vitrine réfrigérée sur mesure ?</h2><p>Une vitrine réfrigérée sur mesure coûte entre 4 000 et 12 000 € selon la longueur, le froid ventilé ou statique et les finitions. ' + words(40) + '</p><h2>Nos services</h2><p>Mais nous faisons aussi beaucoup d’autres choses pour vous, avec passion et savoir-faire, depuis toujours et partout en France pour nos clients fidèles.</p><footer><h2>Contact</h2><p>12 rue de la Paix, 69001 Lyon, ouvert du lundi au samedi.</p></footer>' }), 'https://x.fr/').blocks
  assert.equal(blocks.length, 2, 'titres du pied de page ignorés')
  const sc = scoreBlocks(blocks)
  assert.equal(sc[0].score, 5); assert.ok(sc[1].score <= 2); assert.ok(sc[1].fails.includes('intertitre explicite') && sc[1].fails.includes('réponse en 1re phrase'))
  const r = parseRobots('User-agent: *\nContent-Signal: search=yes, ai-input=no, ai-train=no\nAllow: /\n\nUser-agent: ChatGPT-User\nDisallow: /\n')
  assert.deepEqual(r.signal, { search: true, 'ai-input': false, 'ai-train': false })
  const m = botMatrix(r, '/')
  assert.equal(m.find((b) => b.ua === 'ChatGPT-User').kind, 'ia-utilisateur'); assert.equal(m.find((b) => b.ua === 'ChatGPT-User').allowed, false)
  assert.match(BOTS.find((b) => b.ua === 'Google-Extended').owner, /sans effet sur la recherche Google ni AI Overviews/)
})
test('données de référence vérifiées il y a moins de 120 jours (sinon : refaire la veille, puis node seo/data/sync.mjs)', async () => {
  const { VERIFIED } = await import('../data/google-updates.js')
  const { BOTS_VERIFIED } = await import('../engine/robots.js')
  const dates = { benchmarks: JSON.parse(readFileSync(new URL('../data/research/benchmarks.json', import.meta.url), 'utf8')).generated, 'mises à jour Google': VERIFIED, 'robots IA': BOTS_VERIFIED }
  for (const [k, d] of Object.entries(dates)) {
    const age = (Date.now() - Date.parse(d)) / 86400000
    assert.ok(age < 120, `${k} vérifié le ${d} (il y a ${Math.round(age)} jours) : à revérifier`)
  }
})
test('contrôle avant dépense : un ✗ suspend le verdict, ROAS d’équilibre', () => {
  const site = (meta, psi) => ({ kind: 'site', input: { goal: 'leads' }, ctx: { page: {}, psi }, result: { meta } })
  const bad = preSpendChecks(site({ trackers: ['Pixel Meta'], cmp: [], telLink: false, forms: 0 }, { scores: { performance: 31 } }))
  assert.ok(bad.blocked); assert.deepEqual(bad.checks.filter((c) => c.status === '✗').map((c) => c.id), ['conversion', 'consent', 'mobile', 'contact'])
  assert.match(bad.message, /^Verdict suspendu : corrigez d’abord la mesure des conversions, le Consent Mode v2, la vitesse sur mobile et le téléphone/)
  const ok = preSpendChecks(site({ trackers: ['Google Ads', 'Google Analytics 4'], cmp: ['Axeptio', 'Consent Mode Google'], telLink: true, forms: 1 }, { scores: { performance: 82 }, field: { LCP: 2100 } }))
  assert.ok(!ok.blocked); assert.equal(ok.checks.filter((c) => c.status === '✓').length, 4)
  assert.equal(preSpendChecks({ kind: 'app', input: {}, ctx: {}, result: { meta: {} } }).blocked, false, 'app : rien de bloquant sans mesure')
  assert.equal(planBudget({ sector: 'ecommerce', goal: 'ventes', monthly: 1000, avgValue: 60, margin: 0.4 }).roasBreakEven, 2.5)
})
test('boîte à outils : choix selon l’audit, ordre d’installation, guides et prix', () => {
  const rep = { kind: 'site', input: { sector: 'boulangerie', local: true, monthly: 300, goal: 'leads' }, result: { issues: [{ id: 'analytics', sev: 'important' }, { id: 'cmp', sev: 'important' }, { id: 'lcp', sev: 'important' }, { id: 'bing', sev: 'info' }], meta: { cms: ['WordPress'], forms: 1 } } }
  const t = recommendTools(rep)
  const ids = t.essentiel.map((x) => x.id)
  assert.deepEqual(ids.slice(0, 3), ['search-console', 'gbp', 'tarteaucitron'], 'ordre : Search Console, fiche Google, bandeau cookies')
  for (const id of ['ga4', 'gtm', 'consent-mode', 'rank-math', 'meta-business', 'tiktok-business', 'psi-key']) assert.ok(ids.includes(id), id)
  assert.ok(t.recommande.some((x) => x.id === 'wp-rocket'), 'WordPress lent → WP Rocket')
  assert.ok(t.pro.some((x) => x.id === 'call-tracking'), 'pub sur des contacts → suivi d’appels')
  assert.ok(t.essentiel.find((x) => x.id === 'ga4').raisons[0].includes('Aucun outil de mesure'))
  const md = toolsMarkdown(t)
  assert.match(md, /### Cette semaine \(gratuit, dans cet ordre\)/); assert.match(md, /### Ce mois-ci/); assert.match(md, /Budget outils/)
  // Sans audit : base sectorielle, rien de payant imposé
  const base = recommendTools({ kind: 'site', input: { sector: 'saas' }, result: { issues: [], meta: {} } })
  assert.ok(!base.essentiel.some((x) => x.id === 'gbp')); assert.ok(base.essentiel.some((x) => x.id === 'linkedin-insight' || x.id === 'search-console'))
  for (const x of Object.values(TOOLS)) { assert.match(x.url, /^https:\/\//, x.id); assert.ok(['essentiel', 'recommande', 'pro'].includes(x.niveau), x.id); if (x.niveau === 'essentiel') assert.ok(x.gratuit, `${x.id} : un essentiel doit être gratuit`) }
  const r = spawnSync(process.execPath, [new URL('../cli.mjs', import.meta.url).pathname, 'outils', '--secteur', 'restaurant', '--local'], { encoding: 'utf8' })
  assert.equal(r.status, 0, r.stderr); assert.match(r.stdout, /Google Business Profile/)
})
test('skills : frontmatter, sections obligatoires, références liées, 3 évaluations dont 1 négative, plugin à jour', () => {
  const root = new URL('../../', import.meta.url), dir = new URL('.claude/skills/', root)
  const names = readdirSync(dir).filter((n) => existsSync(new URL(`${n}/SKILL.md`, dir)))
  assert.equal(names.length, 21)
  const evals = readdirSync(new URL('plugins/seo360/evals/', root))
  for (const n of names) {
    const s = readFileSync(new URL(`${n}/SKILL.md`, dir), 'utf8'), fm = s.match(/^---\n([\s\S]*?)\n---/)?.[1] || ''
    assert.equal(fm.match(/^name: (.+)$/m)?.[1].trim(), n, `${n} : name`)
    const d = fm.match(/^description: (.+)$/m)?.[1] || ''
    assert.ok(d.length >= 200 && d.length <= 700, `${n} : description de ${d.length} caractères (liste des skills limitée)`)
    assert.match(fm, /^metadata:\n {2}version: "\d+\.\d+"$/m, `${n} : metadata.version`)
    for (const h of ['## Quand ne pas l', '## Terminé quand', '## Jamais']) assert.ok(s.includes(h), `${n} : section « ${h} »`)
    if (n !== 'contexte-entreprise') assert.ok(s.includes('.claude/contexte-entreprise.md'), `${n} : bloc « Contexte d'abord »`)
    for (const [, ref] of s.matchAll(/\]\((references\/[^)#]+)\)/g)) assert.ok(existsSync(new URL(`${n}/${ref}`, dir)), `${n} : ${ref} introuvable`)
    assert.ok(s.split('\n').length < 500, `${n} : SKILL.md trop long`)
    assert.ok(!/node -e|import\('\.\/seo/.test(s), `${n} : appeler la CLI plutôt que le moteur directement`)
    const ev = evals.filter((e) => e.startsWith(n + '-0'))
    assert.ok(ev.length >= 3, `${n} : ${ev.length} évaluation(s)`)
    assert.ok(ev.some((e) => existsSync(new URL(`plugins/seo360/evals/${e}/graders/ne-declenche-pas.md`, root))), `${n} : pas de cas négatif`)
    for (const e of ev) for (const f of ['prompt.md', 'graders/resultat.md']) assert.ok(existsSync(new URL(`plugins/seo360/evals/${e}/${f}`, root)), `${e} : ${f}`)
  }
  const r = spawnSync(process.execPath, [new URL('../plugin.mjs', import.meta.url).pathname, '--check'], { encoding: 'utf8' })
  assert.equal(r.status, 0, r.stderr)
})
test('partage : aller-retour compressé, lien trop long refusé', async () => {
  const rep = await run(site(GOOD))
  const code = await encodeReport(rep)
  const back = await decodeReport(code)
  assert.equal(back.target, rep.target); assert.equal(back.result.issues.length, rep.result.issues.length)
  assert.ok(code.length < 20000, 'lien de ' + code.length + ' caractères')
  await assert.rejects(decodeReport('A'.repeat(500000)))
})
test('bouton-favori : code valide, données vérifiées, rendu JavaScript comparé au HTML brut', async () => {
  const code = bookmarkletCode('https://valeriongg.github.io/rgte-redesign/seo/')
  assert.ok(code.startsWith('javascript:')); new Function(decodeURIComponent(code.slice(11)))
  assert.equal(validateBundle({ type: 'seo360-bm', url: 'javascript:alert(1)', main: {}, side: [], pages: [] }), false)
  const shell = page({ body: '<div id="app"></div><script src="/app.js"></script>' })
  const bundle = { type: 'seo360-bm', v: 1, url: O + '/', main: { url: O + '/', status: 200, body: shell, headers: { 'Content-Type': 'text/html' } }, side: [{ url: O + '/robots.txt', status: 200, body: 'User-agent: *\nAllow: /' }, { url: O + '/sitemap.xml', status: 404, body: '' }], pages: [], rendered: page({ body: '<main>' + words(500) + '</main>' }) }
  assert.ok(validateBundle(bundle))
  const f = bundleFetcher(bundle)
  assert.equal((await f(O + '/inconnue')).status, 0)
  const rep = await analyze(O + '/', { fetcher: f, psi: false, source: 'bookmarklet', input: { sector: 'boulangerie' }, rendered: { wordCount: extract(bundle.rendered).wordCount } })
  assert.ok(rep.result.issues.some((i) => i.id === 'js-render'))
  assert.ok(rep.result.issues.some((i) => i.id === 'sitemap'), 'sitemap en 404 = vraiment absent')
})

// ───────── Applications & GitHub ─────────
test('GitHub & ASO : audits sans réseau ; fiche Play illisible = pas de note', () => {
  const g = auditRepo({ repo: { name: 'My_Repo', full_name: 'a/My_Repo', description: '', topics: [], license: null, pushed_at: '2020-01-01', has_discussions: false, stargazers_count: 3 }, readme: '', community: { files: {} }, releases: [], contributors: 1 })
  assert.ok(g.issues.some((i) => i.id === 'topics') && g.global < 50)
  const a = auditIOS({ trackName: 'App', description: 'x', screenshotUrls: [1, 2], averageUserRating: 3.6, userRatingCount: 40, currentVersionReleaseDate: '2025-01-01', languageCodesISO2A: ['FR'] }, { keyword: 'recettes' })
  assert.ok(a.issues.some((i) => i.id === 'rating' && i.sev === 'critique'))
  const play = auditPlayHtml('<html><head><title>Mon app - Applications sur Google Play</title></head><body>…</body></html>')
  assert.equal(play.global, null); assert.ok(play.incomplete)
  assert.deepEqual(parseStoreUrl('https://apps.apple.com/fr/app/super/id123456789'), { store: 'ios', country: 'fr', id: '123456789' })
  assert.equal(parseStoreUrl('rgte.fr'), null)
})
// ───────── Critique finale : les correctifs proposés corrigent vraiment ─────────
test('boucle corriger → revérifier : titre et description proposés ne sont plus signalés', async () => {
  const html = readFileSync(new URL('index.html', root), 'utf8')
  const pages = { [O + '/']: { body: html } }
  const rep = await analyze(O + '/', { fetcher: vfetch(pages), psi: false, input: { sector: 'boulangerie', city: 'Lyon', keyword: 'pâtisserie lyon' } })
  const fx = buildFixes(rep)
  const fixed = html.replace(/<title>[^<]*<\/title>/, fx.title.value + fx.description.value)
  const again = await analyze(O + '/', { fetcher: vfetch({ [O + '/']: { body: fixed } }), psi: false, input: { sector: 'boulangerie', city: 'Lyon', keyword: 'pâtisserie lyon' } })
  const ids = again.result.issues.map((i) => i.id)
  for (const id of ['title-short', 'title-long', 'description', 'description-short', 'description-long']) assert.ok(!ids.includes(id), 'encore signalé : ' + id)
  const kw = again.result.issues.find((i) => i.id === 'keyword')
  assert.ok(!kw || !/titre|meta description/.test(kw.title), 'mot-clé encore absent : ' + kw?.title)
  assert.ok(!fx.lazy.value.includes(rep.ctx.page.imagesSample[0]), 'la première image ne doit pas être en lazy')
})
test('GitHub : appels secondaires refusés (limite d’API) = non vérifié, pas défaut', () => {
  const g = auditRepo({ repo: { name: 'react', full_name: 'facebook/react', description: 'The library for web and native user interfaces.', topics: ['react', 'javascript', 'ui', 'frontend', 'library', 'declarative'], homepage: 'https://react.dev', license: { spdx_id: 'MIT' }, pushed_at: new Date().toISOString(), has_discussions: true, stargazers_count: 240000 }, readme: null, community: null, releases: null, contributors: null })
  const ids = g.issues.map((i) => i.id)
  for (const id of ['readme', 'contributing', 'coc', 'issue-template', 'releases']) assert.ok(!ids.includes(id), 'faux défaut : ' + id)
  assert.ok(g.infos.some((i) => i.id === 'community-unknown'))
})
test('mots-clés : gabarits adaptés au secteur (pas de « devis » ni « entretien » de pâtisserie)', () => {
  const all = Object.values(keywordIdeas({ seed: 'pâtisserie lyon', sector: 'boulangerie', city: 'Lyon' }).groups).flat().map((x) => x.keyword)
  assert.ok(!all.some((k) => /devis|entretien|: idées|questions fréquentes/.test(k)), all.join(' | '))
  const b2b = Object.values(keywordIdeas({ seed: 'vitrine réfrigérée', sector: 'equipement-pro' }).groups).flat().map((x) => x.keyword)
  assert.ok(b2b.some((k) => /devis/.test(k)))
})
// ───────── Veille sociale (Agent Reach) ─────────
test('veille : questions, hashtags observés, mentions, sources bloquées', () => {
  const v = analyzeVeille([
    { ok: true, channel: 'reddit', action: 'search', query: 'pâtisserie lyon', items: [
      { title: 'Quelle est la meilleure pâtisserie à Lyon ?', url: 'https://r/a', text: 'Pour un anniversaire. #PatisserieLyon #lyon', raw: { score: 120, num_comments: 45 } },
      { title: 'Combien coûte une pièce montée ?', url: 'https://r/b', text: '#patisserielyon #piecemontee', raw: { score: 30 } },
      { title: 'Super Maison Exemple', url: 'https://r/c', text: 'Maison Exemple, tartes incroyables #patisserielyon', raw: { score: 8 } }] },
    { ok: false, channel: 'twitter', action: 'search', query: 'pâtisserie lyon', items: [], error: { code: 'NEED_LOGIN', hint: 'agent-reach login twitter' } },
  ], { sujet: 'pâtisserie lyon', marque: 'Maison Exemple' })
  assert.equal(v.total, 3)
  assert.equal(v.questions[0].question, 'Quelle est la meilleure pâtisserie à Lyon ?')
  assert.equal(v.hashtags[0].tag, 'patisserielyon'); assert.equal(v.hashtags[0].count, 3)
  assert.equal(v.mentions.length, 1)
  assert.ok(v.recommandations.some((r) => /NEED_LOGIN/.test(r)))
  assert.deepEqual(observedForHashtags(v), [{ tag: 'patisserielyon', camel: 'PatisserieLyon' }])
  assert.deepEqual(extractHashtags('Prix #Tarte et C# ou https://x.fr/#ancre &#39;'), ['tarte'])
  assert.ok(veilleMarkdown(v).includes('## Questions des internautes'))
  const h = generateHashtags({ sector: 'boulangerie', keywords: ['pâtisserie'], city: 'Lyon', observed: ['piecemontee'] })
  assert.ok(h.networks.instagram.tags.some((t) => t.tag === 'piecemontee'), 'hashtag observé repris')
})
test('veille en ligne de commande : appelle Agent Reach, s’arrête sur « connexion requise », explique l’installation', () => {
  const cli = new URL('../cli.mjs', import.meta.url).pathname
  const stub = new URL('./fixtures/agent-reach/agent-reach.mjs', import.meta.url).pathname
  const out = mkdtempSync(join(tmpdir(), 'veille-'))
  const env = { ...process.env, AGENT_REACH_PAUSE_MS: '0', NO_PROXY: '127.0.0.1', no_proxy: '127.0.0.1' }
  execFileSync(process.execPath, [cli, 'veille', 'pâtisserie lyon', '--sources', 'reddit,youtube,twitter,tiktok', '--marque', 'Maison Exemple', '--agent-reach', stub, '--sortie', out], { stdio: 'pipe', env })
  const v = JSON.parse(readFileSync(join(out, 'veille-patisserie-lyon.json'), 'utf8'))
  assert.equal(v.type, 'seo360-veille'); assert.ok(v.total >= 4)
  assert.equal(v.sources.filter((s) => s.channel === 'twitter').length, 1, 'une seule tentative après NEED_LOGIN')
  assert.equal(v.sources.find((s) => s.channel === 'tiktok')?.error?.code, 'UNSUPPORTED', 'TikTok signalé, pas appelé')
  assert.ok(v.recommandations.some((r) => /tiktok \(UNSUPPORTED : .*last30days/.test(r)))
  assert.ok(v.hashtags.some((h) => h.tag === 'patisserielyon'))
  // Audit complet avec --veille : questions réelles dans le rapport, hashtags observés prioritaires
  execFileSync(process.execPath, [cli, origin + '/', '--secteur', 'boulangerie', '--mot-cle', 'pâtisserie lyon', '--no-psi', '--crawl', '0', '--veille', 'reddit', '--agent-reach', stub, '--sortie', out], { stdio: 'pipe', env })
  const rep = JSON.parse(readFileSync(join(out, origin.replace(/^https?:\/\//, '').replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '') + '.json'), 'utf8'))
  assert.ok(rep.veille?.questions?.length >= 2)
  assert.ok(rep.hashtags.networks.instagram.tags.some((t) => t.tag === 'patisserielyon'))
  const miss = spawnSync(process.execPath, [cli, 'veille', 'x', '--agent-reach', '/chemin/inexistant/agent-reach', '--sortie', out], { encoding: 'utf8', env })
  assert.equal(miss.status, 2); assert.match(miss.stderr, /GitHub UNIQUEMENT/); assert.match(miss.stderr, /releases\/latest\/download\/agent-reach\.zip/)
})
test('veille : pause entre deux recherches sur une même plateforme, aucune entre plateformes', async () => {
  const stub = new URL('./fixtures/agent-reach/agent-reach.mjs', import.meta.url).pathname
  const t0 = Date.now()
  const got = await collectVeille({ sujet: 'pâtisserie lyon', sources: ['reddit', 'x', 'linkedin'], marque: 'Maison Exemple', bin: stub, pause: 400 })
  const dt = Date.now() - t0
  assert.ok(dt >= 400, `pause respectée (${dt} ms)`)
  assert.ok(dt < 2500, `pas de pause en trop (${dt} ms)`)
  assert.deepEqual(got.results.map((r) => `${r.channel}:${r.query}`), ['reddit:pâtisserie lyon', 'reddit:Maison Exemple', 'twitter:pâtisserie lyon', 'linkedin:pâtisserie lyon'])
  assert.equal(got.results.at(-1).error.code, 'UNSUPPORTED')
})
test('topTerms ignore les mots vides', () => {
  assert.equal(topTerms('La vitrine réfrigérée et la vitrine réfrigérée pour la pâtisserie de la ville').phrases[0].term, 'vitrine réfrigérée')
})

// ───────── Conseil v3 : chaque faille prouvée par un audit a son test ─────────
test('plugin : chaque sous-commande se charge depuis la copie du plugin', async () => {
  const { spawnSync } = await import('node:child_process')
  const cli = new URL('../../plugins/seo360/seo/cli.mjs', import.meta.url).pathname
  for (const sub of ['veille', 'gsc', 'calendrier', 'budget', 'hashtags', 'outils']) {
    const r = spawnSync(process.execPath, [cli, sub, '--aide'], { encoding: 'utf8', timeout: 20000, env: { ...process.env, NO_PROXY: '127.0.0.1' } })
    assert.ok(!/ERR_MODULE_NOT_FOUND|Cannot find module/.test(r.stdout + r.stderr), `${sub} : module manquant dans le plugin`)
    assert.ok((r.stdout + r.stderr).trim().length > 20, `${sub} : aucune sortie`)
  }
})
test('export Markdown : un seul titre de niveau 1, blocs de code fermés et indentés', async () => {
  const E = (await import('../data/exemple.js')).default
  const md = toMarkdown(E)
  let inCode = false, h1 = 0
  for (const l of md.split('\n')) {
    if (/^\s*```/.test(l)) { inCode = !inCode; continue }
    if (!inCode && /^# /.test(l)) h1++
  }
  assert.equal(inCode, false, 'bloc de code non fermé')
  assert.equal(h1, 1, `${h1} titres de niveau 1 (du code sort de ses blocs)`)
})
test('budget : jamais de liens achetés, PMax gardé en e-commerce, hypothèses affichées', async () => {
  const { planBudget } = await import('../engine/ads.js')
  const seo = planBudget({ sector: 'boulangerie' }).seo
  assert.ok(!seo.items.some((i) => /€ par lien/.test(i.cost)), 'prix par lien acheté')
  const e = planBudget({ sector: 'ecommerce', goal: 'ventes', avgValue: 60 })
  assert.ok(e.channels.some((c) => c.id === 'google_pmax'), 'PMax écarté du budget e-commerce')
  assert.ok(/Hypothèses par défaut/.test(e.verdict.text), 'marge supposée non affichée')
  assert.notEqual(planBudget({ sector: 'boulangerie', avgValue: 400 }).verdict.level, 'ok', 'verdict « Rentable » sur une marge supposée')
  assert.ok(!/conseillé/.test(planBudget({ sector: 'boulangerie' }).verdict.text), 'budget « conseillé » sans valeur client')
})
test('pièges : tarteaucitron, GTM seul, microdata, artisan sans vitrine, nosnippet', async () => {
  const { preSpendChecks } = await import('../engine/ads.js')
  const tac = await run(site(GOOD.replace('</head>', `<script src="/tarteaucitron/tarteaucitron.js"></script><script>tarteaucitron.init({});tarteaucitron.user.gtagUa='G-AB12CD34EF';(tarteaucitron.job=tarteaucitron.job||[]).push('gtag');</script></head>`).replace(/<script defer data-domain[^>]*><\/script>/, '')))
  assert.ok(!tac.result.issues.some((i) => i.id === 'analytics'), 'GA4 posé par tarteaucitron non reconnu')
  const gtm = await run(site(GOOD.replace('</head>', `<script>(function(w,d,s,l,i){})(window,document,'script','dataLayer','GTM-ABC1234');</script></head>`).replace(/<script defer data-domain[^>]*><\/script>/, '')))
  assert.equal(preSpendChecks(gtm, { goal: 'leads' }).checks.find((c) => c.id === 'consent').status, '?', 'GTM seul jugé sans consentement')
  const micro = await run(site(GOOD.replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>/, '').replace('<main>', '<main itemscope itemtype="https://schema.org/Bakery">')))
  assert.ok(!micro.result.issues.some((i) => i.id === 'localbusiness'), 'Bakery en microdata ignoré')
  const sabLd = `<script type="application/ld+json">{"@context":"https://schema.org","@type":"Plumber","name":"Plomberie Test","telephone":"+33 6 00 00 00 00","areaServed":[{"@type":"City","name":"Lyon"},{"@type":"City","name":"Villeurbanne"}]}</script>`
  const sab = await run(site(GOOD.replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>/, sabLd).replace(/<address>[\s\S]*?<\/address>/, '<p><a href="tel:+33600000000">06 00 00 00 00</a></p>')), { sector: 'btp' })
  assert.ok(!sab.result.issues.some((i) => i.id === 'nap'), 'artisan sans vitrine : adresse exigée à tort')
  assert.ok(!sab.result.issues.some((i) => i.id === 'schema-sector'), 'Plumber, sous-type précis, jugé absent')
  const snip = await run(site(GOOD.replace('content="index, follow, max-image-preview:large"', 'content="index, follow, nosnippet"')))
  assert.ok(snip.result.issues.some((i) => i.id === 'nosnippet' && i.sev === 'critique'), 'nosnippet non détecté')
})
test('robustesse : JSON-LD sur 5 000 niveaux, robots.txt non lu, ZIP piégé', async () => {
  const deep = '{"@type":"Thing","a":'.repeat(5000) + '1' + '}'.repeat(5000)
  const r = await run(site(GOOD.replace('</head>', `<script type="application/ld+json">${deep}</script></head>`)))
  assert.ok(r.result.issues.some((i) => i.id === 'jsonld-error'), 'bloc trop imbriqué non signalé')
  const pasted = await analyze(O + '/', { fetcher: async (u) => (u === O + '/' ? { status: 200, body: GOOD, headers: {} } : { status: 0 }), psi: false, source: 'proxy', input: { sector: 'boulangerie', city: 'Lyon' } })
  assert.ok(pasted.result.global <= 79 && pasted.result.caps.some((c) => /robots\.txt/.test(c)), `robots.txt non lu : note ${pasted.result.global} sans plafond`)
  const { zip } = await import('./fixtures/make-gsc-fixtures.mjs')
  const { readGscFiles } = await import('../engine/gsc.js')
  const bomb = zip({ 'Requêtes.csv': 'Requête,Clics,Impressions,CTR,Position\n' + 'x,1,1,"1 %",1\n'.repeat(3_000_000) })
  bomb.writeUInt32LE(1024, bomb.length - 22 - 46 - Buffer.byteLength('Requêtes.csv') + 24) // taille annoncée : 1 Ko (mensonge)
  await assert.rejects(readGscFiles(new Uint8Array(bomb)), /trop gros/)
})
test('données datées : alerte après la date de revérification, profils sociaux reconnus', async () => {
  const { staleNote } = await import('../engine/report.js')
  assert.equal(staleNote(new Date('2026-11-06')), null)
  assert.match(staleNote(new Date('2030-01-01')), /à revérifier/)
  const { socialProfile } = await import('../engine/index.js')
  assert.deepEqual(socialProfile('https://www.tiktok.com/@boulangerie.lyon'), { network: 'TikTok', handle: 'boulangerie.lyon' })
  assert.equal(socialProfile('https://www.maison-exemple.fr/'), null)
})
test('critique finale : objectif par secteur, robots.txt fusionné, JSON-LD complété, plan social, dérive', async () => {
  const { planBudget, defaultGoal } = await import('../engine/ads.js')
  assert.equal(defaultGoal('ecommerce'), 'ventes'); assert.equal(defaultGoal('app-mobile'), 'telechargements'); assert.equal(defaultGoal('boulangerie'), 'leads')
  assert.equal(planBudget({ sector: 'ecommerce', avgValue: 60 }).goal, 'ventes')
  const { mergeRobots, parseRobots, allowed } = await import('../engine/robots.js')
  const merged = mergeRobots('User-agent: *\nDisallow: /admin\n\nUser-agent: GPTBot\nUser-agent: PerplexityBot\nDisallow: /\n', 'https://x.fr', ['PerplexityBot'])
  const pr = parseRobots(merged)
  assert.ok(allowed(pr, 'PerplexityBot', '/').allowed, 'PerplexityBot toujours bloqué')
  assert.ok(!allowed(pr, 'GPTBot', '/').allowed, 'choix sur GPTBot perdu')
  assert.ok(!allowed(pr, 'Googlebot', '/admin').allowed, 'règle /admin effacée')
  const sabLd = `<script type="application/ld+json">{"@context":"https://schema.org","@type":"Plumber","name":"Plomberie Test","telephone":"+33 6 00 00 00 00","areaServed":[{"@type":"City","name":"Lyon"}],"openingHours":"Mo-Fr 08:00-18:00"}</script>`
  const sab = await run(site(GOOD.replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>/, sabLd).replace(/<address>[\s\S]*?<\/address>/, '')), { sector: 'btp' })
  const { buildFixes } = await import('../engine/fixes.js')
  const fx = buildFixes(sab)
  const ld = Object.values(fx).find((x) => /ld\+json/.test(x.value || '') && /Plumber/.test(x.value))
  assert.ok(ld && /areaServed/.test(ld.value) && !/PostalAddress/.test(ld.value), 'JSON-LD proposé : type, zone ou adresse faussés')
  assert.ok(!sab.result.issues.some((i) => /^schema-plumber/.test(i.id)), 'adresse exigée à un artisan sans vitrine')
  const soc = await analyze('https://www.instagram.com/maisontest/', { input: { sector: 'boulangerie', city: 'Lyon' } })
  assert.ok(soc.plan.week.length === 3 && soc.plan.week.every((w) => !/Search Console|sitemap/i.test(w.title)), 'plan social rempli d’actions de site')
  const { compareReports } = await import('../engine/drift.js')
  const before = await run(site(GOOD.replace('<h1>Pâtisserie artisanale à Lyon</h1>', '')))
  const after = await run(site(GOOD))
  const d = compareReports(before, after)
  assert.ok(d.fixed.some((x) => /H1/i.test(x.title)), 'corrections non listées après revérification')
})
test('secteur deviné d’après la page quand il n’est pas choisi', async () => {
  const { guessSector } = await import('../engine/guess.js')
  const r = await analyze(O + '/', { fetcher: vfetch(site(GOOD)), psi: false, crawl: 0, input: { city: 'Lyon' } })
  assert.equal(r.input.sector, 'boulangerie'); assert.ok(r.input.sectorGuessed)
  const chosen = await analyze(O + '/', { fetcher: vfetch(site(GOOD)), psi: false, crawl: 0, input: { sector: 'ecommerce' } })
  assert.equal(chosen.input.sector, 'ecommerce'); assert.ok(!chosen.input.sectorGuessed)
  assert.equal(guessSector({ title: 'Accueil', headings: [], text: 'Bienvenue sur notre site. Contact. Menu.' }), null, 'secteur inventé sans signal')
})
test('secteur deviné : un fournisseur des boulangers n’est pas une boulangerie (cas réel rgte.eu)', async () => {
  const { guessSector } = await import('../engine/guess.js')
  const P = (title, h1, text, jsonLd = []) => ({ title, metaDescription: '', headings: [{ level: 1, text: h1 }], text, jsonLd })
  const g = (p) => guessSector(p)?.id ?? null
  assert.equal(g(P('Vitrines boulangerie, pâtisserie, chocolatiers', 'agencement de vitrines réfrigérées', 'Vitrine réfrigérée boulangerie Loire. Vitrine réfrigérée boucherie. Réalisations : agencement pâtissier chocolatier, sandwicherie. Secteurs d’activités : boulangerie, pâtisserie, traiteur. Bureau d’études et show-room.')), 'equipement-pro')
  assert.equal(g(P('Matériel de restauration professionnelle', 'Fours, vitrines et chambres froides pour restaurants', 'Fabricant de matériel pour restaurants, boulangeries et traiteurs.')), 'equipement-pro')
  // Pièges : une vraie boulangerie qui parle de ses vitrines, et des enseignes « Four » ou « Comptoir »
  assert.equal(g(P('Boulangerie Dupont à Lyon — pains, viennoiseries et pâtisseries', 'Boulangerie artisanale', 'Nos vitrines de pâtisseries changent chaque jour. Pain au levain, viennoiseries, gâteau anniversaire.', [{ '@type': 'Bakery' }])), 'boulangerie')
  assert.equal(g(P('Le Four à Bois — restaurant pizzeria', 'Restaurant au feu de bois', 'Menu, réservation, livraison repas. Restaurant ouvert dimanche.')), 'restaurant')
  assert.equal(g(P('Le Comptoir de Lyon, restaurant bistronomique', 'Restaurant', 'Menu du jour, réservation en ligne, brunch le dimanche.')), 'restaurant')
})
test('« Mentions légales » écrit en pied de page sans lien : signalé comme tel', async () => {
  const page = (foot) => `<!doctype html><html lang="fr"><head><title>Vitrines réfrigérées sur mesure</title></head><body><h1>Vitrines réfrigérées</h1><p>${'Fabricant de vitrines réfrigérées pour les métiers de bouche. '.repeat(30)}</p><footer>${foot}</footer></body></html>`
  const run = (foot) => analyze(O + '/', { fetcher: vfetch({ [O + '/']: { status: 200, body: page(foot) }, [O + '/robots.txt']: { status: 200, body: 'User-agent: *\nAllow: /' } }), psi: false, crawl: 0 })
  const plain = (await run('Mentions légales<br> Conditions de vente<br> Gestion des cookies')).result.issues.find((i) => i.id === 'legal')
  assert.ok(plain && /n’est pas un lien/.test(plain.title), 'texte sans lien non repéré : ' + plain?.title)
  const none = (await run('Contact')).result.issues.find((i) => i.id === 'legal')
  assert.equal(none?.title, 'Lien « Mentions légales » introuvable')
  const linked = (await run('<a href="/mentions-legales">Mentions légales</a>')).result.issues.find((i) => i.id === 'legal')
  assert.equal(linked, undefined)
})

test('CLI : page et robots.txt fournis en fichiers, puis site injoignable lu par Jina (vrai code HTTP, en-têtes non jugés)', async () => {
  const cli = new URL('../cli.mjs', import.meta.url).pathname, dir = mkdtempSync(join(tmpdir(), 'seo360-'))
  const html = `<!doctype html><html lang="fr"><head><title>Vitrines réfrigérées sur mesure | Test</title><meta name="description" content="Fabricant de vitrines réfrigérées sur mesure pour les métiers de bouche."></head><body><h1>Vitrines réfrigérées</h1><p>${'Fabricant de vitrines réfrigérées pour boulangeries et traiteurs. '.repeat(40)}</p><footer><a href="/mentions-legales">Mentions légales</a> <a href="/confidentialite">Confidentialité</a></footer></body></html>`
  writeFileSync(join(dir, 'page.html'), html); writeFileSync(join(dir, 'robots.txt'), 'User-agent: *\nAllow: /')
  const run = (args, env) => new Promise((ok) => execFile(process.execPath, [cli, ...args], { encoding: 'utf8', maxBuffer: 50e6, env: { ...process.env, ...env } }, (err, stdout, stderr) => ok({ err, stdout, stderr })))
  // 1) --html et --robots : le moteur lit les fichiers, aucun accès au site
  const r1 = await run(['https://site-injoignable.invalid/', '--html', join(dir, 'page.html'), '--robots', join(dir, 'robots.txt'), '--lecture', 'direct', '--no-psi', '--crawl', '0', '--json'], { NO_PROXY: '*' })
  const j1 = JSON.parse(r1.stdout)
  assert.equal(j1.ctx.fetch.source, 'paste'); assert.equal(j1.ctx.robots.status, 200); assert.notEqual(j1.result.global, null)
  // 2) Accès direct impossible → Jina Reader (simulé) : provenance « jina », 404 réel de llms.txt, aucun en-tête HTTP jugé
  const jina = http.createServer((req, res) => {
    const t = decodeURIComponent(req.url.slice(1)), p = new URL(t).pathname, txt = /\.txt$/.test(p)
    res.writeHead(200, { 'content-type': 'application/json' })
    res.end(JSON.stringify({ code: 200, data: { url: t, finalUrl: t, httpStatus: p === '/llms.txt' ? 404 : 200, [txt ? 'text' : 'html']: p === '/robots.txt' ? 'User-agent: *\nAllow: /' : p === '/llms.txt' ? 'introuvable' : html } }))
  })
  await new Promise((ok) => jina.listen(0, '127.0.0.1', ok))
  const r2 = await run(['https://site-injoignable.invalid/', '--no-psi', '--crawl', '0', '--json'], { NO_PROXY: '127.0.0.1', SEO360_JINA: `http://127.0.0.1:${jina.address().port}/` })
  jina.close()
  const j2 = JSON.parse(r2.stdout)
  assert.equal(j2.ctx.fetch.source, 'jina'); assert.equal(j2.ctx.fetch.status, 200)
  assert.equal(j2.ctx.robots.status, 200); assert.equal(j2.ctx.llms.status, 404)
  assert.ok(!j2.result.issues.some((i) => /hsts|https-redirect|compression/.test(i.id)), 'en-têtes HTTP jugés sans avoir été vus')
})

test('conseils : description sans trous, pas de commune pour un fabricant national, 3 actions équilibrées, sitemap incomplet', async () => {
  const { actionPlan } = await import('../engine/plan.js')
  const { facts: factsOf, suggestDescription, suggestTitle } = await import('../engine/fixes.js')
  const links = Array.from({ length: 14 }, (_, i) => `<a href="/gamme-${i}/">Gamme ${i}</a>`).join(' ')
  const home = `<!doctype html><html lang="fr"><head><title>Vitrines boulangerie, pâtisserie, chocolatiers</title><script async src="https://www.googletagmanager.com/gtag/js?id=G-ABCDEF1234"></script></head><body><h1>agencement de vitrines réfrigérées</h1><h2>Découvrez nos</h2>${links}<p>Tél : <a href="tel:0800951313">0 800 95 13 13</a></p><footer>423 chemin des Vernèdes, 83480 Puget-sur-Argens · Mentions légales · Gestion des cookies</footer></body></html>`
  const pages = { [O + '/']: { body: home }, [O + '/robots.txt']: { body: 'User-agent: *\nAllow: /' }, [O + '/sitemap.xml']: { body: `<urlset><url><loc>${O}/contact/</loc></url></urlset>` } }
  for (let i = 0; i < 14; i++) pages[`${O}/gamme-${i}/`] = { body: `<!doctype html><html lang="fr"><head><title>Gamme ${i} de vitrines</title></head><body><h1>Gamme ${i}</h1><p>${'Vitrine réfrigérée sur mesure. '.repeat(30)}</p></body></html>` }
  const r = await analyze(O + '/', { fetcher: vfetch(pages), psi: false, crawl: 6, input: { sector: 'equipement-pro' } })
  const f = factsOf(r), d = suggestDescription(f), t = suggestTitle(f)
  assert.ok(!/[\[\]]/.test(d), 'description à trous : ' + d)
  assert.ok(!/Puget/.test(d + t), 'commune de l’usine visée pour une activité nationale : ' + t + ' / ' + d)
  assert.ok(d.length <= 160 && /vitrines/i.test(d) && /08 00 95 13 13/.test(d), d)
  const sm = r.result.issues.find((i) => i.id === 'sitemap-partial')
  assert.ok(sm && sm.scope === 'site' && /1 page listée/.test(sm.title), 'sitemap incomplet non signalé')
  const week = actionPlan(r.result, { local: false, kind: 'site' }).week
  assert.equal(week.filter((i) => i.cat === 'conformite').length, 1, 'une seule action de mise en règle : ' + week.map((i) => i.title).join(' | '))
  assert.match(week.find((i) => i.cat === 'conformite').title, /Mettre le site en règle : \d points/)
  assert.ok(week.some((i) => ['technique', 'contenu'].includes(i.cat)), 'aucune action de visibilité dans les 3')
})

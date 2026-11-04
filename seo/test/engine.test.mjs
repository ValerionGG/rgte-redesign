// Tests du moteur : NO_PROXY=127.0.0.1 node --test seo/test/engine.test.mjs
// Inclut les « pages pièges » relevées par l'audit du conseil (note honnête, faux positifs, robustesse).
import { test, before, after } from 'node:test'
import assert from 'node:assert/strict'
import http from 'node:http'
import { readFileSync, existsSync } from 'node:fs'
import { extract, topTerms } from '../engine/html.js'
import { parseRobots, allowed } from '../engine/robots.js'
import { analyze, detectKind, competitorSummary } from '../engine/index.js'
import { toMarkdown } from '../engine/report.js'
import { generateHashtags } from '../engine/hashtags.js'
import { keywordIdeas } from '../engine/keywords.js'
import { planBudget } from '../engine/ads.js'
import { auditRepo } from '../engine/github.js'
import { auditIOS, auditPlayHtml, parseStoreUrl } from '../engine/appstore.js'
import { buildFixes, suggestTitle, facts } from '../engine/fixes.js'
import { parseGsc, opportunities, readGscFile } from '../engine/gsc.js'
import { encodeReport, decodeReport } from '../engine/share.js'
import { bookmarkletCode, validateBundle, bundleFetcher } from '../engine/bookmarklet.js'
import { decodeBody } from '../engine/decode.js'

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
  const rgte = planBudget({ sector: 'equipement-pro', goal: 'leads', monthly: 1000, avgValue: 12000 })
  assert.equal(rgte.verdict.level, 'ok'); assert.equal(tot(rgte), 1000)
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
test('topTerms ignore les mots vides', () => {
  assert.equal(topTerms('La vitrine réfrigérée et la vitrine réfrigérée pour la pâtisserie de la ville').phrases[0].term, 'vitrine réfrigérée')
})

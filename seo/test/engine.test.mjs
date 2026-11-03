// Tests du moteur : node --test seo/test/
import { test, before, after } from 'node:test'
import assert from 'node:assert/strict'
import http from 'node:http'
import { readFileSync, existsSync } from 'node:fs'
import { extract, topTerms } from '../engine/html.js'
import { parseRobots, allowed } from '../engine/robots.js'
import { analyze } from '../engine/index.js'
import { toMarkdown } from '../engine/report.js'
import { generateHashtags } from '../engine/hashtags.js'
import { planBudget } from '../engine/ads.js'
import { auditRepo } from '../engine/github.js'
import { auditIOS, parseStoreUrl } from '../engine/appstore.js'

const root = new URL('./fixtures/site/', import.meta.url)
let server, origin
before(async () => {
  server = http.createServer((req, res) => {
    const path = req.url.split('?')[0]
    if (path === '/old') { res.writeHead(301, { Location: '/' }); return res.end() }
    const file = new URL('.' + (path === '/' ? '/index.html' : path), root)
    if (!existsSync(file)) { res.writeHead(404); return res.end('not found') }
    res.writeHead(200, { 'Content-Type': path.endsWith('.xml') ? 'application/xml' : path.endsWith('.txt') ? 'text/plain' : 'text/html; charset=utf-8' })
    res.end(readFileSync(file, 'utf8').replaceAll('{{ORIGIN}}', origin))
  })
  await new Promise((r) => server.listen(0, '127.0.0.1', r))
  origin = `http://127.0.0.1:${server.address().port}`
})
after(() => server.close())

const fetcher = async (url, { noFollow } = {}) => {
  const redirects = []
  let cur = url
  for (let i = 0; i < 5; i++) {
    const r = await fetch(cur, { redirect: 'manual' })
    if (r.status >= 300 && r.status < 400) { if (noFollow) return { status: r.status, location: new URL(r.headers.get('location'), cur).href }; redirects.push({ url: cur, status: r.status }); cur = new URL(r.headers.get('location'), cur).href; continue }
    return { status: r.status, headers: Object.fromEntries(r.headers), body: await r.text(), finalUrl: cur, redirects, timeMs: 5 }
  }
}

test('extract : balises, titres, liens, images, JSON-LD', () => {
  const p = extract(readFileSync(new URL('index.html', root), 'utf8'), 'https://ex.fr/')
  assert.equal(p.lang, 'fr')
  assert.equal(p.title, 'Pâtisserie')
  assert.equal(p.headings[0].text, 'Pâtisserie artisanale à Lyon')
  assert.equal(p.images.length, 10)
  assert.equal(p.images.filter((i) => i.alt === null).length, 9)
  assert.equal(p.jsonLd.length, 1)
  assert.equal(p.jsonLdErrors.length, 1)
  assert.ok(p.links.some((l) => l.text === 'Nos gâteaux' && l.internal))
  assert.ok(p.wordCount > 30)
  assert.equal(p.inHeadBlocking, 6)
  assert.ok(!p.text.includes('dataLayer'), 'le JS ne doit pas être compté comme texte')
})

test('extract : fragment sans head/body, entités, script contenant </div>', () => {
  const p = extract('<h1>Caf&eacute; &amp; th&#233;</h1><script>var s="<div></div>"</script><p>Bonjour le monde</p>')
  assert.equal(p.headings[0].text, 'Café & thé')
  assert.ok(p.text.includes('Bonjour le monde'))
})

test('robots.txt : groupes et priorité de la règle la plus longue', () => {
  const r = parseRobots('User-agent: *\nDisallow: /private\nAllow: /private/ok\n\nUser-agent: GPTBot\nDisallow: /')
  assert.equal(allowed(r, 'Googlebot', '/private/x').allowed, false)
  assert.equal(allowed(r, 'Googlebot', '/private/ok/1').allowed, true)
  assert.equal(allowed(r, 'GPTBot', '/').allowed, false)
  assert.equal(allowed(r, 'OAI-SearchBot', '/').allowed, true)
})

test('analyse complète d’un site (crawl + robots IA + sitemap)', async () => {
  const rep = await analyze(origin + '/', { fetcher, psi: false, crawl: 5, input: { sector: 'boulangerie', city: 'Lyon', keyword: 'pâtisserie lyon', brand: 'Maison Test', monthly: 1200 } })
  const ids = rep.result.issues.map((i) => i.id)
  for (const id of ['description', 'alt', 'jsonld-error', 'robots-ai-search', 'broken', 'dup-title', 'heading-order', 'cmp', 'legal', 'labels', 'buttons', 'og', 'https', 'title-short']) assert.ok(ids.includes(id), `constat attendu : ${id}`)
  assert.ok(rep.result.passed.some((p) => p.id === 'sitemap'))
  assert.ok(rep.result.global > 0 && rep.result.global < 80)
  assert.ok(rep.result.meta.trackers.includes('Google Analytics 4'))
  assert.ok(rep.result.meta.social.instagram)
  assert.equal(rep.result.scores.local.label, 'SEO local')
  const md = toMarkdown(rep)
  assert.ok(md.includes('## Plan d’action') && md.includes('## Hashtags par réseau') && md.includes('## Budget publicitaire'))
})

test('hashtags : limites par réseau, pas de hashtag banni, local', () => {
  const h = generateHashtags({ sector: 'boulangerie', keywords: ['pâtisserie lyon'], city: 'Lyon', brand: 'Maison Test' })
  assert.ok(h.networks.instagram.tags.length <= 5 && h.networks.instagram.tags.length >= 4)
  assert.equal(h.networks.threads.tags.length, 1)
  const all = Object.values(h.networks).flatMap((n) => n.tags.map((t) => t.tag))
  assert.ok(!all.includes('followforfollow'))
  assert.ok(all.some((t) => t.includes('lyon')))
  assert.ok(all.every((t) => /^[a-z0-9_]+$/.test(t)))
})

test('budget : peu de canaux à petit budget, fourchettes cohérentes', () => {
  const small = planBudget({ sector: 'boulangerie', goal: 'leads', monthly: 400 })
  assert.equal(small.channels.length, 1)
  const big = planBudget({ sector: 'ecommerce', goal: 'ventes', monthly: 8000, avgValue: 60, targetConversions: 200 })
  assert.ok(big.channels.length >= 3)
  assert.equal(big.channels.reduce((s, c) => s + c.budget, 0), 8000)
  for (const c of big.channels) assert.ok(c.clicks[0] <= c.clicks[1])
  assert.ok(big.needed.budget[0] > 0 && big.totals.roas[0] >= 0)
  const b2b = planBudget({ sector: 'saas', goal: 'leads', monthly: 3000 })
  assert.ok(b2b.channels.some((c) => c.id === 'linkedin'))
})

test('GitHub & ASO : audits sans réseau', () => {
  const g = auditRepo({ repo: { name: 'My_Repo', full_name: 'a/My_Repo', description: '', topics: [], license: null, pushed_at: '2020-01-01', has_discussions: false, stargazers_count: 3 }, readme: '', community: { files: {} }, releases: [], contributors: 1 })
  assert.ok(g.issues.some((i) => i.id === 'topics') && g.global < 50)
  const a = auditIOS({ trackName: 'App', description: 'x', screenshotUrls: [1, 2], averageUserRating: 3.6, userRatingCount: 40, currentVersionReleaseDate: '2025-01-01', languageCodesISO2A: ['FR'] }, { keyword: 'recettes' })
  assert.ok(a.issues.some((i) => i.id === 'rating' && i.sev === 'critique'))
  assert.deepEqual(parseStoreUrl('https://apps.apple.com/fr/app/super/id123456789'), { store: 'ios', country: 'fr', id: '123456789' })
  assert.deepEqual(parseStoreUrl('https://play.google.com/store/apps/details?id=com.ex.app&hl=fr'), { store: 'android', id: 'com.ex.app' })
})

test('topTerms ignore les mots vides', () => {
  const t = topTerms('La vitrine réfrigérée et la vitrine réfrigérée pour la pâtisserie de la ville')
  assert.equal(t.phrases[0].term, 'vitrine réfrigérée')
})

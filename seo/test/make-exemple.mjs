// Génère data/exemple.js : rapport FICTIF (domaine réservé .example) pour le bouton « Voir un exemple ».
// Usage : node seo/test/make-exemple.mjs
import { writeFileSync } from 'node:fs'
import { collect } from '../engine/collect.js'
import { audit } from '../engine/audit.js'
import { slim, competitorSummary } from '../engine/index.js'

const O = 'https://www.patisserie-lyon.example'
const nav = '<nav><a href="/">Accueil</a> <a href="/gateaux">Nos gâteaux</a> <a href="/entremets">Entremets</a> <a href="/commande">Commander</a> <a href="/contact">Contact</a></nav>'
const foot = '<footer>Maison Exemple · 12 rue de la Paix 69001 Lyon · 04 78 00 00 00 · <a href="https://www.instagram.com/maison.exemple"><img src="/ig.svg"></a> <a href="/mentions-legales">Mentions légales</a></footer>'
const body = (h1, txt) => `<header><a href="/"><img src="/logo.png" alt="Maison Exemple"></a>${nav}</header><main><h1>${h1}</h1>${txt}</main>${foot}`
const txt = (n) => Array.from({ length: n }, (_, i) => 'entremets fraises chocolat pâtisserie gâteau anniversaire lyon artisanale beurre saison'.split(' ')[i % 10]).join(' ')
const doc = (title, desc, b, extra = '') => `<!doctype html><html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${title}</title>${desc ? `<meta name="description" content="${desc}">` : ''}${extra}
<script async src="https://www.googletagmanager.com/gtag/js?id=G-EXEMPLE"></script><script>gtag('config','G-EXEMPLE');fbq('init','1')</script>
<link rel="stylesheet" href="/a.css"><link rel="stylesheet" href="/b.css"><script src="/jquery.js"></script><script src="/slider.js"></script></head><body>${b}</body></html>`
const pages = {
  [O + '/']: doc('Accueil', '', body('Bienvenue chez Maison Exemple', `<p>Depuis 1998, nous préparons chaque jour des entremets et des gâteaux d’anniversaire au beurre AOP, à Lyon. ${txt(140)}</p><h2>Nos services</h2><p>Mais nous faisons aussi des créations pour toutes les occasions, avec passion et savoir-faire, pour le plaisir de nos clients fidèles qui reviennent chaque semaine dans notre boutique.</p><h2>Combien coûte un entremets pour 8 personnes à Lyon ?</h2><p>Un entremets pour 8 personnes coûte entre 32 et 48 € chez Maison Exemple, selon le parfum et le décor. ${txt(45)}</p><h2>Notre histoire</h2><p>Elle commence dans un petit atelier où tout a été pensé pour bien faire les choses, avec des produits choisis et une équipe passionnée par son métier depuis longtemps.</p><img src="/photos/IMG_2041.jpg"><img src="/photos/IMG_2042.jpg"><img src="/photos/IMG_2043.jpg" alt="Tarte aux fraises"><h3>Nos gâteaux</h3><p>${txt(60)} <a href="/gateaux">en savoir plus</a></p>`), '<script type="application/ld+json">{"@context":"https://schema.org","@type":"Organization","name":"Maison Exemple"}</script>'),
  [O + '/gateaux']: doc('Accueil', 'Nos gâteaux', body('Nos gâteaux', `<p>${txt(120)}</p>`)),
  [O + '/entremets']: doc('Entremets | Maison Exemple', 'Entremets maison', body('Entremets', `<p>${txt(90)}</p>`)),
  [O + '/commande']: doc('Commander un gâteau | Maison Exemple', 'Commandez votre gâteau en ligne.', body('Commander', `<form><input name="email" placeholder="E-mail"><button></button></form><p>${txt(60)}</p>`)),
  [O + '/robots.txt']: 'User-agent: *\nContent-Signal: search=yes, ai-train=no\nDisallow: /panier\n\nUser-agent: PerplexityBot\nDisallow: /',
  [O + '/sitemap.xml']: `<urlset><url><loc>${O}/</loc></url><url><loc>${O}/gateaux</loc></url><url><loc>${O}/entremets</loc></url><url><loc>${O}/commande</loc></url></urlset>`,
}
const fetcher = async (url, { noFollow } = {}) => {
  if (noFollow) return {}
  const b = pages[url]
  if (b == null) return { status: 404, body: 'Introuvable', headers: {} }
  return { status: 200, body: b, finalUrl: url, redirects: [], headers: { 'content-type': url.endsWith('.txt') ? 'text/plain' : 'text/html; charset=utf-8' } }
}
const input = { sector: 'boulangerie', keyword: 'pâtisserie lyon', city: 'Lyon', brand: 'Maison Exemple', goal: 'leads', monthly: null, avgValue: 45, lang: 'fr', local: true }
const ctx = await collect(O + '/', fetcher, { input, crawl: 6, source: 'node' })
// Valeurs PageSpeed ILLUSTRATIVES (exemple fictif)
ctx.psi = { strategy: 'mobile', scores: { performance: 58, seo: 92, accessibility: 81, bestPractices: 96 }, field: { LCP: 3400, INP: 190, CLS: 0.04, FCP: 2100, TTFB: 900 }, lab: { LCP: '3,9 s', TBT: '420 ms', CLS: '0,03' }, opportunities: [{ id: 'image-delivery-insight', group: 'performance', weight: 0, score: 0, title: 'Améliorer l’affichage des images', displayValue: 'Économies estimées : 1 250 Kio', description: 'Réduisez le poids des images (WebP/AVIF, dimensions adaptées).', savingsMs: 1600, savingsBytes: 1280000 }] }
const result = audit(ctx)
const comp = (url, global, scores, words, social) => ({ url, global, scores, perf: 74, lcp: 2300, words, social, terms: ['entremets', 'mariage', 'pièce montée', 'livraison', 'atelier', 'chocolat'], llms: false, error: null })
const report = {
  version: 2, exemple: true, generatedAt: '2026-11-04T09:00:00.000Z', target: O + '/', kind: 'site', input, ctx: slim(ctx), result,
  competitors: [comp('https://www.concurrent-a.example/', 71, { technique: 78, contenu: 70, performance: 74, donnees: 82, ia: 70, social: 90, local: 76, conformite: 64 }, 820, ['instagram', 'facebook', 'tiktok']), comp('https://www.concurrent-b.example/', 63, { technique: 70, contenu: 58, performance: 61, donnees: 64, ia: 66, social: 72, local: 70, conformite: 60 }, 410, ['instagram'])],
}
writeFileSync(new URL('../data/exemple.js', import.meta.url), `// Rapport FICTIF de démonstration (domaine réservé .example ; vitesse : valeurs illustratives). Généré par seo/test/make-exemple.mjs\nexport default ${JSON.stringify(report)}\n`)
console.log('exemple :', result.global, result.grade, result.issues.length, 'constats')

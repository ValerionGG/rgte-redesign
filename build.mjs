// a/project + b/project (canvas Design) → docs/ (site statique GitHub Pages). Usage : node build.mjs
import { readFileSync, writeFileSync, readdirSync, mkdirSync, copyFileSync, existsSync } from 'node:fs'

mkdirSync('docs/assets', { recursive: true })
mkdirSync('docs/vendor', { recursive: true })
mkdirSync('docs/assets/v2', { recursive: true })
for (const f of readdirSync('assets')) if (f !== 'v2' && f !== 'photos') copyFileSync(`assets/${f}`, `docs/assets/${f}`)
for (const d of ['produits', 'realisations', 'ambiance']) { mkdirSync(`docs/assets/photos/${d}`, { recursive: true }); for (const f of readdirSync(`assets/photos/${d}`)) copyFileSync(`assets/photos/${d}/${f}`, `docs/assets/photos/${d}/${f}`) }
for (const f of readdirSync('assets/v2')) copyFileSync(`assets/v2/${f}`, `docs/assets/v2/${f}`)
for (const [src, dst] of [['../imonovo-redesign/docs/dc.js', 'docs/dc.js'], ['../imonovo-redesign/docs/vendor/preact.min.js', 'docs/vendor/preact.min.js']])
  if (!existsSync(dst)) copyFileSync(src, dst)

// Liens légaux du pied de page → pages légales gérées depuis le back-office (legal.html)
const LEGAL = { 'Mentions légales': 'mentions-legales', 'Conditions de vente': 'conditions-de-vente', 'Plan du site': 'plan-du-site', 'Gestion des cookies': 'cookies' }
const legal = (s, root) => s.replace(/(<a\b[^>]*?\bhref=")#[a-z]*("[^>]*>)(Mentions légales|Conditions de vente|Plan du site|Gestion des cookies)(<\/a>)/g,
  (_, a, b, label, c) => `${a}${root}legal.html?p=${LEGAL[label]}${b}${label}${c}`)

// Marqueurs [HORAIRES], [PRIX]… à compléter depuis le back-office : relevés page par page avec un extrait de contexte
const MARKER = /\[[A-ZÀÂÇÉÈÊÎÏÔÛÙ][A-ZÀÂÇÉÈÊÎÏÔÛÙ0-9 '’\/-]*\]/g
const markers = new Map()
const scan = (page, src) => {
  const text = src.replace(/<[^>]+>/g, ' ').replace(/\{\{[^}]*\}\}/g, '…').replace(/\s+/g, ' ')
  for (const m of text.matchAll(MARKER)) {
    const e = markers.get(m[0]) || { marker: m[0], count: 0, pages: new Set(), contexts: [] }
    e.count++; e.pages.add(page)
    const ctx = text.slice(Math.max(0, m.index - 70), m.index + m[0].length + 70).trim()
    if (e.contexts.length < 4 && !e.contexts.includes(ctx) && !/[{}\[\]]\s*[,:]|\w+: "/.test(ctx.replace(m[0], ''))) e.contexts.push(ctx)
    markers.set(m[0], e)
  }
}

const fix = (s) => s
  .replace("const LOCAL_ALL = false;", 'const LOCAL_ALL = true;')
  .replace(/Main\.dc\.html/g, 'index.html')
  .replace(/\.dc\.html/g, '.html')

let n = 0
for (const dir of ['a/project', 'b/project']) {
  for (const f of readdirSync(dir).filter((x) => x.endsWith('.dc.html'))) {
    if (dir === 'b/project' && f === 'Main.dc.html') continue
    const src = readFileSync(`${dir}/${f}`, 'utf8')
    const a = src.indexOf('<x-dc>'), b = src.lastIndexOf('</x-dc>')
    const script = src.match(/<script type="text\/x-dc" data-dc-script[\s\S]*?<\/script>/)
    if (a < 0 || b < 0 || !script) throw new Error(`format inattendu : ${f}`)
    const tpl = src.slice(a + 6, b)
    if (/<\/script/i.test(tpl)) throw new Error(`</script> dans le gabarit : ${f}`)
    const title = (src.match(/<title>([\s\S]*?)<\/title>/) || [, 'RGTE'])[1]
    for (const part of [tpl, script[0]]) scan(f === 'Main.dc.html' ? 'index.html' : f.replace('.dc.html', '.html'), part)
    writeFileSync(`docs/${f === 'Main.dc.html' ? 'index.html' : f.replace('.dc.html', '.html')}`, `<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<title>${title}</title>
<script src="vendor/preact.min.js"></script>
<script src="dc.js"></script>
</head>
<body>
<div id="dc-root"></div>
<script type="text/x-dc-template" id="dc-template">${legal(fix(tpl), '')}</script>
${fix(script[0])}
</body>
</html>
`)
    n++
  }
}
// Tour 2 : v2/project → docs/v2/ (chemins relatifs remontés d'un niveau)
for (const V of ['v2', 'v3']) {
mkdirSync(`docs/${V}`, { recursive: true })
if (existsSync(`${V}/project`)) {
  for (const f of readdirSync(`${V}/project`).filter((x) => x.endsWith('.dc.html'))) {
    const src = readFileSync(`${V}/project/${f}`, 'utf8')
    const a = src.indexOf('<x-dc>'), b = src.lastIndexOf('</x-dc>')
    const script = src.match(/<script type="text\/x-dc" data-dc-script[\s\S]*?<\/script>/)
    if (a < 0 || b < 0 || !script) throw new Error(`format inattendu : ${V}/${f}`)
    const tpl = src.slice(a + 6, b)
    if (/<\/script/i.test(tpl)) throw new Error(`</script> dans le gabarit : ${V}/${f}`)
    const title = (src.match(/<title>([\s\S]*?)<\/title>/) || [, 'RGTE'])[1]
    for (const part of [tpl, script[0]]) scan(`${V}/${f === 'Main.dc.html' ? 'index.html' : f.replace('.dc.html', '.html')}`, part)
    const up = (s) => fix(s).replace(/(["'(])assets\//g, '$1../assets/')
    writeFileSync(`docs/${V}/${f === 'Main.dc.html' ? 'index.html' : f.replace('.dc.html', '.html')}`, `<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<title>${title}</title>
<script src="../vendor/preact.min.js"></script>
<script src="../dc.js"></script>
</head>
<body>
<div id="dc-root"></div>
<script type="text/x-dc-template" id="dc-template">${legal(up(tpl), '../')}</script>
${up(script[0])}
</body>
</html>
`)
    n++
  }
}
}
mkdirSync('docs/data', { recursive: true })
writeFileSync('docs/data/markers.json', JSON.stringify([...markers.values()]
  .map((e) => ({ ...e, pages: [...e.pages].sort() }))
  .sort((a, b) => b.count - a.count || a.marker.localeCompare(b.marker, 'fr')), null, 1) + '\n')
writeFileSync('docs/.nojekyll', '')
console.log(`${n} pages → docs/`)

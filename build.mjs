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
<script type="text/x-dc-template" id="dc-template">${fix(tpl)}</script>
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
<script type="text/x-dc-template" id="dc-template">${up(tpl)}</script>
${up(script[0])}
</body>
</html>
`)
    n++
  }
}
}
writeFileSync('docs/.nojekyll', '')
console.log(`${n} pages → docs/`)

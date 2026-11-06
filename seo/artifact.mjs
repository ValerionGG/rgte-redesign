// Prépare la version « page claude.ai » (Artifact) de SEO 360 : même application, en mode démonstration.
// node seo/artifact.mjs <dossier de sortie>
// La page est enveloppée par l'hôte (pas de doctype/head/body), les fichiers voisins sont publiés à côté.
import { readFileSync, writeFileSync, mkdirSync, readdirSync, statSync, copyFileSync, rmSync } from 'node:fs'
import { join, dirname, relative } from 'node:path'
import { fileURLToPath } from 'node:url'

const SEO = dirname(fileURLToPath(import.meta.url))
export function artifactHtml(html) {
  const title = (html.match(/<title>([\s\S]*?)<\/title>/) || [, 'SEO 360'])[1]
  const body = (html.match(/<body>([\s\S]*)<\/body>/) || [, ''])[1]
  return `<title>SEO 360</title>
<meta name="claude:viewport-fit-sides" content="cover">
<meta name="seo360-mode" content="artifact">
<meta name="description" content="${title.replace(/"/g, '&quot;')}">
<link rel="stylesheet" href="fonts.css">
<link rel="stylesheet" href="app.css">
${body.trim()}
`
}
const walk = (d) => readdirSync(d).flatMap((f) => { const p = join(d, f); return statSync(p).isDirectory() ? walk(p) : [p] })
if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const out = process.argv[2]
  if (!out) { console.error('Usage : node seo/artifact.mjs <dossier de sortie>'); process.exit(1) }
  rmSync(out, { recursive: true, force: true }); mkdirSync(out, { recursive: true })
  writeFileSync(join(out, 'index.html'), artifactHtml(readFileSync(join(SEO, 'index.html'), 'utf8')))
  const files = ['fonts.css', 'app.css', 'app.js', 'live.js', ...walk(join(SEO, 'engine')).map((f) => relative(SEO, f)), ...walk(join(SEO, 'data')).filter((f) => f.endsWith('.js')).map((f) => relative(SEO, f))]
  for (const f of files) { mkdirSync(dirname(join(out, f)), { recursive: true }); copyFileSync(join(SEO, f), join(out, f)) }
  writeFileSync(join(out, 'files.json'), JSON.stringify(Object.fromEntries(files.map((f) => [f, join(out, f)])), null, 1))
  console.log(`✓ ${files.length + 1} fichiers dans ${out}`)
}

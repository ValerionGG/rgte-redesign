// Diagnostic Search Console en ligne de commande : vos exports, lus sur votre machine.
// node seo/cli.mjs gsc <export.zip|.csv> [autres exports…] [--avant <export-periode-precedente.zip>]
//                      [--marque "Ma marque"] [--site exemple.fr] [--sortie dossier] [--json]
// Accepte l'export « Performances » (ZIP complet conseillé : il contient la courbe quotidienne) et les exports du rapport « Liens ».
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs'
import { basename, join } from 'node:path'
import { readGscFiles, parseGscFiles, analyzeGsc, gscMarkdown } from './engine/gsc.js'

const USAGE = `Usage : node seo/cli.mjs gsc <export.zip|.csv> [autres exports…] [--avant <export-precedent.zip>] [--marque "Nom"] [--site exemple.fr] [--sortie dossier] [--json]

  Search Console → Performances → (période voulue) → Exporter → « Télécharger le fichier ZIP ».
  Pour comparer : exportez aussi la période précédente (--avant), ou utilisez « Comparer » dans le filtre de dates avant l'export.
  Liens : Search Console → Liens → Exporter (sites, pages, textes) et ajoutez les fichiers à la commande.`

async function load(list) {
  const all = []
  for (const f of list) {
    if (!existsSync(f)) throw new Error(`Fichier introuvable : ${f}`)
    all.push(...await readGscFiles(readFileSync(f), basename(f)))
  }
  return parseGscFiles(all)
}
// Domaine deviné depuis l'export « Pages » : sert à reconnaître les requêtes de marque
const guessDomain = (b) => { try { return new URL(b.perf?.pages?.rows?.[0]?.key || '').hostname } catch { return '' } }

export async function main(args) {
  const files = [], prevFiles = []
  let marque = '', site = '', sortie = '', json = false
  for (let i = 0; i < args.length; i++) {
    const a = args[i]
    if (a === '--avant') prevFiles.push(args[++i])
    else if (a === '--marque') marque = args[++i] || ''
    else if (a === '--site') site = args[++i] || ''
    else if (a === '--sortie') sortie = args[++i] || ''
    else if (a === '--json') json = true
    else if (!a.startsWith('--')) files.push(a)
  }
  if (!files.length) { console.log(USAGE); process.exitCode = 1; return }
  let cur, prev = null
  try { cur = await load(files); if (prevFiles.filter(Boolean).length) prev = await load(prevFiles.filter(Boolean)) } catch (e) { console.error(e.message); process.exitCode = 1; return }
  if (!Object.keys(cur.perf).length && !Object.keys(cur.liens).length) { console.error(`Aucun tableau Search Console reconnu dans : ${files.join(', ')}\n\n${USAGE}`); process.exitCode = 1; return }
  const domain = site || guessDomain(cur) || guessDomain(prev || {})
  const a = analyzeGsc({ cur, prev, brand: marque, domain })
  const md = gscMarkdown(a, { titre: `Search Console${domain ? ' — ' + domain.replace(/^www\./, '') : ''}` })
  console.log(json ? JSON.stringify(a, null, 1) : md)
  if (sortie) {
    mkdirSync(sortie, { recursive: true })
    const base = join(sortie, `gsc-${new Date().toISOString().slice(0, 10)}`)
    writeFileSync(base + '.md', md); writeFileSync(base + '.json', JSON.stringify(a, null, 1))
    console.error(`\n📄 ${base}.md\n🧾 ${base}.json`)
  }
  console.error(`\nProchaine étape : ${a.actions[0] ? 'traitez l’action n° 1, notez la date, puis relancez dans 4 semaines avec --avant <cet export> pour mesurer l’effet.' : 'exportez le ZIP complet (avec Dates.csv) et la période précédente pour un vrai diagnostic.'}`)
}

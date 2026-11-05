// Boîte à outils en ligne de commande : outils gratuits et payants, avec guides d'installation.
// node seo/cli.mjs outils [--rapport rapports-seo/site.json] [--secteur <id>] [--ville X] [--local] [--budget €] [--sans-guides]
import { readFileSync } from 'node:fs'
import { recommendTools, toolsMarkdown } from './engine/outils.js'
import { SECTORS } from './data/sectors.js'

export function main(args) {
  const opt = (n, d = '') => { const i = args.indexOf('--' + n); return i >= 0 && args[i + 1] && !args[i + 1].startsWith('--') ? args[i + 1] : d }
  let report = null
  if (opt('rapport')) {
    try { report = JSON.parse(readFileSync(opt('rapport'), 'utf8')) } catch (e) { console.error(`Rapport illisible : ${e.message}`); process.exitCode = 1; return }
    if (!report?.target || !report?.input) { console.error('Ce fichier n’est pas un rapport SEO 360 (.json produit par node seo/cli.mjs <url>).'); process.exitCode = 1; return }
  } else {
    const sector = opt('secteur', 'autre')
    if (!SECTORS.some((s) => s.id === sector)) { console.error(`Secteur inconnu : ${sector}. Valeurs : ${SECTORS.map((s) => s.id).join(', ')}`); process.exitCode = 1; return }
    report = { kind: 'site', input: { sector, city: opt('ville'), monthly: +opt('budget', 0) || 0, ...(args.includes('--local') ? { local: true } : args.includes('--national') ? { local: false } : {}) }, result: { issues: [], meta: {} } }
  }
  const rec = recommendTools(report)
  console.log(toolsMarkdown(rec, { guides: !args.includes('--sans-guides') }))
  console.error(`\nProchaine étape : installez les outils « cette semaine » dans l’ordre (Search Console d’abord), puis relancez l’audit${report.target ? ' avec --avant ' + opt('rapport') : ''} pour vérifier.`)
}

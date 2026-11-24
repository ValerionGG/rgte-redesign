// Demande réelle en ligne de commande, sans audit de site : 4 autocomplétions + tendances Google du jour.
// node seo/cli.mjs demande "<mot-clé>" [--sources google,youtube,amazon,duckduckgo] [--sans-lettres] [--sortie dossier] [--json]
import { writeFileSync, mkdirSync } from 'node:fs'
import { join } from 'node:path'
import { collectDemand, trendsFR, demandeMarkdown, SOURCES } from './engine/demande.js'

export async function main(args) {
  const opt = (n, d = '') => { const i = args.indexOf('--' + n); return i >= 0 && args[i + 1] && !args[i + 1].startsWith('--') ? args[i + 1] : d }
  const seed = args.find((a, i) => !a.startsWith('--') && !(i > 0 && args[i - 1].startsWith('--') && !['--sans-lettres', '--json', '--sans-tendances'].includes(args[i - 1])))
  if (!seed) {
    console.error(`Usage : node seo/cli.mjs demande "<mot-clé>" [--sources ${Object.keys(SOURCES).join(',')}] [--sans-lettres] [--sans-tendances] [--sortie dossier] [--json]`)
    process.exitCode = 1; return
  }
  const sources = opt('sources') ? opt('sources').split(',').map((s) => s.trim()).filter((s) => SOURCES[s]) : undefined
  const log = args.includes('--json') ? () => {} : (m) => console.error('  · ' + m)
  log(`Demande réelle autour de « ${seed} »`)
  const [d, t] = await Promise.all([
    collectDemand(seed, { fetchImpl: fetch, sources, letters: !args.includes('--sans-lettres'), onProgress: log }),
    args.includes('--sans-tendances') ? null : trendsFR({ fetchImpl: fetch, words: [seed] }),
  ])
  const out = { ...d, tendances: t }
  if (args.includes('--json')) { console.log(JSON.stringify(out, null, 1)); return }
  const dir = opt('sortie', 'rapports-seo')
  mkdirSync(dir, { recursive: true })
  const slug = 'demande-' + seed.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '').toLowerCase().slice(0, 50)
  const md = `# Demande réelle : ${seed}\n\n${demandeMarkdown(d, t)}`
  writeFileSync(join(dir, slug + '.md'), md)
  writeFileSync(join(dir, slug + '.json'), JSON.stringify(out, null, 1))
  console.log(md)
  console.error(`\n→ ${join(dir, slug + '.md')} et .json (à importer dans l'onglet « Mots-clés & réseaux » de la plateforme)`)
}

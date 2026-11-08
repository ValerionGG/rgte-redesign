// Calendrier marketing français en ligne de commande (dates calculées, jamais de mémoire).
// node seo/cli.mjs calendrier [année] [--secteur <id>] [--alsace] [--sortie dossier]
import { writeFileSync, mkdirSync } from 'node:fs'
import { join } from 'node:path'
import { calendar, calendarMarkdown, calendarCsv, calendarIcs } from './engine/calendar.js'
import { SECTORS } from './data/sectors.js'

export function main(args) {
  const opt = (n) => { const i = args.indexOf('--' + n); return i >= 0 && args[i + 1] && !args[i + 1].startsWith('--') ? args[i + 1] : '' }
  const year = +(args.find((a) => /^\d{4}$/.test(a)) || new Date().getFullYear() + (new Date().getMonth() >= 9 ? 1 : 0))
  const sector = opt('secteur')
  if (sector && !SECTORS.some((s) => s.id === sector)) { console.error(`Secteur inconnu : ${sector}. Valeurs : ${SECTORS.map((s) => s.id).join(', ')}`); process.exitCode = 1; return }
  const c = calendar(year, { sector, alsace: args.includes('--alsace') })
  console.log(calendarMarkdown(c))
  const out = opt('sortie')
  if (out) {
    mkdirSync(out, { recursive: true })
    const base = join(out, `calendrier-${year}${sector ? '-' + sector : ''}`)
    writeFileSync(base + '.md', calendarMarkdown(c)); writeFileSync(base + '.csv', calendarCsv(c)); writeFileSync(base + '.ics', calendarIcs(c))
    console.error(`\n📄 ${base}.md\n📊 ${base}.csv (tableur)\n📅 ${base}.ics (Google Agenda, Outlook, Apple)`)
  }
  console.error(`\nProchaine étape : ${out ? 'importez le .ics dans votre agenda' : 'relancez avec --sortie rapports-seo pour obtenir le tableur (.csv) et l’agenda (.ics)'} ; ajoutez vos événements locaux (marché de Noël, braderie, salon).`)
}

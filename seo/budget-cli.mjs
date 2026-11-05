// Budget publicitaire en ligne de commande, sans audit de site.
// node seo/cli.mjs budget --secteur <id> [--objectif leads|ventes|notoriete|trafic|telechargements] [--budget €/mois]
//      [--valeur €] [--marge %] [--signature %] [--objectif-conv n] [--cpc €] [--volume n] [--local|--national] [--json]
import { planBudget, preSpendChecks, GOALS } from './engine/ads.js'
import { budgetSection } from './engine/report.js'
import { SECTORS } from './data/sectors.js'

export function main(args) {
  const opt = (n, d) => { const i = args.indexOf('--' + n); return i >= 0 ? (args[i + 1] && !args[i + 1].startsWith('--') ? args[i + 1] : true) : d }
  const sector = opt('secteur', 'autre'), goal = opt('objectif', 'leads')
  if (!SECTORS.some((s) => s.id === sector)) { console.error(`Secteur inconnu : ${sector}. Valeurs : ${SECTORS.map((s) => s.id).join(', ')}`); process.exitCode = 1; return }
  if (!GOALS[goal]) { console.error(`Objectif inconnu : ${goal}. Valeurs : ${Object.keys(GOALS).join(', ')}`); process.exitCode = 1; return }
  const num = (n) => { const v = opt(n, null); return v == null || v === true ? null : +v }
  const b = planBudget({
    sector, goal, monthly: num('budget'), avgValue: num('valeur') || 0, margin: num('marge') == null ? null : num('marge') / 100, closeRate: num('signature') == null ? null : num('signature') / 100,
    targetConversions: num('objectif-conv') || 0, cpcOverride: num('cpc') || 0, searchVolume: num('volume') || 0, local: opt('local') ? true : opt('national') ? false : undefined,
  })
  b.checks = preSpendChecks({ kind: 'site', input: { goal } }, b)
  if (opt('json')) { console.log(JSON.stringify(b, null, 1)); return }
  console.log([`# Budget publicitaire — ${b.sector}`, '', `Objectif : ${b.goalLabel} · ${b.local ? 'zone locale' : 'national'} · coût maximal rentable par ${b.unit} : ${b.maxCpa ? Math.round(b.maxCpa) + ' €' : '— (indiquez --valeur et --marge)'}`, '', ...budgetSection(b)].join('\n'))
  console.error('\nProchaine étape : lancez l’audit du site (node seo/cli.mjs <url> --budget …) pour que le contrôle avant dépense vérifie la mesure, le consentement, la vitesse et le contact.')
}

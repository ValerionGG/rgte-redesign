// Hashtags par réseau en ligne de commande, sans audit de site.
// node seo/cli.mjs hashtags --secteur <id> [--mot-cle "a, b"] [--ville Lyon] [--marque "Nom"] [--langue fr|en|both] [--json]
import { generateHashtags } from './engine/hashtags.js'
import { SECTORS } from './data/sectors.js'

export function main(args) {
  const opt = (n, d = '') => { const i = args.indexOf('--' + n); return i >= 0 && args[i + 1] && !args[i + 1].startsWith('--') ? args[i + 1] : d }
  const sector = opt('secteur', 'autre')
  if (!SECTORS.some((s) => s.id === sector)) { console.error(`Secteur inconnu : ${sector}. Valeurs : ${SECTORS.map((s) => s.id).join(', ')}`); process.exitCode = 1; return }
  const h = generateHashtags({ sector, keywords: opt('mot-cle').split(',').map((x) => x.trim()).filter(Boolean), city: opt('ville'), brand: opt('marque'), lang: opt('langue', 'fr') })
  if (args.includes('--json')) { console.log(JSON.stringify(h, null, 1)); return }
  const nets = Object.values(h.networks).sort((a, b) => (h.priority.indexOf(a.id) + 1 || 99) - (h.priority.indexOf(b.id) + 1 || 99))
  const L = [`# Hashtags — ${h.sector}`, '', 'Niveau attendu : niche < 50 000 publications, moyen 50 000–500 000, large au-delà (vérifiez le compteur sur le réseau). Mélange conseillé : 2–3 niche, 1–2 moyen, 0–1 large.', '']
  for (const n of nets) {
    L.push(`## ${n.label}${h.priority.includes(n.id) ? ' (prioritaire pour votre secteur)' : ''}`, '', n.tags.map((t) => '#' + t.camel).join(' ') || '—', '', ...n.tags.map((t) => `- #${t.camel} — ${t.niveau}`), '')
    if (n.rules) L.push(`Limite : ${n.rules.hashtag_limit} · Placement : ${n.rules.placement}`, '')
    if (n.reserve.length) L.push(`À faire tourner : ${n.reserve.slice(0, 10).map((t) => '#' + t.camel).join(' ')}`, '')
    L.push(`Modèle de légende : ${n.caption}`, '')
  }
  L.push(`À ne jamais utiliser : ${h.banned.map((t) => '#' + t).join(' ')}`)
  console.log(L.join('\n'))
}

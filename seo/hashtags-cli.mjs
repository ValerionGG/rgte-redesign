// Hashtags par réseau en ligne de commande, sans audit de site.
// node seo/cli.mjs hashtags --secteur <id> [--mot-cle "a, b"] [--ville Lyon] [--marque "Nom"] [--langue fr|en|both] [--sans-mastodon] [--instance x] [--json]
// Par défaut, les hashtags réellement employés sur Mastodon (API publique, sans clé) passent en tête.
import { generateHashtags } from './engine/hashtags.js'
import { SECTORS, sectorById } from './data/sectors.js'
import { collectMastodon, seedTags, observedFromMastodon, mastodonMarkdown, DEFAULT_INSTANCE } from './engine/mastodon.js'

export async function main(args) {
  const opt = (n, d = '') => { const i = args.indexOf('--' + n); return i >= 0 && args[i + 1] && !args[i + 1].startsWith('--') ? args[i + 1] : d }
  if (args.includes('--aide') || args.includes('--help')) { console.log('Usage : node seo/cli.mjs hashtags --secteur <id> [--mot-cle "a, b"] [--ville X] [--marque X] [--langue fr|en|both] [--sans-mastodon] [--instance mastodon.social] [--json]\nLes hashtags réellement employés sur Mastodon (comptes distincts, publications en français de moins de 2 ans) passent en tête.'); return }
  const sector = opt('secteur', 'autre')
  if (!SECTORS.some((s) => s.id === sector)) { console.error(`Secteur inconnu : ${sector}. Valeurs : ${SECTORS.map((s) => s.id).join(', ')}`); process.exitCode = 1; return }
  const keywords = opt('mot-cle').split(',').map((x) => x.trim()).filter(Boolean), lang = opt('langue', 'fr')
  const m = args.includes('--sans-mastodon') ? null : await collectMastodon(seedTags({ keywords, sectorTags: sectorById(sector).hashtags?.[lang === 'en' ? 'en' : 'fr']?.niche || [] }), { instance: opt('instance', DEFAULT_INSTANCE), onProgress: args.includes('--json') ? null : (x) => console.error('  · ' + x) })
  const h = generateHashtags({ sector, keywords, city: opt('ville'), brand: opt('marque'), lang, observed: observedFromMastodon(m) })
  if (m) h.mastodon = m
  if (args.includes('--json')) { console.log(JSON.stringify(h, null, 1)); return }
  const nets = Object.values(h.networks).sort((a, b) => (h.priority.indexOf(a.id) + 1 || 99) - (h.priority.indexOf(b.id) + 1 || 99))
  const L = [`# Hashtags — ${h.sector}`, '', 'Niveau attendu : niche < 50 000 publications, moyen 50 000–500 000, large au-delà (vérifiez le compteur sur le réseau). Mélange conseillé : 2–3 niche, 1–2 moyen, 0–1 large.', '']
  for (const n of nets) {
    L.push(`## ${n.label}${h.priority.includes(n.id) ? ' (prioritaire pour votre secteur)' : ''}`, '', n.tags.map((t) => '#' + t.camel).join(' ') || '—', '', ...n.tags.map((t) => `- #${t.camel} — ${t.src === 'mastodon' ? `observé sur Mastodon (${t.comptes} comptes)` : t.niveau}`), '')
    if (n.rules) L.push(`Limite : ${n.rules.hashtag_limit} · Placement : ${n.rules.placement}`, '')
    if (n.reserve.length) L.push(`À faire tourner : ${n.reserve.slice(0, 10).map((t) => '#' + t.camel).join(' ')}`, '')
    L.push(`Modèle de légende : ${n.caption}`, '')
  }
  L.push(`À ne jamais utiliser : ${h.banned.map((t) => '#' + t).join(' ')}`)
  if (m) L.push('', mastodonMarkdown(m))
  console.log(L.join('\n'))
}

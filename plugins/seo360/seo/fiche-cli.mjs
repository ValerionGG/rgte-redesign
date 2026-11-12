// node seo/cli.mjs fiche --store apple --nom "…" --sous-titre "…" --mots-cles "a,b,c" [--marques "f1,motogp"]
// node seo/cli.mjs fiche --store play --titre "…" --description-courte "…" --description-longue fichier.txt --mot-cle "…"
// Contrôle hors ligne d'une fiche de store avant envoi. Code de sortie 1 s'il reste une erreur.
import { readFileSync, existsSync } from 'node:fs'
import { checkListing, listingText, LIMITES } from './engine/fiche.js'

export async function main(args) {
  const opt = (name) => { const i = args.indexOf('--' + name); return i >= 0 && args[i + 1] != null && !args[i + 1].startsWith('--') ? args[i + 1] : null }
  const store = (opt('store') || (opt('titre') || opt('description-courte') ? 'play' : 'apple')).toLowerCase()
  if (!LIMITES[store] || args.includes('--aide') || args.includes('--help')) {
    console.log(`Contrôle d'une fiche App Store ou Google Play (hors ligne)

  node seo/cli.mjs fiche --store apple --nom "…" --sous-titre "…" --mots-cles "a,b,c" [--texte-promo "…"] [--description fichier.txt]
  node seo/cli.mjs fiche --store play --titre "…" --description-courte "…" [--description-longue fichier.txt] [--mot-cle "…"]
  --marques "f1,motogp"   marques d'autrui à ne pas utiliser (erreur dans un titre ou les mots-clés)

Limites : ${Object.entries(LIMITES).map(([s, l]) => `${s} : ${Object.entries(l).map(([k, v]) => `${k} ${v}${k === 'mots-cles' ? ' octets' : ''}`).join(', ')}`).join(' · ')}
Un champ long peut être donné par un chemin de fichier.`)
    process.exitCode = LIMITES[store] ? 0 : 1
    return
  }
  const champs = {}
  for (const k of Object.keys(LIMITES[store])) { const v = opt(k); if (v != null) champs[k] = existsSync(v) ? readFileSync(v, 'utf8').trim() : v }
  if (!Object.keys(champs).length) { console.error('Aucun champ donné. Aide : node seo/cli.mjs fiche --aide'); process.exitCode = 1; return }
  const res = checkListing(store, champs, { marques: (opt('marques') || '').split(','), motCle: opt('mot-cle') || '' })
  console.log(listingText(res))
  if (res.errors) process.exitCode = 1
}

// node seo/cli.mjs presence <site> [--marque "Nom"] [--concurrents a.fr,b.fr] [--secteur id] [--crawl 8] [--sortie dossier] [--json]
// Profil de présence d'une entreprise : réseaux, applications, avis, annuaires, réservation, vente, contenus, emploi,
// d'après son site (toutes les pages lues), puis confirmé par l'App Store et le registre des entreprises.
// Avec --concurrents : la même lecture pour chacun, et une matrice « qui est où ».
import { writeFileSync, mkdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { analyze } from './engine/index.js'
import { FAMILIES, platformLabel, appStoreLookup, registryLookup, presenceMatrix } from './engine/presence.js'
import { makeNodeFetcher, fetchJson } from './node-fetch.mjs'

export async function main(args) {
  const opt = (n, d = null) => { const i = args.indexOf('--' + n); return i >= 0 ? (args[i + 1] && !args[i + 1].startsWith('--') ? args[i + 1] : true) : d }
  const target = args.find((a, i) => !a.startsWith('--') && !(i > 0 && args[i - 1].startsWith('--') && !['--json', '--no-registre', '--no-apps'].includes(args[i - 1])))
  if (!target || opt('aide') || opt('help')) {
    console.log(`Profil de présence d'une entreprise (réseaux, applications, avis, annuaires, registre)

  node seo/cli.mjs presence <site> [--marque "Nom"] [--concurrents a.fr,b.fr] [--secteur id] [--crawl 8]
  --no-apps         ne pas chercher l'App Store
  --no-registre     ne pas chercher le registre des entreprises (France)
  --avant <fichier> comparer à un instantané précédent (…-presence.json) : ce qui est apparu ou a disparu
  --sortie <dir>    dossier des rapports (défaut ./rapports-seo) ; --json : JSON complet sur la sortie

Sources : les liens de toutes les pages lues, le sameAs des données structurées, les balises d'application,
puis l'API publique de l'App Store et recherche-entreprises.api.gouv.fr. Rien n'est deviné : un profil
que le site ne relie pas reste « non trouvé » ; un candidat construit à partir du nom est « à vérifier ».`)
    process.exitCode = target ? 0 : 1
    return
  }
  const quiet = !!opt('json'), log = (...a) => { if (!quiet) console.error(...a) }
  const crawl = +opt('crawl', 8)
  const comps = String(opt('concurrents', '') || '').split(',').map((s) => s.trim()).filter(Boolean).slice(0, 6)
  const input = { sector: opt('secteur', '') || '', brand: opt('marque', '') || '', city: '' }
  const one = async (site, { me = false } = {}) => {
    log(`  · ${me ? 'Votre site' : 'Concurrent'} : ${site}`)
    const fetcher = makeNodeFetcher({ target: site })
    try {
      const r = await analyze(site, { fetcher, fetchImpl: fetch, psi: false, crawl: me ? crawl : Math.min(crawl, 4), input: me ? input : { sector: input.sector }, source: 'node' })
      if (!r.presence) return { name: site, me, error: r.result?.incomplete || r.error || 'page non lue', items: [] }
      return { name: site, me, report: r, ...r.presence, brand: me ? (input.brand || r.ctx?.page?.og?.site_name || '') : '' }
    } catch (e) { return { name: site, me, error: String(e.message || e), items: [] } }
  }
  log(`\n🔎 Profil de présence — ${target}`)
  const mine = await one(target, { me: true })
  const others = []
  for (const c of comps) others.push(await one(c))
  const brand = input.brand || mine.brand || String(target).replace(/^https?:\/\/(www\.)?/, '').split(/[./]/)[0]
  const apps = opt('no-apps') ? null : await appStoreLookup(brand, fetchJson)
  const registry = opt('no-registre') ? null : await registryLookup(brand, fetchJson, { siren: mine.sirenSeen })
  if (registry && !registry.error) { registry.sirenSeen = mine.sirenSeen || null; for (const r of registry.results) r.match = r.siren === registry.sirenSeen ? 'siren' : (mine.postcodes || []).includes(r.postcode) ? 'code postal' : null }
  const matrix = comps.length ? presenceMatrix([mine, ...others]) : null
  const out = { generatedAt: new Date().toISOString(), target, brand, presence: strip(mine), competitors: others.map(strip), appStore: apps, registry, matrix }
  // Instantané précédent (--avant) : plateformes apparues ou disparues, chez vous et chez chaque concurrent
  const before = opt('avant', null)
  if (before && before !== true) { try { out.changes = diffPresence(JSON.parse(readFileSync(before, 'utf8')), out) } catch (e) { console.error(`Instantané illisible (--avant) : ${before}`); process.exitCode = 1; return } }
  const md = toMarkdown(out)
  const dir = String(opt('sortie', 'rapports-seo')), slug = String(target).replace(/^https?:\/\//, '').replace(/[^\w.-]+/g, '-').replace(/-+$/, '')
  mkdirSync(dir, { recursive: true })
  writeFileSync(join(dir, `${slug}-presence.md`), md); writeFileSync(join(dir, `${slug}-presence.json`), JSON.stringify(out, null, 2))
  if (quiet) console.log(JSON.stringify(out, null, 2))
  else { console.log('\n' + md); console.log(`📄 ${join(dir, slug + '-presence.md')}`) }
}

export function diffPresence(prev, cur) {
  const ids = (x) => new Set((x?.items || []).map((i) => i.platform))
  const one = (name, a, b) => { const A = ids(a), B = ids(b); return { name, added: [...B].filter((i) => !A.has(i)).map(platformLabel), lost: [...A].filter((i) => !B.has(i)).map(platformLabel) } }
  const list = [one(cur.target + ' (vous)', prev.presence, cur.presence), ...(cur.competitors || []).map((c) => one(c.name, (prev.competitors || []).find((p) => p.name === c.name), c))]
  return { since: prev.generatedAt, list: list.filter((x) => x.added.length || x.lost.length) }
}

const strip = (r) => ({ name: r.name, error: r.error || null, items: r.items, findings: r.findings || [], missing: r.missing || [], candidates: r.candidates || [], counts: r.counts || {}, sirenSeen: r.sirenSeen || null, postcodes: r.postcodes || [], sameAsSnippet: r.sameAsSnippet || null })

export function toMarkdown(o) {
  const L = [`# Profil de présence — ${o.target}`, '', `*${new Date(o.generatedAt).toLocaleString('fr-FR')} · marque recherchée : « ${o.brand} »*`, '']
  const p = o.presence
  if (p.error) L.push(`> Le site n’a pas pu être lu : ${p.error}. La présence ci-dessous ne vient que des sources externes.`, '')
  L.push('## Où vous êtes, d’après votre site', '')
  if (p.items.length) {
    L.push('| Famille | Plateforme | Compte | Trouvé par |', '|---|---|---|---|')
    for (const i of p.items) L.push(`| ${FAMILIES[i.family]} | ${i.label} | ${i.urls[0]} | ${i.sources.join(', ')}${i.pages.length > 1 ? ` (${i.pages.length} pages)` : ''} |`)
  } else L.push('Aucun profil, aucune application ni page d’avis relié depuis les pages lues.')
  L.push('')
  if (p.findings.length) {
    L.push('## Ce qui manque ou ne colle pas', '')
    for (const f of p.findings) L.push(`- **${f.text}** ${f.todo}`)
    L.push('')
  }
  if (p.sameAsSnippet) L.push('## Bloc sameAs prêt à coller', '', 'À fusionner dans le bloc Organization de votre page d’accueil (une adresse par profil officiel, relue avant de coller) :', '', '```json', p.sameAsSnippet, '```', '')
  if (p.candidates.length) {
    L.push('## Comptes possibles à vérifier (construits à partir du nom, non vérifiés)', '', '| Plateforme | Adresse probable | Recherche |', '|---|---|---|')
    for (const c of p.candidates) L.push(`| ${c.label} | ${c.url} | [chercher](${c.search}) |`)
    L.push('', 'Si un de ces comptes est bien le vôtre, reliez-le depuis le site. S’il appartient à quelqu’un d’autre, c’est un homonyme à surveiller.', '')
  }
  if (o.appStore) {
    L.push('## App Store', '')
    if (o.appStore.error) L.push(`Recherche impossible (${o.appStore.error}). Apple refuse souvent les requêtes venant d’un centre de données : relancez depuis votre ordinateur, ou ouvrez ${o.appStore.url}`)
    else if (!o.appStore.apps.length) L.push(`Aucune application au nom « ${o.brand} » sur l’App Store France.`)
    else {
      L.push('| Application | Éditeur | Note | Langues | Mise à jour |', '|---|---|---|---|---|')
      for (const a of o.appStore.apps) L.push(`| [${a.name}](${a.url}) | ${a.seller} | ${a.rating != null ? `${Math.round(a.rating * 10) / 10} (${a.ratings})` : '—'} | ${a.languages.slice(0, 4).join(', ') || '—'} | ${String(a.updated || '').slice(0, 10)} |`)
      if (o.appStore.homonyms) L.push('', '**Nom partagé** : plusieurs éditeurs publient sous ce nom. Écrivez toujours le nom complet (« Marque, ce que c’est ») sur vos fiches et dans le sameAs.')
    }
    L.push('')
  }
  if (o.registry) {
    L.push('## Registre des entreprises (France)', '')
    if (o.registry.error) L.push(`Recherche impossible (${o.registry.error}) : ${o.registry.url}`)
    else if (!o.registry.results.length) L.push(`Aucune entreprise trouvée pour « ${o.brand} ».`)
    else {
      if (o.registry.sirenSeen) L.push(o.registry.results.some((r) => r.siren === o.registry.sirenSeen) ? `SIREN ${o.registry.sirenSeen} lu sur votre site : il correspond au registre.` : `SIREN ${o.registry.sirenSeen} lu sur votre site : introuvable au registre, à vérifier (faute de frappe dans les mentions légales ?).`, '')
      else L.push('Aucun SIREN ou SIRET lu sur les pages explorées : il est obligatoire dans les mentions légales d’un site professionnel.', '')
      L.push('Résultats de recherche par nom : vérifiez que le premier est bien le vôtre.', '', '| Nom | SIREN | Activité | Création | Siège | État |', '|---|---|---|---|---|---|')
      const hit = o.registry.results.find((r) => r.match)
      if (hit && !o.registry.sirenSeen) L.push(`**Probablement vous : ${hit.name}, SIREN ${hit.siren}** (même code postal que l’adresse de votre site, ${hit.postcode}). À confirmer, puis à afficher dans vos mentions légales.`, '')
      for (const r of o.registry.results) L.push(`| ${r.match ? '✓ ' : ''}[${r.name}](${r.annuaire}) | ${r.siren} | ${r.nafLabel || r.naf || '—'} | ${r.created || '—'} | ${[r.postcode, r.city].filter(Boolean).join(' ') || '—'} | ${r.active ? 'active' : 'fermée'} |`)
      L.push('', 'Le SIREN va dans vos mentions légales et peut aller dans le bloc Organization (`identifier`) ; la fiche de l’annuaire officiel peut aller dans le sameAs.')
    }
    L.push('')
  }
  if (o.changes) {
    L.push(`## Ce qui a changé depuis le ${new Date(o.changes.since).toLocaleDateString('fr-FR')}`, '')
    if (!o.changes.list.length) L.push('Rien : mêmes plateformes reliées, chez vous comme chez vos concurrents.')
    for (const c of o.changes.list) L.push(`- **${c.name}** : ${[c.added.length ? `apparu ${c.added.join(', ')}` : '', c.lost.length ? `disparu ${c.lost.join(', ')}` : ''].filter(Boolean).join(' ; ')}`)
    L.push('')
  }
  if (o.matrix) {
    L.push('## Vous et vos concurrents : qui est où', '')
    L.push(`| | ${o.matrix.rows.map((r) => (r.me ? `**${r.name}**` : r.name)).join(' | ')} |`, `|---|${o.matrix.rows.map(() => '---').join('|')}|`)
    for (const [k, pl] of o.matrix.platforms.entries()) L.push(`| ${pl.label} | ${o.matrix.rows.map((r) => (r.cells[k] ? '✓' : '—')).join(' | ')} |`)
    L.push(`| **Total** | ${o.matrix.rows.map((r) => r.total).join(' | ')} |`, '')
    const failed = o.competitors.filter((c) => c.error)
    if (failed.length) L.push(`Non lus : ${failed.map((c) => `${c.name} (${c.error})`).join(' ; ')}.`, '')
    { const meR = o.matrix.rows.find((r) => r.me), top = o.matrix.rows.filter((r) => !r.me).sort((a, b) => b.total - a.total)[0]
      if (meR && top) L.push(meR.total < top.total ? `Vous êtes relié à **${meR.total} plateforme${meR.total > 1 ? 's' : ''}** ; le concurrent le plus présent, ${top.name}, à **${top.total}**.` : `Vous êtes au moins aussi présent que vos concurrents (${meR.total} plateformes ; le plus présent : ${top.total}).`, '') }
    if (o.matrix.gaps.length) L.push(`**À rattraper en priorité** (au moins la moitié de vos concurrents, et au moins 2, y sont ; pas vous) : ${o.matrix.gaps.join(', ')}.`, '')
    else L.push('Aucune plateforme où la majorité de vos concurrents sont présents sans vous.', '')
  }
  L.push('---', 'Sources : liens des pages lues, sameAs, balises d’application ; API App Store ; recherche-entreprises.api.gouv.fr. Un compte non relié depuis un site peut exister quand même : « non trouvé » veut dire « non relié ».')
  return L.join('\n')
}

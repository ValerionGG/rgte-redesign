// Générateur de hashtags par réseau, à partir du secteur, des mots-clés, de la ville et de la marque.
// Règles 2026 par réseau : data/research/benchmarks.js (social_rules).
import { sectorById, BANNED_HASHTAGS } from '../data/sectors.js'
import research from '../data/research/benchmarks.js'

export const NETWORKS = {
  instagram: { label: 'Instagram', max: 5, mix: { marque: 1, niche: 2, local: 1, sectoriel: 1 } },
  tiktok: { label: 'TikTok', max: 5, mix: { niche: 2, mot: 1, local: 1, large: 1 } },
  linkedin: { label: 'LinkedIn', max: 3, mix: { sectoriel: 1, niche: 1, marque: 1 } },
  youtube: { label: 'YouTube', max: 3, mix: { niche: 1, mot: 1, marque: 1 } },
  facebook: { label: 'Facebook', max: 2, mix: { marque: 1, local: 1 } },
  x: { label: 'X (Twitter)', max: 2, mix: { niche: 1, mot: 1 } },
  pinterest: { label: 'Pinterest', max: 2, mix: { niche: 1, mot: 1 } },
  threads: { label: 'Threads', max: 1, mix: { niche: 1 } },
  bluesky: { label: 'Bluesky', max: 2, mix: { niche: 1, sectoriel: 1 } },
  snapchat: { label: 'Snapchat (Spotlight)', max: 3, mix: { niche: 1, local: 1, large: 1 } },
}

const CITY_REGION = {
  paris: ['paris', 'iledefrance', 'parisjetaime'], marseille: ['marseille', 'provence', 'sudfrance'], lyon: ['lyon', 'lyonnais', 'auvergnerhonealpes'],
  toulouse: ['toulouse', 'occitanie', 'villerose'], nice: ['nice', 'cotedazur', 'frenchriviera'], nantes: ['nantes', 'paysdelaloire'],
  montpellier: ['montpellier', 'occitanie'], strasbourg: ['strasbourg', 'alsace'], bordeaux: ['bordeaux', 'gironde', 'nouvelleaquitaine'],
  lille: ['lille', 'hautsdefrance'], rennes: ['rennes', 'bretagne'], reims: ['reims', 'champagne'], toulon: ['toulon', 'var', 'provence'],
  grenoble: ['grenoble', 'isere', 'alpes'], dijon: ['dijon', 'bourgogne'], angers: ['angers', 'anjou'], nimes: ['nimes', 'gard', 'occitanie'],
  aix: ['aixenprovence', 'provence'], 'aix-en-provence': ['aixenprovence', 'provence'], brest: ['brest', 'bretagne', 'finistere'],
  'le mans': ['lemans', 'sarthe'], tours: ['tours', 'touraine'], limoges: ['limoges', 'limousin'], amiens: ['amiens', 'somme'],
  annecy: ['annecy', 'hautesavoie', 'alpes'], perpignan: ['perpignan', 'pyreneesorientales'], metz: ['metz', 'moselle', 'lorraine'],
  besancon: ['besancon', 'doubs'], 'clermont-ferrand': ['clermontferrand', 'auvergne'], rouen: ['rouen', 'normandie'], caen: ['caen', 'normandie'],
  nancy: ['nancy', 'lorraine'], cannes: ['cannes', 'cotedazur'], antibes: ['antibes', 'cotedazur'], 'frejus': ['frejus', 'var', 'esterel'],
  'saint-raphael': ['saintraphael', 'var', 'esterel'], 'puget-sur-argens': ['pugetsurargens', 'var', 'cotedazur'], avignon: ['avignon', 'vaucluse', 'provence'],
  biarritz: ['biarritz', 'paysbasque'], bayonne: ['bayonne', 'paysbasque'], 'la rochelle': ['larochelle', 'charentemaritime'], ajaccio: ['ajaccio', 'corse'],
  bruxelles: ['bruxelles', 'belgique'], geneve: ['geneve', 'suisse'], lausanne: ['lausanne', 'suisse'], montreal: ['montreal', 'quebec'],
  luxembourg: ['luxembourg'], 'la reunion': ['lareunion', 'reunion974', '974'], casablanca: ['casablanca', 'maroc'], dakar: ['dakar', 'senegal'],
  abidjan: ['abidjan', 'cotedivoire'], tunis: ['tunis', 'tunisie'], alger: ['alger', 'algerie'],
}

export const toTag = (s) => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[’']/g, '').replace(/[^a-z0-9_]+/g, '')
export const camel = (s) => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').split(/[^A-Za-z0-9]+/).filter(Boolean).map((w) => w[0].toUpperCase() + w.slice(1).toLowerCase()).join('')
const BAN = new Set(BANNED_HASHTAGS)
const STOP = /^(de|du|des|la|le|les|et|en|a|au|aux|pour|sur|avec|un|une|the|and|of|for|to)$/

export function rulesFor(network) {
  return (research.social_rules || []).find((r) => r.network === network) || null
}

export function generateHashtags({ sector: sid, keywords = [], city = '', region = '', brand = '', lang = 'fr', terms = [] } = {}) {
  const sector = sectorById(sid)
  const kw = [...keywords, ...terms].map((k) => String(k).trim()).filter(Boolean)
  const pools = { marque: [], niche: [], mot: [], local: [], sectoriel: [], large: [] }
  const push = (g, phrase, display) => {
    const t = toTag(phrase)
    if (!t || t.length < 3 || t.length > 30 || BAN.has(t) || /^\d+$/.test(t)) return
    if (Object.values(pools).some((p) => p.some((x) => x.tag === t))) return
    pools[g].push({ tag: t, camel: display || camel(phrase) || t })
  }
  if (brand) { push('marque', brand); push('marque', brand + ' ' + (lang === 'en' ? 'team' : 'officiel')) }
  const langs = lang === 'both' ? ['fr', 'en'] : [lang]
  for (const L of langs) {
    for (const t of sector.hashtags[L]?.niche || []) push('niche', t, toTag(t))
    for (const t of sector.hashtags[L]?.large || []) push('sectoriel', t, toTag(t))
  }
  for (const k of kw.slice(0, 12)) {
    const words = k.split(/\s+/).filter((w) => !STOP.test(w.toLowerCase()))
    if (words.length <= 3) push('mot', words.join(' '))
  }
  const c = city.trim()
  if (c) {
    const key = c.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
    push('local', c)
    const head = toTag((keywords[0] || sector.keywords[0]).split(/\s+/)[0])
    if (head) push('local', `${head} ${c}`, camel(`${head} ${c}`))
    for (const r of CITY_REGION[key] || []) push('local', r, r)
    if (langs.includes('fr')) push('local', `${c} commerce`, camel(`${c} commerce`))
  }
  if (region) push('local', region)
  const generic = { fr: ['madeinfrance', 'savoirfaire', 'artisanat', 'nouveaute'], en: ['smallbusiness', 'shopsmall', 'madeinfrance'] }
  for (const L of langs) for (const t of generic[L]) push('large', t, t)

  const out = {}
  for (const [id, net] of Object.entries(NETWORKS)) {
    const rules = rulesFor(id)
    const picked = []
    const take = (g, n) => { for (const x of pools[g]) { if (n <= 0) break; if (!picked.includes(x)) { picked.push(x); n-- } } }
    for (const [g, n] of Object.entries(net.mix)) take(g, n)
    for (const g of ['niche', 'mot', 'sectoriel', 'local', 'large', 'marque']) if (picked.length < net.max) take(g, net.max - picked.length)
    out[id] = {
      id, label: net.label, max: net.max, tags: picked.slice(0, net.max),
      reserve: Object.values(pools).flat().filter((x) => !picked.includes(x)).slice(0, 15),
      rules, caption: caption(id, { sector, brand, city, tags: picked.slice(0, net.max), keyword: keywords[0] || sector.keywords[0] }),
    }
  }
  return { sector: sector.label, pools, networks: out, banned: BANNED_HASHTAGS.slice(0, 20), priority: sector.networks }
}

function caption(net, { brand, city, tags, keyword }) {
  const hs = tags.map((t) => '#' + t.camel).join(' ')
  const k = keyword || 'votre produit'
  const where = city ? ` à ${city}` : ''
  switch (net) {
    case 'instagram': return `Accroche en une ligne (le bénéfice, pas le produit) ✨\n\n3–4 lignes : l’histoire, le détail qui prouve le savoir-faire (${k}${where}), une question pour faire répondre.\n\n👉 Enregistrez ce post / lien en bio\n.\n${hs}`
    case 'tiktok': return `[Texte à l’écran 1re seconde : « ${cap(k)}${where} : ce que personne ne vous dit »]\nDites le mot-clé à voix haute dans les 3 premières secondes.\nLégende : ${cap(k)}${where} — la réponse en 1 phrase. ${hs}`
    case 'linkedin': return `Accroche (≤ 2 lignes, un chiffre ou une tension).\n\nLe contexte → le problème → ce que ${brand || 'nous'} avons fait → le résultat chiffré.\n\nQuestion finale pour lancer les commentaires.\n\n${hs}`
    case 'youtube': return `Titre : ${cap(k)}${where} — [promesse] (≤ 60 caractères visibles)\nDescription, 2 premières lignes : le mot-clé + la réponse. Chapitres 00:00…\n${hs}`
    case 'x': return `Une idée, une phrase forte, un visuel. ${hs}`
    case 'facebook': return `Message court + photo/vidéo réelle${where}. Invitez à commenter ou à venir. ${hs}`
    case 'pinterest': return `Titre d’épingle : ${cap(k)} — idée / guide / inspiration (mots-clés naturels, pas de hashtags obligatoires).\nDescription 1–2 phrases riches en mots-clés + lien vers la page.`
    case 'threads': return `Une opinion ou une question qui appelle la conversation. Tag de sujet : ${hs}`
    case 'bluesky': return `Texte court (≤ 300 car.) + lien + texte alternatif sur l’image. ${hs}`
    case 'snapchat': return `Spotlight vertical 5–60 s, son tendance, légende courte. ${hs}`
  }
  return hs
}
const cap = (s) => s ? s[0].toUpperCase() + s.slice(1) : s

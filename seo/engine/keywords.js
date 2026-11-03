// Idées de mots-clés par intention + suggestions Google (autocomplétion) + liens vers les outils de volume.
import { sectorById } from '../data/sectors.js'

const MODS = {
  transactionnel: ['prix', 'devis', 'tarif', 'acheter', 'pas cher', 'sur mesure', 'livraison', 'promo'],
  local: ['près de moi', '{city}', 'à {city}', '{city} centre', 'ouvert dimanche'],
  commercial: ['meilleur', 'avis', 'comparatif', 'top 10', 'alternative', 'vs', 'professionnel', 'haut de gamme'],
  informationnel: ['comment choisir', 'quel', 'pourquoi', 'combien coûte', 'guide', 'idée', 'entretien', 'définition'],
}
export const INTENTS = {
  transactionnel: 'Prêt à acheter — pages produits/services, Google Ads',
  local: 'Recherche locale — fiche Google, pages ville',
  commercial: 'Compare avant d’acheter — comparatifs, avis, pages « meilleur »',
  informationnel: 'Cherche à comprendre — articles, guides, FAQ (et réponses IA)',
}

export function keywordIdeas({ seed = '', sector: sid, city = '' } = {}) {
  const sector = sectorById(sid)
  const seeds = [seed, ...sector.keywords].map((s) => s.trim()).filter(Boolean)
  const base = seeds[0] || sector.keywords[0]
  const groups = {}
  for (const [intent, mods] of Object.entries(MODS)) {
    const list = new Set()
    for (const m of mods) {
      if (m.includes('{city}') && !city) continue
      const mm = m.replace('{city}', city)
      list.add(/^(comment|quel|pourquoi|combien|meilleur|top|guide|idée)/.test(mm) ? `${mm} ${base}` : `${base} ${mm}`)
    }
    if (intent === 'transactionnel') for (const s of seeds.slice(1, 5)) list.add(city ? `${s} ${city}` : `${s} prix`)
    if (intent === 'informationnel') for (const s of seeds.slice(1, 4)) list.add(`comment choisir ${s}`)
    groups[intent] = [...list].map((k) => ({ keyword: k, intent }))
  }
  const q = encodeURIComponent(base)
  return {
    base, seeds, groups,
    tools: [
      { name: 'Google Keyword Planner (volumes, CPC)', url: 'https://ads.google.com/aw/keywordplanner/home' },
      { name: 'Google Trends (saisonnalité FR)', url: `https://trends.google.fr/trends/explore?geo=FR&q=${q}` },
      { name: 'Search Console — vos vraies requêtes', url: 'https://search.google.com/search-console/performance/search-analytics' },
      { name: 'AnswerThePublic (questions)', url: `https://answerthepublic.com/fr` },
      { name: 'AlsoAsked (People Also Ask)', url: `https://alsoasked.com/` },
      { name: 'Recherche TikTok (tendances)', url: `https://www.tiktok.com/search?q=${q}` },
      { name: 'Pinterest Trends', url: 'https://trends.pinterest.com/' },
      { name: 'Google — « Autres questions posées »', url: `https://www.google.fr/search?q=${q}&hl=fr` },
    ],
  }
}

// Suggestions Google réelles. Node : fetch JSON. Navigateur : JSONP (pas de CORS sur cet endpoint).
export async function googleSuggest(q, { hl = 'fr', gl = 'fr', fetchImpl } = {}) {
  const prefixes = ['', 'comment ', 'meilleur ', 'prix ']
  const suffixes = ['', ' a', ' b', ' c', ' d', ' e', ' p', ' s']
  const queries = [...new Set([...prefixes.map((p) => p + q), ...suffixes.slice(1).map((s) => q + s)])]
  const out = new Set()
  const one = async (qq) => {
    try {
      if (fetchImpl) {
        const r = await fetchImpl(`https://suggestqueries.google.com/complete/search?client=firefox&hl=${hl}&gl=${gl}&q=${encodeURIComponent(qq)}`)
        const j = JSON.parse(await r.text())
        return j[1] || []
      }
      return await jsonp(`https://suggestqueries.google.com/complete/search?client=youtube&hl=${hl}&gl=${gl}&q=${encodeURIComponent(qq)}`)
    } catch { return [] }
  }
  const res = await Promise.all(queries.map(one))
  for (const list of res) for (const s of list) out.add(Array.isArray(s) ? s[0] : s)
  out.delete(q)
  return [...out].slice(0, 60)
}

function jsonp(url, timeout = 6000) {
  return new Promise((resolve) => {
    const cb = '__sg' + Math.random().toString(36).slice(2)
    const s = document.createElement('script')
    const done = (v) => { delete window[cb]; s.remove(); resolve(v) }
    window[cb] = (data) => done((data?.[1] || []).map((x) => (Array.isArray(x) ? x[0] : x)))
    s.src = url + '&callback=' + cb
    s.onerror = () => done([])
    setTimeout(() => done([]), timeout)
    document.head.appendChild(s)
  })
}

export function classify(k) {
  const s = k.toLowerCase()
  if (/(prix|tarif|devis|acheter|achat|pas cher|promo|commander|livraison|location|louer)/.test(s)) return 'transactionnel'
  if (/(près de|pres de|autour|ouvert|horaires|adresse)/.test(s)) return 'local'
  if (/(meilleur|avis|comparatif|top|vs|alternative|classement)/.test(s)) return 'commercial'
  return 'informationnel'
}

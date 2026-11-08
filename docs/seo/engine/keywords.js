// Idées de mots-clés par intention + suggestions Google (autocomplétion) + liens vers les outils de volume.
import { sectorById } from '../data/sectors.js'

// Gabarits neutres (pas d'accord en genre à deviner) ; « {b} » = le mot-clé de base.
const MODS = {
  transactionnel: ['{b} prix', '{b} devis', '{b} tarif', 'acheter {b}', '{b} pas cher', '{b} sur mesure', '{b} livraison', '{b} promo'],
  local: ['{b} près de moi', '{b} {city}', '{b} à {city}', '{b} {city} centre', '{b} ouvert dimanche'],
  commercial: ['{b} avis', '{b} comparatif', 'meilleure adresse {b}', '{b} professionnel', '{b} haut de gamme'],
  informationnel: ['comment choisir {b}', 'combien coûte {b}', 'guide {b}', 'entretien {b}'],
}
// Gabarits réservés à certains secteurs (un « devis » de pâtisserie n'a pas de sens, un « entretien » non plus)
const ONLY = {
  '{b} devis': ['btp', 'equipement-pro', 'agence', 'evenementiel', 'juridique', 'finance', 'services-domicile', 'saas', 'immobilier', 'auto', 'formation', 'maison-deco'],
  'entretien {b}': ['equipement-pro', 'auto', 'maison-deco', 'btp', 'services-domicile'],
  '{b} sur mesure': ['equipement-pro', 'btp', 'maison-deco', 'luxe', 'evenementiel', 'ecommerce-mode', 'boulangerie'],
  'acheter {b}': ['ecommerce', 'ecommerce-mode', 'luxe', 'maison-deco', 'equipement-pro', 'auto', 'immobilier', 'animaux'],
  '{b} pas cher': ['ecommerce', 'ecommerce-mode', 'maison-deco', 'auto', 'tourisme', 'sport', 'beaute', 'restaurant'],
  '{b} ouvert dimanche': ['restaurant', 'boulangerie', 'beaute', 'sante', 'sport', 'animaux', 'auto'],
  'meilleure adresse {b}': ['restaurant', 'boulangerie', 'beaute', 'tourisme', 'sport', 'evenementiel'],
  // Comparatifs, guides de choix et « combien coûte » : utiles pour un produit ou un service qu'on compare, pas pour un commerce de bouche.
  '{b} comparatif': ['equipement-pro', 'ecommerce', 'ecommerce-mode', 'saas', 'app-mobile', 'finance', 'auto', 'maison-deco', 'formation', 'animaux', 'gaming'],
  'comment choisir {b}': ['equipement-pro', 'ecommerce', 'ecommerce-mode', 'saas', 'finance', 'auto', 'maison-deco', 'formation', 'immobilier', 'sante', 'animaux', 'juridique'],
  'combien coûte {b}': ['btp', 'equipement-pro', 'services-domicile', 'juridique', 'finance', 'auto', 'immobilier', 'formation', 'evenementiel', 'dentaire', 'sante', 'agence', 'saas', 'luxe'],
  '{b} promo': ['ecommerce', 'ecommerce-mode', 'maison-deco', 'tourisme', 'sport', 'beaute', 'auto', 'gaming'],
}
export const INTENTS = {
  transactionnel: 'Prêt à acheter — pages produits/services, Google Ads',
  local: 'Recherche locale — fiche Google, pages ville',
  commercial: 'Compare avant d’acheter — comparatifs, avis',
  informationnel: 'Idées de contenus (guides, FAQ) : vérifiez la demande réelle dans les suggestions Google ou Search Console',
}
const fold = (s) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')

export function keywordIdeas({ seed = '', sector: sid, city = '', local } = {}) {
  const sector = sectorById(sid)
  local ??= sector.local
  // Les mots-clés « modificateurs » du secteur (prix, devis, sur mesure…) ne sont pas des sujets : on les écarte des bases.
  const MODIFIER = /^(prix|devis( gratuit)?|avis|sur mesure|fabricant|livraison( gratuite)?|tarifs?|réservation|menu|installation|fiche technique|services?|meilleur|près de chez moi|acheter|pas cher|promo|comparatif|collection|soldes|taille|simulation|essai gratuit|intégration|api|outil|gratuit|télécharger|application|appli|iphone|android|alternative à|commande|atelier|événement|adhésion|bénévolat|faire un don)$/i
  const seeds = [...new Set([seed, ...sector.keywords.filter((k) => !MODIFIER.test(k.trim()))].map((s) => s.trim()).filter(Boolean))]
  const base = seeds[0] || sector.keywords[0]
  const hasCity = city && fold(base).includes(fold(city))
  const groups = {}
  for (const [intent, mods] of Object.entries(MODS)) {
    if (intent === 'local' && !local) continue
    const list = new Set()
    for (const m of mods) {
      if (ONLY[m] && !ONLY[m].includes(sector.id)) continue
      if (m.includes('{city}') && (!city || hasCity)) continue
      if (m.includes('près de moi') && hasCity) continue
      const extra = fold(m.replace('{b}', '').replace('{city}', '').replace(/[:]/g, '').trim())
      if (extra && fold(base).includes(extra)) continue // évite « sur mesure sur mesure »
      list.add(m.replace('{b}', base).replace('{city}', city).replace(/\s+/g, ' ').trim())
    }
    if (intent === 'transactionnel') for (const s of seeds.slice(1, 5)) list.add(city && local && !fold(s).includes(fold(city)) ? `${s} ${city}` : `${s} prix`)
    if (intent === 'informationnel') for (const s of seeds.slice(1, 3)) list.add(`comment choisir ${s}`)
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

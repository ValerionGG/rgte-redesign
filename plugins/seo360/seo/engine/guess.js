// Secteur deviné à partir de la page (titre, H1-H2, description, données structurées, texte), pour lancer
// une analyse avec la seule adresse. Prudent : sans signal net, on garde « Autre » et on le dit.
import { SECTORS } from '../data/sectors.js'

const fold = (s) => String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
// Mots trop courants sur tous les sites pour désigner un secteur
const GENERIC = new Set(['menu', 'devis', 'sur mesure', 'installation', 'livraison', 'reservation', 'prix', 'tarif', 'tarifs', 'contact', 'promo', 'avis', 'conseil', 'service', 'services', 'boutique', 'formation'].map(fold))
const GENERIC_TYPES = new Set(['localbusiness', 'organization', 'product', 'offer', 'faqpage', 'website', 'webpage', 'service', 'store', 'onlinestore'])

const count = (hay, needle) => {
  if (!needle || needle.length < 4) return 0
  let n = 0, i = 0
  while ((i = hay.indexOf(needle, i)) >= 0) { n++; i += needle.length }
  return n
}

export function guessSector(page) {
  if (!page) return null
  const strong = fold([page.title, page.metaDescription, ...(page.headings || page.h || []).filter((h) => h.level <= 2).map((h) => h.text)].join(' · '))
  const body = fold(String(page.text || '').slice(0, 30000))
  const ld = fold(JSON.stringify(page.jsonLd || []) + ' ' + (page.microdataTypes || []).join(' '))
  const scores = SECTORS.filter((s) => s.id !== 'autre').map((s) => {
    let score = 0
    for (const kw of s.keywords || []) {
      const k = fold(kw)
      if (GENERIC.has(k)) continue
      score += 3 * Math.min(2, count(strong, k)) + Math.min(4, count(body, k))
    }
    for (const t of s.schema || []) { const k = fold(t); if (!GENERIC_TYPES.has(k) && (ld.includes(`"${k}"`) || ld.includes(` ${k}`))) score += 8 }
    return { id: s.id, label: s.label, score }
  }).sort((a, b) => b.score - a.score)
  const [a, b] = scores
  return a && a.score >= 4 && a.score >= (b?.score || 0) * 1.4 ? { id: a.id, label: a.label, score: a.score } : null
}

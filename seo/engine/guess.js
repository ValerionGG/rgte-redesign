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

// « Vitrines boulangerie », « matériel de pâtisserie », « mobilier pour restaurants » : le site vend AUX boulangers
// ou aux restaurateurs, il n'en est pas un. Le métier client qui suit un produit professionnel compte alors pour
// l'équipement B2B, pas pour ce métier. (Ni « four » ni « comptoir » : « Le Four à pain », « Le Comptoir » sont des enseignes.)
const SUPPLY = /\b(vitrines?|agencements?|amenagements?|mobiliers?|equipements?|materiels?|machines?|fournitures?|emballages?|cuves?|chambres? froides?|froid commercial|fabricants?|fournisseurs?|grossistes?|installateurs?)\b([^.!?;:|·\n()]{0,70})/g
const CLIENTS = /\b(boulangeries?|boulangers?|patisseries?|patissiers?|chocolat(?:iers?|eries?)|boucheries?|bouchers?|charcuteries?|poissonneries?|traiteurs?|restaurants?|restauration|hotels?|hotellerie|bars?|cafes?|snacks?|sandwicheries?|supermarches?|epiceries?|magasins?|commerces?|commercants?|pharmacies?|fromageries?|glaciers?|primeurs?|salons?|cantines?|collectivites)\b/
function supplierSpans(text) {
  let n = 0
  const rest = text.replace(SUPPLY, (m, noun, tail) => (CLIENTS.test(tail) ? (n++, noun + ' '.repeat(tail.length)) : m))
  return { rest, n }
}

export function guessSector(page) {
  if (!page) return null
  const s1 = supplierSpans(fold([page.title, page.metaDescription, ...(page.headings || page.h || []).filter((h) => h.level <= 2).map((h) => h.text)].join(' · ')))
  const s2 = supplierSpans(fold(String(page.text || '').slice(0, 30000)))
  const strong = s1.rest, body = s2.rest
  const ld = fold(JSON.stringify(page.jsonLd || []) + ' ' + (page.microdataTypes || []).join(' '))
  const scores = SECTORS.filter((s) => s.id !== 'autre').map((s) => {
    let score = s.id === 'equipement-pro' ? 5 * Math.min(3, s1.n) + Math.min(6, s2.n) : 0
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

// Boîte à outils : les outils gratuits et payants à installer, choisis d'après l'audit (ce qui manque vraiment),
// le secteur, l'activité locale, les réseaux prioritaires et la publicité, avec le guide d'installation
// (étapes tirées des pages d'aide officielles) et le coût mensuel d'entrée.
import catalog from '../data/research/outils.js'
import { sectorById } from '../data/sectors.js'

export const TOOLS = Object.fromEntries(catalog.tools.map((t) => [t.id, t]))
export const CATALOG_DATE = catalog.generated
const PERF = ['lh-perf', 'lcp', 'render-blocking', 'ttfb', 'img-format', 'img-dims', 'compression', 'cache', 'html-size', 'scripts', 'inline-css', 'fonts-preconnect', 'lcp-lazy', 'crux', 'video-facade', 'third-parties']
const SCHEMA = ['schema', 'schema-none', 'schema-org', 'schema-sector', 'jsonld-error', 'localbusiness', 'breadcrumb', 'sameas']
const LEVELS = ['essentiel', 'recommande', 'pro']
// Ordre d'installation des outils gratuits (le plus utile d'abord) ; le reste suit dans le mois
const PRIO = { 'search-console': 100, gbp: 96, 'tarteaucitron': 92, 'consent-mode': 90, ga4: 89, gtm: 86, 'merchant-center': 84, 'rank-math': 82, 'meta-business': 78, 'tiktok-business': 74, 'bing-webmaster': 72, 'apple-business': 66, clarity: 64, 'bing-places': 62, 'rich-results': 58, 'keyword-planner': 56, canva: 52, capcut: 51, 'ahrefs-awt': 50, 'google-trends': 46, 'psi-key': 44 }
export const WEEK = 6

export function recommendTools(report = {}) {
  const R = report.result || {}, m = R.meta || {}, ids = new Set((R.issues || []).filter((i) => i.sev !== 'ok').map((i) => i.id))
  const input = report.input || {}, sector = sectorById(input.sector || 'autre')
  const local = input.local ?? sector.local, kind = report.kind || 'site'
  const nets = new Set(sector.networks || []), cms = (m.cms || []).join(' ')
  const ads = Number(input.monthly) > 0 || ['ok', 'test'].includes(report.budget?.verdict?.level)
  const picks = new Map()
  const add = (id, raison) => {
    const t = TOOLS[id]
    if (!t) return
    const p = picks.get(id) || { ...t, raisons: [] }
    if (raison && !p.raisons.includes(raison)) p.raisons.push(raison)
    picks.set(id, p)
  }
  if (kind === 'site') {
    add('search-console', 'Indispensable : vos vraies requêtes, et la preuve que chaque correction marche.')
    add('bing-webmaster', ids.has('bing') ? 'Site non vérifié sur Bing, qui alimente Copilot et une partie de ChatGPT Search.' : 'Bing alimente Copilot et une partie de ChatGPT Search ; IndexNow accélère l’indexation.')
    if (ids.has('analytics')) { add('ga4', 'Aucun outil de mesure détecté sur le site.'); add('gtm', 'Installer GA4 et les balises sans retoucher le code.') }
    else add('ga4', 'Déclarer vos appels, formulaires et achats comme événements clés.')
    add('clarity', 'Voir où les visiteurs hésitent ou abandonnent.')
    if (ids.has('cmp')) { add('tarteaucitron', 'Traceurs sans bandeau de consentement détecté : risque de sanction CNIL.'); add('axeptio', 'Alternative clés en main au bandeau gratuit.') }
    if (ids.has('cmp') || ids.has('consent-mode')) add('consent-mode', 'Sans Consent Mode v2, Google Ads perd le remarketing et une partie des conversions.')
    const slow = PERF.some((x) => ids.has(x))
    if (slow) { add('psi-key', 'Mesurer la vitesse réelle à chaque audit sans dépasser le quota gratuit.'); add('cloudflare', 'Cache et CDN gratuits pour accélérer le site.') }
    if (/WordPress|WooCommerce/.test(cms)) {
      add('rank-math', 'Site WordPress : titres, descriptions, sitemap et données structurées au même endroit.')
      if (slow) add('wp-rocket', 'WordPress lent : cache et optimisation en quelques clics.')
    }
    if (SCHEMA.some((x) => ids.has(x))) add('rich-results', 'Des données structurées manquent ou sont à corriger.')
    add('screaming-frog', 'Explorer tout le site comme Google, avant et après chaque refonte.')
    add('ahrefs-awt', 'Vos liens entrants et un audit de site, gratuitement.')
    add('keyword-planner', 'Volumes et CPC réels de vos mots-clés.')
    add('google-trends', 'La saison de votre activité : quand publier et quand investir.')
    add('alsoasked', 'Les questions de vos clients pour la FAQ, les intertitres et les vidéos.')
    add('looker-studio', 'Un tableau de bord mensuel gratuit (Search Console et GA4).')
    if (ids.has('citabilite') || ids.has('robots-ai-search') || ids.has('robots-ai-user')) add('otterly', 'Savoir si ChatGPT, Perplexity et AI Overviews vous citent, mois après mois.')
    if (ids.has('robots-ai-search') || ids.has('robots-ai-user') || ids.has('content-signal')) add('cloudflare', 'Régler les robots IA au cas par cas (AI Crawl Control).')
    if (['ecommerce', 'ecommerce-mode', 'maison-deco', 'luxe'].includes(sector.id)) { add('merchant-center', 'Vos produits gratuitement dans Google Shopping et Images.'); add('trustpilot', 'Des avis publics qui rassurent avant l’achat.') }
    if (ids.has('tel') || m.forms === 0) add('calendly', 'Prise de rendez-vous en ligne quand le contact direct manque.')
  }
  if (local) {
    add('gbp', 'Activité locale : la fiche Google est le premier levier (Maps, pack local, avis).')
    add('apple-business', 'Être trouvé dans Plans sur iPhone.')
    add('bing-places', 'Être trouvé dans Bing Maps et Copilot.')
    add('guest-suite', 'Si vous voulez industrialiser la collecte d’avis (outil français).')
  }
  // Les suites Meta et TikTok installent surtout le pixel publicitaire : proposées seulement si la pub est envisagée (bloc « ads »).
  if (nets.has('linkedin')) add('linkedin-insight', 'LinkedIn est prioritaire pour votre secteur.')
  if (nets.has('pinterest')) add('pinterest-business', 'Pinterest apporte un trafic durable dans votre secteur.')
  if (nets.has('youtube')) add('youtube-studio', 'YouTube est prioritaire pour votre secteur, et les IA le citent souvent.')
  add('canva', 'Visuels, carrousels et miniatures aux formats de chaque réseau.')
  if (nets.has('tiktok') || nets.has('instagram') || nets.has('youtube')) add('capcut', 'Monter Reels, TikTok et Shorts au téléphone, sous-titres compris.')
  add('metricool', 'Planifier tous les réseaux et suivre les statistiques au même endroit.')
  add('brevo', 'Relancer vos clients par e-mail et SMS, et leur demander un avis.')
  if (ads) {
    add('keyword-planner', 'Choisir les mots-clés de vos campagnes avec les CPC réels.')
    add('gtm', 'Installer les balises de conversion de vos campagnes.')
    add('consent-mode', 'Mesurer les conversions publicitaires dans le respect du consentement.')
    if ((input.goal || 'leads') === 'leads') add('call-tracking', 'Savoir quelle campagne fait sonner le téléphone.')
    if (nets.has('instagram') || nets.has('facebook')) add('meta-business', 'Pixel et API Conversions pour la publicité Meta.')
    if (nets.has('tiktok')) add('tiktok-business', 'Pixel et Events API pour la publicité TikTok.')
  }
  if (kind === 'site') add(['agence', 'ecommerce', 'saas'].includes(sector.id) ? 'semrush' : 'haloscan', 'Pour suivre vos positions et vos concurrents chaque semaine.')
  add('make', 'Automatiser les tâches répétitives : formulaire → e-mail → demande d’avis.')
  const list = [...picks.values()].sort((a, b) => (PRIO[b.id] || 0) - (PRIO[a.id] || 0))
  const out = Object.fromEntries(LEVELS.map((l) => [l, list.filter((t) => t.niveau === l)]))
  const cost = (arr) => Math.round(arr.filter((t) => !t.gratuit && t.mois_eur).reduce((s, t) => s + t.mois_eur, 0))
  const optional = (arr) => Math.round(arr.filter((t) => t.gratuit && t.mois_eur).reduce((s, t) => s + t.mois_eur, 0))
  return {
    ...out,
    couts: { essentiel: cost(out.essentiel), recommande: cost(out.recommande), recommandeOptionnel: optional(out.recommande), pro: cost(out.pro) + optional(out.pro) },
    verifie: CATALOG_DATE,
  }
}

const price = (t) => t.prix || (t.gratuit ? 'Gratuit (offre gratuite ; offres payantes : à vérifier)' : 'Prix : à vérifier')
// Prix court pour une pastille : « Gratuit », « Gratuit + offres payantes » ou le premier montant
export function shortPrice(t) {
  const p = String(t.prix || '')
  if (/^\s*sur devis/i.test(p)) return 'Sur devis'
  if (t.gratuit && (!p || /^gratuit/i.test(p))) return /payant|pro|premium|starter|plus|360|€|\$|£/i.test(p.replace(/^gratuit\s*/i, '')) ? 'Gratuit + options payantes' : 'Gratuit'
  // Outil payant qui a une offre gratuite limitée : le prix d'entrée d'abord (sinon « Offre gratuite » au milieu des outils payants).
  if (t.gratuit) { const m = p.match(/\d[\d\s.,]*\s?(€|\$|£)(\s?HT)?(\s?(par |\/)\s?[a-zé]+)?/i); return m ? `Dès ${m[0].replace(/\s+/g, ' ').trim()} (offre gratuite limitée)` : 'Offre gratuite limitée' }
  const m = p.match(/(à partir de |dès )?\d[\d\s.,]*\s?(€|\$|£)(\s?HT)?(\s?(par |\/)\s?[a-zé]+)?(\/[a-zé]+)?/i)
  return m ? m[0].replace(/\s+/g, ' ').trim() : /devis/i.test(p) ? 'Sur devis' : 'Payant'
}
export function toolsMarkdown(rec, { guides = true } = {}) {
  const L = ['## Outils recommandés et guides d’installation', '', `Sélection faite d’après votre audit, votre secteur et vos réseaux. Prix d’entrée indicatifs, vérifiés le ${new Date(rec.verifie + 'T12:00:00Z').toLocaleDateString('fr-FR')} (hors taxes sauf mention) : à reconfirmer chez l’éditeur.`, '']
  const block = (t, withGuide) => {
    const lines = [`- **[${t.nom}](${t.url})** — ${price(t)}`, `  ${t.raisons.join(' ') || t.pourquoi}`]
    if (t.limites_gratuit && withGuide) lines.push(`  Offre gratuite : ${t.limites_gratuit}`)
    if (withGuide && t.etapes?.length) lines.push(...t.etapes.map((e, i) => `  ${i + 1}. ${e}`))
    if (withGuide && t.doc) lines.push(`  Aide officielle : ${t.doc}`)
    return lines.join('\n')
  }
  if (rec.essentiel.length) L.push('### Cette semaine (gratuit, dans cet ordre)', '', ...rec.essentiel.slice(0, WEEK).map((t) => block(t, guides)), '')
  if (rec.essentiel.length > WEEK) L.push('### Ce mois-ci (gratuit)', '', ...rec.essentiel.slice(WEEK).map((t) => block(t, guides)), '')
  if (rec.recommande.length) L.push('### Recommandés (gratuits ou petit budget)', '', ...rec.recommande.map((t) => block(t, guides)), '')
  if (rec.pro.length) L.push('### Pour aller plus loin (payants)', '', ...rec.pro.map((t) => block(t, false)), '')
  L.push(`**Budget outils** : 0 € pour démarrer${rec.couts.recommandeOptionnel ? ` · ≈ ${rec.couts.recommandeOptionnel} €/mois si vous prenez les offres payantes des outils recommandés` : ''}${rec.couts.pro ? ` · ≈ ${rec.couts.pro} €/mois de plus au niveau pro` : ''} (prix d’entrée connus seulement).`, '')
  return L.join('\n')
}

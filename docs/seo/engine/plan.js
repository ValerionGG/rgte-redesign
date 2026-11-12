// Plan d'action : « cette semaine » (critiques d'abord, puis les gains rapides), puis 30 / 60 / 90 jours.
// Chaque tâche dit QUI s'en charge et COMBIEN DE TEMPS elle prend, pour qu'un dirigeant puisse déléguer.

const OWNER_BY_ID = {
  https: 'Hébergeur', 'http-redirect': 'Hébergeur', www: 'Hébergeur', hsts: 'Hébergeur', nosniff: 'Hébergeur', compression: 'Hébergeur',
  cache: 'Hébergeur', ttfb: 'Hébergeur', 'robots-5xx': 'Hébergeur', 'fetch-error': 'Hébergeur', 'redirect-chain': 'Webmaster',
  keyword: 'Vous', city: 'Vous', thin: 'Vous', 'crawl-thin': 'Vous', questions: 'Vous', facts: 'Vous', about: 'Vous', 'author-date': 'Vous', h2: 'Vous',
  'title': 'Vous ou webmaster', 'title-long': 'Vous ou webmaster', 'title-short': 'Vous ou webmaster', description: 'Vous ou webmaster',
  'description-short': 'Vous ou webmaster', 'description-long': 'Vous ou webmaster', 'dup-title': 'Vous ou webmaster', 'dup-desc': 'Vous ou webmaster',
  alt: 'Vous ou webmaster', 'img-names': 'Vous', anchors: 'Vous', 'internal-links': 'Vous', legal: 'Vous', privacy: 'Vous', cgv: 'Vous',
  gbp: 'Vous', 'gbp-link': 'Vous', nap: 'Vous ou webmaster', 'nap-sab': 'Vous', bing: 'Vous',
  // robots.txt, balises et données structurées : il faut l'accès aux fichiers ou au thème du site
  'robots-ai-train': 'Webmaster', 'robots-ai-user': 'Webmaster', 'robots-ai-search': 'Webmaster', 'content-signal': 'Webmaster', llms: 'Webmaster', nosnippet: 'Webmaster', 'data-nosnippet': 'Webmaster',
  localbusiness: 'Webmaster', hours: 'Webmaster', 'schema-none': 'Webmaster', 'schema-sector': 'Webmaster', 'schema-org': 'Webmaster', cmp: 'Webmaster', 'consent-mode': 'Webmaster',
}
const OWNER_BY_CAT = { technique: 'Webmaster', performance: 'Webmaster', donnees: 'Webmaster', conformite: 'Webmaster', contenu: 'Vous', social: 'Webmaster', ia: 'Vous', local: 'Vous', decouverte: 'Vous', readme: 'Vous', confiance: 'Vous', activite: 'Vous', metadonnees: 'Vous', visuels: 'Vous', avis: 'Vous', fraicheur: 'Développeur' }
const LEGAL = new Set(['cmp', 'legal', 'privacy', 'cgv', 'mentions', 'consent'])
const LEGAL_SHORT = { cmp: 'bandeau cookies', legal: 'mentions légales', privacy: 'confidentialité', cgv: 'CGV', mentions: 'mentions légales', consent: 'consentement' }
export const ownerOf = (i) => OWNER_BY_ID[i.id] || OWNER_BY_CAT[i.cat] || 'Webmaster'
export const timeOf = (effort) => ['15 min', '15 min', '1 h', '½ journée', '2 à 5 jours', 'projet'][effort] || '1 h'
const gain = (i) => i.impact * 3 + (6 - i.effort) * 2
const slug = (s) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').slice(0, 40)

// Lien de profil social (Instagram, TikTok…) : le compte n'est pas lisible, le plan porte sur ce que le dirigeant peut faire lui-même.
function socialPlan({ network, handle }, { hasAds }) {
  const ex = (step, who, time, title) => ({ id: `x:${step}:${slug(title)}`, title, who, time, extra: true })
  const steps = [
    { id: 'semaine', title: 'Cette semaine', why: `Votre profil ${network} (@${handle}) : ce qui se règle en une semaine.`, items: [], extra: [
      ex('semaine', 'Vous', '15 min', 'Bio : dire en une phrase quoi, où et pour qui, avec un lien vers votre page de commande, de réservation ou de contact'),
      ex('semaine', 'Vous', '15 min', 'Exporter les statistiques des 90 derniers jours (Meta Business Suite, TikTok Studio, LinkedIn ou YouTube Studio) et les envoyer à Claude pour un diagnostic chiffré'),
      ex('semaine', 'Vous', '½ journée', 'Publier 3 vidéos courtes : une coulisse, un produit ou service, une réponse à une question de client ; 3 à 5 hashtags de niche (onglet Mots-clés & réseaux). Scripts prêts à filmer : demandez-les à Claude (skill contenus-reseaux-video)'),
    ] },
    { id: 'j30', title: 'Dans les 30 jours', why: 'Un rythme tenable et un profil relié à votre site.', items: [], extra: [
      ex('j30', 'Vous', '2 h par semaine', 'Tenir 3 publications par semaine pendant 4 semaines, calées sur les temps forts du calendrier (onglet Mots-clés & réseaux)'),
      ex('j30', 'Vous ou webmaster', '15 min', 'Relier le profil et le site : lien du profil vers le site, et lien du site (pied de page) vers le profil'),
      ex('j30', 'Vous', '10 min par jour', 'Répondre à chaque commentaire et message sous 24 h'),
    ] },
    { id: 'j60', title: 'Dans les 60 jours', why: 'Garder ce qui marche, arrêter le reste.', items: [], extra: [
      ex('j60', 'Vous', '1 h', 'Garder les 3 formats qui ont le plus de partages et d’enregistrements, arrêter les autres'),
      ex('j60', 'Vous', '½ journée', 'Une collaboration locale par mois : commerce voisin, fournisseur ou client fidèle'),
      ...(hasAds ? [ex('j60', 'Vous', '15 min', 'Booster les 2 meilleures publications (5 à 10 € par jour, 7 jours), seulement si un contact ou une vente est mesuré')] : []),
    ] },
    { id: 'j90', title: 'Dans les 90 jours', why: 'Mesurer et étendre.', items: [], extra: [
      ex('j90', 'Vous', '30 min', 'Comparer avec l’export du jour 0 : abonnés, portée hors abonnés, clics vers le site, messages reçus'),
      ex('j90', 'Vous', '5 min', 'Relancer SEO 360 avec l’adresse de votre site, s’il existe, pour le référencement Google et la fiche Google'),
    ] },
  ]
  const kpis = [['Abonnés', 'à relever'], ['Portée hors abonnés (moyenne par publication)', 'à relever'], ['Clics vers le site', 'à relever'], ['Messages et demandes reçus', 'à relever']].map(([kpi, now]) => ({ kpi, now, target: 'en hausse sur 90 jours' }))
  return { steps, week: steps[0].extra.slice(0, 3), kpis, social: true }
}
export function actionPlan(result, { local = false, hasAds = false, kind = 'site', social = null } = {}) {
  if (social) return socialPlan(social, { hasAds })
  const issues = (result?.issues || []).map((i) => ({ ...i, who: ownerOf(i), time: timeOf(i.effort) }))
  const used = new Set()
  const take = (list, n) => { const out = list.filter((i) => !used.has(i)).slice(0, n); out.forEach((i) => used.add(i)); return out }
  const byGain = (a, b) => gain(b) - gain(a)
  const critiques = take(issues.filter((i) => i.sev === 'critique').sort(byGain), 10)
  // Risque juridique (cookies déposés sans consentement, mentions légales) : avant les gains de confort.
  const legal = take(issues.filter((i) => LEGAL.has(i.id)).sort(byGain), 3)
  const quick = take(issues.filter((i) => i.effort <= 2 && i.impact >= 3).sort(byGain), Math.max(0, 7 - critiques.length))
  const m1 = take(issues.filter((i) => i.sev === 'important').sort(byGain), 12)
  const m2 = take(issues.filter((i) => ['technique', 'contenu', 'performance', 'donnees', 'local', 'decouverte', 'readme', 'metadonnees'].includes(i.cat)).sort(byGain), 12)
  const m3 = take(issues.slice().sort(byGain), Infinity)
  const ex = (step, who, title) => ({ id: `x:${step}:${slug(title)}`, title, who, time: '', extra: true })
  const steps = [
    { id: 'semaine', title: 'Cette semaine', why: 'Les points bloquants et les risques juridiques, puis les corrections de moins d’une heure à fort effet.', items: [...critiques, ...legal, ...quick], extra: [
      local ? ex('semaine', 'Vous', 'Fiche Google Business Profile : catégorie principale exacte, horaires, 5 photos réelles, lien vers le site') : null,
      kind === 'site' ? ex('semaine', 'Vous', 'Créer Google Search Console et Bing Webmaster Tools, y déclarer le sitemap') : null,
    ].filter(Boolean) },
    { id: 'j30', title: 'Dans les 30 jours', why: 'Indexation, technique et pages clés propres.', items: m1, extra: [
      ex('j30', 'Vous', 'Lister 10 à 20 mots-clés cibles (onglet Mots-clés) et attribuer UNE page à chacun'),
      kind === 'site' ? ex('j30', 'Vous ou webmaster', 'Réécrire titres, H1 et descriptions des 10 pages qui ont le plus d’impressions (Search Console)') : null,
      hasAds ? ex('j30', 'Vous', 'Lancer la publicité sur 1 ou 2 canaux (onglet Budget) pour obtenir des contacts pendant que le SEO monte') : null,
    ].filter(Boolean) },
    { id: 'j60', title: 'Dans les 60 jours', why: 'Contenu et autorité : ce qui fait monter durablement.', items: m2, extra: [
      ex('j60', 'Vous', 'Publier 4 à 8 contenus experts (guides, comparatifs, FAQ, cas clients) qui répondent aux vraies questions'),
      ex('j60', 'Vous', 'Obtenir 5 à 10 liens de sites français du même domaine ou de la même ville (partenaires, fournisseurs, presse locale)'),
      local ? ex('j60', 'Vous', 'Campagne d’avis clients (QR code, SMS après prestation) : +10 avis par mois, réponse à chacun') : ex('j60', 'Webmaster', 'Données structurées sur tous les gabarits (produit, article, FAQ)'),
    ] },
    { id: 'j90', title: 'Dans les 90 jours', why: 'Mesurer, étendre, être cité par les IA.', items: m3, extra: [
      ex('j90', 'Vous', 'Poser 10 questions types à ChatGPT, Perplexity, Gemini et Copilot : noter si vous êtes cité, et qui l’est à votre place'),
      ex('j90', 'Vous', 'Relancer un audit SEO 360 et comparer (onglet Synthèse : vos progrès)'),
      kind === 'app' ? ex('j90', 'Développeur', 'Tester 2 icônes et 2 jeux de captures (Product Page Optimization / expériences Play Console)') : ex('j90', 'Vous', 'Réallouer le budget pub vers les canaux au meilleur coût par client réel'),
    ] },
  ]
  // Les 3 actions de la semaine : les points bloquants, puis UNE action de mise en règle (les points juridiques
  // regroupés, pour ne pas occuper les 3 places), puis ce qui fait gagner en visibilité : fiche Google en local,
  // corrections rapides à fort effet. Un dirigeant qui veut être trouvé doit voir au moins une action de visibilité.
  const legalOne = legal.length > 1
    ? [{ ...legal[0], title: `Mettre le site en règle : ${legal.length} points (${legal.map((i) => LEGAL_SHORT[i.id] || i.id).join(', ')})`, fix: 'Réglez ces points ensemble : ils se corrigent au même endroit (pied de page et bandeau de consentement). Détail et correctifs dans « À faire ».', group: legal.map((i) => i.id), time: '1 à 2 h' }]
    : legal
  // Visibilité d'abord (indexation, contenu, vitesse, données structurées, IA, local) ; le partage social ensuite
  const FOUND = ['technique', 'contenu', 'performance', 'donnees', 'ia', 'local']
  const pool = [...quick, ...m1, ...m2].filter((i) => i.cat !== 'conformite')
  const visible = [...pool.filter((i) => FOUND.includes(i.cat)), ...pool]
  const week = [...critiques, ...legalOne, ...(local ? steps[0].extra.slice(0, 1) : []), ...visible, ...quick, ...steps[0].extra, ...m1].filter((v, i, a) => a.indexOf(v) === i).slice(0, 3)
  return { steps, week, kpis: kpis(result, local) }
}

function kpis(result, local) {
  return [
    { kpi: 'Note de l’audit (à couverture égale)', now: result?.global != null ? `${result.global}/100` : 'non notée', target: result?.global != null ? `${Math.min(100, result.global + 20)}/100 en 90 jours` : '≥ 80' },
    { kpi: 'Pages indexées (Search Console)', now: 'à relever', target: '≈ 100 % des pages utiles' },
    { kpi: 'Clics Google / mois', now: 'à relever', target: '+30 à +100 % en 6 mois selon la concurrence' },
    { kpi: 'Vitesse réelle mobile', now: 'voir Synthèse', target: 'LCP ≤ 2,5 s · INP ≤ 200 ms · CLS ≤ 0,1' },
    { kpi: 'Contacts ou ventes venus de Google', now: 'à relever (GA4)', target: 'suivre la tendance mensuelle' },
    local ? { kpi: 'Avis Google', now: 'à relever', target: '+10 par mois, note ≥ 4,5' } : { kpi: 'Sites qui vous citent (liens)', now: 'à relever', target: '+5 à +10 par mois' },
    { kpi: 'Citations dans les IA', now: 'test manuel', target: 'cité sur au moins 3 questions types sur 10' },
  ]
}

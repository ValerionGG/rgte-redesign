// Plan d'action : « cette semaine » (critiques d'abord, puis les gains rapides), puis 30 / 60 / 90 jours.
// Chaque tâche dit QUI s'en charge et COMBIEN DE TEMPS elle prend, pour qu'un dirigeant puisse déléguer.

const OWNER_BY_ID = {
  https: 'Hébergeur', 'http-redirect': 'Hébergeur', www: 'Hébergeur', hsts: 'Hébergeur', nosniff: 'Hébergeur', compression: 'Hébergeur',
  cache: 'Hébergeur', ttfb: 'Hébergeur', 'robots-5xx': 'Hébergeur', 'fetch-error': 'Hébergeur', 'redirect-chain': 'Webmaster',
  keyword: 'Vous', city: 'Vous', thin: 'Vous', 'crawl-thin': 'Vous', questions: 'Vous', facts: 'Vous', about: 'Vous', 'author-date': 'Vous', h2: 'Vous',
  'title': 'Vous ou webmaster', 'title-long': 'Vous ou webmaster', 'title-short': 'Vous ou webmaster', description: 'Vous ou webmaster',
  'description-short': 'Vous ou webmaster', 'description-long': 'Vous ou webmaster', 'dup-title': 'Vous ou webmaster', 'dup-desc': 'Vous ou webmaster',
  alt: 'Vous ou webmaster', 'img-names': 'Vous', anchors: 'Vous', 'internal-links': 'Vous', legal: 'Vous', privacy: 'Vous', cgv: 'Vous',
  gbp: 'Vous', 'gbp-link': 'Vous', nap: 'Vous ou webmaster', bing: 'Vous', 'robots-ai-train': 'Vous',
}
const OWNER_BY_CAT = { technique: 'Webmaster', performance: 'Webmaster', donnees: 'Webmaster', conformite: 'Webmaster', contenu: 'Vous', social: 'Webmaster', ia: 'Vous', local: 'Vous', decouverte: 'Vous', readme: 'Vous', confiance: 'Vous', activite: 'Vous', metadonnees: 'Vous', visuels: 'Vous', avis: 'Vous', fraicheur: 'Développeur' }
export const ownerOf = (i) => OWNER_BY_ID[i.id] || OWNER_BY_CAT[i.cat] || 'Webmaster'
export const timeOf = (effort) => ['15 min', '15 min', '1 h', '½ journée', '2 à 5 jours', 'projet'][effort] || '1 h'
const gain = (i) => i.impact * 3 + (6 - i.effort) * 2
const slug = (s) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').slice(0, 40)

export function actionPlan(result, { local = false, hasAds = false, kind = 'site' } = {}) {
  const issues = (result?.issues || []).map((i) => ({ ...i, who: ownerOf(i), time: timeOf(i.effort) }))
  const used = new Set()
  const take = (list, n) => { const out = list.filter((i) => !used.has(i)).slice(0, n); out.forEach((i) => used.add(i)); return out }
  const byGain = (a, b) => gain(b) - gain(a)
  const critiques = take(issues.filter((i) => i.sev === 'critique').sort(byGain), 10)
  const quick = take(issues.filter((i) => i.effort <= 2 && i.impact >= 3).sort(byGain), Math.max(0, 7 - critiques.length))
  const m1 = take(issues.filter((i) => i.sev === 'important').sort(byGain), 12)
  const m2 = take(issues.filter((i) => ['technique', 'contenu', 'performance', 'donnees', 'local', 'decouverte', 'readme', 'metadonnees'].includes(i.cat)).sort(byGain), 12)
  const m3 = take(issues.slice().sort(byGain), Infinity)
  const ex = (step, who, title) => ({ id: `x:${step}:${slug(title)}`, title, who, time: '', extra: true })
  const steps = [
    { id: 'semaine', title: 'Cette semaine', why: 'Les points bloquants, puis les corrections de moins d’une heure à fort effet.', items: [...critiques, ...quick], extra: [
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
  // Les 3 actions de la semaine : critiques, puis la fiche Google (activité locale), puis les gains rapides
  const week = [...critiques, ...(local ? steps[0].extra.slice(0, 1) : []), ...quick, ...steps[0].extra, ...m1].filter((v, i, a) => a.indexOf(v) === i).slice(0, 3)
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

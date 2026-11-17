// Profil de présence d'une entreprise : où elle existe en ligne, d'après ce que son propre site déclare
// (liens de toutes les pages lues, schema.org sameAs, balises d'application), puis ce que des sources publiques
// confirment (App Store, registre des entreprises). Rien n'est deviné : un profil non trouvé reste « non trouvé »,
// un candidat construit à partir du nom de marque reste « à vérifier ».

// Plateformes reconnues : [id, libellé, famille, motif d'URL, extraction de l'identifiant]
export const PLATFORMS = [
  // Réseaux sociaux
  ['instagram', 'Instagram', 'reseau', /instagram\.com\/(?!p\/|reel\/|explore\/|accounts\/)([\w.]+)/i],
  ['facebook', 'Facebook', 'reseau', /facebook\.com\/(?!sharer|dialog|plugins|tr\b|share\b|profile\.php)([\w.-]+)/i],
  ['linkedin', 'LinkedIn', 'reseau', /linkedin\.com\/(?:company|school|showcase)\/([\w-]+)/i],
  ['linkedin-perso', 'LinkedIn (profil personnel)', 'reseau', /linkedin\.com\/in\/([\w-]+)/i],
  ['tiktok', 'TikTok', 'reseau', /tiktok\.com\/@([\w.-]+)/i],
  ['youtube', 'YouTube', 'reseau', /youtube\.com\/(?:@|c\/|channel\/|user\/)([\w.-]+)/i],
  ['x', 'X (Twitter)', 'reseau', /(?:twitter|x)\.com\/(?!intent|share|home|search|hashtag)(\w{2,15})\b/i],
  ['pinterest', 'Pinterest', 'reseau', /pinterest\.[a-z.]+\/(?!pin\/)([\w-]+)/i],
  ['threads', 'Threads', 'reseau', /threads\.(?:net|com)\/@([\w.]+)/i],
  ['bluesky', 'Bluesky', 'reseau', /bsky\.app\/profile\/([\w.-]+)/i],
  ['snapchat', 'Snapchat', 'reseau', /snapchat\.com\/add\/([\w.-]+)/i],
  ['twitch', 'Twitch', 'reseau', /twitch\.tv\/(\w+)/i],
  ['discord', 'Discord', 'communaute', /discord\.(?:gg|com\/invite)\/([\w-]+)/i],
  ['whatsapp', 'WhatsApp', 'messagerie', /(?:wa\.me|api\.whatsapp\.com\/send|chat\.whatsapp\.com)\/?([\w?=&+-]*)/i],
  ['telegram', 'Telegram', 'messagerie', /t\.me\/([\w]+)/i],
  ['messenger', 'Messenger', 'messagerie', /m\.me\/([\w.]+)/i],
  // Applications
  ['app-store', 'App Store', 'app', /apps\.apple\.com\/(?:[a-z]{2}\/)?app\/[^/]*\/?id(\d+)|itunes\.apple\.com\/.*id(\d+)/i],
  ['google-play', 'Google Play', 'app', /play\.google\.com\/store\/apps\/details\?id=([\w.]+)/i],
  ['app-gallery', 'AppGallery (Huawei)', 'app', /appgallery\.huawei\.com\/.*app\/(C?\d+)/i],
  // Avis et réputation
  ['google-avis', 'Fiche Google (avis, itinéraire)', 'avis', /(?:g\.page|maps\.app\.goo\.gl|google\.[a-z.]+\/maps|business\.google\.com|search\.google\.com\/local\/writereview)\/?([^\s"'#]*)/i],
  ['trustpilot', 'Trustpilot', 'avis', /trustpilot\.com\/review\/([\w.-]+)/i],
  ['avis-verifies', 'Avis Vérifiés', 'avis', /avis-verifies\.com\/avis-clients\/([\w.-]+)/i],
  ['tripadvisor', 'Tripadvisor', 'avis', /tripadvisor\.[a-z.]+\/([\w-]+\.html)/i],
  ['pagesjaunes', 'PagesJaunes', 'annuaire', /pagesjaunes\.fr\/(?:pros|annuaire)\/([\w/-]+)/i],
  ['apple-plans', 'Apple Plans', 'annuaire', /maps\.apple\.com\/\?([^\s"']+)/i],
  ['waze', 'Waze', 'annuaire', /waze\.com\/(?:[a-z-]+\/)?live-map\/directions\/([\w-]+)/i],
  // Réservation et vente
  ['doctolib', 'Doctolib', 'reservation', /doctolib\.fr\/([\w/-]+)/i],
  ['planity', 'Planity', 'reservation', /planity\.com\/([\w-]+)/i],
  ['thefork', 'TheFork / LaFourchette', 'reservation', /(?:thefork|lafourchette)\.[a-z]+\/restaurant\/([\w-]+)/i],
  ['booking', 'Booking.com', 'reservation', /booking\.com\/hotel\/[a-z]{2}\/([\w-]+)/i],
  ['airbnb', 'Airbnb', 'reservation', /airbnb\.[a-z.]+\/rooms\/(\d+)/i],
  ['calendly', 'Calendly', 'reservation', /calendly\.com\/([\w-]+)/i],
  ['amazon', 'Amazon', 'vente', /amazon\.[a-z.]+\/(?:stores\/|s\?me=|sp\?seller=)([\w/=-]+)/i],
  ['etsy', 'Etsy', 'vente', /etsy\.com\/(?:[a-z-]+\/)?shop\/([\w-]+)/i],
  ['leboncoin', 'Leboncoin', 'vente', /leboncoin\.fr\/(?:boutique|profile)\/([\w/-]+)/i],
  ['ubereats', 'Uber Eats', 'vente', /ubereats\.com\/[a-z-]+\/store\/([\w-]+)/i],
  ['deliveroo', 'Deliveroo', 'vente', /deliveroo\.fr\/[a-z-]+\/menu\/[\w-]+\/[\w-]+\/([\w-]+)/i],
  // Contenus et autorité
  ['spotify', 'Spotify (podcast)', 'contenu', /open\.spotify\.com\/(?:show|artist)\/(\w+)/i],
  ['apple-podcasts', 'Apple Podcasts', 'contenu', /podcasts\.apple\.com\/.*id(\d+)/i],
  ['medium', 'Medium', 'contenu', /medium\.com\/@?([\w.-]+)/i],
  ['substack', 'Substack', 'contenu', /([\w-]+)\.substack\.com/i],
  ['github', 'GitHub', 'contenu', /github\.com\/([\w-]+)(?:\/|$|[?#"'])/i],
  ['wikipedia', 'Wikipédia', 'autorite', /[a-z]{2}\.wikipedia\.org\/wiki\/([^\s"'#?]+)/i],
  ['wikidata', 'Wikidata', 'autorite', /wikidata\.org\/wiki\/(Q\d+)/i],
  // Emploi
  ['welcometothejungle', 'Welcome to the Jungle', 'emploi', /welcometothejungle\.com\/[a-z]{2}\/companies\/([\w-]+)/i],
  ['indeed', 'Indeed', 'emploi', /indeed\.[a-z.]+\/cmp\/([\w-]+)/i],
  ['malt', 'Malt', 'emploi', /malt\.fr\/profile\/([\w-]+)/i],
]
export const FAMILIES = { reseau: 'Réseaux sociaux', communaute: 'Communauté', messagerie: 'Messageries', app: 'Applications', avis: 'Avis', annuaire: 'Annuaires et cartes', reservation: 'Réservation', vente: 'Vente en ligne', contenu: 'Contenus', autorite: 'Autorité (Wikipédia, Wikidata)', emploi: 'Emploi' }
const BY_ID = Object.fromEntries(PLATFORMS.map(([id, label, family]) => [id, { id, label, family }]))
export const platformLabel = (id) => BY_ID[id]?.label || id

// Réseaux attendus selon l'activité (ceux qui comptent vraiment pour le secteur, dans l'ordre)
const EXPECTED = {
  local: ['google-avis', 'instagram', 'facebook'],
  b2b: ['linkedin', 'youtube', 'google-avis'],
  app: ['app-store', 'google-play', 'instagram', 'tiktok'],
  ecommerce: ['instagram', 'facebook', 'tiktok', 'pinterest', 'trustpilot'],
  default: ['linkedin', 'instagram', 'facebook', 'google-avis'],
}
export function expectedFor(sector = '', { local = false } = {}) {
  if (sector === 'app-mobile') return EXPECTED.app
  if (/^ecommerce/.test(sector) || sector === 'luxe') return EXPECTED.ecommerce
  if (['equipement-pro', 'saas', 'agence', 'finance', 'juridique', 'formation'].includes(sector)) return local ? [...EXPECTED.b2b, 'facebook'] : EXPECTED.b2b
  if (local) return EXPECTED.local
  return EXPECTED.default
}

const norm = (s) => String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]/g, '')

// Reconnaît une URL : { platform, handle } ou null
export function identify(href) {
  const u = String(href || '')
  for (const [id, , , re] of PLATFORMS) {
    const m = u.match(re)
    if (m) return { platform: id, handle: decodeURIComponent((m.slice(1).find(Boolean) || '').replace(/\/+$/, '')).slice(0, 80) }
  }
  return null
}

// Tous les sameAs des données structurées (Organization, LocalBusiness, Person…)
function sameAsOf(jsonLd = []) {
  const out = []
  const walk = (n) => {
    if (Array.isArray(n)) return n.forEach(walk)
    if (!n || typeof n !== 'object') return
    if (n.sameAs) out.push(...[].concat(n.sameAs).filter((x) => typeof x === 'string'))
    for (const k of Object.keys(n)) if (typeof n[k] === 'object') walk(n[k])
  }
  walk(jsonLd)
  return out
}

// Présence déclarée par le site. pages : [{ url, links: [{href, text}] }], page : la page d'accueil extraite
export function presenceFromSite({ page, pages = [], origin = '', sector = '', local = false, brand = '' } = {}) {
  const found = new Map() // platform → { platform, label, family, urls:Set, handles:Set, sources:Set, pages:Set }
  const note = (href, source, pageUrl) => {
    const id = identify(href)
    if (!id) return
    const meta = BY_ID[id.platform]
    const f = found.get(id.platform) || { platform: id.platform, label: meta.label, family: meta.family, urls: new Set(), handles: new Set(), sources: new Set(), pages: new Set() }
    f.urls.add(String(href).split('#')[0]); if (id.handle) f.handles.add(id.handle); f.sources.add(source); if (pageUrl) f.pages.add(pageUrl)
    found.set(id.platform, f)
  }
  if (page) {
    for (const l of page.links || []) note(l.href, 'lien', page.url)
    for (const s of sameAsOf(page.jsonLd)) note(s, 'sameAs', page.url)
    // Balises d'application : bannière iOS, lien Android déclaré, App Links
    const appleId = String(page.appleApp || '').match(/app-id=(\d+)/)?.[1]
    if (appleId) note(`https://apps.apple.com/app/id${appleId}`, 'balise', page.url)
    const playId = String(page.googlePlayApp || '').match(/app-id=([\w.]+)/)?.[1]
    if (playId) note(`https://play.google.com/store/apps/details?id=${playId}`, 'balise', page.url)
    for (const m of page.metas || []) {
      if (m.name === 'al:ios:app_store_id' && /^\d+$/.test(m.content)) note(`https://apps.apple.com/app/id${m.content}`, 'balise', page.url)
      if (m.name === 'al:android:package' && m.content) note(`https://play.google.com/store/apps/details?id=${m.content}`, 'balise', page.url)
      if (m.name === 'twitter:site' && /^@?\w{2,15}$/.test(m.content)) note(`https://x.com/${m.content.replace(/^@/, '')}`, 'balise', page.url)
    }
  }
  for (const pg of pages) for (const l of pg.links || []) note(l.href, 'lien', pg.url)

  const items = [...found.values()].map((f) => ({ ...f, urls: [...f.urls].slice(0, 3), handles: [...f.handles], sources: [...f.sources], pages: [...f.pages].slice(0, 3) }))
  items.sort((a, b) => Object.keys(FAMILIES).indexOf(a.family) - Object.keys(FAMILIES).indexOf(b.family))
  const has = new Set(items.map((i) => i.platform))
  const findings = []
  // 1. Réseaux attendus pour l'activité, absents du site
  const expected = expectedFor(sector, { local })
  const missing = expected.filter((id) => !has.has(id))
  for (const id of missing) findings.push({ level: 'manque', platform: id, text: `${platformLabel(id)} : aucun lien depuis le site.`, todo: id === 'google-avis' ? 'Ajoutez un lien « Avis Google » ou « Itinéraire » vers votre fiche (et créez-la si elle n’existe pas).' : `Si le compte existe, reliez-le depuis le pied de page et le sameAs ; sinon, c’est un canal attendu pour votre activité.` })
  // 2. Liens vers les profils, mais pas de sameAs (ou l'inverse)
  const social = items.filter((i) => ['reseau', 'autorite', 'app'].includes(i.family))
  const notInSameAs = social.filter((i) => !i.sources.includes('sameAs'))
  const sameAsOnly = items.filter((i) => i.sources.length === 1 && i.sources[0] === 'sameAs')
  if (social.length && notInSameAs.length) findings.push({ level: 'coherence', text: `${notInSameAs.length} profil${notInSameAs.length > 1 ? 's' : ''} relié${notInSameAs.length > 1 ? 's' : ''} depuis le site mais absent${notInSameAs.length > 1 ? 's' : ''} du sameAs : ${notInSameAs.map((i) => i.label).join(', ')}.`, todo: 'Ajoutez-les au « sameAs » de votre bloc Organization : c’est ce qui relie votre marque à ses profils pour Google et les IA.' })
  if (sameAsOnly.length) findings.push({ level: 'coherence', text: `Déclaré${sameAsOnly.length > 1 ? 's' : ''} dans le sameAs mais jamais relié${sameAsOnly.length > 1 ? 's' : ''} visiblement : ${sameAsOnly.map((i) => i.label).join(', ')}.`, todo: 'Ajoutez aussi un lien visible (pied de page) : les visiteurs ne lisent pas le sameAs.' })
  // 3. Plusieurs comptes pour une même plateforme, ou identifiants différents d'un réseau à l'autre
  for (const i of items.filter((x) => x.handles.length > 1 && x.family === 'reseau')) findings.push({ level: 'coherence', platform: i.platform, text: `${i.label} : ${i.handles.length} comptes différents liés (${i.handles.join(', ')}).`, todo: 'Gardez un seul compte officiel par réseau et redirigez les autres.' })
  const handles = items.filter((i) => i.family === 'reseau' && i.handles.length === 1 && i.platform !== 'linkedin-perso').map((i) => [i.label, i.handles[0]])
  const distinct = [...new Set(handles.map(([, h]) => norm(h)))]
  if (distinct.length > 1 && handles.length >= 3) findings.push({ level: 'info', text: `Identifiants différents selon les réseaux : ${handles.map(([l, h]) => `${l} @${h}`).join(' · ')}.`, todo: 'Un même identifiant partout aide les gens (et les IA) à vous retrouver. À harmoniser quand c’est possible.' })
  // 4. Liens de partage pris pour des profils (Facebook sharer exclu plus haut ; ici, un profil personnel à la place d'une page)
  if (has.has('linkedin-perso') && !has.has('linkedin')) findings.push({ level: 'info', platform: 'linkedin', text: 'LinkedIn : seul un profil personnel est relié, pas de page entreprise.', todo: 'Créez la page entreprise et reliez-la (c’est elle que Google associe à la marque).' })
  // Candidats à vérifier pour les réseaux attendus manquants : construits depuis le nom, jamais affirmés
  const slug = norm(brand) || norm(String(origin).replace(/^https?:\/\/(www\.)?/, '').split('.')[0])
  const CANDIDATE = { instagram: (s) => `https://www.instagram.com/${s}/`, facebook: (s) => `https://www.facebook.com/${s}`, linkedin: (s) => `https://www.linkedin.com/company/${s}/`, tiktok: (s) => `https://www.tiktok.com/@${s}`, youtube: (s) => `https://www.youtube.com/@${s}`, pinterest: (s) => `https://www.pinterest.fr/${s}/` }
  const candidates = slug ? missing.filter((id) => CANDIDATE[id]).map((id) => ({ platform: id, label: platformLabel(id), url: CANDIDATE[id](slug), search: `https://www.google.com/search?q=${encodeURIComponent(`"${brand || slug}" site:${new URL(CANDIDATE[id](slug)).hostname.replace(/^www\./, '')}`)}` })) : []
  // SIREN ou SIRET affiché sur le site (mentions légales) : à croiser avec le registre
  const txt = [page?.text || '', ...pages.map((x) => x.text || '')].join(' ')
  // Codes postaux lus sur le site (adresse du pied de page) : servent à reconnaître la bonne entreprise au registre
  const postcodes = [...new Set([...txt.matchAll(/\b((?:0[1-9]|[1-8]\d|9[0-8])\d{3})\s+[A-ZÉÈ][\p{L}'’ -]{2,}/gu)].map((m) => m[1]))].slice(0, 5)
  const sirenSeen = (txt.match(/(?:siren|siret|rcs)[^0-9]{0,40}(\d{3}\s?\d{3}\s?\d{3})/i) || [])[1]?.replace(/\s/g, '') || null
  // Bloc sameAs prêt à coller : les profils officiels trouvés (réseaux, applications, autorité), une adresse chacun
  const official = items.filter((i) => ['reseau', 'app', 'autorite', 'communaute', 'contenu'].includes(i.family) && i.platform !== 'linkedin-perso' && i.handles.length <= 1)
  const sameAsSnippet = official.length ? JSON.stringify({ '@context': 'https://schema.org', '@type': 'Organization', ...(brand ? { name: brand } : {}), ...(origin ? { url: origin + '/' } : {}), sameAs: official.map((i) => i.urls[0]) }, null, 2) : null
  return { items, findings, expected, missing, candidates, sirenSeen, postcodes, sameAsSnippet, counts: Object.fromEntries(Object.keys(FAMILIES).map((k) => [k, items.filter((i) => i.family === k).length]).filter(([, n]) => n)) }
}

// Recherche App Store (API publique iTunes Search) : applications au nom de la marque, et homonymes d'autres éditeurs.
export async function appStoreLookup(term, fetchJson, { country = 'fr' } = {}) {
  if (!term) return null
  const url = `https://itunes.apple.com/search?term=${encodeURIComponent(term)}&country=${country}&entity=software&limit=15`
  const j = await fetchJson(url).catch((e) => ({ error: String(e.message || e) }))
  if (!j || j.error || !Array.isArray(j.results)) return { error: j?.error || 'réponse illisible', url }
  const t = norm(term)
  const apps = j.results.map((a) => ({ id: a.trackId, name: a.trackName, seller: a.sellerName || a.artistName, url: a.trackViewUrl, rating: a.averageUserRating ?? null, ratings: a.userRatingCount ?? 0, version: a.version, updated: a.currentVersionReleaseDate, languages: a.languageCodesISO2A || [], genre: a.primaryGenreName }))
  const sameName = apps.filter((a) => norm(a.name).startsWith(t) || norm(a.name).includes(t))
  return { url, apps: sameName.slice(0, 8), homonyms: [...new Set(sameName.map((a) => a.seller))].length > 1 }
}

// Registre des entreprises (API publique recherche-entreprises.api.gouv.fr, sans clé) : SIREN, activité, création, siège.
export async function registryLookup(term, fetchJson, { siren = null } = {}) {
  if (siren && /^\d{9}$/.test(siren)) term = siren // le SIREN lu sur le site est plus sûr que le nom
  if (!term) return null
  const url = `https://recherche-entreprises.api.gouv.fr/search?q=${encodeURIComponent(term)}&per_page=5`
  const j = await fetchJson(url).catch((e) => ({ error: String(e.message || e) }))
  if (!j || j.error || !Array.isArray(j.results)) return { error: j?.error || 'réponse illisible', url }
  return {
    url,
    results: j.results.map((r) => ({
      siren: r.siren, name: r.nom_complet || r.nom_raison_sociale, naf: r.activite_principale, nafLabel: r.libelle_activite_principale || '', created: r.date_creation, active: r.etat_administratif === 'A',
      city: r.siege?.libelle_commune || '', postcode: r.siege?.code_postal || '', employees: r.tranche_effectif_salarie || null, category: r.categorie_entreprise || '',
      leaders: (r.dirigeants || []).filter((d) => d.type_dirigeant === 'personne morale' || d.qualite).slice(0, 3).map((d) => ({ name: d.denomination || [d.prenoms, d.nom].filter(Boolean).join(' '), role: d.qualite || '' })),
      annuaire: r.siren ? `https://annuaire-entreprises.data.gouv.fr/entreprise/${r.siren}` : '',
    })),
  }
}

// Matrice de présence : vous et vos concurrents, plateforme par plateforme
export function presenceMatrix(rows) {
  const ids = [...new Set(rows.flatMap((r) => r.items.map((i) => i.platform)))]
  ids.sort((a, b) => Object.keys(FAMILIES).indexOf(BY_ID[a]?.family) - Object.keys(FAMILIES).indexOf(BY_ID[b]?.family) || rows.filter((r) => !r.items.some((i) => i.platform === b)).length - rows.filter((r) => !r.items.some((i) => i.platform === a)).length)
  return {
    platforms: ids.map((id) => ({ id, label: platformLabel(id), family: BY_ID[id]?.family })),
    rows: rows.map((r) => ({ name: r.name, me: !!r.me, cells: ids.map((id) => r.items.find((i) => i.platform === id)?.urls?.[0] || null), total: r.items.length })),
    // Là où au moins la moitié des concurrents (et au moins 2) sont présents et vous non : le rattrapage prioritaire
    gaps: ids.filter((id) => { const me = rows.find((r) => r.me), others = rows.filter((r) => !r.me && !r.error); return me && others.length && !me.items.some((i) => i.platform === id) && others.filter((r) => r.items.some((i) => i.platform === id)).length >= (others.length === 1 ? 1 : Math.max(2, Math.ceil(others.length / 2))) }).map(platformLabel),
  }
}

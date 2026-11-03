// ASO : audit d'une fiche App Store (API iTunes Lookup, JSONP/CORS) ; Google Play via HTML (proxy ou CLI).
import { scoreFindings, finding as f } from './audit.js'
import { extract } from './html.js'

export const ASO_CATS = {
  metadonnees: { label: 'Titre, sous-titre & mots-clés', weight: 0.35 },
  visuels: { label: 'Icône, captures & vidéo', weight: 0.2 },
  avis: { label: 'Notes & avis', weight: 0.25 },
  fraicheur: { label: 'Mises à jour & localisation', weight: 0.2 },
}

export function parseStoreUrl(u) {
  u = String(u || '')
  const ios = u.match(/apps\.apple\.com\/(?:([a-z]{2})\/)?app\/(?:[^/]+\/)?id(\d+)/i) || u.match(/^id?(\d{6,})$/)
  if (ios) return { store: 'ios', country: ios[2] ? (ios[1] || 'fr') : 'fr', id: ios[2] || ios[1] }
  const gp = u.match(/play\.google\.com\/store\/apps\/details\?(?:.*&)?id=([\w.]+)/i)
  if (gp) return { store: 'android', id: gp[1] }
  if (/^[a-z][\w]*(\.[\w]+)+$/i.test(u)) return { store: 'android', id: u }
  return null
}

export async function lookupIOS(id, country = 'fr', { fetchImpl } = {}) {
  const url = `https://itunes.apple.com/lookup?id=${id}&country=${country}&lang=fr_fr`
  if (fetchImpl) { const r = await fetchImpl(url); const j = await r.json(); return j.results?.[0] || null }
  return new Promise((resolve) => {
    const cb = '__it' + Math.random().toString(36).slice(2), s = document.createElement('script')
    const done = (v) => { delete window[cb]; s.remove(); resolve(v) }
    window[cb] = (j) => done(j?.results?.[0] || null)
    s.src = url + '&callback=' + cb; s.onerror = () => done(null); setTimeout(() => done(null), 8000)
    document.head.appendChild(s)
  })
}

export function auditIOS(a, { keyword = '' } = {}) {
  const F = [], add = (...x) => F.push(f(...x))
  const name = a.trackName || ''
  if (name.length > 30) add('metadonnees', 'moyen', 'name', `Nom de plus de 30 caractères (${name.length})`, name, 'Limite App Store : 30 caractères. Format : Marque – mot-clé principal.')
  else if (name.length < 15) add('metadonnees', 'moyen', 'name-short', `Nom court (${name.length}/30) : place perdue pour un mot-clé`, name, 'Ajoutez le mot-clé le plus recherché : « Marque – Recettes faciles ».')
  else add('metadonnees', 'ok', 'name', `Nom : ${name} (${name.length}/30)`)
  if (keyword && !name.toLowerCase().includes(keyword.toLowerCase())) add('metadonnees', 'important', 'name-kw', `Mot-clé « ${keyword} » absent du nom`, 'Le nom est le champ le plus pondéré de l’algorithme App Store.', 'Intégrez-le au nom ou, à défaut, au sous-titre.')
  add('metadonnees', 'info', 'subtitle', 'À vérifier dans App Store Connect : sous-titre (30 car.) et champ mots-clés (100 car.)', 'Non exposés par l’API publique.', 'Mots-clés séparés par des virgules sans espaces, sans répéter ceux du nom, au singulier.')
  const desc = a.description || ''
  if (desc.length < 1000) add('metadonnees', 'faible', 'desc', `Description courte (${desc.length} car.)`, 'Peu indexée sur iOS, mais elle convertit : les 3 premières lignes sont visibles.', 'Accroche + bénéfices en liste + preuves (notes, presse) + appel à l’action.')
  const shots = (a.screenshotUrls || []).length, ipad = (a.ipadScreenshotUrls || []).length
  if (shots < 5) add('visuels', 'important', 'screens', `${shots} capture(s) iPhone`, 'Jusqu’à 10 captures ; les 3 premières décident du téléchargement.', 'Utilisez 6–10 captures avec un bénéfice écrit en gros sur chacune.')
  else add('visuels', 'ok', 'screens', `${shots} captures iPhone`)
  if (a.supportedDevices?.some((d) => /ipad/i.test(d)) && !ipad) add('visuels', 'faible', 'ipad', 'Compatible iPad sans captures iPad', '', 'Ajoutez des captures iPad.')
  add('visuels', 'info', 'preview', 'Vidéo d’aperçu (App Preview) à vérifier', '', '15–30 s, démarre sur le bénéfice, lisible sans son.')
  const rating = a.averageUserRating, count = a.userRatingCount || 0
  if (!count) add('avis', 'important', 'ratings', 'Aucune note dans ce pays', '', 'Déclenchez SKStoreReviewController après un moment positif (jamais au lancement).')
  else {
    if (rating < 4) add('avis', 'critique', 'rating', `Note moyenne ${rating.toFixed(1)}/5`, 'Sous 4, le taux de conversion chute fortement.', 'Corrigez les irritants cités dans les avis, répondez à chaque avis négatif, relancez la demande d’avis.')
    else if (rating < 4.5) add('avis', 'moyen', 'rating', `Note ${rating.toFixed(1)}/5`, '', 'Objectif ≥ 4,5 : répondez aux avis et demandez la note au bon moment.')
    else add('avis', 'ok', 'rating', `Note ${rating.toFixed(1)}/5`)
    if (count < 100) add('avis', 'moyen', 'count', `Seulement ${count} notes`, '', 'Le volume d’avis pèse dans le classement : visez 100+ puis 1 000+.')
  }
  const days = (Date.now() - new Date(a.currentVersionReleaseDate || a.releaseDate).getTime()) / 864e5
  if (days > 120) add('fraicheur', 'moyen', 'update', `Dernière mise à jour il y a ${Math.round(days)} jours`, '', 'Une mise à jour toutes les 4–6 semaines (notes de version soignées) entretient le classement.')
  else add('fraicheur', 'ok', 'update', 'Mise à jour récente')
  const langs = a.languageCodesISO2A || []
  if (langs.length < 2) add('fraicheur', 'moyen', 'langs', `${langs.length} langue(s)`, langs.join(', '), 'Localisez au minimum la fiche (nom, sous-titre, mots-clés, captures) : chaque langue = un nouveau champ mots-clés.')
  if (!a.releaseNotes || a.releaseNotes.length < 40) add('fraicheur', 'faible', 'notes', 'Notes de version vides ou génériques', '', 'Décrivez les nouveautés en bénéfices utilisateurs.')
  add('fraicheur', 'info', 'events', 'In-App Events & Custom Product Pages', '', 'Créez des événements in-app (visibles en recherche) et des pages produit personnalisées par mot-clé / campagne Apple Search Ads.')
  return scoreFindings(F, ASO_CATS, { name, rating, count, genre: a.primaryGenreName, price: a.formattedPrice, seller: a.sellerName, icon: a.artworkUrl100, url: a.trackViewUrl, version: a.version, size: a.fileSizeBytes })
}

export function auditPlayHtml(html, { keyword = '' } = {}) {
  const p = extract(html, 'https://play.google.com/')
  const F = [], add = (...x) => F.push(f(...x))
  const title = (p.og.title || p.title || '').replace(/ - (Apps on Google Play|Applications sur Google Play)$/i, '')
  if (!title) return { error: 'Fiche Google Play illisible' }
  if (title.length > 30) add('metadonnees', 'moyen', 'title', `Titre de plus de 30 caractères (${title.length})`, title, 'Limite Google Play : 30 caractères.')
  else add('metadonnees', 'ok', 'title', `Titre : ${title} (${title.length}/30)`)
  if (keyword && !title.toLowerCase().includes(keyword.toLowerCase())) add('metadonnees', 'important', 'title-kw', `Mot-clé « ${keyword} » absent du titre`, '', 'Le titre est le champ le plus pondéré sur Google Play.')
  const short = p.metaDescription || ''
  add('metadonnees', 'info', 'short', 'Description courte (80 car.) et longue (4 000 car.)', short.slice(0, 120), 'Sur Google Play, la description longue EST indexée : répétez naturellement les 3–5 mots-clés (pas de bourrage).')
  const rating = +(html.match(/"ratingValue"\s*:\s*"?([\d.]+)/)?.[1] || 0), count = +(html.match(/"ratingCount"\s*:\s*"?(\d+)/)?.[1] || 0)
  if (rating && rating < 4) add('avis', 'critique', 'rating', `Note ${rating.toFixed(1)}/5`, '', 'Utilisez l’API In-App Review au bon moment et répondez aux avis.')
  else if (rating) add('avis', rating < 4.5 ? 'moyen' : 'ok', 'rating', `Note ${rating.toFixed(1)}/5 (${count} avis)`)
  add('visuels', 'info', 'graphics', 'Graphique de présentation 1024×500, 4–8 captures, vidéo YouTube', '', 'Testez les visuels via les expériences de fiche (Play Console).')
  add('fraicheur', 'info', 'vitals', 'Android Vitals (plantages, ANR) pèsent dans le classement', '', 'Taux de plantage < 1,09 % et ANR < 0,47 % (seuils Google).')
  return scoreFindings(F, ASO_CATS, { name: title, rating, count })
}

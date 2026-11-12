// Contrôle d'une fiche App Store ou Google Play avant publication : longueurs officielles, mots interdits dans les
// titres, marques d'autrui, règles des mots-clés Apple. Repris du chantier RaceLink (kit-stores/check_limites.py) :
// les mots-clés Apple se comptent en OCTETS UTF-8 (une lettre accentuée en vaut 2), pas en caractères.
export const LIMITES = {
  apple: { nom: 30, 'sous-titre': 30, 'mots-cles': 100, 'texte-promo': 170, description: 4000 },
  play: { titre: 30, 'description-courte': 80, 'description-longue': 4000 },
}
const OCTETS = new Set(['mots-cles'])
const TITRES = new Set(['nom', 'sous-titre', 'titre', 'description-courte'])
const INTERDITS = [[/\bgratuite?s?\b/, '« gratuit »'], [/\bn\s*[°º]\s*1\b|#\s*1\b|\bnumero\s*1\b/, '« n°1 »'], [/\bmeilleure?s?\b/, '« meilleur »'], [/\bpromo\b/, '« promo »'], [/%/, '« % »']]
const fold = (s) => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
const words = (s) => new Set(fold(s).split(/[^a-z0-9]+/).filter(Boolean))
const hasEmoji = (s) => /[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{2B00}-\u{2BFF}\u{FE0F}\u{200D}]/u.test(String(s || ''))
const bytes = (s) => new TextEncoder().encode(String(s || '')).length
const chars = (s) => [...String(s || '')].length

// champs : { nom, 'sous-titre', 'mots-cles', … } ; marques : marques d'autrui à ne pas utiliser ; motCle : mot-clé principal (Play)
export function checkListing(store, champs, { marques = [], motCle = '' } = {}) {
  const limites = LIMITES[store]
  if (!limites) throw new Error('Store inconnu : apple ou play')
  const lines = [], add = (level, field, msg) => lines.push({ level, field, msg })
  const brandRes = marques.map((m) => String(m).trim()).filter(Boolean).map((m) => [new RegExp(`\\b${fold(m).replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/\s+/g, '\\s*')}\\b`), m])
  for (const [champ, limite] of Object.entries(limites)) {
    const texte = champs[champ]
    if (texte == null) continue
    const enOctets = OCTETS.has(champ), n = enOctets ? bytes(texte) : chars(texte), unite = enOctets ? 'octets' : 'caractères'
    if (!n) add('erreur', champ, `vide (limite ${limite} ${unite})`)
    else if (n > limite) add('erreur', champ, `${n} / ${limite} ${unite} : dépasse de ${n - limite}`)
    else { add('ok', champ, `${n} / ${limite} ${unite}`); if (n < limite * 0.6 && TITRES.has(champ)) add('alerte', champ, `place perdue : ${limite - n} ${unite} libres, c’est là que se joue la recherche (visez plus de 80 % de la limite)`) }
    const bas = fold(texte)
    if (TITRES.has(champ) || enOctets) {
      for (const [re, label] of INTERDITS) if (re.test(bas)) add('erreur', champ, `${label} est refusé dans un titre ou des mots-clés`)
      if (hasEmoji(texte)) add('erreur', champ, 'emoji interdit dans un titre')
      for (const m of String(texte).match(/(?<![\p{L}])[A-ZÀ-Ý]{4,}(?![\p{L}])/gu) || []) add('alerte', champ, `mot tout en majuscules « ${m} »`)
      for (const [re, m] of brandRes) if (re.test(bas)) add('erreur', champ, `marque d’autrui « ${m} » : motif de refus`)
    } else {
      for (const [re, m] of brandRes) if (re.test(bas)) add('alerte', champ, `marque d’autrui « ${m} » citée : à éviter`)
      if (hasEmoji(texte)) add('alerte', champ, 'contient un emoji')
    }
  }
  if (store === 'apple' && champs['mots-cles'] != null) {
    const kw = String(champs['mots-cles'])
    if (/,\s|\s,/.test(kw)) add('erreur', 'mots-cles', 'espace autour d’une virgule : chaque espace coûte un octet pour rien')
    const terms = kw.split(',').map((t) => t.trim()).filter(Boolean), seen = new Set()
    const taken = new Set([...words(champs.nom), ...words(champs['sous-titre'])])
    for (const t of terms) {
      const f = fold(t)
      if (seen.has(f)) add('erreur', 'mots-cles', `doublon « ${t} »`)
      seen.add(f)
      if ([...f].length <= 2) add('alerte', 'mots-cles', `terme très court « ${t} »`)
      for (const w of words(t)) if (taken.has(w) && w.length > 2) add('erreur', 'mots-cles', `« ${w} » est déjà dans le nom ou le sous-titre : Apple l’indexe une seule fois, place perdue`)
    }
  }
  if (store === 'apple' && champs.nom != null && champs['sous-titre'] != null) {
    const dup = [...words(champs['sous-titre'])].filter((w) => w.length > 3 && words(champs.nom).has(w))
    if (dup.length) add('alerte', 'sous-titre', `répète le nom (${dup.join(', ')}) : mettez-y des mots nouveaux`)
  }
  if (store === 'play') {
    const titre = words(champs.titre), court = words(champs['description-courte'])
    const dup = [...court].filter((w) => w.length > 3 && titre.has(w))
    if (dup.length) add('alerte', 'description-courte', `répète le titre (${dup.join(', ')}) : mettez-y des mots nouveaux`)
    if (motCle && champs['description-longue'] != null && !fold([...String(champs['description-longue'])].slice(0, 167).join('')).includes(fold(motCle))) add('alerte', 'description-longue', `« ${motCle} » absent des 167 premiers caractères (ceux que Google Play pèse le plus)`)
  }
  return { store, lines, errors: lines.filter((l) => l.level === 'erreur').length, warnings: lines.filter((l) => l.level === 'alerte').length }
}

export function listingText({ store, lines, errors, warnings }) {
  const tag = { ok: 'OK     ', erreur: 'ERREUR ', alerte: 'ALERTE ' }
  return [`Fiche ${store === 'apple' ? 'App Store' : 'Google Play'}`, ...lines.map((l) => `  ${tag[l.level]} ${l.field.padEnd(19)} ${l.msg}`), errors ? `→ ${errors} erreur(s) à corriger avant d’envoyer${warnings ? `, ${warnings} alerte(s)` : ''}.` : warnings ? `→ Aucune erreur, ${warnings} alerte(s) à relire.` : '→ Tout passe.'].join('\n')
}

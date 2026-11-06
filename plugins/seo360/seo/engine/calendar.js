// Calendrier marketing français : dates CALCULÉES pour une année, jamais écrites de mémoire.
// Fêtes mobiles (comput grégorien), fêtes commerciales, soldes (règle nationale, arrêté du 27 mai 2019 : 2e mercredi de janvier,
// avancé au 1er si le 2e tombe après le 12 ; dernier mercredi de juin, avancé à l'avant-dernier s'il tombe après le 28 ; 4 semaines),
// jours fériés (et Alsace-Moselle), ponts, temps forts par secteur, et rétroplanning : contenu J-30, pub J-14, posts J-7,
// horaires exceptionnels de la fiche Google J-7 avant chaque jour férié.

const D = (y, m, d) => new Date(Date.UTC(y, m - 1, d))
const iso = (dt) => dt.toISOString().slice(0, 10)
const add = (dt, n) => new Date(dt.getTime() + n * 86400000)
const dow = (dt) => dt.getUTCDay() // 0 = dimanche
const JOURS = ['dim.', 'lun.', 'mar.', 'mer.', 'jeu.', 'ven.', 'sam.']
const MOIS = ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.']
export const frShort = (s) => { const dt = new Date(s + 'T00:00:00Z'); return `${JOURS[dow(dt)]} ${dt.getUTCDate()} ${MOIS[dt.getUTCMonth()]}` }

// Pâques : algorithme de Meeus/Jones/Butcher (calendrier grégorien)
export function easter(y) {
  const a = y % 19, b = Math.floor(y / 100), c = y % 100, d = Math.floor(b / 4), e = b % 4, f = Math.floor((b + 8) / 25), g = Math.floor((b - f + 1) / 3)
  const h = (19 * a + b - d - g + 15) % 30, i = Math.floor(c / 4), k = c % 4, l = (32 + 2 * e + 2 * i - h - k) % 7, m = Math.floor((a + 11 * h + 22 * l) / 451)
  const month = Math.floor((h + l - 7 * m + 114) / 31), day = ((h + l - 7 * m + 114) % 31) + 1
  return D(y, month, day)
}
// n-ième jour de la semaine d'un mois (n = -1 : le dernier)
export function nthWeekday(y, m, wd, n) {
  if (n > 0) { const first = D(y, m, 1); return add(first, ((wd - dow(first) + 7) % 7) + (n - 1) * 7) }
  const last = D(y, m + 1, 0); return add(last, -((dow(last) - wd + 7) % 7))
}

export function soldes(y) {
  let hiver = nthWeekday(y, 1, 3, 2)
  if (hiver.getUTCDate() > 12) hiver = nthWeekday(y, 1, 3, 1)
  let ete = nthWeekday(y, 6, 3, -1)
  if (ete.getUTCDate() > 28) ete = add(ete, -7)
  return { hiver: { start: iso(hiver), end: iso(add(hiver, 27)) }, ete: { start: iso(ete), end: iso(add(ete, 27)) } }
}

export function feries(y, { alsace = false } = {}) {
  const p = easter(y)
  const list = [
    [D(y, 1, 1), 'Jour de l’an'], [add(p, 1), 'Lundi de Pâques'], [D(y, 5, 1), 'Fête du Travail'], [D(y, 5, 8), 'Victoire 1945'],
    [add(p, 39), 'Ascension'], [add(p, 50), 'Lundi de Pentecôte'], [D(y, 7, 14), 'Fête nationale'], [D(y, 8, 15), 'Assomption'],
    [D(y, 11, 1), 'Toussaint'], [D(y, 11, 11), 'Armistice 1918'], [D(y, 12, 25), 'Noël'],
  ]
  if (alsace) list.push([add(p, -2), 'Vendredi saint (Alsace-Moselle)'], [D(y, 12, 26), 'Saint-Étienne (Alsace-Moselle)'])
  return list.map(([dt, label]) => {
    const w = dow(dt), pont = w === 2 ? iso(add(dt, -1)) : w === 4 ? iso(add(dt, 1)) : null
    return { date: iso(dt), label, pont, note: label === 'Lundi de Pentecôte' ? 'Souvent journée de solidarité : ouverture variable selon les entreprises.' : '' }
  }).sort((a, b) => (a.date < b.date ? -1 : 1))
}

// Temps forts commerciaux et secteurs concernés ('*' = tous)
const ALL = '*'
function moments(y) {
  const p = easter(y), pentecote = add(p, 49)
  let meres = nthWeekday(y, 5, 0, -1)
  if (iso(meres) === iso(pentecote)) meres = nthWeekday(y, 6, 0, 1)
  const thanks = nthWeekday(y, 11, 4, 4), s = soldes(y)
  const epiphanie = (() => { for (let d = 2; d <= 8; d++) if (dow(D(y, 1, d)) === 0) return D(y, 1, d) })()
  return [
    { date: iso(epiphanie), label: 'Épiphanie (galette des rois tout janvier)', sectors: ['boulangerie', 'restaurant'] },
    { date: s.hiver.start, end: s.hiver.end, label: 'Soldes d’hiver', sectors: ['ecommerce-mode', 'ecommerce', 'maison-deco', 'luxe', 'beaute', 'sport', 'gaming'], verifier: 'Dates officielles et dérogations départementales : economie.gouv.fr' },
    { date: iso(D(y, 1, 15)), label: 'Bonnes résolutions (mi-janvier)', sectors: ['sport', 'formation', 'app-mobile', 'sante'], approx: true },
    { date: iso(D(y, 2, 2)), label: 'Chandeleur', sectors: ['boulangerie', 'restaurant'] },
    { date: iso(D(y, 2, 14)), label: 'Saint-Valentin', sectors: ['restaurant', 'boulangerie', 'beaute', 'luxe', 'ecommerce', 'ecommerce-mode', 'evenementiel', 'tourisme'] },
    { date: iso(add(p, -47)), label: 'Mardi gras', sectors: ['boulangerie', 'restaurant'] },
    { date: iso(nthWeekday(y, 3, 0, 1)), label: 'Fête des grands-mères', sectors: ['boulangerie', 'beaute', 'ecommerce', 'luxe'] },
    { date: iso(D(y, 3, 20)), label: 'Printemps : travaux, jardin, immobilier', sectors: ['btp', 'services-domicile', 'immobilier', 'maison-deco', 'auto'], approx: true },
    { date: iso(p), label: 'Pâques', sectors: ['boulangerie', 'restaurant', 'ecommerce', 'tourisme', 'luxe'] },
    { date: iso(D(y, 5, 1)), label: 'Muguet du 1er mai', sectors: ['ecommerce', 'autre'] },
    { date: iso(meres), label: 'Fête des mères', sectors: ['restaurant', 'boulangerie', 'beaute', 'luxe', 'ecommerce', 'ecommerce-mode', 'maison-deco', 'evenementiel'] },
    { date: iso(nthWeekday(y, 6, 0, 3)), label: 'Fête des pères', sectors: ['restaurant', 'luxe', 'ecommerce', 'ecommerce-mode', 'sport', 'gaming', 'auto'] },
    { date: iso(D(y, 6, 21)), label: 'Fête de la musique', sectors: ['restaurant', 'culture', 'evenementiel'] },
    { date: s.ete.start, end: s.ete.end, label: 'Soldes d’été', sectors: ['ecommerce-mode', 'ecommerce', 'maison-deco', 'luxe', 'beaute', 'sport', 'gaming'], verifier: 'Dates officielles et dérogations départementales : economie.gouv.fr' },
    { date: iso(D(y, 7, 5)), label: 'Départs en vacances d’été', sectors: ['tourisme', 'auto', 'animaux', 'restaurant'], approx: true },
    { date: iso(D(y, 9, 1)), label: 'Rentrée', sectors: ['formation', 'sport', 'saas', 'agence', 'equipement-pro', 'ecommerce', 'ecommerce-mode', 'association', 'culture', 'services-domicile', 'sante', 'dentaire', 'app-mobile'], approx: true, verifier: 'Date officielle par zone : education.gouv.fr' },
    { date: iso(D(y, 10, 15)), label: 'Avant l’hiver : chauffage, isolation, pneus', sectors: ['btp', 'services-domicile', 'auto'], approx: true },
    { date: iso(D(y, 10, 31)), label: 'Halloween', sectors: ['boulangerie', 'restaurant', 'ecommerce', 'culture', 'gaming'] },
    { date: iso(nthWeekday(y, 11, 4, 3)), label: 'Beaujolais nouveau', sectors: ['restaurant'] },
    { date: iso(add(thanks, 1)), label: 'Black Friday', sectors: ['ecommerce', 'ecommerce-mode', 'maison-deco', 'gaming', 'beaute', 'app-mobile', 'saas', 'luxe', 'sport'] },
    { date: iso(add(thanks, 4)), label: 'Cyber Monday', sectors: ['ecommerce', 'ecommerce-mode', 'gaming', 'saas', 'app-mobile'] },
    { date: iso(add(thanks, 5)), label: 'Giving Tuesday', sectors: ['association'] },
    { date: iso(D(y, 12, 6)), label: 'Saint-Nicolas (Est et Nord)', sectors: ['boulangerie'] },
    { date: iso(D(y, 12, 15)), label: 'Fin d’exercice et budgets restants', sectors: ['saas', 'agence', 'equipement-pro', 'juridique', 'finance', 'association'], approx: true },
    { date: iso(D(y, 12, 25)), label: 'Noël', sectors: [ALL] },
    { date: iso(D(y, 12, 31)), label: 'Réveillon de la Saint-Sylvestre', sectors: ['restaurant', 'boulangerie', 'evenementiel', 'tourisme'] },
  ]
}
const forSector = (m, sector) => !sector || sector === 'autre' ? m.sectors.includes(ALL) || ['Soldes d’hiver', 'Fête des mères', 'Rentrée', 'Black Friday', 'Soldes d’été'].includes(m.label) : m.sectors.includes(ALL) || m.sectors.includes(sector)

// Actions de préparation d'un temps fort (une ligne = une action datée)
function actionsFor(m) {
  const t = new Date(m.date + 'T00:00:00Z'), tag = `${m.label} (${frShort(m.date)})`
  const note = [m.approx ? 'date indicative' : '', m.verifier ? 'à vérifier : ' + m.verifier : ''].filter(Boolean).join(' ; ')
  return [
    { date: iso(add(t, -30)), j: 'J-30', canal: 'site', action: 'Page ou contenu saisonnier en ligne (même URL que l’an passé, mise à jour)' },
    { date: iso(add(t, -14)), j: 'J-14', canal: 'Google Ads', action: 'Lancer la campagne saisonnière (budget et annonces prêts)' },
    { date: iso(add(t, -7)), j: 'J-7', canal: 'Instagram', action: 'Série de posts et Stories' },
  ].map((a) => ({ ...a, temps_fort: tag, notes: [a.j, note].filter(Boolean).join(' ; '), uid: `${m.date.slice(0, 4)}-${slug(m.label)}-${slug(a.j)}` }))
}
const slug = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

export function calendar(year, { sector = '', alsace = false } = {}) {
  const y = +year || new Date().getFullYear()
  const fer = feries(y, { alsace })
  const tf = moments(y).filter((m) => forSector(m, sector)).sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0))
  const actions = []
  for (const m of tf) actions.push(...actionsFor(m))
  for (const f of fer) {
    const t = new Date(f.date + 'T00:00:00Z')
    actions.push({ date: iso(add(t, -7)), j: 'J-7', canal: 'Fiche Google', action: 'Horaires exceptionnels', temps_fort: `${f.label}${f.pont ? ' et pont' : ''} (${frShort(f.date)})`, notes: 'J-7', uid: `${y}-${slug(f.label)}-horaires` })
  }
  actions.sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0))
  return { year: y, sector, alsace, feries: fer, tempsForts: tf, actions, soldes: soldes(y) }
}

// Les prochains jours (pour l'interface) : temps forts et fériés des N jours à venir, sur deux années si besoin
export function upcoming(from = new Date(), { days = 90, sector = '', alsace = false } = {}) {
  const start = iso(from), stop = iso(add(new Date(start + 'T00:00:00Z'), days)), y = +start.slice(0, 4)
  const out = []
  for (const yy of [y, y + 1]) {
    const c = calendar(yy, { sector, alsace })
    for (const m of c.tempsForts) if (m.date >= start && m.date <= stop) out.push({ ...m, kind: 'temps-fort', prep: actionsFor(m).filter((a) => a.date >= start) })
    for (const f of c.feries) {
      if (f.date < start || f.date > stop) continue
      const same = out.find((o) => o.date === f.date && o.label === f.label)
      if (same) same.ferie = true; else out.push({ ...f, kind: 'ferie', ferie: true })
    }
  }
  return out.sort((a, b) => (a.date < b.date ? -1 : 1))
}

export function calendarCsv(c) {
  const esc = (v) => (/[;"\n]/.test(v) ? `"${String(v).replace(/"/g, '""')}"` : v)
  return '﻿' + ['date;temps_fort;action;canal;responsable;statut;notes', ...c.actions.map((a) => [a.date, a.temps_fort, a.action, a.canal, 'Vous', 'à faire', a.notes].map(esc).join(';'))].join('\r\n') + '\r\n'
}
export function calendarIcs(c, { stamp = new Date() } = {}) {
  const e = (s) => String(s).replace(/\\/g, '\\\\').replace(/([,;])/g, '\\$1').replace(/\n/g, '\\n')
  const ds = stamp.toISOString().replace(/[-:]/g, '').replace(/\.\d+Z$/, 'Z')
  const L = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//SEO 360//Calendrier marketing//FR', 'CALSCALE:GREGORIAN']
  for (const a of c.actions) {
    const d0 = a.date.replace(/-/g, ''), d1 = iso(add(new Date(a.date + 'T00:00:00Z'), 1)).replace(/-/g, '')
    L.push('BEGIN:VEVENT', `UID:${a.uid}@calendrier-seo360`, `DTSTAMP:${ds}`, `DTSTART;VALUE=DATE:${d0}`, `DTEND;VALUE=DATE:${d1}`, `SUMMARY:${e(`${a.j} ${a.temps_fort} : ${a.action}`)}`, `DESCRIPTION:${e(`${a.canal} — ${a.notes}`)}`, 'END:VEVENT')
  }
  L.push('END:VCALENDAR')
  return L.join('\r\n') + '\r\n'
}
export function calendarMarkdown(c) {
  const L = [`# Calendrier marketing ${c.year}${c.sector ? ' — ' + c.sector : ''}`, '', 'Dates calculées (fêtes mobiles, soldes selon la règle nationale). Les dates marquées « à vérifier » dépendent d’une décision locale ou annuelle.', '']
  L.push('## Temps forts', '', '| Date | Temps fort | Préparer |', '|---|---|---|', ...c.tempsForts.map((m) => `| ${frShort(m.date)}${m.end ? ' → ' + frShort(m.end) : ''} | ${m.label}${m.approx ? ' (indicatif)' : ''}${m.verifier ? ' — à vérifier : ' + m.verifier : ''} | contenu ${frShort(iso(add(new Date(m.date + 'T00:00:00Z'), -30)))}, pub ${frShort(iso(add(new Date(m.date + 'T00:00:00Z'), -14)))}, posts ${frShort(iso(add(new Date(m.date + 'T00:00:00Z'), -7)))} |`), '')
  L.push('## Jours fériés et ponts', '', ...c.feries.map((f) => `- ${frShort(f.date)} : ${f.label}${f.pont ? ` — pont probable le ${frShort(f.pont)}` : ''}${f.note ? ' — ' + f.note : ''} (horaires de la fiche Google à mettre à jour avant)`), '')
  return L.join('\n')
}

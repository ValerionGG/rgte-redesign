// Génère les exports Search Console de test (données fictives) : node seo/test/fixtures/make-gsc-fixtures.mjs
// - gsc-complet.zip   : export « Performances » complet (Requêtes, Pages, Pays, Appareils, Dates, Filtres), 90 jours
//                       avec une chute de clics le 28/09/2026 à positions et impressions stables
// - gsc-precedent.zip : la période précédente (Requêtes, Pages)
// - liens.zip         : exports du rapport « Liens » (sites, pages les plus liées, textes d'ancre)
import { writeFileSync } from 'node:fs'
import { deflateRawSync } from 'node:zlib'

const CRC = Array.from({ length: 256 }, (_, n) => { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; return c >>> 0 })
const crc32 = (buf) => { let c = 0xffffffff; for (const b of buf) c = CRC[(c ^ b) & 0xff] ^ (c >>> 8); return (c ^ 0xffffffff) >>> 0 }
export function zip(files) {
  const parts = [], central = []
  let offset = 0
  for (const [name, text] of Object.entries(files)) {
    const raw = Buffer.from('﻿' + text, 'utf8'), data = deflateRawSync(raw), nameB = Buffer.from(name, 'utf8'), crc = crc32(raw)
    const local = Buffer.alloc(30); local.writeUInt32LE(0x04034b50, 0); local.writeUInt16LE(20, 4); local.writeUInt16LE(0x0800, 6); local.writeUInt16LE(8, 8)
    local.writeUInt32LE(crc, 14); local.writeUInt32LE(data.length, 18); local.writeUInt32LE(raw.length, 22); local.writeUInt16LE(nameB.length, 26)
    const cen = Buffer.alloc(46); cen.writeUInt32LE(0x02014b50, 0); cen.writeUInt16LE(20, 4); cen.writeUInt16LE(20, 6); cen.writeUInt16LE(0x0800, 8); cen.writeUInt16LE(8, 10)
    cen.writeUInt32LE(crc, 16); cen.writeUInt32LE(data.length, 20); cen.writeUInt32LE(raw.length, 24); cen.writeUInt16LE(nameB.length, 28); cen.writeUInt32LE(offset, 42)
    parts.push(local, nameB, data); central.push(cen, nameB)
    offset += 30 + nameB.length + data.length
  }
  const cd = Buffer.concat(central), end = Buffer.alloc(22)
  end.writeUInt32LE(0x06054b50, 0); end.writeUInt16LE(Object.keys(files).length, 8); end.writeUInt16LE(Object.keys(files).length, 10); end.writeUInt32LE(cd.length, 12); end.writeUInt32LE(offset, 16)
  return Buffer.concat([...parts, cd, end])
}

const pct = (x) => (x * 100).toFixed(2).replace('.', ',') + ' %'
const row = (k, c, i, p) => `${k},${c},${i},"${pct(i ? c / i : 0)}",${p}`
const H = (first) => `${first},Clics,Impressions,CTR,Position`

const dates = []
for (let d = Date.parse('2026-08-07'), n = 0; n < 90; n++, d += 86400000) {
  const day = new Date(d).toISOString().slice(0, 10), wk = [0.7, 1.1, 1.1, 1.05, 1, 0.9, 0.6][new Date(d).getUTCDay()]
  const clicks = Math.round((day >= '2026-09-28' ? 24 : 40) * wk), imp = Math.round(1500 * wk)
  dates.push(row(day, clicks, imp, (8 + (n % 3) * 0.1).toFixed(1)))
}
const complet = {
  'Requêtes.csv': [H('Requêtes les plus fréquentes'), row('vitrine réfrigérée', 60, 6000, 4.1), row('vitrine pâtissière sur mesure', 40, 2600, 6.8), row('maison exemple', 300, 900, 1.1), row('maison exemple avis', 40, 200, 1.4), row('vitrine boulangerie prix', 10, 1800, 11.2), row('vitrine réfrigérée occasion', 25, 3000, 2.2)].join('\n'),
  'Pages.csv': [H('Pages les plus populaires'), row('https://www.maison-exemple.fr/', 360, 2000, 1.8), row('https://www.maison-exemple.fr/vitrines-refrigerees', 70, 9000, 4.6), row('https://www.maison-exemple.fr/sur-mesure', 40, 2600, 6.8)].join('\n'),
  'Pays.csv': [H('Pays'), row('France', 430, 13000, 4.2), row('Belgique', 30, 900, 6.1), row('Suisse', 15, 500, 7.3)].join('\n'),
  'Appareils.csv': [H('Appareil'), row('Mobile', 300, 9000, 4.8), row('Ordinateur', 160, 4800, 3.9), row('Tablette', 15, 500, 5.2)].join('\n'),
  'Dates.csv': [H('Date'), ...dates].join('\n'),
  'Filtres.csv': 'Filtre,Valeur\nType de recherche,Web\nDate,3 derniers mois',
}
const precedent = {
  'Requêtes.csv': [H('Requêtes les plus fréquentes'), row('vitrine réfrigérée', 120, 6100, 4.0), row('vitrine pâtissière sur mesure', 38, 2500, 7.0), row('maison exemple', 290, 880, 1.1), row('vitrine réfrigérée occasion', 30, 3100, 2.1), row('vitrine froide ancienne', 22, 700, 3.5)].join('\n'),
  'Pages.csv': [H('Pages les plus populaires'), row('https://www.maison-exemple.fr/', 350, 1950, 1.8), row('https://www.maison-exemple.fr/vitrines-refrigerees', 150, 9200, 4.5), row('https://www.maison-exemple.fr/ancienne-gamme', 22, 700, 3.5)].join('\n'),
}
const liens = {
  'Principaux sites de provenance des liens.csv': 'Site,Pages de provenance des liens,Pages cibles\nannuaire-artisans.fr,40,1\ncma-auvergne-rhone-alpes.fr,3,1\nblog-patisserie.fr,2,2\nfournisseur-inox.com,1,1',
  'Pages les plus liées.csv': 'Pages les plus liées,Liens entrants,Sites de provenance des liens\nhttps://www.maison-exemple.fr/,44,4\nhttps://www.maison-exemple.fr/sur-mesure,2,1',
  'Principaux textes de liens.csv': 'Principaux textes de liens,Liens\nvitrine réfrigérée pas cher,30\nvitrine pâtissière,8\nmaison exemple,4\nwww.maison-exemple.fr,2\ncliquez ici,1',
}

if (process.argv[1] && import.meta.url.endsWith(process.argv[1].split('/').pop())) {
  const dir = new URL('.', import.meta.url)
  writeFileSync(new URL('gsc-complet.zip', dir), zip(complet))
  writeFileSync(new URL('gsc-precedent.zip', dir), zip(precedent))
  writeFileSync(new URL('liens.zip', dir), zip(liens))
  console.log('ok : gsc-complet.zip, gsc-precedent.zip, liens.zip')
}

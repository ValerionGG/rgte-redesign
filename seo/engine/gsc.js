// Import Search Console (export CSV « Requêtes » ou « Pages ») : vos vraies données, sans serveur.
// Opportunités = requêtes en positions 4–20 avec des impressions : le gain se calcule en clics/mois
// si la page passe en position 3, d'après une courbe de CTR prudente (sans AI Overview).

// CTR moyen par position, prudent : GrowthSRC 2025 (pos. 1 ≈ 19 %, pos. 2 ≈ 12,6 %) et First Page Sage 2026 (pos. 10 ≈ 1,6 %).
export const CTR_CURVE = [0, 0.19, 0.126, 0.09, 0.065, 0.05, 0.04, 0.033, 0.028, 0.024, 0.02]
export const ctrAt = (pos) => (pos < 1 ? CTR_CURVE[1] : pos <= 10 ? CTR_CURVE[Math.round(pos)] : pos <= 20 ? 0.01 : 0.003)

// CSV tolérant : séparateur , ; ou tabulation, guillemets, BOM, décimales à virgule, pourcentages.
export function parseCsv(text) {
  text = String(text || '').replace(/^﻿/, '')
  const first = text.split(/\r?\n/, 1)[0] || ''
  const sep = [',', ';', '\t'].sort((a, b) => first.split(b).length - first.split(a).length)[0]
  const rows = []
  let row = [], cell = '', q = false
  for (let i = 0; i < text.length; i++) {
    const ch = text[i]
    if (q) {
      if (ch === '"' && text[i + 1] === '"') { cell += '"'; i++ }
      else if (ch === '"') q = false
      else cell += ch
    } else if (ch === '"') q = true
    else if (ch === sep) { row.push(cell); cell = '' }
    else if (ch === '\n' || ch === '\r') {
      if (ch === '\r' && text[i + 1] === '\n') i++
      row.push(cell); cell = ''
      if (row.some((c) => c.trim() !== '')) rows.push(row)
      row = []
    } else cell += ch
  }
  row.push(cell)
  if (row.some((c) => c.trim() !== '')) rows.push(row)
  return rows
}

const num = (v) => {
  if (v == null) return NaN
  let s = String(v).trim().replace(/\s| | /g, '')
  const pct = s.endsWith('%')
  s = s.replace('%', '')
  if (s.includes(',') && !s.includes('.')) s = s.replace(',', '.')
  else s = s.replace(/,/g, '')
  const n = parseFloat(s)
  return pct ? n / 100 : n
}

const COLS = {
  key: /requ[eê]te|query|queries|^page|^url|pages? (les plus|top)|top pages/i,
  clicks: /^clic|^click/i,
  impressions: /^impression/i,
  ctr: /^ctr/i,
  position: /^position/i,
}

export function parseGsc(text) {
  const rows = parseCsv(text)
  if (rows.length < 2) return { error: 'Fichier vide ou illisible.' }
  const head = rows[0].map((h) => h.trim())
  const idx = {}
  for (const [k, re] of Object.entries(COLS)) idx[k] = head.findIndex((h) => re.test(h))
  if (idx.key < 0) idx.key = 0
  if (idx.impressions < 0 || idx.position < 0) return { error: 'Colonnes « Impressions » et « Position » introuvables : exportez le tableau « Requêtes » ou « Pages » de Search Console (Performances → Exporter → CSV).' }
  const kind = /page|url/i.test(head[idx.key]) ? 'pages' : 'requetes'
  const data = rows.slice(1).map((r) => {
    const impressions = num(r[idx.impressions]), clicks = idx.clicks >= 0 ? num(r[idx.clicks]) : NaN
    let ctr = idx.ctr >= 0 ? num(r[idx.ctr]) : NaN
    if (ctr > 1) ctr = ctr / 100
    if (Number.isNaN(ctr) && impressions > 0 && !Number.isNaN(clicks)) ctr = clicks / impressions
    return { key: (r[idx.key] || '').trim(), clicks: Number.isNaN(clicks) ? 0 : clicks, impressions: Number.isNaN(impressions) ? 0 : impressions, ctr: Number.isNaN(ctr) ? 0 : ctr, position: num(r[idx.position]) }
  }).filter((d) => d.key && d.impressions > 0 && d.position > 0)
  return { kind, rows: data, totals: { clicks: data.reduce((s, d) => s + d.clicks, 0), impressions: data.reduce((s, d) => s + d.impressions, 0) } }
}

// Les meilleures opportunités, chiffrées en clics par période d'export (souvent 3 mois → on ramène au mois).
export function opportunities(parsed, { months = 3, min = 30, limit = 15 } = {}) {
  if (!parsed?.rows) return []
  const out = []
  for (const d of parsed.rows) {
    const imp = d.impressions / months
    if (imp < min / months) continue
    if (d.position > 3.5 && d.position <= 20) {
      const gain = imp * Math.max(0, ctrAt(3) - d.ctr)
      out.push({ ...d, type: 'remonter', gain, action: d.position <= 10 ? 'Page 1 mais sous le pli : renforcez le titre, le contenu sur cette requête et 2–3 liens internes vers la page.' : 'Page 2 : enrichissez la page qui se positionne (ou créez une page dédiée) et ajoutez des liens internes.' })
    } else if (d.position <= 3.5 && d.ctr < ctrAt(Math.round(d.position)) * 0.6 && imp >= 50) {
      const gain = imp * (ctrAt(Math.round(d.position)) * 0.8 - d.ctr)
      out.push({ ...d, type: 'ctr', gain, action: 'Bien classée mais peu cliquée : réécrivez le titre et la meta description (bénéfice, chiffre, appel à l’action). Vérifiez si une réponse IA ou un encart occupe le haut de page.' })
    }
  }
  return out.filter((o) => o.gain >= 1).sort((a, b) => b.gain - a.gain).slice(0, limit).map((o) => ({ ...o, gain: Math.round(o.gain) }))
}

// L'export de Search Console est un ZIP de plusieurs CSV (Requêtes.csv, Pages.csv, Pays.csv…) :
// on le lit directement dans le navigateur (DecompressionStream), sans bibliothèque.
export async function readGscFile(buf) {
  const u8 = new Uint8Array(buf)
  if (u8[0] === 0x50 && u8[1] === 0x4b) return unzipPick(u8)
  return { text: new TextDecoder('utf-8').decode(u8), name: '' }
}
async function unzipPick(u8) {
  const dv = new DataView(u8.buffer, u8.byteOffset, u8.byteLength)
  let eocd = -1
  for (let i = u8.length - 22; i >= Math.max(0, u8.length - 65557); i--) if (dv.getUint32(i, true) === 0x06054b50) { eocd = i; break }
  if (eocd < 0) throw new Error('Fichier ZIP illisible.')
  const count = dv.getUint16(eocd + 10, true)
  let p = dv.getUint32(eocd + 16, true)
  const entries = []
  for (let n = 0; n < count && dv.getUint32(p, true) === 0x02014b50; n++) {
    const nameLen = dv.getUint16(p + 28, true)
    entries.push({ method: dv.getUint16(p + 10, true), csize: dv.getUint32(p + 20, true), local: dv.getUint32(p + 42, true), name: new TextDecoder().decode(u8.subarray(p + 46, p + 46 + nameLen)) })
    p += 46 + nameLen + dv.getUint16(p + 30, true) + dv.getUint16(p + 32, true)
  }
  const pick = entries.find((e) => /requ.{1,2}tes|quer(y|ies)/i.test(e.name)) || entries.find((e) => /pages/i.test(e.name)) || entries.find((e) => /\.csv$/i.test(e.name))
  if (!pick) throw new Error('Aucun fichier CSV dans le ZIP.')
  const start = pick.local + 30 + dv.getUint16(pick.local + 26, true) + dv.getUint16(pick.local + 28, true)
  const data = u8.subarray(start, start + pick.csize)
  if (pick.method !== 0 && pick.method !== 8) throw new Error('Compression ZIP non prise en charge.')
  const raw = pick.method === 0 ? data : new Uint8Array(await new Response(new Blob([data]).stream().pipeThrough(new DecompressionStream('deflate-raw'))).arrayBuffer())
  return { text: new TextDecoder('utf-8').decode(raw), name: pick.name }
}

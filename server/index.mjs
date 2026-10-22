// Serveur RGTE : site public (docs/), API des formulaires, back-office (/admin). Aucune dépendance npm.
// Usage : node --disable-warning=ExperimentalWarning server/index.mjs   (voir README, section « Back-office »)
import { createServer } from 'node:http'
import { readFileSync, mkdirSync, existsSync, statSync, createReadStream } from 'node:fs'
import { join, resolve, extname, sep } from 'node:path'
import { randomBytes } from 'node:crypto'
import { fileURLToPath } from 'node:url'
import { openDb, getSetting, setSetting, tx } from './db.mjs'
import { hashPassword, verifyOrDummy, verifyPassword, createSession, sessionUser, destroySession, parseCookies, rateLimiter, COOKIE } from './auth.mjs'

const ROOT = resolve(fileURLToPath(import.meta.url), '../..')
const DOCS = join(ROOT, 'docs')
const PORT = +process.env.PORT || 8080
const DATA_DIR = resolve(process.env.DATA_DIR || join(ROOT, 'data'))
const TRUST_PROXY = process.env.TRUST_PROXY === '1'
const WEBHOOK = process.env.NOTIFY_WEBHOOK_URL || ''

mkdirSync(DATA_DIR, { recursive: true })
const db = openDb(join(DATA_DIR, 'rgte.db'))

export const TYPES = { devis: 'Demande de devis', plan3d: 'Plan 3D offert', info: 'Demande d’informations', projet: 'Projet composé', contact: 'Contact' }
export const STATUSES = { nouvelle: 'Nouvelle', en_cours: 'En cours', devis_envoye: 'Devis envoyé', gagnee: 'Gagnée', perdue: 'Perdue', archivee: 'Archivée' }
const FIELDS = { nom: 120, telephone: 40, email: 160, societe: 160, secteur: 80, codePostal: 12, ville: 80, message: 5000 }

// ── Premier administrateur ────────────────────────────────────────────────
if (!db.prepare('SELECT 1 FROM users LIMIT 1').get()) {
  const email = process.env.ADMIN_EMAIL || 'admin@rgte.local'
  const pw = process.env.ADMIN_PASSWORD || randomBytes(9).toString('base64url')
  db.prepare('INSERT INTO users(email, name, pass_hash) VALUES(?, ?, ?)').run(email, 'Administrateur', hashPassword(pw))
  console.log(`[rgte] Compte administrateur créé : ${email}` + (process.env.ADMIN_PASSWORD ? ' (mot de passe ADMIN_PASSWORD)' : ` / mot de passe : ${pw} — à changer dans « Mon compte »`))
}

// ── Contenus gérés ────────────────────────────────────────────────────────
const LEGAL_DEFAULTS = JSON.parse(readFileSync(join(DOCS, 'data/legal-defaults.json'), 'utf8'))
const markerList = () => { try { return JSON.parse(readFileSync(join(DOCS, 'data/markers.json'), 'utf8')) } catch { return [] } }
const content = () => ({ phone: '0 800 95 13 13', markers: {}, replacements: [], legal: {}, ...getSetting(db, 'content', {}) })

function publicSite() {
  const c = content()
  const reps = [
    ...c.replacements.filter((r) => r.from && r.to != null),
    ...Object.entries(c.markers).filter(([, v]) => v !== '').map(([from, to]) => ({ from, to })),
  ]
  return { live: true, phone: c.phone, replacements: reps }
}

// ── Utilitaires HTTP ──────────────────────────────────────────────────────
const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.mjs': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.json': 'application/json; charset=utf-8', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.avif': 'image/avif', '.gif': 'image/gif', '.ico': 'image/x-icon', '.woff2': 'font/woff2', '.txt': 'text/plain; charset=utf-8', '.md': 'text/plain; charset=utf-8' }

class HttpError extends Error { constructor(status, msg) { super(msg); this.status = status } }

function send(res, status, body, headers = {}) {
  const data = typeof body === 'string' || Buffer.isBuffer(body) ? body : JSON.stringify(body)
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', ...headers })
  res.end(data)
}

function readJson(req, limit = 64 * 1024) {
  return new Promise((ok, ko) => {
    if (!/^application\/json\b/.test(req.headers['content-type'] || '')) return ko(new HttpError(415, 'JSON attendu'))
    let size = 0; const chunks = []
    req.on('data', (c) => { size += c.length; if (size > limit) { ko(new HttpError(413, 'Requête trop volumineuse')); req.destroy() } else chunks.push(c) })
    req.on('end', () => { try { ok(JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}')) } catch { ko(new HttpError(400, 'JSON invalide')) } })
    req.on('error', ko)
  })
}

const clientIp = (req) => (TRUST_PROXY && String(req.headers['x-forwarded-for'] || '').split(',')[0].trim()) || req.socket.remoteAddress || ''
const isHttps = (req) => req.socket.encrypted || (TRUST_PROXY && req.headers['x-forwarded-proto'] === 'https')
const clean = (v, max) => String(v ?? '').replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '').trim().slice(0, max)

function cleanDetails(d) {
  const out = {}
  if (!d || typeof d !== 'object' || Array.isArray(d)) return out
  for (const [k, v] of Object.entries(d).slice(0, 40)) {
    const key = clean(k, 80); if (!key) continue
    if (Array.isArray(v)) out[key] = v.slice(0, 50).map((x) => clean(x, 300))
    else if (typeof v === 'boolean') out[key] = v ? 'Oui' : 'Non'
    else if (v != null && typeof v !== 'object') out[key] = clean(v, 1000)
  }
  return out
}

// ── Formulaires publics ───────────────────────────────────────────────────
const leadLimit = rateLimiter(8, 10 * 60e3)
const loginLimit = rateLimiter(10, 15 * 60e3)

async function postLead(req, res) {
  const body = await readJson(req)
  if (!leadLimit(clientIp(req))) throw new HttpError(429, 'Trop de demandes, réessayez plus tard ou appelez le 0 800 95 13 13.')
  const type = Object.hasOwn(TYPES, body.type) ? body.type : 'contact'
  const f = body.fields && typeof body.fields === 'object' ? body.fields : {}
  const v = Object.fromEntries(Object.entries(FIELDS).map(([k, max]) => [k, clean(f[k], max)]))
  if (!v.nom || (!v.email && !v.telephone)) throw new HttpError(422, 'Nom et email ou téléphone requis')
  if (v.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.email)) throw new HttpError(422, 'Email invalide')
  // Envoi en moins d'une seconde après l'ouverture de la page : robot. Réponse identique, rien n'est enregistré.
  if (typeof body.elapsed === 'number' && body.elapsed < 1000) return send(res, 201, { ok: true })
  const details = cleanDetails(f.details)
  const r = db.prepare(`INSERT INTO leads(type, nom, email, telephone, societe, secteur, code_postal, ville, message, details, page)
    VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`).run(type, v.nom, v.email, v.telephone, v.societe, v.secteur, v.codePostal, v.ville, v.message, JSON.stringify(details), clean(body.page, 200))
  notify(Number(r.lastInsertRowid), type, v)
  send(res, 201, { ok: true })
}

function notify(id, type, v) {
  if (!WEBHOOK) return
  const text = `Nouvelle demande RGTE n°${id} — ${TYPES[type]} — ${v.nom}${v.ville ? ` (${v.ville})` : ''} — ${v.telephone || v.email}`
  fetch(WEBHOOK, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text, id, type, nom: v.nom, email: v.email, telephone: v.telephone, ville: v.ville }) })
    .catch((e) => console.error('[rgte] webhook :', e.message))
}

function getLegal(slug) {
  const def = LEGAL_DEFAULTS[slug]
  if (!def) throw new HttpError(404, 'Page inconnue')
  return { slug, ...def, ...(content().legal[slug] || {}) }
}

// ── Back-office ───────────────────────────────────────────────────────────
const leadRow = (r) => r && ({ ...r, details: JSON.parse(r.details || '{}'), typeLabel: TYPES[r.type] || r.type, statusLabel: STATUSES[r.status] || r.status })

function listLeads(q) {
  const where = [], args = []
  if (q.get('status')) { where.push('status = ?'); args.push(q.get('status')) } else if (!q.get('archived')) where.push("status != 'archivee'")
  if (q.get('type')) { where.push('type = ?'); args.push(q.get('type')) }
  if (q.get('q')) { where.push("(nom || ' ' || email || ' ' || telephone || ' ' || societe || ' ' || ville || ' ' || message || ' ' || details) LIKE ?"); args.push(`%${q.get('q')}%`) }
  const sql = `SELECT * FROM leads ${where.length ? 'WHERE ' + where.join(' AND ') : ''} ORDER BY id DESC LIMIT 500`
  return db.prepare(sql).all(...args).map(leadRow)
}

function csvLeads() {
  const cell = (v) => { let s = String(v ?? ''); if (/^[=+\-@\t\r]/.test(s)) s = "'" + s; return '"' + s.replace(/"/g, '""') + '"' }
  const cols = ['id', 'created_at', 'type', 'status', 'nom', 'societe', 'email', 'telephone', 'secteur', 'code_postal', 'ville', 'message', 'details', 'page']
  const head = ['N°', 'Date', 'Type', 'Statut', 'Nom', 'Société', 'Email', 'Téléphone', 'Secteur', 'Code postal', 'Ville', 'Message', 'Détails', 'Page']
  const rows = db.prepare('SELECT * FROM leads ORDER BY id DESC').all().map((r) => cols.map((c) =>
    c === 'type' ? TYPES[r.type] || r.type : c === 'status' ? STATUSES[r.status] || r.status
      : c === 'details' ? Object.entries(JSON.parse(r.details || '{}')).map(([k, v]) => `${k} : ${Array.isArray(v) ? v.join(', ') : v}`).join(' | ') : r[c]))
  return '﻿' + [head, ...rows].map((r) => r.map(cell).join(';')).join('\r\n') + '\r\n'
}

function stats() {
  const by = (col) => Object.fromEntries(db.prepare(`SELECT ${col} AS k, COUNT(*) AS n FROM leads GROUP BY ${col}`).all().map((r) => [r.k, r.n]))
  const since = new Date(Date.now() - 30 * 864e5).toISOString()
  const days = db.prepare("SELECT substr(created_at, 1, 10) AS d, COUNT(*) AS n FROM leads WHERE created_at >= ? GROUP BY d ORDER BY d").all(since)
  const markers = markerList(), filled = content().markers
  return {
    total: db.prepare('SELECT COUNT(*) AS n FROM leads').get().n,
    last30: days.reduce((a, d) => a + d.n, 0), days,
    byStatus: by('status'), byType: by('type'),
    latest: db.prepare('SELECT * FROM leads ORDER BY id DESC LIMIT 6').all().map(leadRow),
    markers: { total: markers.length, filled: markers.filter((m) => filled[m.marker]).length },
  }
}

function event(leadId, user, kind, text) {
  db.prepare('INSERT INTO lead_events(lead_id, user_name, kind, text) VALUES(?, ?, ?, ?)').run(leadId, user.name || user.email, kind, text)
}

async function admin(req, res, path, url, user) {
  const m = req.method
  let mm
  if (path === '/me' && m === 'GET') return send(res, 200, { user, types: TYPES, statuses: STATUSES })
  if (path === '/logout' && m === 'POST') {
    destroySession(db, parseCookies(req.headers.cookie)[COOKIE])
    return send(res, 200, { ok: true }, { 'Set-Cookie': `${COOKIE}=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0` })
  }
  if (path === '/stats' && m === 'GET') return send(res, 200, stats())
  if (path === '/leads' && m === 'GET') return send(res, 200, listLeads(url.searchParams))
  if (path === '/leads.csv' && m === 'GET') return send(res, 200, csvLeads(), { 'Content-Type': 'text/csv; charset=utf-8', 'Content-Disposition': `attachment; filename="rgte-demandes-${new Date().toISOString().slice(0, 10)}.csv"` })
  if ((mm = path.match(/^\/leads\/(\d+)$/))) {
    const id = +mm[1], lead = leadRow(db.prepare('SELECT * FROM leads WHERE id = ?').get(id))
    if (!lead) throw new HttpError(404, 'Demande introuvable')
    if (m === 'GET') return send(res, 200, { ...lead, events: db.prepare('SELECT * FROM lead_events WHERE lead_id = ? ORDER BY id').all(id) })
    if (m === 'PATCH') {
      const b = await readJson(req)
      if (b.status != null && !Object.hasOwn(STATUSES, b.status)) throw new HttpError(422, 'Statut inconnu')
      tx(db, () => {
        if (b.status && b.status !== lead.status) {
          db.prepare('UPDATE leads SET status = ? WHERE id = ?').run(b.status, id)
          event(id, user, 'status', `${STATUSES[lead.status] || lead.status} → ${STATUSES[b.status]}`)
        }
        const note = clean(b.note, 5000)
        if (note) event(id, user, 'note', note)
      })
      return send(res, 200, { ok: true })
    }
    if (m === 'DELETE') { db.prepare('DELETE FROM leads WHERE id = ?').run(id); return send(res, 200, { ok: true }) }
  }
  if (path === '/content' && m === 'GET') return send(res, 200, { ...content(), markerList: markerList(), legalDefaults: LEGAL_DEFAULTS })
  if (path === '/content' && m === 'PUT') {
    const b = await readJson(req, 512 * 1024), c = content()
    if (b.phone != null) c.phone = clean(b.phone, 40) || '0 800 95 13 13'
    if (b.markers && typeof b.markers === 'object') {
      c.markers = {}
      for (const [k, v] of Object.entries(b.markers)) if (/^\[[^\]]{1,60}\]$/.test(k) && clean(v, 2000)) c.markers[k] = clean(v, 2000)
    }
    if (Array.isArray(b.replacements)) c.replacements = b.replacements.slice(0, 200).map((r) => ({ from: clean(r && r.from, 500), to: clean(r && r.to, 2000) })).filter((r) => r.from.length >= 3)
    if (b.legal && typeof b.legal === 'object') {
      c.legal = {}
      for (const slug of Object.keys(LEGAL_DEFAULTS)) {
        const l = b.legal[slug]
        if (l && typeof l === 'object') c.legal[slug] = { title: clean(l.title, 120) || LEGAL_DEFAULTS[slug].title, body: clean(l.body, 50000) }
      }
    }
    setSetting(db, 'content', c)
    return send(res, 200, { ok: true })
  }
  if (path === '/users' && m === 'GET') return send(res, 200, db.prepare('SELECT id, email, name, created_at, last_login FROM users ORDER BY id').all())
  if (path === '/users' && m === 'POST') {
    const b = await readJson(req), email = clean(b.email, 160).toLowerCase(), pw = String(b.password || '')
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new HttpError(422, 'Email invalide')
    if (pw.length < 10) throw new HttpError(422, 'Mot de passe : 10 caractères minimum')
    if (db.prepare('SELECT 1 FROM users WHERE email = ?').get(email)) throw new HttpError(409, 'Cet email a déjà un compte')
    db.prepare('INSERT INTO users(email, name, pass_hash) VALUES(?, ?, ?)').run(email, clean(b.name, 80), hashPassword(pw))
    return send(res, 201, { ok: true })
  }
  if ((mm = path.match(/^\/users\/(\d+)$/)) && m === 'DELETE') {
    if (+mm[1] === user.id) throw new HttpError(422, 'Vous ne pouvez pas supprimer votre propre compte')
    db.prepare('DELETE FROM users WHERE id = ?').run(+mm[1])
    return send(res, 200, { ok: true })
  }
  if (path === '/password' && m === 'POST') {
    const b = await readJson(req), row = db.prepare('SELECT pass_hash FROM users WHERE id = ?').get(user.id)
    if (!verifyPassword(String(b.current || ''), row.pass_hash)) throw new HttpError(403, 'Mot de passe actuel incorrect')
    if (String(b.next || '').length < 10) throw new HttpError(422, 'Nouveau mot de passe : 10 caractères minimum')
    // Toutes les sessions du compte sont fermées, puis une nouvelle est ouverte pour cet appareil.
    tx(db, () => {
      db.prepare('UPDATE users SET pass_hash = ? WHERE id = ?').run(hashPassword(String(b.next)), user.id)
      db.prepare('DELETE FROM sessions WHERE user_id = ?').run(user.id)
    })
    const s = createSession(db, user.id)
    return send(res, 200, { ok: true }, { 'Set-Cookie': cookie(req, s) })
  }
  throw new HttpError(404, 'Route inconnue')
}

const cookie = (req, s) => `${COOKIE}=${s.token}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${s.maxAge}${isHttps(req) ? '; Secure' : ''}`

async function login(req, res) {
  if (!loginLimit(clientIp(req))) throw new HttpError(429, 'Trop de tentatives, réessayez dans 15 minutes.')
  const b = await readJson(req)
  const row = db.prepare('SELECT id, pass_hash FROM users WHERE email = ?').get(clean(b.email, 160))
  if (!verifyOrDummy(String(b.password || ''), row && row.pass_hash)) throw new HttpError(401, 'Email ou mot de passe incorrect')
  db.prepare("UPDATE users SET last_login = strftime('%Y-%m-%dT%H:%M:%fZ', 'now') WHERE id = ?").run(row.id)
  send(res, 200, { ok: true }, { 'Set-Cookie': cookie(req, createSession(db, row.id)) })
}

// ── Fichiers statiques ────────────────────────────────────────────────────
function serveStatic(req, res, pathname) {
  let rel
  try { rel = decodeURIComponent(pathname) } catch { throw new HttpError(400, 'URL invalide') }
  if (rel.includes('\0') || rel.split('/').some((p) => p.startsWith('.'))) throw new HttpError(404, 'Introuvable')
  if (rel === '/admin') return send(res, 301, '', { Location: '/admin/' })
  let file = resolve(DOCS, '.' + rel)
  if (file !== DOCS && !file.startsWith(DOCS + sep)) throw new HttpError(404, 'Introuvable')
  if (existsSync(file) && statSync(file).isDirectory()) {
    if (!pathname.endsWith('/')) return send(res, 301, '', { Location: pathname + '/' })
    file = join(file, 'index.html')
  }
  if (!existsSync(file) || !statSync(file).isFile()) throw new HttpError(404, 'Introuvable')
  const ext = extname(file).toLowerCase(), isHtml = ext === '.html'
  const headers = {
    'Content-Type': MIME[ext] || 'application/octet-stream',
    'Content-Length': statSync(file).size,
    'Cache-Control': isHtml || ext === '.js' || ext === '.json' ? 'no-cache' : 'public, max-age=86400',
  }
  if (rel.startsWith('/admin/')) {
    headers['Content-Security-Policy'] = "default-src 'self'; img-src 'self' data:; style-src 'self'; script-src 'self'; connect-src 'self'; frame-ancestors 'none'; base-uri 'none'; form-action 'self'"
    headers['X-Robots-Tag'] = 'noindex, nofollow'
  }
  res.writeHead(200, headers)
  if (req.method === 'HEAD') return res.end()
  createReadStream(file).pipe(res)
}

// ── Routage ───────────────────────────────────────────────────────────────
export const server = createServer(async (req, res) => {
  res.setHeader('X-Content-Type-Options', 'nosniff')
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin')
  res.setHeader('X-Frame-Options', 'SAMEORIGIN')
  const url = new URL(req.url, 'http://localhost'), p = url.pathname
  try {
    if (p === '/healthz') return send(res, 200, { ok: true })
    if (p === '/api/site' && req.method === 'GET') return send(res, 200, publicSite())
    if (p === '/api/leads' && req.method === 'POST') return await postLead(req, res)
    let lm
    if ((lm = p.match(/^\/api\/legal\/([a-z-]+)$/)) && req.method === 'GET') return send(res, 200, getLegal(lm[1]))
    if (p.startsWith('/api/admin/')) {
      // En-tête personnalisé obligatoire : bloque les requêtes inter-sites (CSRF) en plus du cookie SameSite=Strict.
      if (req.headers['x-rgte'] !== '1') throw new HttpError(403, 'Requête refusée')
      const sub = p.slice('/api/admin'.length)
      if (sub === '/login' && req.method === 'POST') return await login(req, res)
      const user = sessionUser(db, parseCookies(req.headers.cookie)[COOKIE])
      if (!user) throw new HttpError(401, 'Session expirée, reconnectez-vous')
      return await admin(req, res, sub, url, user)
    }
    if (p.startsWith('/api/')) throw new HttpError(404, 'Route inconnue')
    if (req.method !== 'GET' && req.method !== 'HEAD') throw new HttpError(405, 'Méthode non autorisée')
    return serveStatic(req, res, p)
  } catch (e) {
    const status = e instanceof HttpError ? e.status : 500
    if (status === 500) console.error('[rgte]', e)
    if (!res.headersSent) send(res, status, { error: status === 500 ? 'Erreur interne' : e.message })
    else res.destroy()
  }
})

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  server.listen(PORT, () => console.log(`[rgte] Site : http://localhost:${PORT}/ · Back-office : http://localhost:${PORT}/admin/ · Données : ${DATA_DIR}`))
  const stop = () => server.close(() => { db.close(); process.exit(0) })
  process.on('SIGTERM', stop); process.on('SIGINT', stop)
}

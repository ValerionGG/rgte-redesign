// Mots de passe (scrypt), sessions par cookie HttpOnly, limitation de débit en mémoire.
import { scryptSync, randomBytes, timingSafeEqual, createHash } from 'node:crypto'

const N = 16384, R = 8, P = 1, LEN = 32
const SESSION_DAYS = 7
export const COOKIE = 'rgte_sid'

export function hashPassword(pw) {
  const salt = randomBytes(16)
  const hash = scryptSync(pw, salt, LEN, { N, r: R, p: P })
  return `scrypt$${N}$${R}$${P}$${salt.toString('base64')}$${hash.toString('base64')}`
}

export function verifyPassword(pw, stored) {
  const [alg, n, r, p, salt, hash] = String(stored).split('$')
  if (alg !== 'scrypt') return false
  const expected = Buffer.from(hash, 'base64')
  const got = scryptSync(pw, Buffer.from(salt, 'base64'), expected.length, { N: +n, r: +r, p: +p })
  return got.length === expected.length && timingSafeEqual(got, expected)
}

// Vérification à coût constant quand l'email n'existe pas (évite de révéler les comptes).
const DUMMY = hashPassword(randomBytes(12).toString('hex'))
export function verifyOrDummy(pw, stored) { return verifyPassword(pw, stored || DUMMY) && !!stored }

const sha = (s) => createHash('sha256').update(s).digest('hex')

export function createSession(db, userId) {
  const token = randomBytes(32).toString('base64url')
  const expires = Date.now() + SESSION_DAYS * 864e5
  db.prepare('DELETE FROM sessions WHERE expires_at < ?').run(Date.now())
  db.prepare('INSERT INTO sessions(token_hash, user_id, expires_at) VALUES(?, ?, ?)').run(sha(token), userId, expires)
  return { token, maxAge: SESSION_DAYS * 86400 }
}

export function sessionUser(db, token) {
  if (!token) return null
  return db.prepare(`SELECT u.id, u.email, u.name FROM sessions s JOIN users u ON u.id = s.user_id
    WHERE s.token_hash = ? AND s.expires_at > ?`).get(sha(token), Date.now()) || null
}

export function destroySession(db, token) {
  if (token) db.prepare('DELETE FROM sessions WHERE token_hash = ?').run(sha(token))
}

export function parseCookies(header) {
  const out = {}
  for (const part of String(header || '').split(';')) {
    const i = part.indexOf('=')
    if (i > 0) out[part.slice(0, i).trim()] = decodeURIComponent(part.slice(i + 1).trim())
  }
  return out
}

// Fenêtre glissante simple : au plus `max` évènements par clé sur `windowMs`.
export function rateLimiter(max, windowMs) {
  const hits = new Map()
  setInterval(() => { const t = Date.now() - windowMs; for (const [k, v] of hits) if (v.at(-1) < t) hits.delete(k) }, windowMs).unref()
  return (key) => {
    const now = Date.now(), list = (hits.get(key) || []).filter((t) => t > now - windowMs)
    if (list.length >= max) { hits.set(key, list); return false }
    list.push(now); hits.set(key, list); return true
  }
}

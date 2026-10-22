// Base SQLite (module node:sqlite intégré à Node ≥ 22.5) : utilisateurs, sessions, demandes, historique, réglages.
import { DatabaseSync } from 'node:sqlite'

const SCHEMA = `
PRAGMA journal_mode = WAL;
PRAGMA foreign_keys = ON;
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY,
  email TEXT NOT NULL UNIQUE COLLATE NOCASE,
  name TEXT NOT NULL DEFAULT '',
  pass_hash TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  last_login TEXT
);
CREATE TABLE IF NOT EXISTS sessions (
  token_hash TEXT PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires_at INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS leads (
  id INTEGER PRIMARY KEY,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  type TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'nouvelle',
  nom TEXT NOT NULL DEFAULT '',
  email TEXT NOT NULL DEFAULT '',
  telephone TEXT NOT NULL DEFAULT '',
  societe TEXT NOT NULL DEFAULT '',
  secteur TEXT NOT NULL DEFAULT '',
  code_postal TEXT NOT NULL DEFAULT '',
  ville TEXT NOT NULL DEFAULT '',
  message TEXT NOT NULL DEFAULT '',
  details TEXT NOT NULL DEFAULT '{}',
  page TEXT NOT NULL DEFAULT ''
);
CREATE INDEX IF NOT EXISTS leads_created ON leads(created_at DESC);
CREATE TABLE IF NOT EXISTS lead_events (
  id INTEGER PRIMARY KEY,
  lead_id INTEGER NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  user_name TEXT NOT NULL DEFAULT '',
  kind TEXT NOT NULL,
  text TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS lead_events_lead ON lead_events(lead_id);
CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);
`

export function openDb(file) {
  const db = new DatabaseSync(file)
  db.exec(SCHEMA)
  return db
}

export function getSetting(db, key, fallback) {
  const row = db.prepare('SELECT value FROM settings WHERE key = ?').get(key)
  if (!row) return fallback
  try { return JSON.parse(row.value) } catch { return fallback }
}

export function setSetting(db, key, value) {
  db.prepare('INSERT INTO settings(key, value) VALUES(?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value')
    .run(key, JSON.stringify(value))
}

// Exécute fn dans une transaction (annulée si fn lève une erreur).
export function tx(db, fn) {
  db.exec('BEGIN')
  try { const r = fn(); db.exec('COMMIT'); return r } catch (e) { db.exec('ROLLBACK'); throw e }
}

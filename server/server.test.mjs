// Tests de l'API : npm test  (base temporaire, serveur sur un port libre)
import { test, before, after } from 'node:test'
import assert from 'node:assert/strict'
import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const dir = mkdtempSync(join(tmpdir(), 'rgte-test-'))
process.env.DATA_DIR = dir
process.env.ADMIN_EMAIL = 'admin@test.fr'
process.env.ADMIN_PASSWORD = 'motdepasse-test'
const { server } = await import('./index.mjs')
let base, cookie = ''

before(() => new Promise((ok) => server.listen(0, () => { base = `http://127.0.0.1:${server.address().port}`; ok() })))
after(() => { server.close(); rmSync(dir, { recursive: true, force: true }) })

const req = (path, { method = 'GET', body, admin = true, headers = {} } = {}) => fetch(base + path, {
  method,
  headers: { ...(body ? { 'Content-Type': 'application/json' } : {}), ...(admin ? { 'X-RGTE': '1', Cookie: cookie } : {}), ...headers },
  body: body ? JSON.stringify(body) : undefined,
})
const lead = (fields, extra = {}) => req('/api/leads', { method: 'POST', admin: false, body: { type: 'devis', fields, page: 'v3/Test.html', elapsed: 5000, ...extra } })

test('site public et mode serveur', async () => {
  const r = await req('/api/site', { admin: false })
  assert.equal(r.status, 200)
  assert.equal((await r.json()).live, true)
  assert.equal((await req('/v3/', { admin: false })).status, 200)
  assert.equal((await req('/../server/index.mjs', { admin: false })).status, 404)
  assert.equal((await req('/%2e%2e/server/index.mjs', { admin: false })).status, 404)
})

test('formulaire : validation et enregistrement', async () => {
  assert.equal((await lead({ nom: '' })).status, 422)
  assert.equal((await lead({ nom: 'A', email: 'pas-un-email' })).status, 422)
  assert.equal((await lead({ nom: 'Marie', email: 'marie@ex.fr', details: { 'Plan 3D souhaité': true, Modules: ['Gourmandise 101 cm'] } })).status, 201)
  assert.equal((await lead({ nom: 'Robot', email: 'r@ex.fr' }, { elapsed: 10 })).status, 201) // ignoré
})

test('back-office : accès protégé', async () => {
  assert.equal((await req('/api/admin/leads')).status, 401)
  assert.equal((await req('/api/admin/login', { method: 'POST', body: { email: 'admin@test.fr', password: 'faux' } })).status, 401)
  const noHeader = await req('/api/admin/login', { method: 'POST', admin: false, body: { email: 'admin@test.fr', password: 'motdepasse-test' } })
  assert.equal(noHeader.status, 403)
  const r = await req('/api/admin/login', { method: 'POST', body: { email: 'admin@test.fr', password: 'motdepasse-test' } })
  assert.equal(r.status, 200)
  assert.match(r.headers.get('set-cookie'), /HttpOnly; SameSite=Strict/)
  cookie = r.headers.get('set-cookie').split(';')[0]
})

test('back-office : demandes, suivi, export, suppression', async () => {
  const list = await (await req('/api/admin/leads')).json()
  assert.equal(list.length, 1)
  assert.equal(list[0].nom, 'Marie')
  assert.deepEqual(list[0].details, { 'Plan 3D souhaité': 'Oui', Modules: ['Gourmandise 101 cm'] })
  const id = list[0].id
  assert.equal((await req(`/api/admin/leads/${id}`, { method: 'PATCH', body: { status: 'en_cours', note: 'Rappel demain' } })).status, 200)
  const one = await (await req(`/api/admin/leads/${id}`)).json()
  assert.equal(one.status, 'en_cours')
  assert.deepEqual(one.events.map((e) => e.kind), ['status', 'note'])
  const csv = await (await req('/api/admin/leads.csv')).text()
  assert.match(csv, /Marie/)
  assert.equal((await req(`/api/admin/leads/${id}`, { method: 'PATCH', body: { status: 'inconnu' } })).status, 422)
  assert.equal((await req(`/api/admin/leads/${id}`, { method: 'DELETE' })).status, 200)
  assert.equal((await req(`/api/admin/leads/${id}`)).status, 404)
})

test('contenus : marqueurs et remplacements publiés', async () => {
  const put = await req('/api/admin/content', { method: 'PUT', body: { markers: { '[HORAIRES]': 'Lun–ven 8h–18h', '[PRIX]': '' }, replacements: [{ from: '5 800,00 € HT', to: '5 950,00 € HT' }] } })
  assert.equal(put.status, 200)
  const site = await (await req('/api/site', { admin: false })).json()
  assert.deepEqual(site.replacements, [{ from: '5 800,00 € HT', to: '5 950,00 € HT' }, { from: '[HORAIRES]', to: 'Lun–ven 8h–18h' }])
  await req('/api/admin/content', { method: 'PUT', body: { legal: { 'mentions-legales': { title: 'Mentions', body: 'SIRET 123' } } } })
  const legal = await (await req('/api/legal/mentions-legales', { admin: false })).json()
  assert.equal(legal.body, 'SIRET 123')
})

test('comptes : création, mot de passe, déconnexion', async () => {
  assert.equal((await req('/api/admin/users', { method: 'POST', body: { email: 'b@ex.fr', password: 'court' } })).status, 422)
  assert.equal((await req('/api/admin/users', { method: 'POST', body: { email: 'b@ex.fr', name: 'B', password: 'assez-long-123' } })).status, 201)
  assert.equal((await req('/api/admin/password', { method: 'POST', body: { current: 'faux', next: 'nouveau-mot-de-passe' } })).status, 403)
  const old = cookie
  const r = await req('/api/admin/password', { method: 'POST', body: { current: 'motdepasse-test', next: 'nouveau-mot-de-passe' } })
  assert.equal(r.status, 200)
  cookie = r.headers.get('set-cookie').split(';')[0]
  assert.equal((await req('/api/admin/me', { headers: { Cookie: old } })).status, 401)
  assert.equal((await req('/api/admin/me')).status, 200)
  await req('/api/admin/logout', { method: 'POST' })
  assert.equal((await req('/api/admin/me')).status, 401)
})

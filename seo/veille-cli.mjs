// Veille sociale en ligne de commande, via Agent Reach (https://github.com/Panniantong/Agent-Reach).
// node seo/cli.mjs veille "<sujet>" [--sources reddit,youtube,web,github,twitter] [--limit 10]
//        [--requetes "autre requête;encore une"] [--marque "Ma marque"] [--sortie rapports-seo] [--agent-reach <chemin>]
// Agent Reach doit être installé sur votre machine (lecture seule, vos connexions restent les vôtres).
import { execFile } from 'node:child_process'
import { writeFileSync, mkdirSync } from 'node:fs'
import { join } from 'node:path'
import { analyzeVeille, veilleMarkdown } from './engine/veille.js'

// Règles d'Agent Reach : sur ces erreurs, on arrête la source au lieu d'insister ou de changer de compte.
const STOP = new Set(['NEED_LOGIN', 'RATE_LIMITED', 'PLATFORM_BLOCKED', 'BUSY', 'NEED_SETUP', 'UPSTREAM_BROKEN', 'TIMEOUT'])
const INSTALL = `Agent Reach n'est pas installé (ou introuvable).
Installation (depuis GitHub UNIQUEMENT — le paquet PyPI « agent-reach » n'est PAS ce projet) :
  1. uv tool install https://github.com/Panniantong/Agent-Reach/archive/refs/tags/v1.6.0.zip
  2. agent-reach setup            (canaux par défaut : web, youtube, github…)
  3. agent-reach add reddit       (optionnel : Reddit, connexion faite par vous-même ; compte secondaire conseillé)
Ou demandez à Claude Code : « Installe Agent Reach : https://raw.githubusercontent.com/Panniantong/Agent-Reach/main/docs/install.md »
Puis relancez cette commande (ou --agent-reach <chemin du programme>).`

function opt(args, name, def) { const i = args.indexOf('--' + name); return i >= 0 && args[i + 1] && !args[i + 1].startsWith('--') ? args[i + 1] : def }

export function runReach(bin, argv, timeout = 180000) {
  return new Promise((resolve) => {
    execFile(bin, argv, { timeout, maxBuffer: 32 * 1024 * 1024, windowsHide: true }, (err, stdout, stderr) => {
      if (err && err.code === 'ENOENT') return resolve({ missing: true })
      const text = String(stdout || '').trim()
      const start = text.indexOf('{')
      try { return resolve(JSON.parse(start > 0 ? text.slice(start) : text)) } catch {}
      resolve({ ok: false, channel: argv[0], action: argv[1], error: { code: err?.killed ? 'TIMEOUT' : 'BAD_OUTPUT', message: String(stderr || text || err?.message || '').slice(0, 300) } })
    })
  })
}

// Collecte réutilisable (audit avec --veille) : renvoie { results } ou { missing: true }
export async function collectVeille({ sujet, sources = ['reddit', 'youtube', 'web'], requetes = [], marque = '', limit = 10, bin = process.env.AGENT_REACH_BIN || 'agent-reach', log = () => {} }) {
  const results = []
  for (const ch of sources) {
    const qs = [sujet, ...requetes, ...(marque && ['reddit', 'web', 'twitter', 'youtube'].includes(ch) ? [marque] : [])]
    for (const q of qs) {
      log(`  · ${ch} : « ${q} »`)
      const r = await runReach(bin, [ch, 'search', q, '--limit', String(limit)])
      if (r.missing) return { missing: true }
      results.push({ ...r, channel: r.channel || ch, action: r.action || 'search', query: q })
      if (!r.ok) { log(`    ${r.error?.code || 'erreur'} : ${r.error?.hint || r.error?.message || ''}`); if (STOP.has(r.error?.code)) break }
    }
  }
  return { results }
}
export const INSTALL_HELP = INSTALL

export async function main(args) {
  const sujet = args[0] && !args[0].startsWith('--') ? args[0] : ''
  if (!sujet) { console.log('Usage : node seo/cli.mjs veille "<sujet>" [--sources reddit,youtube,web] [--limit 10] [--requetes "a;b"] [--marque X] [--sortie dossier]'); process.exitCode = 1; return }
  const sources = String(opt(args, 'sources', 'reddit,youtube,web')).split(',').map((s) => s.trim()).filter(Boolean)
  const limit = Math.max(1, Math.min(50, +opt(args, 'limit', 10) || 10))
  const marque = opt(args, 'marque', '')
  const requetes = [sujet, ...String(opt(args, 'requetes', '')).split(';').map((s) => s.trim()).filter(Boolean)]
  const bin = opt(args, 'agent-reach', process.env.AGENT_REACH_BIN || 'agent-reach')
  const results = []
  for (const ch of sources) {
    const qs = marque && ['reddit', 'web', 'twitter', 'youtube'].includes(ch) ? [...requetes, marque] : requetes
    for (const q of qs) {
      console.error(`  · ${ch} : « ${q} »`)
      const r = await runReach(bin, [ch, 'search', q, '--limit', String(limit)])
      if (r.missing) { console.error('\n' + INSTALL); process.exitCode = 2; return }
      results.push({ ...r, channel: r.channel || ch, action: r.action || 'search', query: q })
      if (!r.ok) {
        console.error(`    ${r.error?.code || 'erreur'} : ${r.error?.hint || r.error?.message || ''}`)
        if (STOP.has(r.error?.code)) break
      }
    }
  }
  const v = analyzeVeille(results, { sujet, marque })
  const out = opt(args, 'sortie', 'rapports-seo')
  mkdirSync(out, { recursive: true })
  const slug = 'veille-' + sujet.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '').slice(0, 50).toLowerCase()
  writeFileSync(join(out, slug + '.json'), JSON.stringify(v, null, 1))
  writeFileSync(join(out, slug + '.md'), veilleMarkdown(v))
  console.error(`\n${v.total} publications lues · ${v.questions.length} questions · ${v.hashtags.length} hashtags observés`)
  for (const r of v.recommandations) console.error('  • ' + r)
  console.error(`\n📄 ${join(out, slug + '.md')}\n🧾 ${join(out, slug + '.json')} (importable dans l’interface : Mots-clés & réseaux)`)
}

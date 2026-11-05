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
// Règle du skill officiel d'Agent Reach : au moins 10 s entre deux recherches sur une même plateforme.
// AGENT_REACH_PAUSE_MS ne sert qu'aux tests (faux Agent Reach local).
export const PAUSE_MS = 10000
const envPause = () => { const n = Number(process.env.AGENT_REACH_PAUSE_MS); return process.env.AGENT_REACH_PAUSE_MS != null && Number.isFinite(n) && n >= 0 ? n : PAUSE_MS }
// Couverture réelle d'Agent Reach 1.6.x (docs/capabilities.md et issues ouvertes)
const ALIAS = { x: 'twitter', yt: 'youtube' }
const SKIP = {
  tiktok: 'Agent Reach n’a pas de canal TikTok. Pour TikTok, passez par last30days-skill ou les skills ScrapeCreators (clé API payante).',
  linkedin: 'Dans Agent Reach, LinkedIn ne couvre que les offres d’emploi : inutile pour une veille de contenus.',
}
const WARN = {
  instagram: 'Instagram est expérimental dans Agent Reach (recherche de comptes seulement, erreurs 400 fréquentes) : résultats indicatifs.',
  twitter: 'X est expérimental dans Agent Reach : résultats possibles mais instables.',
}
const INSTALL = `Agent Reach n'est pas installé (ou introuvable).
Installation (depuis GitHub UNIQUEMENT — le paquet PyPI « agent-reach » n'est PAS ce projet) :
  1. uv tool install https://github.com/Panniantong/Agent-Reach/releases/latest/download/agent-reach.zip
  2. agent-reach setup                 (canaux sans compte : web, youtube, github…)
  3. agent-reach add reddit            (optionnel : vous vous connectez vous-même, compte secondaire conseillé)
  4. agent-reach check reddit --text   (test réel du canal ; « doctor » seul peut se tromper)
Commande introuvable après l'installation : uv tool update-shell, puis ouvrez un nouveau terminal.
Ou demandez à Claude Code : « Installe Agent Reach : https://raw.githubusercontent.com/Panniantong/Agent-Reach/main/docs/install.md »
Puis relancez cette commande (ou --agent-reach <chemin du programme>).`

function opt(args, name, def) { const i = args.indexOf('--' + name); return i >= 0 && args[i + 1] && !args[i + 1].startsWith('--') ? args[i + 1] : def }
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

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

// Collecte (sous-commande veille et audit avec --veille) : renvoie { results } ou { missing: true }.
// Une plateforme à la fois, une recherche à la fois, pause entre deux recherches sur la même plateforme.
export async function collectVeille({ sujet, sources = ['reddit', 'youtube', 'web'], requetes = [], marque = '', limit = 10, bin = process.env.AGENT_REACH_BIN || 'agent-reach', log = () => {}, pause = envPause() }) {
  const results = [], done = new Set()
  if (pause > 0) log(`  (pause de ${Math.round(pause / 1000)} s entre deux recherches sur une même plateforme : règle d’Agent Reach)`)
  for (const raw of sources) {
    const name = String(raw || '').trim().toLowerCase()
    const ch = ALIAS[name] || name
    if (!ch || done.has(ch)) continue
    done.add(ch)
    if (SKIP[ch]) {
      log(`  · ${ch} : ignoré — ${SKIP[ch]}`)
      results.push({ ok: false, channel: ch, action: 'search', query: sujet, items: [], error: { code: 'UNSUPPORTED', message: SKIP[ch], hint: SKIP[ch] } })
      continue
    }
    if (WARN[ch]) log(`  ! ${WARN[ch]}`)
    const qs = [...new Set([sujet, ...requetes, ...(marque && ['reddit', 'web', 'twitter', 'youtube'].includes(ch) ? [marque] : [])].map((s) => String(s || '').trim()).filter(Boolean))]
    for (let i = 0; i < qs.length; i++) {
      if (i > 0 && pause > 0) await sleep(pause)
      log(`  · ${ch} : « ${qs[i]} »`)
      const r = await runReach(bin, [ch, 'search', qs[i], '--limit', String(limit)])
      if (r.missing) return { missing: true }
      results.push({ ...r, channel: r.channel || ch, action: r.action || 'search', query: qs[i] })
      if (!r.ok) {
        const wait = Number(r.error?.retry_after_seconds)
        log(`    ${r.error?.code || 'erreur'} : ${r.error?.hint || r.error?.message || ''}${wait > 0 ? ` (attendre ${Math.ceil(wait)} s avant de relancer)` : ''}`)
        if (STOP.has(r.error?.code)) break
      }
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
  const requetes = String(opt(args, 'requetes', '')).split(';').map((s) => s.trim()).filter(Boolean)
  const bin = opt(args, 'agent-reach', process.env.AGENT_REACH_BIN || 'agent-reach')
  const got = await collectVeille({ sujet, sources, requetes, marque, limit, bin, log: (m) => console.error(m) })
  if (got.missing) { console.error('\n' + INSTALL); process.exitCode = 2; return }
  const v = analyzeVeille(got.results, { sujet, marque })
  const out = opt(args, 'sortie', 'rapports-seo')
  mkdirSync(out, { recursive: true })
  const slug = 'veille-' + sujet.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '').slice(0, 50).toLowerCase()
  writeFileSync(join(out, slug + '.json'), JSON.stringify(v, null, 1))
  writeFileSync(join(out, slug + '.md'), veilleMarkdown(v))
  console.error(`\n${v.total} publications lues · ${v.questions.length} questions · ${v.hashtags.length} hashtags observés`)
  for (const r of v.recommandations) console.error('  • ' + r)
  console.error(`\n📄 ${join(out, slug + '.md')}\n🧾 ${join(out, slug + '.json')} (importable dans l’interface : Mots-clés & réseaux)`)
}

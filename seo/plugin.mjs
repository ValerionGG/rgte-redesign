// Construit le plugin Claude Code « seo360 » (plugins/seo360) depuis les skills du dépôt et le moteur SEO 360.
//   node seo/plugin.mjs           construit
//   node seo/plugin.mjs --check   vérifie que le plugin est à jour (code de sortie 1 sinon) — utilisé par les tests
// Les skills du dépôt (.claude/skills) restent la source : dans le plugin, les chemins « seo/… » sont réécrits vers
// le moteur embarqué (${CLAUDE_SKILL_DIR}/../../seo/…), pour que les commandes marchent dans n'importe quel projet.
import { readFileSync, writeFileSync, readdirSync, mkdirSync, rmSync, existsSync, statSync } from 'node:fs'
import { join, dirname, relative } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const SKILLS = join(ROOT, '.claude/skills'), OUT = join(ROOT, 'plugins/seo360')
export const VERSION = '3.0.0'
const PAGES = 'https://valeriongg.github.io/rgte-redesign/seo/'
const REPO = 'https://github.com/valeriongg/rgte-redesign'

// Réécriture des chemins pour le plugin
export function rewrite(md) {
  return md
    // les tests et la synchronisation des études n'existent que dans le dépôt : on ne les réécrit pas
    .replace(/\bnode (?:\.\/)?seo\/(?!test\/|data\/sync\.mjs)([\w./-]+)/g, 'node "${CLAUDE_SKILL_DIR}/../../seo/$1"')
    .replace(/(?<![\w/.\-"$])(?:\.\/)?seo\/(?!test\/|data\/sync\.mjs)(?=[\w-])/g, '${CLAUDE_SKILL_DIR}/../../seo/')
}

const walk = (dir) => readdirSync(dir).flatMap((f) => { const p = join(dir, f); return statSync(p).isDirectory() ? walk(p) : [p] })
const ENGINE = () => [
  // Toutes les commandes : cli.mjs et chaque sous-commande *-cli.mjs (une liste écrite à la main avait oublié outils-cli.mjs).
  ...readdirSync(join(ROOT, 'seo')).filter((f) => f === 'cli.mjs' || /-cli\.mjs$/.test(f)).sort().map((f) => join(ROOT, 'seo', f)),
  ...walk(join(ROOT, 'seo/engine')), ...walk(join(ROOT, 'seo/data')).filter((f) => !/sync\.mjs$/.test(f)),
]

function plan() {
  const files = new Map()
  for (const f of walk(SKILLS)) {
    const rel = relative(SKILLS, f), buf = readFileSync(f)
    files.set(join('skills', rel), /\.md$/.test(f) ? Buffer.from(rewrite(buf.toString('utf8'))) : buf)
  }
  for (const f of ENGINE()) files.set(join('seo', relative(join(ROOT, 'seo'), f)), readFileSync(f))
  const skills = readdirSync(SKILLS).filter((d) => existsSync(join(SKILLS, d, 'SKILL.md'))).sort()
  files.set('.claude-plugin/plugin.json', Buffer.from(JSON.stringify({
    name: 'seo360', version: VERSION,
    description: `Pack SEO 360 en français pour TPE et PME : ${skills.length} skills (audit SEO, SEO local, IA/GEO, Search Console, contenus, réseaux sociaux, hashtags, budget publicitaire, conformité marketing, calendrier) et la ligne de commande SEO 360 embarquée.`,
    author: { name: 'ValerionGG', url: 'https://github.com/valeriongg' }, homepage: PAGES, repository: REPO,
    keywords: ['seo', 'seo-local', 'geo', 'search-console', 'hashtags', 'google-ads', 'tpe', 'francais'],
  }, null, 2) + '\n'))
  files.set('README.md', Buffer.from(readme(skills)))
  return files
}

function readme(skills) {
  const desc = (name) => { const m = readFileSync(join(SKILLS, name, 'SKILL.md'), 'utf8').match(/^description:\s*(.+)$/m); return (m?.[1] || '').split(/\s+À utiliser/)[0].slice(0, 220) }
  return `# SEO 360 — plugin Claude Code

Pack de ${skills.length} skills en français pour les TPE, PME, artisans, commerces et freelances : audit SEO complet, SEO local et fiche Google, visibilité dans les IA (GEO), diagnostic Search Console, rédaction, réseaux sociaux et hashtags, budget publicitaire, conformité marketing française et calendrier des temps forts. La ligne de commande SEO 360 est embarquée : les skills l'utilisent pour mesurer au lieu de deviner.

## Installation

Deux commandes dans Claude Code :

\`\`\`
/plugin marketplace add ValerionGG/rgte-redesign
/plugin install seo360@seo360-fr
\`\`\`

Node 18 ou plus est nécessaire pour les commandes (aucune dépendance à installer).

## Premier usage

Dites « voici mon entreprise » : le skill \`contexte-entreprise\` crée \`.claude/contexte-entreprise.md\` (activité, ville, concurrents, budget, valeur d'un client). Tous les autres skills le lisent avant de poser une question.

## Les skills

${skills.map((s) => `- **${s}** — ${desc(s)}`).join('\n')}

## Commandes embarquées

Dans le plugin, les skills appellent \`node "\${CLAUDE_SKILL_DIR}/../../seo/cli.mjs"\` : audit (\`<url>\`, \`--avant\` après une refonte), \`gsc\` (export Search Console), \`veille\` (Agent Reach), \`calendrier\`, \`budget\`, \`hashtags\`. L'interface web est en ligne : ${PAGES}

## Données et confidentialité

Tout tourne sur votre machine : les exports Search Console et les rapports ne sont envoyés nulle part. Les audits lisent les pages publiques du site analysé. Agent Reach (veille sociale) est en lecture seule et ne se connecte jamais à votre place.

## Évaluations

\`claude plugin eval plugins/seo360\` lance les ${countEvals()} cas du dossier \`evals/\` (2 cas qui doivent déclencher chaque skill, 1 cas voisin qui ne doit pas), avec et sans le plugin.

Généré par \`node seo/plugin.mjs\` depuis \`.claude/skills\` (version ${VERSION}) : ne modifiez pas les fichiers de ce dossier à la main, sauf \`evals/\`.
`
}
const countEvals = () => (existsSync(join(OUT, 'evals')) ? readdirSync(join(OUT, 'evals')).filter((d) => existsSync(join(OUT, 'evals', d, 'prompt.md'))).length : 0)

const MARKET = JSON.stringify({
  name: 'seo360-fr',
  owner: { name: 'ValerionGG', url: 'https://github.com/valeriongg' },
  metadata: { description: 'Skills SEO, GEO, réseaux sociaux et publicité en français pour TPE et PME.', version: VERSION },
  plugins: [{ name: 'seo360', source: './plugins/seo360', description: 'Pack SEO 360 : audit, SEO local, IA, Search Console, contenus, hashtags, budget pub, conformité, calendrier.', version: VERSION }],
}, null, 2) + '\n'

const generated = () => [...walk(join(OUT, 'skills')), ...walk(join(OUT, 'seo'))].map((f) => relative(OUT, f))

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const files = plan(), check = process.argv.includes('--check')
  if (check) {
    const diff = []
    for (const [rel, buf] of files) { const p = join(OUT, rel); if (!existsSync(p) || !readFileSync(p).equals(buf)) diff.push(rel) }
    if (existsSync(join(OUT, 'skills'))) for (const rel of generated()) if (!files.has(rel)) diff.push(rel + ' (en trop)')
    const mp = join(ROOT, '.claude-plugin/marketplace.json')
    if (!existsSync(mp) || readFileSync(mp, 'utf8') !== MARKET) diff.push('.claude-plugin/marketplace.json')
    if (diff.length) { console.error(`Plugin pas à jour (${diff.length}) : ${diff.slice(0, 10).join(', ')}\nLancez : node seo/plugin.mjs`); process.exit(1) }
    console.log('Plugin à jour.')
  } else {
    for (const d of ['skills', 'seo']) rmSync(join(OUT, d), { recursive: true, force: true })
    for (const [rel, buf] of files) { mkdirSync(dirname(join(OUT, rel)), { recursive: true }); writeFileSync(join(OUT, rel), buf) }
    mkdirSync(join(ROOT, '.claude-plugin'), { recursive: true })
    writeFileSync(join(ROOT, '.claude-plugin/marketplace.json'), MARKET)
    console.log(`✓ plugins/seo360 : ${files.size} fichiers (version ${VERSION})`)
  }
}

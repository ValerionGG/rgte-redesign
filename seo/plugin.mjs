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
export const VERSION = '3.1.0'
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

**Dans Claude, Cowork et Claude Code en une fois (recommandé)** : dans l'application Claude, *Personnaliser › Plugins › Ajouter une marketplace*, saisir \`ValerionGG/rgte-redesign\`, puis installer **seo360** depuis *Découvrir*. Un plugin installé là est enregistré dans votre compte : il sert dans Cowork, dans le chat et dans Claude Code.

**Dans Claude Code seul** :

\`\`\`
/plugin marketplace add ValerionGG/rgte-redesign
/plugin install seo360@seo360-fr
\`\`\`

**Packs tiers relus** : le même catalogue propose ${PACKS.length} packs relus le 05/11/2026, chacun épinglé au commit relu (une mise à jour de leur auteur n'arrive pas sans nouvelle relecture). Pour commencer : \`audit-seo-avance\`, \`web-quality-skills\`, puis \`audit-publicite\` si vous faites de la publicité et \`instagram-skills\` ou \`linkedin-skills\` selon vos réseaux. Chaque skill installé coûte des jetons à chaque échange : installez peu, mais juste.

Node 18 ou plus est nécessaire pour les commandes de mesure (aucune dépendance). Si le réseau ne joint pas le site (bac à sable, session cloud filtrée), la mesure passe par Jina Reader ; sinon, \`--html page.html\`.

## Premier usage

Dites « voici mon entreprise » : le skill \`contexte-entreprise\` crée \`.claude/contexte-entreprise.md\` (activité, ville, concurrents, budget, valeur d'un client). Tous les autres skills le lisent avant de poser une question.

## Les skills

${skills.map((s) => `- **${s}** — ${desc(s)}`).join('\n')}

## Commandes embarquées

Dans le plugin, les skills appellent \`node "\${CLAUDE_SKILL_DIR}/../../seo/cli.mjs"\` : audit (\`<url>\`, \`--avant\` après une refonte), \`gsc\` (export Search Console), \`veille\` (Agent Reach), \`calendrier\`, \`budget\`, \`hashtags\`. L'interface web est en ligne : ${PAGES}

## Données et confidentialité

Tout tourne sur votre machine : les exports Search Console et les rapports ne sont envoyés nulle part. Les audits lisent les pages publiques du site analysé, directement, ou par Jina Reader (r.jina.ai) quand le réseau ne joint pas le site. Agent Reach (veille sociale) est en lecture seule et ne se connecte jamais à votre place.

## Évaluations

\`claude plugin eval plugins/seo360\` lance les ${countEvals()} cas du dossier \`evals/\` (2 cas qui doivent déclencher chaque skill, 1 cas voisin qui ne doit pas), avec et sans le plugin.

Généré par \`node seo/plugin.mjs\` depuis \`.claude/skills\` (version ${VERSION}) : ne modifiez pas les fichiers de ce dossier à la main, sauf \`evals/\`.
`
}
const countEvals = () => (existsSync(join(OUT, 'evals')) ? readdirSync(join(OUT, 'evals')).filter((d) => existsSync(join(OUT, 'evals', d, 'prompt.md'))).length : 0)

// Packs tiers relus le 05/11/2026, chacun épinglé au commit relu (sha) : une mise à jour de leur auteur n'arrive
// jamais sans nouvelle relecture. Licence MIT pour tous. Détail : .claude/skills/plan-croissance-360/references/packs-complementaires.md
export const PACKS = [
  ['audit-seo-avance', 'AgriciDaniel/claude-seo', '6be93f45064ffbadced572b5d5c95f55fd263af0', 'seo', 'Projet claude-seo. Audit SEO approfondi en sous-agents : technique, contenu, schéma, local, e-commerce, Search Console, CrUX. 26 skills, environ 4 700 jetons permanents. Un hook valide le JSON-LD après chaque modification de fichier.'],
  ['audit-publicite', 'AgriciDaniel/claude-ads', 'fc3908e786c318776df89a3a098333da377364be', 'publicite', 'Projet claude-ads. Audits publicitaires Google, Meta, TikTok, LinkedIn, Microsoft et autres. 34 skills, environ 6 600 jetons permanents.'],
  ['instagram-skills', 'sergebulaev/instagram-skills', '550d3cf6cece08de75dae64235bd32136820920f', 'reseaux', 'Instagram : légendes, carrousels, Reels, accroches, hashtags. 9 skills, environ 1 800 jetons.'],
  ['linkedin-skills', 'sergebulaev/linkedin-skills', '8f8bc4b40a2d5419b2dcf898772b85712cfbdf41', 'reseaux', 'LinkedIn : posts, commentaires, profil, régularité (B2B). 12 skills, environ 2 100 jetons.'],
  ['social-media-research-skills', 'ScrapeCreators/social-media-research-skills', '64ba7b4dea71e130d2712ffb6c1c1024b3b7c4b2', 'reseaux', 'Données réelles TikTok, Instagram, YouTube : publications hors norme, commentaires, pubs des concurrents. Demande une clé API ScrapeCreators, payante. 13 skills.'],
  ['web-quality-skills', 'addyosmani/web-quality-skills', 'afa8da942115f2961fdbfa80807ea0b232ff6c00', 'technique', 'Performance, Core Web Vitals, accessibilité WCAG 2.2, bonnes pratiques (Addy Osmani). 6 skills, environ 540 jetons.'],
  ['youtube', 'AgriciDaniel/claude-youtube', '84c3fa6805200632fadb4fe2795ef265511271c7', 'reseaux', 'Projet claude-youtube. Chaîne YouTube : SEO vidéo, scripts, miniatures, Shorts, calendrier. Ses scripts demandent une clé de l’API YouTube.'],
  ['aso-skills', 'appeeky/aso-skills', '3919d7c27402d92c7ef698f2016174b874ea189e', 'application', 'Seulement pour une application mobile : 40 skills d’ASO (mots-clés, fiche, concurrents), environ 7 200 jetons permanents.'],
  ['blog-seo', 'AgriciDaniel/claude-blog', '4f9c2cb8fd17f594e868d6c2ce0e8fb2c971f987', 'contenu', 'Projet claude-blog. Seulement pour un blog à fort volume : 32 skills pour écrire, réécrire et auditer des articles, environ 7 300 jetons permanents.'],
  ['local-seo-skills', 'garrettjsmith/localseoskills', 'c3b7a25b7d5cc370752d74cfea240ccf992a24db', 'seo', 'Seulement pour un réseau d’établissements : 39 skills de SEO local, environ 5 900 jetons permanents. Contient un serveur MCP.'],
  ['last30days', 'mvanhorn/last30days-skill', 'e9c31b868ab9d284c1a988e528c3391c51ebf944', 'veille', 'Veille sur 30 jours : Reddit, X, YouTube, Hacker News et autres. 1 skill, environ 100 jetons ; accède au réseau de ces sites.'],
  ['marketing-skills', 'coreyhaines31/marketingskills', '88c79f6528a9347420e57ceb1fff9a60de651768', 'marketing', 'Pack complet de 53 skills marketing (copywriting, offres, e-mails, lead magnets, relations presse), lourd : environ 16 100 jetons permanents. À installer seulement si besoin.'],
]
const MARKET = JSON.stringify({
  name: 'seo360-fr',
  owner: { name: 'ValerionGG', url: 'https://github.com/valeriongg' },
  metadata: { description: 'SEO 360 et les packs tiers relus, en français pour TPE et PME. Chaque pack tiers est épinglé au commit relu.', version: VERSION },
  plugins: [
    { name: 'seo360', source: './plugins/seo360', description: 'Pack SEO 360 : audit, SEO local, IA, Search Console, contenus, hashtags, budget pub, conformité, calendrier.', version: VERSION, category: 'seo' },
    ...PACKS.map(([name, repo, sha, category, d]) => ({ name, source: { source: 'github', repo, sha }, description: `Relu le 05/11/2026 (commit ${sha.slice(0, 7)}, licence MIT). ${d}`, category, homepage: `https://github.com/${repo}` })),
  ],
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

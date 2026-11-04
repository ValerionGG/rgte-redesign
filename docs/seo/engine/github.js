// Audit de référencement d'un dépôt GitHub (API REST publique, CORS ouvert ; 60 requêtes/h sans jeton).
import { scoreFindings, finding as f } from './audit.js'

export const GH_CATS = {
  decouverte: { label: 'Découvrabilité (recherche GitHub & Google)', weight: 0.35 },
  readme: { label: 'README & documentation', weight: 0.3 },
  confiance: { label: 'Confiance & communauté', weight: 0.2 },
  activite: { label: 'Activité & diffusion', weight: 0.15 },
}

export function parseRepo(input) {
  const m = String(input).trim().match(/(?:github\.com\/)?([A-Za-z0-9_.-]+)\/([A-Za-z0-9_.-]+?)(?:\.git)?(?:[/?#].*)?$/)
  return m ? { owner: m[1], repo: m[2] } : null
}

export async function fetchRepo(input, { token = '', fetchImpl = fetch } = {}) {
  const r = parseRepo(input)
  if (!r) return { error: 'Format attendu : owner/repo ou https://github.com/owner/repo' }
  const H = { Accept: 'application/vnd.github+json', ...(token ? { Authorization: `Bearer ${token}` } : {}) }
  const get = async (path, accept) => {
    const res = await fetchImpl(`https://api.github.com/repos/${r.owner}/${r.repo}${path}`, { headers: accept ? { ...H, Accept: accept } : H })
    if (!res.ok) return { status: res.status }
    return { status: res.status, data: accept?.includes('raw') ? await res.text() : await res.json() }
  }
  const repo = await get('')
  if (repo.status !== 200) return { error: repo.status === 404 ? 'Dépôt introuvable (ou privé)' : repo.status === 403 ? 'Limite de l’API GitHub atteinte (60/h sans jeton)' : `Erreur GitHub ${repo.status}` }
  const [readme, community, releases, contributors] = await Promise.all([
    get('/readme', 'application/vnd.github.raw+json'), get('/community/profile'), get('/releases?per_page=5'), get('/contributors?per_page=30&anon=1'),
  ])
  return {
    repo: repo.data, readme: readme.status === 200 ? readme.data : readme.status === 404 ? '' : null,
    community: community.status === 200 ? community.data : null, releases: releases.status === 200 ? releases.data : null,
    contributors: Array.isArray(contributors.data) ? contributors.data.length : null,
  }
}

export function auditRepo(d) {
  const F = [], add = (...a) => F.push(f(...a))
  const r = d.repo, md = d.readme || ''
  const desc = r.description || ''
  if (!desc) add('decouverte', 'critique', 'desc', 'Pas de description', 'La description est indexée par la recherche GitHub et reprise par Google comme extrait.', 'Une phrase de 80–160 caractères : ce que fait le projet + pour qui + mot-clé principal (ex. « Audit SEO open-source en Node.js… »).')
  else if (desc.length < 50) add('decouverte', 'moyen', 'desc-short', `Description courte (${desc.length} car.)`, desc, 'Visez 80–160 caractères avec 2–3 mots-clés recherchés.')
  else add('decouverte', 'ok', 'desc', 'Description renseignée')
  const topics = r.topics || []
  if (topics.length === 0) add('decouverte', 'critique', 'topics', 'Aucun topic', 'Les topics sont le 1er moyen d’apparaître dans github.com/topics/… et la recherche.', 'Ajoutez 6–20 topics : langage, framework, domaine, cas d’usage (ex. seo, seo-audit, lighthouse, nodejs, cli).')
  else if (topics.length < 6) add('decouverte', 'moyen', 'topics-few', `Seulement ${topics.length} topic(s)`, topics.join(', '), 'Montez à 10–20 topics (maximum GitHub : 20).')
  else add('decouverte', 'ok', 'topics', `${topics.length} topics : ${topics.join(', ')}`)
  if (!r.homepage) add('decouverte', 'moyen', 'homepage', 'Pas de site web (champ « Website »)', 'Un lien vers une démo/documentation (GitHub Pages) donne un 2e résultat Google et un lien entrant.', 'Publiez une page de démo ou de doc (GitHub Pages) et renseignez-la.')
  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(r.name)) add('decouverte', 'faible', 'name', 'Nom de dépôt peu lisible pour la recherche', r.name, 'Préférez des mots séparés par des tirets contenant le mot-clé (seo-audit-cli).')
  add('decouverte', 'info', 'social-preview', 'Image d’aperçu social à vérifier', 'Settings → Social preview : image 1280×640 affichée sur LinkedIn, X, Slack, Discord.', 'Ajoutez une image avec le nom + la promesse du projet.')

  const words = (md || '').split(/\s+/).filter(Boolean).length
  if (d.readme == null) add('readme', 'info', 'readme-unknown', 'README non vérifié', 'L’API GitHub n’a pas répondu pour ce fichier (limite de 60 requêtes/h sans jeton).', 'Relancez avec un jeton GitHub.', { effort: 1 })
  else if (!md) add('readme', 'critique', 'readme', 'Pas de README', '', 'Créez un README.md : titre, phrase de promesse, capture/GIF, installation, usage, exemples, licence.', { penalty: 100 })
  else {
    if (words < 150) add('readme', 'important', 'readme-short', `README très court (${words} mots)`, '', 'Développez : pourquoi, fonctionnalités, installation, exemple, FAQ.')
    else add('readme', 'ok', 'readme', `README de ${words} mots`)
    if (!/^#\s+\S/m.test(md)) add('readme', 'moyen', 'readme-h1', 'README sans titre H1', '', 'Commencez par « # Nom du projet » puis une phrase de promesse.')
    if (!/!\[[^\]]*\]\([^)]+\.(png|jpe?g|gif|webp|svg)|<img\s/i.test(md)) add('readme', 'moyen', 'readme-visual', 'Pas de capture ni de GIF de démonstration', 'Les dépôts avec visuel convertissent nettement mieux les visiteurs en étoiles.', 'Ajoutez une capture ou un GIF de 5–10 s en haut du README.')
    if (!/(install|npm i|pip install|brew install|docker|go install|cargo add|composer require)/i.test(md)) add('readme', 'moyen', 'readme-install', 'Pas de section installation', '', 'Ajoutez « ## Installation » avec une commande copiable.')
    if (!/(usage|utilisation|exemple|example|quick ?start|démarrage)/i.test(md)) add('readme', 'moyen', 'readme-usage', 'Pas d’exemple d’utilisation', '', 'Ajoutez « ## Utilisation » avec un exemple minimal et sa sortie.')
    if (!/shields\.io|badge|\[!\[/i.test(md)) add('readme', 'faible', 'badges', 'Pas de badges', '', 'Badges version, licence, CI, téléchargements : signaux de sérieux.')
    if ((md.match(/^##\s/gm) || []).length < 3) add('readme', 'faible', 'readme-structure', 'README peu structuré', '', 'Utilisez des sections ## (Fonctionnalités, Installation, Utilisation, Contribuer, Licence).')
    const kw = (desc + ' ' + topics.join(' ')).toLowerCase().split(/[^a-z0-9]+/).filter((w) => w.length > 3)
    const head = md.slice(0, 600).toLowerCase()
    if (kw.length && !kw.some((w) => head.includes(w))) add('readme', 'faible', 'readme-kw', 'Les mots-clés n’apparaissent pas en haut du README', '', 'Reprenez les mots-clés de la description dans les 2 premières lignes du README.')
  }

  if (!r.license) add('confiance', 'important', 'license', 'Pas de licence', 'Sans licence, personne ne peut légalement réutiliser le code : frein majeur à l’adoption.', 'Ajoutez une licence (MIT, Apache-2.0, AGPL… selon vos objectifs).')
  else add('confiance', 'ok', 'license', `Licence ${r.license.spdx_id}`)
  const files = d.community?.files || {}
  if (!d.community) add('confiance', 'info', 'community-unknown', 'Fichiers communautaires non vérifiés', 'L’API GitHub n’a pas répondu (limite de 60 requêtes/h sans jeton).', 'Relancez avec un jeton GitHub.', { effort: 1 })
  else if (!files.contributing) add('confiance', 'faible', 'contributing', 'Pas de CONTRIBUTING.md', '', 'Expliquez comment contribuer : plus de PR, plus de signaux d’activité.')
  if (d.community && !files.code_of_conduct) add('confiance', 'faible', 'coc', 'Pas de code de conduite', '', 'Ajoutez CODE_OF_CONDUCT.md (modèle Contributor Covenant).')
  if (d.community && !files.issue_template) add('confiance', 'faible', 'issue-template', 'Pas de modèle d’issue', '', 'Ajoutez .github/ISSUE_TEMPLATE pour des rapports exploitables.')
  if (!r.has_discussions) add('confiance', 'faible', 'discussions', 'Discussions désactivées', '', 'Activez Discussions : questions d’usage hors des issues, contenu indexé.')
  if (d.contributors != null && d.contributors < 2) add('confiance', 'info', 'contributors', 'Un seul contributeur', '', 'Taguez des issues « good first issue » pour attirer des contributeurs.')

  const days = (Date.now() - new Date(r.pushed_at).getTime()) / 864e5
  if (days > 365) add('activite', 'important', 'stale', `Aucun commit depuis ${Math.round(days)} jours`, 'Un projet inactif est moins recommandé et moins mis en avant.', 'Publiez une mise à jour (dépendances, docs) ou indiquez le statut (maintenu / archivé).')
  else if (days > 120) add('activite', 'faible', 'stale', `Dernier commit il y a ${Math.round(days)} jours`)
  else add('activite', 'ok', 'active', 'Dépôt actif')
  if (d.releases == null) add('activite', 'info', 'releases-unknown', 'Releases non vérifiées', 'L’API GitHub n’a pas répondu (limite d’appels).', '', { effort: 1 })
  else if (!d.releases.length) add('activite', 'moyen', 'releases', 'Aucune release', 'Les releases déclenchent des notifications aux « watchers » et apparaissent dans les flux.', 'Publiez des releases versionnées (SemVer) avec notes de version.')
  if (r.archived) add('activite', 'important', 'archived', 'Dépôt archivé', '', 'Désarchivez si le projet est maintenu.')
  add('activite', 'info', 'promo', 'Diffusion', 'Listes « awesome-… » de votre domaine, Hacker News (Show HN), Reddit, Product Hunt, dev.to, LinkedIn, newsletter du domaine.', 'Préparez un post « Show HN » + une soumission à 2–3 listes awesome pertinentes.')
  return scoreFindings(F, GH_CATS, { stars: r.stargazers_count, forks: r.forks_count, watchers: r.subscribers_count, language: r.language, topics, homepage: r.homepage, name: r.full_name, description: desc })
}

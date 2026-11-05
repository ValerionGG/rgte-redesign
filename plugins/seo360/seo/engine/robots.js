// robots.txt : analyse (RFC 9309) + robots IA.

export function parseRobots(txt = '') {
  const groups = [], sitemaps = []
  let signal = null
  let cur = null, lastWasUA = false
  for (const raw of txt.split(/\r?\n/)) {
    const line = raw.replace(/#.*/, '').trim()
    if (!line) continue
    const i = line.indexOf(':')
    if (i < 0) continue
    const k = line.slice(0, i).trim().toLowerCase(), v = line.slice(i + 1).trim()
    if (k === 'user-agent') {
      if (!lastWasUA || !cur) { cur = { agents: [], rules: [] }; groups.push(cur) }
      cur.agents.push(v.toLowerCase()); lastWasUA = true
    } else {
      lastWasUA = false
      if (k === 'sitemap') sitemaps.push(v)
      else if (cur && (k === 'allow' || k === 'disallow')) cur.rules.push({ allow: k === 'allow', path: v })
      else if (cur && k === 'crawl-delay') cur.crawlDelay = +v
      else if (k === 'content-signal') { const sig = parseSignal(v); if (cur) cur.signal = { ...cur.signal, ...sig }; else signal = { ...signal, ...sig } }
    }
  }
  // Content-Signal (politique de Cloudflare) : préférences d'usage search / ai-input / ai-train, pas un blocage technique
  const star = groups.find((g) => g.agents.includes('*'))
  return { groups, sitemaps, signal: star?.signal || signal || null }
}
function parseSignal(v) {
  const o = {}
  for (const part of v.split(/[,;]\s*/)) { const [key, val] = part.split('=').map((x) => (x || '').trim().toLowerCase()); if (key && /^(yes|no)$/.test(val)) o[key] = val === 'yes' }
  return o
}

function groupFor(parsed, ua) {
  ua = ua.toLowerCase()
  let best = null, bestLen = -1
  for (const g of parsed.groups) for (const a of g.agents) {
    if (a !== '*' && ua.includes(a) && a.length > bestLen) { best = g; bestLen = a.length }
  }
  return best || parsed.groups.find((g) => g.agents.includes('*')) || null
}

const toRe = (p) => new RegExp('^' + p.replace(/[.+?^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*').replace(/\\\$$/, '$'))

export function allowed(parsed, ua, path = '/') {
  const g = groupFor(parsed, ua)
  if (!g) return { allowed: true, explicit: false }
  let match = null
  for (const r of g.rules) {
    if (r.path === '') { if (!r.allow) continue }
    if (toRe(r.path).test(path) && (!match || r.path.length > match.path.length || (r.path.length === match.path.length && r.allow))) match = r
  }
  return { allowed: !match || match.allow || match.path === '', explicit: g.agents.some((a) => a !== '*' && ua.toLowerCase().includes(a)) }
}

// Robots des moteurs et des IA (fin 2026), en 3 niveaux pour les IA :
// ia-recherche = index qui sert à citer le site ; ia-utilisateur = lecture déclenchée par la question d'un utilisateur ;
// ia-entrainement = entraînement de modèles. AI Overviews et AI Mode dépendent de Googlebot (et de nosnippet / max-snippet),
// pas de Google-Extended.
export const BOTS_VERIFIED = '2026-11-05' // liste des robots revue le (à revoir tous les 3 à 4 mois)
export const BOTS = [
  { ua: 'Googlebot', owner: 'Google Search (y compris AI Overviews et AI Mode)', kind: 'moteur' },
  { ua: 'Bingbot', owner: 'Bing (alimente aussi Copilot, DuckDuckGo et en partie ChatGPT Search)', kind: 'moteur' },
  { ua: 'Applebot', owner: 'Apple (Siri, Spotlight)', kind: 'moteur' },
  { ua: 'OAI-SearchBot', owner: 'OpenAI — index de ChatGPT Search', kind: 'ia-recherche' },
  { ua: 'PerplexityBot', owner: 'Perplexity — index', kind: 'ia-recherche' },
  { ua: 'Claude-SearchBot', owner: 'Anthropic — index de recherche de Claude', kind: 'ia-recherche' },
  { ua: 'DuckAssistBot', owner: 'DuckDuckGo — DuckAssist', kind: 'ia-recherche' },
  { ua: 'ChatGPT-User', owner: 'OpenAI — lecture à la demande', kind: 'ia-utilisateur' },
  { ua: 'Perplexity-User', owner: 'Perplexity — lecture à la demande', kind: 'ia-utilisateur' },
  { ua: 'Claude-User', owner: 'Anthropic — lecture à la demande', kind: 'ia-utilisateur' },
  { ua: 'MistralAI-User', owner: 'Mistral — Le Chat, lecture à la demande', kind: 'ia-utilisateur' },
  { ua: 'GPTBot', owner: 'OpenAI — entraînement', kind: 'ia-entrainement' },
  { ua: 'ClaudeBot', owner: 'Anthropic — entraînement', kind: 'ia-entrainement' },
  { ua: 'Google-Extended', owner: 'Google — entraînement et réponses de Gemini (sans effet sur la recherche Google ni AI Overviews)', kind: 'ia-entrainement' },
  { ua: 'Applebot-Extended', owner: 'Apple Intelligence — entraînement', kind: 'ia-entrainement' },
  { ua: 'CCBot', owner: 'Common Crawl', kind: 'ia-entrainement' },
  { ua: 'Meta-ExternalAgent', owner: 'Meta AI', kind: 'ia-entrainement' },
  { ua: 'Bytespider', owner: 'ByteDance', kind: 'ia-entrainement' },
  { ua: 'Amazonbot', owner: 'Amazon (Alexa, Rufus)', kind: 'ia-entrainement' },
]

export function botMatrix(parsed, path = '/') {
  return BOTS.map((b) => ({ ...b, ...allowed(parsed, b.ua, path) }))
}

export const ROBOTS_TEMPLATE = (origin) => `# robots.txt — base à adapter (ne bloquez que ce qui ne doit pas être exploré)
User-agent: *
# Préférences d'usage, facultatif (politique Content-Signal de Cloudflare) :
# Content-Signal: search=yes, ai-input=yes, ai-train=no
# Exemples à adapter à VOTRE site (attention : « Disallow: /recherche » bloque aussi /recherche-et-developpement) :
# Disallow: /panier/
# Disallow: /mon-compte/
Allow: /

# IA : index de recherche (pour être cité) et lecture à la demande (quand un utilisateur pose une question) — autorisés
User-agent: OAI-SearchBot
User-agent: PerplexityBot
User-agent: Claude-SearchBot
User-agent: ChatGPT-User
User-agent: Claude-User
User-agent: Perplexity-User
User-agent: MistralAI-User
Allow: /

# Entraînement des modèles : choix éditorial (décommentez pour refuser).
# Google-Extended ne règle que Gemini : aucun effet sur la recherche Google ni sur AI Overviews.
# User-agent: GPTBot
# User-agent: ClaudeBot
# User-agent: Google-Extended
# User-agent: CCBot
# Disallow: /

Sitemap: ${origin}/sitemap.xml`

// Correctif robots.txt qui part du fichier existant : toutes vos règles sont gardées, seuls les robots
// listés dans `unblock` (recherche IA, lecture à la demande) sont autorisés. Sans fichier lu : modèle de base.
export function mergeRobots(body, origin, unblock = []) {
  if (!body || !String(body).trim()) return ROBOTS_TEMPLATE(origin)
  const want = new Set(unblock.map((u) => u.toLowerCase()))
  const lines = String(body).replace(/\r\n?/g, '\n').replace(/\n+$/, '').split('\n')
  const key = (l) => { const m = l.replace(/#.*/, '').match(/^\s*([A-Za-z-]+)\s*:\s*(.*)$/); return m ? [m[1].toLowerCase(), m[2].trim()] : null }
  // Groupes : une suite de lignes User-agent, puis les règles jusqu'au groupe suivant
  const groups = []
  let cur = null, lastUA = false
  lines.forEach((l, i) => {
    const kv = key(l)
    if (!kv) return
    if (kv[0] === 'user-agent') { if (!lastUA || !cur) { cur = { ua: [], rules: [] }; groups.push(cur) } cur.ua.push({ i, name: kv[1].toLowerCase() }); lastUA = true }
    else { lastUA = false; if (cur && (kv[0] === 'allow' || kv[0] === 'disallow')) cur.rules.push({ i, k: kv[0], v: kv[1] }) }
  })
  const out = lines.slice(), moved = new Set()
  for (const g of groups) {
    const mine = g.ua.filter((u) => want.has(u.name))
    if (!mine.length) continue
    if (mine.length === g.ua.length) {
      // groupe réservé à ces robots : on retire leurs interdictions
      for (const r of g.rules) if (r.k === 'disallow' && r.v) out[r.i] = `# (retiré par SEO 360) ${lines[r.i].trim()}`
      if (!g.rules.some((r) => r.k === 'allow' && r.v === '/')) out[g.ua.at(-1).i] += '\nAllow: /'
    } else for (const u of mine) { out[u.i] = `# (déplacé plus bas par SEO 360) ${lines[u.i].trim()}`; moved.add(u.name) }
  }
  const named = new Set(groups.flatMap((g) => g.ua.map((u) => u.name)))
  const add = unblock.filter((u) => moved.has(u.toLowerCase()) || !named.has(u.toLowerCase()))
  const text = ['# Votre robots.txt, avec seulement les robots de recherche IA débloqués : vos autres règles sont conservées.', ...out]
  if (add.length) text.push('', '# Robots de recherche IA autorisés (ajouté par SEO 360)', ...add.map((u) => `User-agent: ${u}`), 'Allow: /')
  if (!lines.some((l) => /^\s*sitemap\s*:/i.test(l))) text.push('', `Sitemap: ${origin}/sitemap.xml`)
  return text.join('\n') + '\n'
}

// robots.txt : analyse (RFC 9309) + robots IA.

export function parseRobots(txt = '') {
  const groups = [], sitemaps = []
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
    }
  }
  return { groups, sitemaps }
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

// Robots des moteurs et des IA (fin 2026). search = visibilité dans les réponses ; training = entraînement de modèles.
export const BOTS = [
  { ua: 'Googlebot', owner: 'Google Search', kind: 'moteur' },
  { ua: 'Bingbot', owner: 'Bing (alimente aussi ChatGPT Search, Copilot, DuckDuckGo)', kind: 'moteur' },
  { ua: 'Applebot', owner: 'Apple (Siri, Spotlight)', kind: 'moteur' },
  { ua: 'OAI-SearchBot', owner: 'OpenAI — ChatGPT Search', kind: 'ia-recherche' },
  { ua: 'ChatGPT-User', owner: 'OpenAI — navigation à la demande', kind: 'ia-recherche' },
  { ua: 'PerplexityBot', owner: 'Perplexity — index', kind: 'ia-recherche' },
  { ua: 'Perplexity-User', owner: 'Perplexity — à la demande', kind: 'ia-recherche' },
  { ua: 'Claude-SearchBot', owner: 'Anthropic — recherche Claude', kind: 'ia-recherche' },
  { ua: 'Claude-User', owner: 'Anthropic — à la demande', kind: 'ia-recherche' },
  { ua: 'MistralAI-User', owner: 'Mistral — Le Chat', kind: 'ia-recherche' },
  { ua: 'DuckAssistBot', owner: 'DuckDuckGo — DuckAssist', kind: 'ia-recherche' },
  { ua: 'GPTBot', owner: 'OpenAI — entraînement', kind: 'ia-entrainement' },
  { ua: 'ClaudeBot', owner: 'Anthropic — entraînement', kind: 'ia-entrainement' },
  { ua: 'Google-Extended', owner: 'Google — Gemini / entraînement', kind: 'ia-entrainement' },
  { ua: 'Applebot-Extended', owner: 'Apple Intelligence — entraînement', kind: 'ia-entrainement' },
  { ua: 'CCBot', owner: 'Common Crawl', kind: 'ia-entrainement' },
  { ua: 'Meta-ExternalAgent', owner: 'Meta AI', kind: 'ia-entrainement' },
  { ua: 'Bytespider', owner: 'ByteDance', kind: 'ia-entrainement' },
  { ua: 'Amazonbot', owner: 'Amazon (Alexa, Rufus)', kind: 'ia-entrainement' },
]

export function botMatrix(parsed, path = '/') {
  return BOTS.map((b) => ({ ...b, ...allowed(parsed, b.ua, path) }))
}

export const ROBOTS_TEMPLATE = (origin) => `# robots.txt — moteurs et IA de recherche autorisés
User-agent: *
Disallow: /panier
Disallow: /compte
Disallow: /*?*sort=
Disallow: /recherche

# Visibilité dans les réponses IA (ChatGPT, Perplexity, Claude…)
User-agent: OAI-SearchBot
User-agent: ChatGPT-User
User-agent: PerplexityBot
User-agent: Claude-SearchBot
Allow: /

# Entraînement des modèles : choix éditorial (décommentez pour refuser)
# User-agent: GPTBot
# User-agent: ClaudeBot
# User-agent: Google-Extended
# User-agent: CCBot
# Disallow: /

Sitemap: ${origin}/sitemap.xml`

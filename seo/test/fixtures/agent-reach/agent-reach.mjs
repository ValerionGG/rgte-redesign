#!/usr/bin/env node
// Faux Agent Reach pour les tests : imite la sortie JSON documentée ({ ok, channel, action, backend, items, error }).
const [channel, action, query] = process.argv.slice(2)
const out = (o) => process.stdout.write(JSON.stringify({ schema_version: 1, channel, action, backend: 'test', meta: { query }, ...o }) + '\n')
if (channel === 'reddit') out({ ok: true, items: [
  { title: 'Quelle est la meilleure pâtisserie à Lyon ?', url: 'https://www.reddit.com/r/lyon/comments/a1', author: 'u1', text: 'On cherche un entremets pour un anniversaire. #PatisserieLyon #lyon', raw: { score: 120, num_comments: 45 } },
  { title: 'Combien coûte une pièce montée pour 40 personnes ?', url: 'https://www.reddit.com/r/patisserie/comments/a2', text: 'Des idées de prix ? #piecemontee #patisserielyon', raw: { score: 30, num_comments: 12 } },
  { title: 'Mon avis sur Maison Exemple', url: 'https://www.reddit.com/r/lyon/comments/a3', text: 'Super accueil chez Maison Exemple, les tartes sont incroyables. #patisserielyon', raw: { score: 8 } },
] })
else if (channel === 'youtube') out({ ok: true, items: [
  { title: 'Les 5 meilleures pâtisseries de Lyon (test à l’aveugle)', url: 'https://www.youtube.com/watch?v=abc', text: 'Notre tournée gourmande #lyon #patisserie', raw: { view_count: 250000, like_count: 9000 } },
] })
else if (channel === 'twitter') out({ ok: false, items: [], error: { code: 'NEED_LOGIN', message: 'login required', hint: 'agent-reach login twitter' } })
else out({ ok: false, items: [], error: { code: 'BAD_INPUT', message: 'unknown channel' } })

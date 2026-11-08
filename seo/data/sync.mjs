// Régénère les modules JS (navigateur + Node) depuis les JSON de recherche. Usage : node seo/data/sync.mjs
import { readFileSync, writeFileSync, readdirSync } from 'node:fs'
const dir = new URL('./research/', import.meta.url)
for (const f of readdirSync(dir).filter((x) => x.endsWith('.json'))) {
  const d = JSON.parse(readFileSync(new URL(f, dir), 'utf8'))
  writeFileSync(new URL(f.replace('.json', '.js'), dir), `// Généré depuis ${f} (recherche du ${d.generated || '?'}). Ne pas éditer à la main : modifiez le .json puis node seo/data/sync.mjs\nexport default ${JSON.stringify(d, null, 1)}\n`)
  console.log('✓', f)
}

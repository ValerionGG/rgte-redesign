// Génère seo/fonts.css : les deux polices (licence OFL, sous-ensemble latin, qui couvre le français, œ et €)
// incluses en data: URI. Pas de service tiers (Google Fonts) et compatible avec la page claude.ai.
// node seo/fonts/make-css.mjs
import { readFileSync, writeFileSync } from 'node:fs'
const dir = new URL('./', import.meta.url)
const face = (family, file, weights) => `@font-face { font-family: "${family}"; font-style: normal; font-display: swap; font-weight: ${weights}; src: url(data:font/woff2;base64,${readFileSync(new URL(file, dir)).toString('base64')}) format("woff2"); }`
writeFileSync(new URL('../fonts.css', dir), [
  '/* Polices de SEO 360 — Bricolage Grotesque (titres) et Figtree (texte), SIL Open Font License 1.1 : voir seo/fonts/. Fichier généré par seo/fonts/make-css.mjs. */',
  face('Bricolage Grotesque Variable', 'bricolage-grotesque-latin-wght-normal.woff2', '200 800'),
  face('Figtree Variable', 'figtree-latin-wght-normal.woff2', '300 900'),
].join('\n') + '\n')
console.log('fonts.css écrit')

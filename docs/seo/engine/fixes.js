// Correctifs prêts à coller, construits à partir de la page analysée (titre, H1, téléphone, adresse,
// réseaux détectés…) et non de gabarits à trous. Ce qui n'est pas connu est omis plutôt qu'inventé.
// Chaque correctif : { label, lang: 'html'|'text'|'json'|'apache'|'nginx', value, note? }
import { sectorById } from '../data/sectors.js'

const cut = (s, n) => {
  s = String(s || '').replace(/\s+/g, ' ').trim()
  if (s.length <= n) return s
  const c = s.slice(0, n + 1)
  return (c.slice(0, c.lastIndexOf(' ')) || c.slice(0, n)).replace(/[\s,;:–—-]+$/, '') + '…'
}
const cap = (s) => (s ? s[0].toUpperCase() + s.slice(1) : s)
const escAttr = (s) => String(s || '').replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;')
const norm = (s) => String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')

// Éléments réutilisables extraits de la page
export function facts(report) {
  const r = report, p = r.ctx?.pageFull || null, page = r.ctx?.page || {}, m = r.result?.meta || {}, input = r.input || {}
  let origin = 'https://votre-site.fr', url = r.target
  try { const U = new URL(r.ctx?.fetch?.finalUrl || r.target); origin = U.origin; url = U.href } catch {}
  const brand = input.brand || page.og?.site_name || (page.title || '').split(/\s[|–—-]\s/).pop()?.trim() || ''
  const h1 = page.h?.find((h) => h.level === 1)?.text || ''
  const phone = m.phone || ''
  const address = m.address || null
  const sameAs = Object.values(m.social || {}).filter((u) => !/github\.com/.test(u) || r.kind === 'github')
  const image = page.og?.image || page.firstImage || ''
  return { origin, url, brand, h1, phone, address, sameAs, image, city: input.city || address?.locality || '', keyword: input.keyword || '', sector: sectorById(input.sector), page, p, meta: m, input }
}

export function suggestTitle(f) {
  let subject = cap(f.keyword || f.h1 || f.page.title || f.sector.keywords[0])
  // « pâtisserie lyon » → « Pâtisserie Lyon » : la ville garde sa majuscule
  if (f.city) subject = subject.replace(new RegExp(f.city.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i'), f.city)
  const city = f.city && !norm(subject).includes(norm(f.city)) ? ` à ${f.city}` : ''
  const brand = f.brand && !norm(subject).includes(norm(f.brand)) ? ` | ${f.brand}` : ''
  let t = `${subject}${city}${brand}`
  if (t.length > 60) t = `${subject}${city}`.length <= 60 ? `${subject}${city}` : cut(subject, 57)
  return t
}

export function suggestDescription(f) {
  const text = (f.page.intro || f.page.metaDescription || '').trim()
  const goal = f.input.goal
  const cta = goal === 'ventes' ? 'Commandez en ligne.' : goal === 'telechargements' ? 'Téléchargez l’application.' : f.sector.local || f.input.local ? (f.phone ? `Appelez le ${f.phone}.` : 'Demandez votre devis gratuit.') : 'Demandez une démo ou un devis.'
  // Coupe de préférence à la fin d'une phrase
  let intro = text ? cut(text, 150 - cta.length - 1) : ''
  const end = intro.lastIndexOf('. ')
  if (end >= 60) intro = intro.slice(0, end + 1)
  const base = text ? intro : `${cap(f.keyword || f.h1 || f.sector.keywords[0])}${f.city ? ' à ' + f.city : ''} : ${f.brand ? f.brand + ', ' : ''}[votre bénéfice principal + une preuve chiffrée].`
  return `${base.replace(/…$/, '.')} ${cta}`.replace(/\.\./g, '.').trim()
}

export function jsonLd(f, { local } = {}) {
  const type = f.sector.schema.find((t) => t !== 'Product' && t !== 'Offer' && t !== 'FAQPage') || 'Organization'
  const o = { '@context': 'https://schema.org', '@type': local ? type : (type === 'LocalBusiness' ? 'Organization' : type) }
  if (f.brand) o.name = f.brand
  o.url = f.origin + '/'
  const logo = f.page.icons?.find?.((i) => /apple-touch|192|512/.test(i.sizes + i.rel))?.href
  if (logo) o.logo = logo
  if (f.image) o.image = f.image
  if (f.phone) o.telephone = intlPhone(f.phone)
  if (local && f.address) o.address = { '@type': 'PostalAddress', ...(f.address.street ? { streetAddress: f.address.street } : {}), postalCode: f.address.postalCode, addressLocality: f.address.locality, addressCountry: 'FR' }
  if (f.sameAs.length) o.sameAs = f.sameAs
  return `<script type="application/ld+json">\n${JSON.stringify(o, null, 2)}\n</script>`
}

const SERVER = {
  https: { apache: 'RewriteEngine On\nRewriteCond %{HTTPS} off\nRewriteRule ^ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]', nginx: 'server {\n  listen 80;\n  server_name exemple.fr www.exemple.fr;\n  return 301 https://$host$request_uri;\n}' },
  www: { apache: '# Exemple : forcer la version sans www\nRewriteEngine On\nRewriteCond %{HTTP_HOST} ^www\\.(.+)$ [NC]\nRewriteRule ^ https://%1%{REQUEST_URI} [L,R=301]', nginx: 'server {\n  server_name www.exemple.fr;\n  return 301 https://exemple.fr$request_uri;\n}' },
  hsts: { apache: 'Header always set Strict-Transport-Security "max-age=31536000; includeSubDomains"', nginx: 'add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;' },
  nosniff: { apache: 'Header always set X-Content-Type-Options "nosniff"', nginx: 'add_header X-Content-Type-Options "nosniff" always;' },
  compression: { apache: '<IfModule mod_deflate.c>\n  AddOutputFilterByType DEFLATE text/html text/css application/javascript application/json image/svg+xml\n</IfModule>', nginx: 'gzip on;\ngzip_types text/css application/javascript application/json image/svg+xml;\n# brotli on; (si le module est installé)' },
  cache: { apache: '<IfModule mod_expires.c>\n  ExpiresActive On\n  ExpiresByType text/css "access plus 1 year"\n  ExpiresByType application/javascript "access plus 1 year"\n  ExpiresByType image/webp "access plus 1 year"\n  ExpiresByType text/html "access plus 0 seconds"\n</IfModule>', nginx: 'location ~* \\.(css|js|webp|avif|png|jpe?g|svg|woff2)$ {\n  expires 1y;\n  add_header Cache-Control "public, immutable";\n}' },
}

export function buildFixes(report) {
  const R = report.result
  if (!R) return {}
  const f = facts(report)
  const local = report.input?.local ?? f.sector.local
  const out = {}
  const put = (id, fx) => { out[id] = fx }
  const title = suggestTitle(f), desc = suggestDescription(f)
  const metaBlock = `<title>${escAttr(title)}</title>\n<meta name="description" content="${escAttr(desc)}">`
  for (const id of ['title', 'title-long', 'title-short', 'title-multi', 'keyword', 'city', 'lh-document-title']) put(id, { label: 'Titre proposé (à relire)', lang: 'html', value: `<title>${escAttr(title)}</title>`, note: `${title.length} caractères.` })
  for (const id of ['description', 'description-long', 'description-short', 'lh-meta-description']) put(id, { label: 'Meta description proposée (à relire)', lang: 'html', value: `<meta name="description" content="${escAttr(desc)}">`, note: `${desc.length} caractères. Remplacez les crochets s’il y en a.` })
  if (report.result.issues.some((i) => i.id === 'keyword')) put('keyword', { label: 'Titre et meta proposés', lang: 'html', value: metaBlock })
  for (const id of ['h1', 'h1-empty', 'h1-multi']) put(id, { label: 'H1 proposé', lang: 'html', value: `<h1>${escAttr(cap(f.keyword || f.h1 || f.page.title || ''))}${f.city && !norm(f.keyword || f.h1).includes(norm(f.city)) ? ' à ' + escAttr(f.city) : ''}</h1>`, note: 'Un seul H1 par page ; le logo ne doit pas être un H1.' })
  put('canonical', { label: 'Canonical', lang: 'html', value: `<link rel="canonical" href="${escAttr(f.url)}">` })
  put('canonical-multi', out.canonical)
  put('lang', { label: 'Langue', lang: 'html', value: '<html lang="fr">' })
  put('viewport', { label: 'Viewport', lang: 'html', value: '<meta name="viewport" content="width=device-width, initial-scale=1">' })
  put('zoom', out.viewport)
  put('charset', { label: 'Encodage', lang: 'html', value: '<meta charset="utf-8">', note: 'Tout en haut du <head>.' })
  put('doctype', { label: 'Doctype', lang: 'html', value: '<!doctype html>', note: 'Première ligne du document.' })
  put('noindex', { label: 'Meta robots', lang: 'html', value: '<meta name="robots" content="index, follow, max-image-preview:large">', note: 'Vérifiez aussi l’en-tête X-Robots-Tag côté serveur et l’option « Demander aux moteurs de ne pas indexer » de votre CMS.' })
  put('nofollow', out.noindex); put('max-image-preview', out.noindex)
  const ogImg = f.image || `${f.origin}/og-image.jpg`
  put('og', { label: 'Open Graph + Twitter', lang: 'html', value: `<meta property="og:type" content="website">\n<meta property="og:title" content="${escAttr(title)}">\n<meta property="og:description" content="${escAttr(desc)}">\n<meta property="og:image" content="${escAttr(ogImg)}">\n<meta property="og:url" content="${escAttr(f.url)}">\n<meta property="og:locale" content="fr_FR">\n<meta name="twitter:card" content="summary_large_image">`, note: f.image ? 'Image : celle de la page (idéal : 1200 × 630 px).' : 'Créez une image 1200 × 630 px.' })
  put('og-image-rel', out.og); put('twitter', { label: 'Twitter / X', lang: 'html', value: '<meta name="twitter:card" content="summary_large_image">' })
  put('favicon', { label: 'Icônes', lang: 'html', value: '<link rel="icon" href="/favicon.svg" type="image/svg+xml">\n<link rel="icon" href="/favicon-48.png" sizes="48x48">\n<link rel="apple-touch-icon" href="/apple-touch-icon.png">' })
  put('apple-icon', { label: 'Icône iOS', lang: 'html', value: '<link rel="apple-touch-icon" href="/apple-touch-icon.png">', note: 'PNG 180 × 180 px.' })
  const ld = jsonLd(f, { local })
  for (const id of ['schema-none', 'schema-sector', 'schema-org', 'localbusiness', 'sameas']) put(id, { label: 'Données structurées (avec ce qui a été détecté sur la page)', lang: 'html', value: ld, note: 'Ajoutez les horaires (openingHoursSpecification) et l’adresse exacte si absents. Testez sur search.google.com/test/rich-results.' })
  put('hours', { label: 'Horaires structurés (à ajouter dans le JSON-LD)', lang: 'json', value: JSON.stringify({ openingHoursSpecification: [{ '@type': 'OpeningHoursSpecification', dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'], opens: '09:00', closes: '18:00' }] }, null, 2), note: 'Adaptez les jours et heures.' })
  try {
    const parts = new URL(f.url).pathname.split('/').filter(Boolean)
    if (parts.length) put('breadcrumb', { label: 'Fil d’Ariane structuré', lang: 'html', value: `<script type="application/ld+json">\n${JSON.stringify({ '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [{ '@type': 'ListItem', position: 1, name: 'Accueil', item: f.origin + '/' }, ...parts.map((p, i) => ({ '@type': 'ListItem', position: i + 2, name: cap(decodeURIComponentSafe(p).replace(/[-_]/g, ' ').replace(/\.\w+$/, '')), item: f.origin + '/' + parts.slice(0, i + 1).join('/') }))] }, null, 2)}\n</script>` })
  } catch {}
  if (f.phone) put('tel', { label: 'Téléphone cliquable', lang: 'html', value: `<a href="tel:${intlPhone(f.phone).replace(/\s/g, '')}">${escAttr(f.phone)}</a>` })
  else put('tel', { label: 'Téléphone cliquable', lang: 'html', value: '<a href="tel:+33XXXXXXXXX">0X XX XX XX XX</a>' })
  put('nap', { label: 'Bloc NAP (pied de page)', lang: 'html', value: `<address>\n  <strong>${escAttr(f.brand || 'Nom exact de l’entreprise')}</strong><br>\n  ${escAttr(f.address?.street || 'N° et rue')}<br>\n  ${escAttr(f.address?.postalCode || 'Code postal')} ${escAttr(f.address?.locality || f.city || 'Ville')}<br>\n  ${f.phone ? `<a href="tel:${intlPhone(f.phone).replace(/\s/g, '')}">${escAttr(f.phone)}</a>` : '<a href="tel:+33…">Téléphone</a>'}\n</address>`, note: 'Strictement identique à la fiche Google Business Profile.' })
  put('gbp-link', { label: 'Lien vers la fiche Google', lang: 'html', value: '<a href="https://maps.app.goo.gl/VOTRE-LIEN" rel="noopener">Itinéraire et avis Google</a>', note: 'Lien « Partager » de votre fiche Google Maps.' })
  const socials = f.sameAs
  put('social-links', { label: 'Liens vers vos réseaux (pied de page)', lang: 'html', value: (socials.length ? socials : ['https://www.instagram.com/votre-compte', 'https://www.linkedin.com/company/votre-entreprise']).map((u) => `<a href="${escAttr(u)}" aria-label="${escAttr(netName(u))} de ${escAttr(f.brand || 'notre entreprise')}" rel="me noopener">…icône…</a>`).join('\n') })
  put('robots-ai-search', { label: 'robots.txt (base à adapter)', lang: 'text', value: robotsTxt(f.origin) })
  for (const id of ['robots-block', 'robots-all', 'robots-bing', 'robots-missing', 'robots-sitemap', 'robots-assets']) put(id, out['robots-ai-search'])
  put('llms', { label: '/llms.txt', lang: 'text', value: llmsTxt(f, report) })
  const urls = (report.ctx?.crawl?.pages || []).filter((x) => x.status === 200).map((x) => x.url)
  put('sitemap', { label: 'sitemap.xml (pages explorées)', lang: 'html', value: `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${(urls.length ? urls : [f.origin + '/']).slice(0, 50).map((u) => `  <url><loc>${escAttr(u)}</loc><lastmod>${new Date().toISOString().slice(0, 10)}</lastmod></url>`).join('\n')}\n</urlset>`, note: 'Mieux : activez le sitemap automatique de votre CMS (WordPress : Yoast / Rank Math ; Shopify et Wix : natif).' })
  put('questions', { label: 'Section FAQ (à compléter avec vos vraies réponses)', lang: 'html', value: faq(f, report) })
  put('author-date', { label: 'Auteur et date', lang: 'html', value: `<p class="byline">Par <a href="/a-propos#equipe">Prénom Nom</a>, [fonction / expertise] — mis à jour le <time datetime="${new Date().toISOString().slice(0, 10)}">${new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</time></p>` })
  put('about', { label: 'Plan d’une page « À propos » qui inspire confiance', lang: 'text', value: `# À propos de ${f.brand || 'nous'}\n- Notre histoire (date de création, lieu, fondateurs)\n- L’équipe (photos, rôles, expérience)\n- Chiffres clés (clients, projets, années, zone)\n- Certifications, labels, garanties, assurances\n- Avis et références clients\n- Coordonnées complètes (NAP)` })
  const lazyImgs = (report.ctx?.page?.imagesSample || []).slice(0, 3)
  put('lazy', { label: 'Images sous la ligne de flottaison', lang: 'html', value: (lazyImgs.length ? lazyImgs : ['/photo.webp']).map((s) => `<img src="${escAttr(s)}" loading="lazy" decoding="async" width="800" height="600" alt="…">`).join('\n'), note: 'Gardez la première image (héros) sans lazy.' })
  put('lcp-lazy', { label: 'Image principale (LCP)', lang: 'html', value: `<img src="${escAttr(report.ctx?.page?.imagesSample?.[0] || '/hero.webp')}" fetchpriority="high" width="1600" height="900" alt="…">` })
  put('img-dims', { label: 'Dimensions des images', lang: 'html', value: '<img src="photo.webp" width="800" height="600" alt="…">\n/* ou en CSS */\nimg { aspect-ratio: 4 / 3; height: auto; }' })
  put('img-format', { label: 'Conversion WebP / AVIF', lang: 'text', value: '# En ligne de commande (libwebp) :\ncwebp -q 80 photo.jpg -o photo.webp\n# WordPress : plugin de conversion (ex. Converter for Media) ou CDN d’images ;\n# Shopify / Wix : conversion automatique.' })
  put('render-blocking', { label: 'Scripts non bloquants', lang: 'html', value: '<script src="/js/app.js" defer></script>\n<link rel="preload" href="/css/critique.css" as="style">' })
  put('fonts-preconnect', { label: 'Polices', lang: 'html', value: '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>\n<!-- Mieux pour le RGPD et la vitesse : auto-héberger les polices (woff2) -->' })
  put('video-facade', { label: 'Vidéo YouTube légère (façade)', lang: 'html', value: '<a class="yt" href="https://www.youtube.com/watch?v=ID" target="_blank" rel="noopener">\n  <img src="https://i.ytimg.com/vi/ID/hqdefault.jpg" loading="lazy" width="480" height="360" alt="Voir la vidéo : …">\n</a>' })
  for (const k of Object.keys(SERVER)) put(k, { label: 'Configuration serveur', lang: 'apache', value: `# Apache (.htaccess)\n${SERVER[k].apache}\n\n# Nginx\n${SERVER[k].nginx}`, note: 'Hébergement mutualisé : demandez à l’hébergeur ou cherchez l’option dans son panneau.' })
  put('http-redirect', out.https)
  put('redirect-302', { label: 'Redirection permanente', lang: 'apache', value: '# Apache\nRedirect 301 /ancienne-url https://exemple.fr/nouvelle-url\n\n# Nginx\nlocation = /ancienne-url { return 301 https://exemple.fr/nouvelle-url; }' })
  put('analytics', { label: 'Mesure d’audience respectueuse (exemptée de consentement si bien configurée)', lang: 'html', value: '<!-- Matomo ou Plausible : voir la recommandation CNIL sur les outils exemptés -->\n<script defer data-domain="exemple.fr" src="https://plausible.io/js/script.js"></script>', note: 'Ou GA4 + bandeau de consentement + Consent Mode v2.' })
  put('consent-mode', { label: 'Consent Mode v2 (avant le chargement de gtag)', lang: 'html', value: `<script>\n  window.dataLayer = window.dataLayer || [];\n  function gtag(){dataLayer.push(arguments);}\n  gtag('consent', 'default', { ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied', analytics_storage: 'denied' });\n</script>`, note: 'Votre CMP met ensuite à jour le consentement (« update »).' })
  put('cmp', out['consent-mode'])
  put('labels', { label: 'Champ de formulaire accessible', lang: 'html', value: '<label for="email">Votre e-mail</label>\n<input id="email" name="email" type="email" autocomplete="email">' })
  put('buttons', { label: 'Bouton-icône accessible', lang: 'html', value: '<button type="button" aria-label="Ouvrir le menu">☰</button>' })
  put('empty-links', { label: 'Lien-icône accessible', lang: 'html', value: '<a href="https://www.instagram.com/compte" aria-label="Instagram de la marque">\n  <svg aria-hidden="true">…</svg>\n</a>' })
  put('landmarks', { label: 'Structure de page', lang: 'html', value: '<header>…menu…</header>\n<main>…contenu principal…</main>\n<footer>…NAP, liens légaux…</footer>' })
  put('legal', { label: 'Liens obligatoires (pied de page)', lang: 'html', value: '<a href="/mentions-legales">Mentions légales</a> · <a href="/confidentialite">Politique de confidentialité</a> · <a href="/cookies">Gestion des cookies</a>' })
  put('privacy', out.legal); put('cgv', { label: 'CGV', lang: 'html', value: '<a href="/cgv">Conditions générales de vente</a>' })
  put('hreflang-default', { label: 'hreflang complet', lang: 'html', value: `<link rel="alternate" hreflang="fr-fr" href="${escAttr(f.url)}">\n<link rel="alternate" hreflang="en-gb" href="${escAttr(f.origin)}/en/">\n<link rel="alternate" hreflang="x-default" href="${escAttr(f.origin)}/">` })
  put('hreflang-self', out['hreflang-default']); put('hreflang-code', out['hreflang-default'])
  put('alt', { label: 'Textes alternatifs à écrire', lang: 'html', value: (report.ctx?.page?.noAltSample || []).slice(0, 6).map((s) => `<img src="${escAttr(s)}" alt="${escAttr(altHint(s, f))}">`).join('\n') || `<img src="photo.webp" alt="${escAttr(altHint('', f))}">`, note: 'Décrivez ce que montre réellement chaque image ; alt="" pour les images purement décoratives.' })
  put('anchors', { label: 'Ancre descriptive', lang: 'html', value: `<!-- Avant --> <a href="/page">en savoir plus</a>\n<!-- Après --> <a href="/page">${escAttr(cap(f.sector.keywords[0]))} : nos réalisations</a>` })
  put('mixed', { label: 'Ressources en http:// à passer en https://', lang: 'text', value: (report.ctx?.page?.mixedSample || []).join('\n') || 'Remplacez http:// par https:// dans les liens d’images, scripts et iframes.' })
  put('broken', { label: 'Liens cassés', lang: 'text', value: (report.ctx?.crawl?.broken || []).slice(0, 20).map((b) => `${b.status}  ${b.url}  (lien depuis ${b.from})`).join('\n') })
  // Titres uniques pour les pages explorées (doublons, pages sans description)
  const pages = (report.ctx?.crawl?.pages || []).filter((x) => x.status === 200 && x.url)
  if (pages.length) {
    const uniq = pages.slice(0, 15).map((x) => { const subj = cap(x.h1 || decodeURIComponentSafe(new URL(x.url).pathname.split('/').filter(Boolean).pop() || 'Accueil').replace(/[-_]/g, ' ')); return `${x.url}\n  <title>${escAttr(cut(subj + (f.brand && !norm(subj).includes(norm(f.brand)) ? ' | ' + f.brand : ''), 60))}</title>` }).join('\n')
    for (const id of ['dup-title', 'dup-desc', 'crawl-desc', 'crawl-h1']) put(id, { label: 'Un titre unique par page (à partir de leur H1)', lang: 'text', value: uniq, note: 'Écrivez ensuite une meta description propre à chaque page.' })
  }
  const outline = `<h1>${escAttr(cap(f.keyword || f.h1 || f.sector.keywords[0]))}${f.city ? ' à ' + escAttr(f.city) : ''}</h1>\n<p>[Réponse directe en 2 phrases : ce que vous proposez, pour qui, votre preuve chiffrée.]</p>\n<h2>Nos ${escAttr(f.sector.keywords[0])}s : ce qui nous distingue</h2>\n<h2>Combien ça coûte ?</h2>\n<h2>Comment se passe une commande / un devis ?</h2>\n<h2>Nos réalisations (photos, avis clients)</h2>\n<h2>Questions fréquentes</h2>`
  for (const id of ['thin', 'crawl-thin', 'h2']) put(id, { label: 'Plan de page à rédiger (500 mots utiles minimum)', lang: 'html', value: outline })
  put('heading-order', { label: 'Hiérarchie des titres', lang: 'html', value: '<h1>Sujet de la page</h1>\n  <h2>Partie</h2>\n    <h3>Sous-partie</h3>\n  <h2>Partie suivante</h2>', note: 'Ne sautez pas de niveau (H2 → H4) ; le style visuel se règle en CSS.' })
  const imgs = report.ctx?.page?.imagesSample || []
  put('img-names', { label: 'Noms de fichiers descriptifs', lang: 'text', value: (imgs.length ? imgs.slice(0, 5) : ['IMG_1234.jpg']).map((src) => `${src.split('/').pop()}  →  ${norm(f.sector.keywords[0]).replace(/[^a-z0-9]+/g, '-')}${f.city ? '-' + norm(f.city).replace(/[^a-z0-9]+/g, '-') : ''}-1.webp`).join('\n') })
  put('facts', { label: 'Phrases de preuve à compléter', lang: 'text', value: `Depuis [année], ${f.brand || 'nous'} [verbe] pour [N] clients${f.city ? ' à ' + f.city + ' et alentour' : ''}.\nDélai moyen : [N] jours. Garantie : [N] ans. Note Google : [4,8]/5 sur [N] avis.\nPrix indicatif : à partir de [N] € (devis gratuit sous 48 h).` })
  put('sitemap-lastmod', out.sitemap)
  const perf = `<!-- Image principale : chargée en priorité -->\n<link rel="preload" as="image" href="${escAttr(report.ctx?.page?.imagesSample?.[0] || '/hero.webp')}" fetchpriority="high">\n<!-- Scripts : jamais bloquants -->\n<script src="/js/app.js" defer></script>\n<!-- Images : WebP/AVIF, dimensions fixées, lazy sous la ligne de flottaison -->\n<img src="/photo.webp" width="800" height="600" loading="lazy" decoding="async" alt="…">`
  for (const i of R.issues) {
    if (out[i.id]) continue
    if (/^schema-/.test(i.id)) put(i.id, out['schema-none'])
    else if (/^(cwv-|lh-perf|lh-.*(image|lcp|render|document-latency|font|third|unused|legacy|dom))/.test(i.id)) put(i.id, { label: 'Leviers de vitesse les plus rentables', lang: 'html', value: perf, note: 'Puis : cache et CDN (TTFB), suppression des scripts tiers inutiles.' })
  }
  return out
}

function robotsTxt(origin) {
  return `# robots.txt — base à adapter (ne bloquez que ce qui ne doit pas être exploré)
User-agent: *
# Exemples à adapter à VOTRE site :
# Disallow: /panier/
# Disallow: /mon-compte/
Allow: /

# Robots de recherche IA (citations dans ChatGPT, Perplexity, Claude…) : autorisés
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
}

function llmsTxt(f, report) {
  const links = (report.ctx?.page?.navLinks || []).slice(0, 10)
  return `# ${f.brand || 'Votre marque'}

> ${f.page.metaDescription || suggestDescription(f)}

## Pages clés
${(links.length ? links : [{ text: 'Accueil', href: f.origin + '/' }]).map((l) => `- [${l.text}](${l.href})`).join('\n')}

## Contact
${f.address ? `- Adresse : ${[f.address.street, f.address.postalCode, f.address.locality].filter(Boolean).join(' ')}` : '- Adresse : …'}
${f.phone ? `- Téléphone : ${f.phone}` : '- Téléphone : …'}
`
}

function faq(f, report) {
  const kw = f.keyword || f.sector.keywords[0]
  const qs = [`Combien coûte ${kw} ?`, `Quels sont les délais ?`, `Intervenez-vous${f.city ? ' autour de ' + f.city : ' dans ma région'} ?`, `Comment se passe la commande ou le devis ?`, `Quelles garanties proposez-vous ?`]
  return `<section aria-labelledby="faq">\n  <h2 id="faq">Questions fréquentes</h2>\n${qs.map((q) => `  <h3>${escAttr(q)}</h3>\n  <p>[Réponse directe en 40–60 mots, avec un chiffre précis.]</p>`).join('\n')}\n</section>`
}

function altHint(src, f) {
  const name = decodeURIComponentSafe(String(src).split('/').pop() || '').replace(/\.\w+(\?.*)?$/, '').replace(/[-_]+/g, ' ').replace(/\b(img|dsc|image|photo|pxl|screenshot)\s*\d+\b/gi, '').trim()
  return name && /[a-zà-ÿ]{3}/i.test(name) && !/^[a-f0-9 ]{10,}$/i.test(name) ? `${cap(name)}${f.city ? ' – ' + f.city : ''}` : `[Décrivez la photo : ${f.sector.keywords[0]}…]`
}
function netName(u) { return (u.match(/(instagram|facebook|linkedin|tiktok|youtube|pinterest|threads|bsky|twitter|x)\./i)?.[1] || 'Réseau').replace(/^./, (c) => c.toUpperCase()) }
function decodeURIComponentSafe(s) { try { return decodeURIComponent(s) } catch { return s } }

// 04 78 00 00 00 → +33 4 78 00 00 00 (format international attendu par schema.org)
export function intlPhone(p) {
  const d = String(p).replace(/[^\d+]/g, '').replace(/^\+330/, '+33').replace(/^0(\d{9})$/, '+33$1')
  const m = d.match(/^\+33(\d)(\d{2})(\d{2})(\d{2})(\d{2})$/)
  return m ? `+33 ${m.slice(1).join(' ')}` : p
}

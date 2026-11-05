// Moteur d'audit : à partir du contexte collecté (page, en-têtes, robots, sitemap, crawl, PageSpeed),
// produit des constats classés (critique → faible), des scores par catégorie et un score global.
import { schemaTypes, topTerms } from './html.js'
import { parseRobots, botMatrix, ROBOTS_TEMPLATE } from './robots.js'
import { scoreBlocks, citabilityTemplate } from './citability.js'
import { sectorById } from '../data/sectors.js'

export const CATEGORIES = {
  technique: { label: 'Indexation & technique', weight: 0.22 },
  contenu: { label: 'Contenu & on-page', weight: 0.2 },
  performance: { label: 'Vitesse & Core Web Vitals', weight: 0.17 },
  donnees: { label: 'Données structurées', weight: 0.09 },
  ia: { label: 'Visibilité IA (GEO)', weight: 0.11 },
  social: { label: 'Partage social & marque', weight: 0.07 },
  local: { label: 'SEO local', weight: 0.06 },
  conformite: { label: 'Mesure, RGPD & accessibilité', weight: 0.08 },
}
export const SEVERITY = {
  critique: { label: 'Critique', penalty: 25, rank: 0 },
  important: { label: 'Important', penalty: 12, rank: 1 },
  moyen: { label: 'Moyen', penalty: 6, rank: 2 },
  faible: { label: 'Faible', penalty: 2, rank: 3 },
  info: { label: 'Info', penalty: 0, rank: 4 },
  ok: { label: 'OK', penalty: 0, rank: 5 },
}

const GENERIC_ANCHORS = /^(cliquez ici|cliquer ici|ici|en savoir plus|lire la suite|voir plus|plus|suite|lien|click here|here|read more|learn more|more|découvrir|voir|>|»|→)$/i

const TRACKERS = [
  ['Google Analytics 4', /gtag\(|googletagmanager\.com\/gtag|google-analytics\.com/],
  ['Google Tag Manager', /googletagmanager\.com\/gtm\.js|GTM-[A-Z0-9]{4,}/],
  ['Matomo', /matomo|piwik/i], ['Plausible', /plausible\.io/], ['Fathom', /usefathom/], ['Microsoft Clarity', /clarity\.ms/],
  ['Hotjar', /hotjar/], ['Pixel Meta', /connect\.facebook\.net|fbq\(/], ['Pixel TikTok', /analytics\.tiktok\.com|ttq\./],
  ['LinkedIn Insight', /snap\.licdn\.com|_linkedin_partner_id/], ['Pinterest Tag', /pintrk|s\.pinimg\.com\/ct/],
  ['Snap Pixel', /sc-static\.net\/scevent/], ['Google Ads', /googleadservices|AW-\d{6,}/], ['Microsoft UET', /bat\.bing\.com/],
  ['AT Internet / Piano', /xiti|piano\.io|atinternet/],
]
const CMPS = [
  ['Axeptio', /axeptio/i], ['Didomi', /didomi/i], ['Cookiebot', /cookiebot/i], ['OneTrust', /onetrust|optanon/i],
  ['tarteaucitron', /tarteaucitron/i], ['Complianz', /complianz/i], ['CookieYes', /cookieyes/i], ['Iubenda', /iubenda/i],
  ['Usercentrics', /usercentrics/i], ['Sirdata', /sirdata/i], ['Quantcast Choice', /quantcast/i], ['Consent Mode Google', /gtag\(\s*['"]consent['"]/],
]
const SOCIAL = [
  ['instagram', /instagram\.com\//], ['facebook', /facebook\.com\/(?!sharer|dialog|plugins|tr\b)/], ['linkedin', /linkedin\.com\/(company|in|school)\//],
  ['tiktok', /tiktok\.com\/@/], ['youtube', /youtube\.com\/(@|c\/|channel\/|user\/)|youtu\.be/], ['x', /(twitter|x)\.com\/(?!intent|share|home)[A-Za-z0-9_]+/],
  ['pinterest', /pinterest\.[a-z.]+\/(?!pin\/create)/], ['threads', /threads\.(net|com)\/@/], ['bluesky', /bsky\.app\/profile/], ['github', /github\.com\/[^/]+/],
]
const CMS = [
  ['WordPress', /wp-content|wp-includes|wordpress/i], ['Shopify', /cdn\.shopify|shopify/i], ['Wix', /wix\.com|wixstatic|_wix/i],
  ['Squarespace', /squarespace/i], ['Webflow', /webflow/i], ['PrestaShop', /prestashop/i], ['Joomla', /joomla/i], ['Drupal', /drupal/i],
  ['Next.js', /__NEXT_DATA__|\/_next\//], ['Nuxt', /__NUXT__|\/_nuxt\//], ['Gatsby', /gatsby/i], ['Astro', /astro-island|\/_astro\//],
  ['Framer', /framerusercontent|framer\.com/i], ['Magento', /mage\/|magento/i], ['WooCommerce', /woocommerce/i], ['Hugo', /gohugo|hugo/i],
  ['React (SPA)', /id=["']root["']|data-reactroot/], ['Vue (SPA)', /id=["']app["']|data-v-[a-f0-9]{6}/], ['Angular', /ng-version|ng-app/],
]

export function audit(ctx) {
  const F = []
  const add = (cat, sev, id, title, detail = '', fix = '', o = {}) => F.push({
    cat, sev, id, title, detail, fix, impact: o.impact ?? ({ critique: 5, important: 4, moyen: 3, faible: 2, info: 1, ok: 0 }[sev]),
    effort: o.effort ?? 2, code: o.code || '', ref: o.ref || '', value: o.value,
  })
  const p = ctx.page, input = ctx.input || {}, sector = sectorById(input.sector)
  const local = input.local ?? sector.local
  const url = ctx.fetch?.finalUrl || ctx.fetch?.url || input.url || p?.url
  let U = null
  try { U = new URL(url) } catch {}
  const origin = U ? U.origin : 'https://votre-site.fr'
  const h = ctx.fetch?.headers || {}
  const allHtmlText = p ? (p.scripts.map((s) => (s.src || '') + ' ' + s.sample).join(' ') + ' ' + p.iframes.join(' ') + ' ' + p.stylesheets.join(' ') + ' ' + (p.generator || '')) : ''
  const meta = { trackers: [], cmp: [], social: {}, cms: [], terms: null, schemaTypes: [], bots: null, thirdParties: [] }

  // ───────────────────────── Technique ─────────────────────────
  const status = ctx.fetch?.status
  if (ctx.blocked) add('technique', 'info', 'blocked', `Le site a refusé l’accès au robot d’audit (${ctx.blocked.status || 'protection anti-robot'})`, ctx.blocked.reason || '', 'Ce n’est pas forcément un problème pour Google, mais vérifiez que votre pare-feu laisse passer Googlebot et Bingbot (Search Console → Inspection d’URL). Pour l’audit : bouton-favori ou code collé.', { effort: 1 })
  else if (ctx.fetch?.error && ctx.fetch.source === 'node') add('technique', 'critique', 'fetch-error', 'Page inaccessible', ctx.fetch.error, 'Vérifiez que le site répond (DNS, certificat, pare-feu, blocage des robots).', { effort: 3 })
  else if (status >= 400) add('technique', 'critique', 'status', `La page répond ${status}`, 'Une page en erreur n’est pas indexée.', 'Corrigez la réponse serveur pour obtenir un 200 (ou redirigez en 301 vers la bonne page).', { effort: 3 })
  else if (status === 200) add('technique', 'ok', 'status', 'La page répond 200')

  const redirects = ctx.fetch?.redirects || []
  if (redirects.length > 1) add('technique', 'moyen', 'redirect-chain', `Chaîne de ${redirects.length} redirections`, redirects.map((r) => `${r.status} ${r.url}`).join(' → '), 'Redirigez directement vers l’URL finale (une seule 301) et mettez à jour les liens internes.', { effort: 2 })
  else if (redirects.length === 1 && redirects[0].status === 302) add('technique', 'faible', 'redirect-302', 'Redirection temporaire (302) vers l’URL finale', redirects[0].url, 'Utilisez une 301 (permanente) pour transmettre la popularité.', { effort: 1 })

  if (U && U.protocol !== 'https:') add('technique', 'critique', 'https', 'Le site n’est pas en HTTPS', 'HTTPS est un signal de classement et Chrome affiche « Non sécurisé ».', 'Installez un certificat (Let’s Encrypt est gratuit) et redirigez tout le HTTP en 301 vers HTTPS.', { effort: 2 })
  else if (U) add('technique', 'ok', 'https', 'HTTPS actif')
  const isIp = U && /^(\d+\.){3}\d+$|^localhost$|^\[/.test(U.hostname)
  if (U?.protocol === 'https:' && ctx.http?.httpRedirects === false) add('technique', 'important', 'http-redirect', 'La version http:// ne redirige pas vers https://', '', 'Ajoutez une redirection 301 de http:// vers https:// pour éviter le contenu dupliqué.', { effort: 1 })
  if (!isIp && ctx.http?.wwwConsistent === false) add('technique', 'moyen', 'www', 'Les versions avec et sans « www » ne redirigent pas l’une vers l’autre', ctx.http.wwwDetail || '', 'Choisissez une version (www ou non) et redirigez l’autre en 301.', { effort: 1 })

  if (p) {
    const xr = (h['x-robots-tag'] || '').toLowerCase()
    const robotsMeta = [p.robots, p.googlebot, xr].filter(Boolean).join(',')
    const tokens = new Set(robotsMeta.split(/[\s,]+/).map((t) => t.replace(/^[a-z-]+bot:\s*/, '')).filter(Boolean))
    const noindex = tokens.has('noindex') || tokens.has('none'), nofollow = tokens.has('nofollow') || tokens.has('none')
    if (noindex) add('technique', 'critique', 'noindex', 'La page est en « noindex » : Google ne l’indexera pas', `Directive trouvée : ${robotsMeta}`, 'Retirez « noindex » de la balise meta robots / de l’en-tête X-Robots-Tag si la page doit être trouvée.', { effort: 1, code: '<meta name="robots" content="index, follow, max-image-preview:large">' })
    if (nofollow) add('technique', 'important', 'nofollow', 'Les liens de la page sont en « nofollow »', robotsMeta, 'Retirez « nofollow » pour que Google suive vos liens internes.', { effort: 1 })
    if (/max-image-preview:large/.test(robotsMeta) === false && !noindex) add('technique', 'faible', 'max-image-preview', 'Aperçus d’image en grand non autorisés (Discover)', 'Sans « max-image-preview:large », vos images apparaissent en petit dans Google Discover.', 'Ajoutez la directive dans la meta robots.', { effort: 1, code: '<meta name="robots" content="index, follow, max-image-preview:large">' })

    if (!p.canonical.length) add('technique', 'moyen', 'canonical', 'Pas de balise canonical', 'Sans canonical, les variantes d’URL (paramètres, majuscules, /index.html) peuvent créer du contenu dupliqué.', 'Ajoutez une canonical auto-référente absolue sur chaque page.', { effort: 1, code: `<link rel="canonical" href="${url}">` })
    else if (p.canonical.length > 1 && new Set(p.canonical).size > 1) add('technique', 'important', 'canonical-multi', 'Plusieurs canonical différentes', p.canonical.join(' | '), 'Gardez une seule balise canonical.', { effort: 1 })
    else if (p.canonical[0] && url && normalize(p.canonical[0]) !== normalize(url)) {
      const other = tryHost(p.canonical[0]) && U && tryHost(p.canonical[0]) !== U.hostname.replace(/^www\./, '')
      if (other) add('technique', 'critique', 'canonical-host', 'La canonical pointe vers un autre domaine', `${p.canonical[0]} : Google risque d’indexer cet autre domaine à la place du vôtre (oubli fréquent après une préproduction).`, 'Faites pointer la canonical vers l’URL de cette page sur votre domaine.', { effort: 1 })
      else add('technique', 'info', 'canonical-other', 'La canonical pointe vers une autre URL', `${p.canonical[0]} — vérifiez que c’est voulu (sinon la page ne sera pas indexée).`, '', { effort: 1 })
    }
    else add('technique', 'ok', 'canonical', 'Canonical auto-référente')

    if (!p.lang) add('technique', 'moyen', 'lang', 'Langue non déclarée (<html lang>)', 'Aide Google, les lecteurs d’écran et la traduction.', 'Ajoutez lang="fr" (ou fr-FR) sur la balise html.', { effort: 1, code: '<html lang="fr">' })
    if (!p.viewport) add('technique', 'critique', 'viewport', 'Pas de balise viewport : le site n’est pas adapté au mobile', 'Google indexe la version mobile en priorité (mobile-first).', 'Ajoutez la meta viewport et un design responsive.', { effort: 2, code: '<meta name="viewport" content="width=device-width, initial-scale=1">' })
    else if (/user-scalable\s*=\s*(no|0)|maximum-scale\s*=\s*1(\.0)?\b/.test(p.viewport)) add('conformite', 'faible', 'zoom', 'Le zoom est bloqué sur mobile', p.viewport, 'Retirez user-scalable=no / maximum-scale=1 (accessibilité).', { effort: 1 })
    if (!p.charset && !/charset/i.test(h['content-type'] || '')) add('technique', 'faible', 'charset', 'Encodage non déclaré', '', 'Ajoutez <meta charset="utf-8"> en tout début de <head>.', { effort: 1, code: '<meta charset="utf-8">' })
    if (!p.doctype) add('technique', 'faible', 'doctype', 'Doctype HTML5 absent', 'Le navigateur passe en mode « quirks ».', 'Commencez le document par <!doctype html>.', { effort: 1 })
    if (p.hreflang.length) {
      const langs = p.hreflang.map((x) => x.lang)
      if (!langs.includes('x-default')) add('technique', 'faible', 'hreflang-default', 'hreflang sans « x-default »', langs.join(', '), 'Ajoutez une alternative x-default (page de choix de langue ou langue principale).', { effort: 1 })
      if (!p.hreflang.some((x) => normalize(x.href) === normalize(url))) add('technique', 'moyen', 'hreflang-self', 'hreflang sans auto-référence', 'Chaque page doit se citer elle-même dans son jeu hreflang.', 'Ajoutez la ligne hreflang de la page courante.', { effort: 1 })
      const bad = langs.filter((l) => { if (l === 'x-default') return false; const m = l.match(/^([a-z]{2,3})(?:-([a-z]{4}))?(?:-([a-z]{2}))?$/); return !m || (m[3] && !REGIONS.has(m[3])) })
      if (bad.length) add('technique', 'moyen', 'hreflang-code', 'Codes hreflang invalides', bad.join(', '), 'Utilisez ISO 639-1 (+ ISO 3166-1 pour le pays) : fr, fr-fr, fr-be, en-gb (et non en-uk)…', { effort: 1 })
    }
    const kb = p.htmlBytes / 1024
    if (kb > 1024) add('performance', 'important', 'html-size', `HTML très lourd (${Math.round(kb)} Ko)`, 'Ralentit le premier rendu et le crawl.', 'Réduisez le HTML : retirez le JSON/état inline inutile, paginez les listes, chargez à la demande.', { effort: 3, value: Math.round(kb) })
    else if (kb > 300) add('performance', 'moyen', 'html-size', `HTML lourd (${Math.round(kb)} Ko)`, '', 'Visez moins de 100–200 Ko de HTML compressé.', { effort: 3, value: Math.round(kb) })
    if (p.deprecated.length) add('technique', 'faible', 'deprecated', 'Balises HTML obsolètes', [...new Set(p.deprecated)].join(', '), 'Remplacez-les par du CSS.', { effort: 2 })
  }

  if (ctx.fetch && !ctx.fetch.error && ['node', 'worker'].includes(ctx.fetch.source)) {
    const t = ctx.fetch.ttfbMs ?? ctx.fetch.timeMs
    if (t > 1800) add('performance', 'important', 'ttfb', `Serveur lent : ${Math.round(t)} ms avant la réponse`, 'Le temps de réponse serveur (TTFB) devrait rester sous 800 ms.', 'Activez le cache serveur/page, un CDN, et vérifiez l’hébergement (PHP, base de données).', { effort: 3, value: Math.round(t) })
    else if (t > 800) add('performance', 'moyen', 'ttfb', `Temps de réponse moyen : ${Math.round(t)} ms`, 'Objectif : moins de 800 ms (idéalement < 200 ms avec cache).', 'Cache serveur + CDN.', { effort: 3, value: Math.round(t) })
    if (Object.keys(h).length) {
      if (!h['content-encoding']) add('performance', 'moyen', 'compression', 'Pas de compression gzip/brotli détectée', '', 'Activez Brotli (ou gzip) sur le serveur ou le CDN : −60 à −80 % sur le HTML/CSS/JS.', { effort: 1 })
      if (!h['strict-transport-security'] && U?.protocol === 'https:') add('conformite', 'faible', 'hsts', 'En-tête HSTS absent', '', 'Ajoutez Strict-Transport-Security: max-age=31536000; includeSubDomains', { effort: 1 })
      if (!h['x-content-type-options']) add('conformite', 'faible', 'nosniff', 'En-tête X-Content-Type-Options absent', '', 'Ajoutez X-Content-Type-Options: nosniff', { effort: 1 })
      if (/no-store|no-cache|max-age=0/.test(h['cache-control'] || '') === false && !h['cache-control']) add('performance', 'faible', 'cache', 'Pas d’en-tête Cache-Control sur la page', '', 'Définissez une politique de cache (HTML court, ressources statiques 1 an avec empreinte).', { effort: 2 })
    }
  }

  // robots.txt
  if (ctx.robots) {
    if (ctx.robots.status === 200 && ctx.robots.body != null) {
      const parsed = parseRobots(ctx.robots.body)
      const path = U ? U.pathname : '/'
      meta.bots = botMatrix(parsed, path)
      meta.robotsSitemaps = parsed.sitemaps
      const g = meta.bots.find((b) => b.ua === 'Googlebot'), bing = meta.bots.find((b) => b.ua === 'Bingbot')
      const starAll = parsed.groups.some((gr) => gr.agents.includes('*') && gr.rules.some((r) => !r.allow && r.path === '/'))
      if (!g.allowed && starAll) add('technique', 'critique', 'robots-all', 'robots.txt interdit tout le site aux robots, Google compris', 'Disallow: / pour User-agent: *', 'Supprimez « Disallow: / » (souvent oublié après une préproduction).', { effort: 1, code: ROBOTS_TEMPLATE(origin) })
      else if (!g.allowed) add('technique', 'critique', 'robots-block', 'robots.txt bloque Googlebot sur cette page', '', 'Retirez la règle Disallow concernée.', { effort: 1, code: ROBOTS_TEMPLATE(origin) })
      else if (starAll) add('technique', 'important', 'robots-star', 'robots.txt bloque tous les robots sauf Google', 'Bing (qui alimente ChatGPT Search et Copilot), Apple et les robots IA ne peuvent pas explorer le site.', 'Ouvrez au moins Bingbot, Applebot et les robots de recherche IA, ou retirez « Disallow: / » du groupe « * ».', { effort: 1, code: ROBOTS_TEMPLATE(origin) })
      if (!bing.allowed) add('ia', 'important', 'robots-bing', 'robots.txt bloque Bingbot', 'Bing alimente ChatGPT Search, Copilot et DuckDuckGo.', 'Autorisez Bingbot.', { effort: 1 })
      const blockedSearch = meta.bots.filter((b) => b.kind === 'ia-recherche' && !b.allowed)
      if (blockedSearch.length) add('ia', 'important', 'robots-ai-search', `Robots de recherche IA bloqués : ${blockedSearch.map((b) => b.ua).join(', ')}`, 'Ces robots servent à citer votre site dans les réponses (ChatGPT, Perplexity, Claude). Les bloquer = disparaître de ces réponses.', 'Autorisez au minimum OAI-SearchBot, PerplexityBot et Claude-SearchBot.', { effort: 1, code: ROBOTS_TEMPLATE(origin) })
      const blockedUser = meta.bots.filter((b) => b.kind === 'ia-utilisateur' && !b.allowed)
      if (blockedUser.length) add('ia', 'moyen', 'robots-ai-user', `Lecture à la demande bloquée : ${blockedUser.map((b) => b.ua).join(', ')}`, 'Ces agents lisent votre page quand un utilisateur pose une question à ChatGPT, Claude, Perplexity ou Le Chat (et la cite). Les bloquer empêche de répondre avec vos informations.', 'Autorisez ChatGPT-User, Claude-User, Perplexity-User et MistralAI-User.', { effort: 1, code: ROBOTS_TEMPLATE(origin) })
      const blockedTrain = meta.bots.filter((b) => b.kind === 'ia-entrainement' && !b.allowed)
      if (blockedTrain.length) add('ia', 'info', 'robots-ai-train', `Robots d’entraînement IA bloqués : ${blockedTrain.map((b) => b.ua).join(', ')}`, `Choix éditorial légitime : sans effet sur la recherche Google${blockedTrain.some((b) => b.ua === 'Google-Extended') ? ' ni sur AI Overviews (Google-Extended ne règle que Gemini)' : ''}, mais moins de présence dans les connaissances « de base » des modèles. Pour de grands éditeurs, bloquer les robots IA a coûté environ 7 % de trafic (étude révisée, ppc.land 2026) et 70,6 % des sites bloquants restent cités.`, '', { effort: 1 })
      if (parsed.signal && Object.keys(parsed.signal).length) {
        const sg = parsed.signal, txt = Object.entries(sg).map(([k, v]) => `${k}=${v ? 'yes' : 'no'}`).join(', ')
        meta.contentSignal = sg
        if (sg['ai-input'] === false) add('ia', 'moyen', 'content-signal', `Content-Signal refuse les réponses IA (${txt})`, 'Ligne « Content-Signal » (politique de Cloudflare) : vous demandez que vos contenus ne servent pas de source aux réponses IA. C’est une préférence, pas un blocage technique ; les moteurs qui la respectent vous citeront moins.', 'Si vous voulez être cité par les IA, passez à « Content-Signal: search=yes, ai-input=yes, ai-train=no » (réglage dans Cloudflare : AI Crawl Control).', { effort: 1 })
        else add('ia', 'ok', 'content-signal', `Préférences IA déclarées (Content-Signal : ${txt})`)
      }
      if (!parsed.sitemaps.length) add('technique', 'faible', 'robots-sitemap', 'robots.txt ne déclare pas le sitemap', '', `Ajoutez « Sitemap: ${origin}/sitemap.xml » à la fin du fichier.`, { effort: 1 })
      if (/\.css|\.js|\/wp-content|\/assets/i.test(ctx.robots.body) && /disallow:\s*\S*(\.css|\.js|wp-content|wp-includes|assets)/i.test(ctx.robots.body)) add('technique', 'moyen', 'robots-assets', 'robots.txt bloque des CSS/JS', 'Google doit pouvoir charger les ressources pour rendre la page.', 'Retirez les Disallow sur les CSS/JS/thèmes.', { effort: 1 })
    } else if (ctx.robots.status >= 400 && ctx.robots.status < 500) add('technique', 'faible', 'robots-missing', 'Pas de fichier robots.txt', 'Sans robots.txt, tout est crawlable — mais vous ne pouvez pas déclarer le sitemap ni régler les robots IA.', 'Créez /robots.txt.', { effort: 1, code: ROBOTS_TEMPLATE(origin) })
    else if (!ctx.robots.status) add('technique', 'info', 'robots-unknown', 'robots.txt non vérifié', 'Le fichier n’a pas pu être lu par ce mode de collecte.', 'Ouvrez votre-site.fr/robots.txt ou utilisez le bouton-favori / la CLI.', { effort: 1 })
    else if (ctx.robots.status >= 500) add('technique', 'critique', 'robots-5xx', `robots.txt répond ${ctx.robots.status}`, 'Google ralentit voire suspend le crawl si robots.txt est en erreur serveur.', 'Corrigez la réponse du serveur (200 ou 404).', { effort: 2 })
  }

  // sitemap
  if (ctx.sitemap) {
    if (!ctx.sitemap.status) add('technique', 'info', 'sitemap-unknown', 'Sitemap non vérifié', 'Le fichier n’a pas pu être lu par ce mode de collecte.', 'Vérifiez dans Search Console → Sitemaps.', { effort: 1 })
    else if (ctx.sitemap.status !== 200 || !ctx.sitemap.count) add('technique', 'moyen', 'sitemap', 'Sitemap XML introuvable ou vide', ctx.sitemap.url || '', 'Générez un sitemap.xml (CMS / plugin) et déclarez-le dans Search Console et robots.txt.', { effort: 1 })
    else {
      add('technique', 'ok', 'sitemap', `Sitemap trouvé : ${ctx.sitemap.count} ${ctx.sitemap.isIndex ? 'sitemaps' : 'URL'}`)
      if (ctx.sitemap.noLastmod) add('technique', 'faible', 'sitemap-lastmod', 'Le sitemap n’indique pas <lastmod>', '', 'Ajoutez des dates de modification fiables : Google et Bing s’en servent pour recrawler.', { effort: 1 })
      if (ctx.sitemap.foreignHost) add('technique', 'moyen', 'sitemap-host', 'Le sitemap contient des URL d’un autre domaine / protocole', ctx.sitemap.foreignHost, 'Utilisez exclusivement les URL canoniques (https, même domaine).', { effort: 1 })
    }
  }

  // ───────────────────────── Contenu ─────────────────────────
  if (p) {
    const title = p.title || ''
    if (!title) add('contenu', 'critique', 'title', 'Balise <title> absente', 'Le titre est le premier facteur on-page et le texte cliquable dans Google.', 'Écrivez un titre unique de 50–60 caractères : mot-clé principal + bénéfice + marque.', { effort: 1, code: `<title>${input.keyword ? cap(input.keyword) + ' — ' : ''}${input.brand || 'Votre marque'}</title>` })
    else {
      if (title.length > 65) add('contenu', 'moyen', 'title-long', `Titre trop long (${title.length} caractères)`, `« ${title} » — Google coupe vers 55–60 caractères (≈ 580 px).`, 'Placez le mot-clé au début et raccourcissez.', { effort: 1, value: title.length })
      else if (title.length < 25) add('contenu', 'moyen', 'title-short', `Titre trop court (${title.length} caractères)`, `« ${title} »`, 'Ajoutez le mot-clé principal, la localisation ou le bénéfice (50–60 car.).', { effort: 1, value: title.length })
      else add('contenu', 'ok', 'title', `Titre de bonne longueur (${title.length} car.)`)
      if (p.titles.length > 1) add('contenu', 'moyen', 'title-multi', `${p.titles.length} balises <title>`, '', 'Gardez une seule balise <title>.', { effort: 1 })
    }
    const d = p.metaDescription
    if (!d) add('contenu', 'important', 'description', 'Meta description absente', 'Google invente alors un extrait : vous perdez le contrôle du message et du taux de clic.', 'Rédigez 140–155 caractères : bénéfice + preuve + appel à l’action.', { effort: 1, code: `<meta name="description" content="${input.keyword ? cap(input.keyword) + ' : ' : ''}… (140–155 caractères avec un appel à l’action)">` })
    else if (d.length > 165) add('contenu', 'faible', 'description-long', `Meta description longue (${d.length} car.)`, 'Coupée au-delà de ~155 caractères (≈ 120 sur mobile).', 'Mettez l’essentiel dans les 120 premiers caractères.', { effort: 1, value: d.length })
    else if (d.length < 70) add('contenu', 'moyen', 'description-short', `Meta description courte (${d.length} car.)`, `« ${d} »`, 'Visez 140–155 caractères.', { effort: 1, value: d.length })
    else add('contenu', 'ok', 'description', 'Meta description présente et bien dimensionnée')

    const h1 = p.headings.filter((x) => x.level === 1)
    if (!h1.length) add('contenu', 'important', 'h1', 'Pas de titre H1', 'Le H1 annonce le sujet de la page aux moteurs, aux IA et aux lecteurs d’écran.', 'Ajoutez un H1 unique qui contient le mot-clé principal.', { effort: 1 })
    else if (h1.length > 1) add('contenu', 'faible', 'h1-multi', `${h1.length} titres H1`, h1.map((x) => x.text).slice(0, 4).join(' | '), 'Un seul H1 par page est plus clair (le logo ne doit pas être un H1).', { effort: 1 })
    else if (!h1[0].text) add('contenu', 'important', 'h1-empty', 'H1 vide (image sans alt ou texte caché)', '', 'Mettez du texte réel dans le H1.', { effort: 1 })
    else add('contenu', 'ok', 'h1', `H1 : « ${h1[0].text.slice(0, 80)} »`)
    let prev = 0, skips = 0
    for (const x of p.headings) { if (prev && x.level > prev + 1) skips++; prev = x.level }
    if (skips) add('contenu', 'faible', 'heading-order', 'Hiérarchie des titres irrégulière', `${skips} saut(s) de niveau (ex. H2 → H4).`, 'Respectez H1 → H2 → H3 : structure lisible par Google et les IA.', { effort: 1 })
    const h2 = p.headings.filter((x) => x.level === 2).length
    if (p.wordCount > 400 && h2 < 2) add('contenu', 'moyen', 'h2', 'Peu de sous-titres H2', 'Un texte sans intertitres se lit mal et se découpe mal en passages pour Google et les IA.', 'Ajoutez un H2 tous les 200–300 mots, formulé comme une question ou un sujet précis.', { effort: 2 })

    const rootDiv = /<div[^>]+id=["'](root|app|__next|__nuxt|svelte|q-app)["'][^>]*>\s*(<\/div>|<noscript)/i.test(ctx.rawHead || '')
    const jsShell = (p.wordCount < 80 && rootDiv) || (p.wordCount < 30 && p.scripts.filter((x) => x.src).length >= 2)
    const rw = ctx.rendered?.wordCount
    if (rw >= 150 && p.wordCount < rw * 0.5) add('contenu', p.wordCount < rw * 0.2 ? 'critique' : 'important', 'js-render', `${Math.round((1 - p.wordCount / rw) * 100)} % du texte n’apparaît qu’après JavaScript`, `${p.wordCount} mots dans le HTML envoyé par le serveur, ${rw} après exécution du JavaScript. Google rend le JS avec retard ; la plupart des robots IA (ChatGPT, Perplexity, Claude) ne l’exécutent pas.`, 'Rendu serveur (SSR) ou génération statique pour le contenu principal (Next.js, Nuxt, Astro, ou pré-rendu).', { effort: 4 })
    else if (jsShell && !(rw >= 150)) add('contenu', 'critique', 'js-render', 'Le contenu dépend du JavaScript (quasi aucun texte dans le HTML)', `${p.wordCount} mots dans le HTML initial. Google rend le JS avec retard ; la plupart des robots IA (ChatGPT, Perplexity, Claude) ne l’exécutent pas.`, 'Passez au rendu serveur (SSR) ou à la génération statique (Next.js, Nuxt, Astro…), ou au pré-rendu.', { effort: 4 })
    else if (p.wordCount < 150) add('contenu', 'important', 'thin', `Contenu très mince (${p.wordCount} mots)`, 'Trop peu de texte pour se positionner, être cité par une IA ou convaincre.', 'Visez 500+ mots utiles sur les pages clés : réponses, preuves, FAQ, cas clients.', { effort: 3, value: p.wordCount })
    else if (p.wordCount < 350) add('contenu', 'moyen', 'thin', `Contenu léger (${p.wordCount} mots)`, '', 'Enrichissez : questions des clients, chiffres, exemples, avis.', { effort: 3, value: p.wordCount })
    else add('contenu', 'ok', 'words', `${p.wordCount} mots de contenu`)

    const imgs = p.images.filter((i) => i.src && !/1x1|pixel|spacer|\.gif\?|facebook\.com\/tr/.test(i.src))
    const noAlt = imgs.filter((i) => i.alt === null && !i.decorative)
    if (noAlt.length) add('contenu', noAlt.length > 5 ? 'important' : 'moyen', 'alt', `${noAlt.length} image(s) sans attribut alt sur ${imgs.length}`, noAlt.slice(0, 5).map((i) => i.src.split('/').pop()).join(', '), `Décrivez chaque image utile (ex. alt="${cap(sector.keywords[0])}${input.city ? ' – ' + input.city : ''} : ce que montre la photo") ; alt="" pour les images décoratives. Gain : Google Images + accessibilité.`, { effort: 2, value: noAlt.length })
    else if (imgs.length) add('contenu', 'ok', 'alt', 'Toutes les images ont un attribut alt')
    const badNames = imgs.filter((i) => /\/(img|image|dsc|photo|screenshot|capture|untitled|whatsapp)[_\- ]?\d+/i.test(i.src) || /\/[a-f0-9]{16,}\.(jpe?g|png|webp)/i.test(i.src))
    if (badNames.length >= 3) add('contenu', 'faible', 'img-names', 'Noms de fichiers d’images non descriptifs', badNames.slice(0, 3).map((i) => i.src.split('/').pop()).join(', '), 'Renommez : vitrine-refrigeree-patisserie.webp plutôt que IMG_1234.jpg.', { effort: 2 })

    const internal = p.links.filter((l) => l.internal && l.href && !/^(mailto|tel|javascript):/.test(l.raw || ''))
    const external = p.links.filter((l) => !l.internal && /^https?:/.test(l.href || ''))
    if (internal.length < 5) add('contenu', 'moyen', 'internal-links', `Maillage interne faible (${internal.length} lien(s) interne(s))`, 'Les liens internes distribuent la popularité et aident Google à découvrir vos pages.', 'Reliez chaque page à 3–10 pages proches avec des ancres descriptives.', { effort: 2, value: internal.length })
    const generic = p.links.filter((l) => GENERIC_ANCHORS.test(l.text || ''))
    if (generic.length >= 2) add('contenu', 'faible', 'anchors', `${generic.length} liens aux ancres génériques (« en savoir plus », « ici »)`, '', 'Rédigez des ancres descriptives : « nos vitrines pâtissières » plutôt que « en savoir plus ».', { effort: 1 })
    const empty = p.links.filter((l) => l.href && !l.text && !/^(mailto|tel):/.test(l.raw || ''))
    if (empty.length) add('conformite', 'moyen', 'empty-links', `${empty.length} lien(s) sans texte accessible`, 'Liens-icônes sans aria-label : illisibles pour les lecteurs d’écran et sans ancre pour Google.', 'Ajoutez un aria-label ou un texte masqué visuellement, ou un alt sur l’image du lien.', { effort: 1 })
    const jsLinks = p.links.filter((l) => /^javascript:|^#$/.test(l.raw || ''))
    if (jsLinks.length > 3) add('contenu', 'faible', 'js-links', `${jsLinks.length} liens « javascript: » ou « # »`, 'Google ne suit que les vrais liens <a href>.', 'Utilisez des <a href="/url"> pour la navigation.', { effort: 2 })
    meta.internalLinks = internal.length; meta.externalLinks = external.length

    if (U) {
      let path = U.pathname
      try { path = decodeURIComponent(U.pathname) } catch {}
      if (U.href.length > 115) add('contenu', 'faible', 'url-long', 'URL longue', U.href, 'Des URL courtes et lisibles cliquent mieux.', { effort: 3 })
      if (/[A-Z]/.test(U.pathname)) add('technique', 'faible', 'url-case', 'Majuscules dans l’URL', '', 'Utilisez des minuscules (risque de doublons).', { effort: 3 })
      if (/_/.test(path)) add('contenu', 'faible', 'url-underscore', 'Underscores dans l’URL', '', 'Google lit « - » comme séparateur, pas « _ ».', { effort: 3 })
      if ([...U.searchParams.keys()].length > 2) add('technique', 'faible', 'url-params', 'Nombreux paramètres d’URL', '', 'Préférez des URL propres ; canonical vers la version sans paramètres.', { effort: 3 })
    }

    // Mot-clé cible
    if (input.keyword) {
      const kw = norm(input.keyword), words = kw.split(' ').filter((w) => w.length > 2)
      const has = (s) => { const n = norm(s || ''); return n.includes(kw) || (words.length > 1 && words.every((w) => n.includes(w))) }
      const spots = { titre: has(title), H1: has(h1[0]?.text), 'meta description': has(d), ...(U && U.pathname.length > 1 ? { URL: has(U.pathname.replace(/[-_/]/g, ' ')) } : {}), 'début du texte': has(p.text.split(' ').slice(0, 120).join(' ')) }
      const missing = Object.entries(spots).filter(([, v]) => !v).map(([k]) => k)
      if (missing.length) add('contenu', missing.includes('titre') || missing.includes('H1') ? 'important' : 'moyen', 'keyword', `Mot-clé « ${input.keyword} » absent : ${missing.join(', ')}`, 'Le mot-clé principal doit figurer dans le titre, le H1 et le premier paragraphe — naturellement.', 'Réécrivez le titre et le H1 autour de l’intention de recherche.', { effort: 1 })
      else add('contenu', 'ok', 'keyword', `Mot-clé « ${input.keyword} » bien placé (titre, H1, description, URL, intro)`)
      const occ = (norm(p.text).match(new RegExp(`\\b${kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'g')) || []).length
      const dens = p.wordCount ? (occ * kw.split(' ').length) / p.wordCount : 0
      if (dens > 0.04) add('contenu', 'moyen', 'stuffing', `Sur-optimisation : « ${input.keyword} » ≈ ${(dens * 100).toFixed(1)} % du texte`, '', 'Variez avec des synonymes et du vocabulaire du sujet (champ sémantique).', { effort: 2 })
    }
    meta.terms = topTerms(p.text)
  }

  // ───────────────────────── Performance (heuristiques HTML) ─────────────────────────
  if (p) {
    const ext = p.scripts.filter((s) => s.src)
    const hosts = new Set()
    for (const s of [...ext.map((x) => x.src), ...p.stylesheets, ...p.iframes]) { try { const hh = new URL(s).hostname; if (U && hh.replace(/^www\./, '') !== U.hostname.replace(/^www\./, '')) hosts.add(hh) } catch {} }
    meta.thirdParties = [...hosts]
    if (hosts.size > 12) add('performance', 'moyen', 'third-parties', `${hosts.size} domaines tiers chargés`, [...hosts].slice(0, 8).join(', '), 'Supprimez les scripts inutiles, chargez les autres après consentement / interaction (façades YouTube, chat…).', { effort: 2 })
    if (p.inHeadBlocking > 4) add('performance', 'moyen', 'render-blocking', `${p.inHeadBlocking} ressources bloquantes dans <head>`, 'CSS et scripts synchrones retardent l’affichage (LCP).', 'Ajoutez defer/async aux scripts, regroupez/inlinez le CSS critique.', { effort: 3 })
    if (ext.length > 25) add('performance', 'moyen', 'scripts', `${ext.length} scripts externes`, '', 'Regroupez, supprimez les plugins inutiles, chargez à la demande.', { effort: 3 })
    const imgs = p.images.filter((i) => i.src)
    const noDim = imgs.filter((i) => !i.width || !i.height)
    if (noDim.length > 2) add('performance', 'moyen', 'img-dims', `${noDim.length} image(s) sans width/height`, 'Provoque des sauts de mise en page (CLS).', 'Indiquez width et height (ou aspect-ratio en CSS) sur chaque image.', { effort: 1 })
    const lazyable = imgs.slice(3).filter((i) => !i.loading)
    if (lazyable.length > 4) add('performance', 'moyen', 'lazy', `${lazyable.length} images hors écran sans chargement différé`, '', 'Ajoutez loading="lazy" aux images sous la ligne de flottaison.', { effort: 1, code: '<img src="…" loading="lazy" width="800" height="600" alt="…">' })
    if (imgs[0] && imgs[0].loading === 'lazy') add('performance', 'important', 'lcp-lazy', 'La première image (probable LCP) est en loading="lazy"', imgs[0].src, 'Retirez lazy sur l’image principale et ajoutez fetchpriority="high".', { effort: 1, code: '<img src="hero.webp" fetchpriority="high" width="1600" height="900" alt="…">' })
    const legacy = imgs.filter((i) => /\.(jpe?g|png|gif|bmp)(\?|$)/i.test(i.src)).length
    const modern = imgs.filter((i) => /\.(webp|avif|svg)(\?|$)/i.test(i.src)).length + (p.modernSources || 0)
    if (legacy > 3 && modern < legacy / 2) add('performance', 'moyen', 'img-format', `${legacy} images en JPEG/PNG`, 'WebP/AVIF pèsent 25 à 50 % de moins à qualité égale.', 'Convertissez en WebP/AVIF (plugin, CDN d’images) et servez des srcset.', { effort: 2, value: legacy })
    if (p.inlineStyleBytes > 60000) add('performance', 'faible', 'inline-css', `${Math.round(p.inlineStyleBytes / 1024)} Ko de CSS inline`, '', 'Externalisez le CSS non critique (mis en cache).', { effort: 2 })
    if (/fonts\.googleapis\.com/.test(p.stylesheets.join(' ')) && !p.preconnect.some((x) => /fonts\.gstatic/.test(x || ''))) add('performance', 'faible', 'fonts-preconnect', 'Google Fonts sans preconnect', '', 'Ajoutez <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin> ou auto-hébergez les polices (mieux pour le RGPD).', { effort: 1 })
    if (p.iframes.some((s) => /youtube\.com\/embed|player\.vimeo/.test(s))) add('performance', 'faible', 'video-facade', 'Vidéo intégrée chargée immédiatement', '', 'Utilisez une façade (miniature cliquable) : −500 Ko à −1 Mo de JS par vidéo.', { effort: 2 })
  }

  // ───────────────────────── Données structurées ─────────────────────────
  if (p) {
    const types = schemaTypes(p.jsonLd)
    meta.schemaTypes = [...new Set(types.map((t) => t.type))]
    if (p.jsonLdErrors.length) add('donnees', 'important', 'jsonld-error', `${p.jsonLdErrors.length} bloc(s) JSON-LD invalide(s)`, p.jsonLdErrors.join(' ; '), 'Corrigez la syntaxe JSON (virgules, guillemets) et testez sur search.google.com/test/rich-results.', { effort: 1 })
    if (!types.length && !p.microdata) add('donnees', 'important', 'schema-none', 'Aucune donnée structurée', 'Les données structurées décrivent votre entreprise, vos produits, vos avis : résultats enrichis + compréhension par les IA.', `Ajoutez au minimum ${sector.schema.slice(0, 2).join(' + ')} en JSON-LD.`, { effort: 2, code: schemaTemplate(sector, input, origin) })
    else {
      add('donnees', 'ok', 'schema', `Types schema.org : ${meta.schemaTypes.join(', ') || 'microdata'}`)
      const flat = meta.schemaTypes.join(',').toLowerCase()
      const wanted = sector.schema.filter((t) => !flat.includes(t.toLowerCase()))
      if (wanted.length === sector.schema.length) add('donnees', 'moyen', 'schema-sector', `Types conseillés pour votre secteur absents : ${wanted.join(', ')}`, '', 'Ajoutez le type le plus précis possible (ex. Bakery plutôt que LocalBusiness).', { effort: 2, code: schemaTemplate(sector, input, origin) })
      if (!meta.schemaTypes.some((t) => t.toLowerCase().split(',').some((x) => ORG_TYPES.has(x) || LOCAL_TYPES.has(x)))) add('donnees', 'faible', 'schema-org', 'Pas de schéma Organization / LocalBusiness', 'C’est lui qui relie votre site à votre fiche Google et à vos réseaux (sameAs).', 'Ajoutez Organization avec name, url, logo, sameAs.', { effort: 1, code: schemaTemplate(sector, input, origin) })
      for (const t of types) checkSchemaProps(t, add)
      const hasSameAs = types.some((t) => t.node.sameAs)
      if (!hasSameAs) add('ia', 'moyen', 'sameas', 'Pas de « sameAs » vers vos profils officiels', 'sameAs relie votre marque à LinkedIn, Instagram, Wikidata… : clé pour l’entité Google (Knowledge Panel) et les IA.', 'Ajoutez sameAs dans le schéma Organization.', { effort: 1 })
      if (U && U.pathname !== '/' && !/breadcrumblist/.test(flat)) add('donnees', 'faible', 'breadcrumb', 'Pas de fil d’Ariane structuré (BreadcrumbList)', '', 'Ajoutez BreadcrumbList : affiché dans les résultats Google.', { effort: 1 })
    }
  }

  // ───────────────────────── Visibilité IA (GEO) ─────────────────────────
  if (ctx.llms) {
    if (!ctx.llms.status) { /* non vérifié : rien à dire */ }
    else if (ctx.llms.status === 200 && ctx.llms.bytes > 50) add('ia', 'ok', 'llms', 'Fichier /llms.txt présent')
    else add('ia', 'info', 'llms', 'Pas de /llms.txt (optionnel)', 'Proposition de standard (llmstxt.org) : un résumé Markdown de votre site pour les agents IA. Google ne l’utilise pas ; coût quasi nul.', 'Créez /llms.txt : qui vous êtes, offres, pages clés, contacts.', { effort: 1, code: llmsTemplate(input, origin, p) })
  }
  if (p) {
    const qHeadings = p.headings.filter((x) => /\?\s*$/.test(x.text)).length
    if (qHeadings === 0 && p.wordCount > 150) add('ia', 'moyen', 'questions', 'Aucun intertitre sous forme de question', 'Les moteurs de réponse (AI Overviews, ChatGPT, Perplexity) citent des passages qui répondent directement à une question.', 'Ajoutez une section FAQ (5–8 vraies questions clients) avec des réponses de 40–60 mots, factuelles et chiffrées.', { effort: 2 })
    const textLow = (p.text || '').toLowerCase(), linkText = p.links.map((l) => (l.text + ' ' + (l.href || '')).toLowerCase()).join(' ')
    if (!/(à propos|a propos|qui sommes|notre histoire|about|equipe|équipe)/.test(linkText)) add('ia', 'faible', 'about', 'Pas de lien vers une page « À propos »', 'E-E-A-T : montrer qui est derrière le site (équipe, expérience, preuves).', 'Créez une page À propos riche (histoire, équipe, chiffres, certifications) et liez-la dans le menu/pied de page.', { effort: 2 })
    if (!p.authorMeta && !p.times && !/(publié le|mis à jour le|updated on|posted on)/i.test(p.text.slice(0, 3000)) && !/\b(?:Par|par|By|by) [A-ZÀ-Ý][a-zà-ÿ]+/.test(p.text.slice(0, 3000)) && /article|blog|actualit|guide/i.test((U?.pathname || '') + ' ' + (p.title || ''))) add('ia', 'moyen', 'author-date', 'Article sans auteur ni date visibles', 'Les IA et Google privilégient les contenus datés et signés par un expert identifiable.', 'Affichez auteur (avec bio), date de publication et de mise à jour, + schéma Article.', { effort: 1 })
    if (!p.verification.some((v) => /msvalidate/.test(v))) add('ia', 'info', 'bing', 'Bing Webmaster Tools non vérifié (balise absente)', 'ChatGPT Search et Copilot s’appuient sur l’index Bing. La vérification peut aussi se faire par DNS ou via Search Console.', 'Inscrivez le site sur bing.com/webmasters (import depuis Search Console en 2 clics) et activez IndexNow.', { effort: 1 })
    const numbers = (p.text.match(/\b\d+[\d\s.,]*\s?(%|€|ans|clients|m2|m²|km|années|projets|\+)/gi) || []).length
    if (p.wordCount > 200 && numbers < 2) add('ia', 'faible', 'facts', 'Peu de faits chiffrés', 'Les IA citent volontiers des données précises (chiffres, dates, prix, délais).', 'Ajoutez des preuves chiffrées : années d’expérience, nombre de clients, délais, garanties, prix indicatifs.', { effort: 2 })
    // Citabilité par bloc H2/H3 : les 3 passages à réécrire en priorité
    const scored = scoreBlocks(p.blocks)
    if (scored.length >= 2) {
      meta.citabilite = scored.slice(0, 20)
      const weak = scored.filter((b) => b.score <= 2).sort((a, b) => a.score - b.score || b.words - a.words)
      if (weak.length) add('ia', weak.length >= 3 && weak.length / scored.length >= 0.5 ? 'moyen' : 'faible', 'citabilite', `${weak.length} bloc(s) sur ${scored.length} peu citables par les IA`, `Un passage est repris par les moteurs de réponse quand il se suffit à lui-même. À réécrire d’abord : ${weak.slice(0, 3).map((b) => `« ${b.heading} » (manque : ${b.fails.join(', ')})`).join(' ; ')}.`, 'Pour chaque bloc : intertitre en vraie question, réponse directe dès la 1re phrase qui nomme le sujet, un fait précis (prix, délai, lieu, chiffre daté), 50 à 200 mots.', { effort: 2, code: citabilityTemplate(weak.slice(0, 3)) })
      else add('ia', 'ok', 'citabilite', `Blocs citables : ${scored.length}/${scored.length} passent au moins 3 règles sur 5`)
    }
  }

  // ───────────────────────── Social & marque ─────────────────────────
  if (p) {
    const missingOg = ['title', 'description', 'image', 'url', 'type'].filter((k) => !p.og[k])
    if (missingOg.length >= 3) add('social', 'important', 'og', `Balises Open Graph manquantes : ${missingOg.map((k) => 'og:' + k).join(', ')}`, 'Sans elles, vos liens partagés sur Facebook, LinkedIn, WhatsApp, Slack s’affichent sans image ni titre propre.', 'Ajoutez les balises Open Graph.', { effort: 1, code: ogTemplate(p, url) })
    else if (missingOg.length) add('social', 'moyen', 'og', `Open Graph incomplet : ${missingOg.map((k) => 'og:' + k).join(', ')}`, '', 'Complétez les balises manquantes.', { effort: 1, code: ogTemplate(p, url) })
    else add('social', 'ok', 'og', 'Open Graph complet')
    if (p.og.image && !/^https?:\/\//.test(p.og.image)) add('social', 'moyen', 'og-image-rel', 'og:image en URL relative', p.og.image, 'Utilisez une URL absolue (https://…), image 1200×630 px.', { effort: 1 })
    if (!p.twitter.card) add('social', 'faible', 'twitter', 'Pas de twitter:card', 'X/Twitter et certaines messageries l’utilisent pour la grande vignette.', 'Ajoutez <meta name="twitter:card" content="summary_large_image">.', { effort: 1 })
    for (const l of p.links) for (const [net, re] of SOCIAL) if (re.test(l.href || '')) meta.social[net] = l.href
    const nets = Object.keys(meta.social)
    if (!nets.length) add('social', 'moyen', 'social-links', 'Aucun lien vers vos réseaux sociaux', 'Les liens site ↔ réseaux renforcent l’entité de marque et le trafic croisé.', 'Ajoutez les icônes de vos profils dans le pied de page (avec aria-label) + sameAs dans le schéma.', { effort: 1 })
    else add('social', 'ok', 'social-links', `Réseaux reliés : ${nets.join(', ')}`)
    if (!p.icons.length) add('social', 'faible', 'favicon', 'Favicon non déclarée', 'Google affiche la favicon à côté de votre résultat (mobile et desktop).', 'Ajoutez une favicon carrée (48×48 minimum, SVG ou PNG) et un apple-touch-icon 180×180.', { effort: 1 })
    else if (!p.icons.some((i) => /apple-touch-icon/.test(i.rel))) add('social', 'faible', 'apple-icon', 'Pas d’apple-touch-icon', '', 'Ajoutez une icône 180×180 pour les raccourcis iOS.', { effort: 1 })
  }

  // Coordonnées détectées (servent aux correctifs prêts à coller)
  if (p) {
    const telLink = p.links.find((l) => /^tel:/.test(l.raw || ''))
    meta.phone = (telLink && (telLink.text.match(PHONE_RE)?.[0] || decodeSafe(telLink.raw.slice(4)).trim())) || p.text.match(PHONE_RE)?.[0] || ''
    meta.address = findAddress(p)
    meta.telLink = !!telLink
    meta.forms = p.forms || 0
    meta.orgName = orgName(p.jsonLd)
  }
  if (ctx.fetch?.uaFallback) add('technique', 'info', 'ua-fallback', 'Le site refuse les robots inconnus', 'L’audit s’est d’abord présenté comme « SEO360-Audit » et a été refusé ; il a été fait en se présentant comme un navigateur.', 'Vérifiez dans Search Console (Inspection d’URL) que Googlebot et Bingbot passent bien votre pare-feu.', { effort: 1 })

  // ───────────────────────── Local ─────────────────────────
  if (p && local) {
    const flat = (meta.schemaTypes || []).join(',').toLowerCase()
    const tel = p.links.some((l) => /^tel:/.test(l.raw || ''))
    const phoneText = PHONE_RE.test(p.text)
    if (!tel) add('local', phoneText ? 'faible' : 'important', 'tel', phoneText ? 'Numéro présent mais non cliquable' : 'Pas de numéro de téléphone', 'Sur mobile, l’appel en un clic est la première conversion locale.', 'Ajoutez <a href="tel:+33…">.', { effort: 1 })
    const address = /\b\d{5}\b/.test(p.text) || /postaladdress|address/.test(JSON.stringify(p.jsonLd).toLowerCase())
    if (!address) add('local', 'important', 'nap', 'Adresse (NAP) introuvable dans la page', 'Nom, adresse, téléphone doivent être identiques partout (site, fiche Google, annuaires).', 'Affichez l’adresse complète dans le pied de page et dans le schéma LocalBusiness.', { effort: 1 })
    if (!meta.schemaTypes.some((t) => t.toLowerCase().split(',').some((x) => LOCAL_TYPES.has(x)))) add('local', 'important', 'localbusiness', 'Pas de schéma LocalBusiness', '', 'Ajoutez LocalBusiness (type précis) avec adresse, téléphone, horaires, géo.', { effort: 1, code: schemaTemplate(sector, input, origin) })
    else if (!/openinghours/i.test(JSON.stringify(p.jsonLd))) add('local', 'faible', 'hours', 'Horaires non structurés', '', 'Ajoutez openingHoursSpecification au schéma.', { effort: 1 })
    if (!p.links.some((l) => /google\.[a-z.]+\/maps|maps\.app\.goo\.gl|g\.page|goo\.gl\/maps/.test(l.href || '')) && !p.iframes.some((s) => /google\.[a-z.]+\/maps/.test(s))) add('local', 'moyen', 'gbp-link', 'Pas de lien vers votre fiche Google / Maps', '', 'Liez votre fiche Google Business Profile (itinéraire, avis).', { effort: 1 })
    if (input.city && !norm(`${p.title} ${p.headings.map((x) => x.text).join(' ')}`).includes(norm(input.city))) add('local', 'moyen', 'city', `La ville « ${input.city} » n’apparaît ni dans le titre ni dans les intertitres`, '', `Ex. titre : « ${cap(input.keyword || sector.keywords[0])} à ${input.city} — ${input.brand || 'Marque'} ».`, { effort: 1 })
    add('local', 'info', 'gbp', 'À vérifier hors site : fiche Google Business Profile', 'Catégorie principale exacte, photos chaque semaine, posts, réponses à 100 % des avis, attributs, produits/services.', 'Voir la checklist « SEO local ».', { effort: 2 })
  }

  // ───────────────────────── Mesure, RGPD, accessibilité ─────────────────────────
  if (p) {
    for (const [name, re] of TRACKERS) if (re.test(allHtmlText)) meta.trackers.push(name)
    for (const [name, re] of CMPS) if (re.test(allHtmlText)) meta.cmp.push(name)
    for (const [name, re] of CMS) if (re.test(allHtmlText + ' ' + (ctx.rawHead || ''))) meta.cms.push(name)
    if (!meta.trackers.some((t) => /Analytics|Matomo|Plausible|Fathom|Piano|Tag Manager|Clarity/.test(t))) add('conformite', 'important', 'analytics', 'Aucun outil de mesure d’audience détecté', 'Impossible de piloter le SEO et la publicité sans mesure (trafic, conversions, sources).', 'Installez GA4 + Search Console (ou Matomo/Plausible, exemptables de consentement CNIL), et suivez les conversions.', { effort: 2 })
    else add('conformite', 'ok', 'analytics', `Mesure : ${meta.trackers.join(', ')}`)
    const ads = meta.trackers.filter((t) => /Pixel|Insight|Tag|Ads|UET/.test(t) && t !== 'Google Tag Manager')
    if ((ads.length || meta.trackers.includes('Google Analytics 4')) && !meta.cmp.length) add('conformite', 'important', 'cmp', 'Traceurs sans bandeau de consentement détecté', `Traceurs : ${meta.trackers.join(', ')}. La CNIL sanctionne le dépôt de cookies avant consentement.`, 'Installez une CMP certifiée Google (Axeptio, Didomi, Cookiebot…) et le Consent Mode v2 (obligatoire pour Google Ads dans l’EEE).', { effort: 2 })
    if (ads.length && meta.cmp.length && !meta.cmp.includes('Consent Mode Google')) add('conformite', 'info', 'consent-mode', 'Vérifiez le Google Consent Mode v2', '', 'Sans Consent Mode v2, Google Ads perd le remarketing et une partie des conversions mesurées dans l’EEE.', { effort: 1 })
    const linkText = p.links.map((l) => (l.text + ' ' + (l.href || '')).toLowerCase()).join(' ')
    if (/\.fr$|\.eu$/.test(U?.hostname || '') || (p.lang || '').startsWith('fr')) {
      if (!/mentions[- ]l[ée]gales|legal|impressum/.test(linkText)) add('conformite', 'important', 'legal', 'Lien « Mentions légales » introuvable', 'Obligatoire en France (LCEN) pour tout site professionnel.', 'Ajoutez une page Mentions légales liée dans le pied de page.', { effort: 1 })
      if (!/confidentialit|privacy|donn[ée]es personnelles|rgpd/.test(linkText)) add('conformite', 'moyen', 'privacy', 'Politique de confidentialité introuvable', 'Obligatoire dès que vous collectez des données (formulaire, cookies).', 'Ajoutez la page et liez-la dans le pied de page et sous chaque formulaire.', { effort: 1 })
      if (input.sector?.startsWith('ecommerce') && !/cgv|conditions g[ée]n[ée]rales/.test(linkText)) add('conformite', 'important', 'cgv', 'CGV introuvables', 'Obligatoires pour la vente en ligne.', 'Publiez vos CGV et liez-les.', { effort: 1 })
    }
    const unlabeled = p.inputs.filter((i) => !i.label && !(i.id && p.labelsFor.includes(i.id)))
    if (unlabeled.length) add('conformite', 'moyen', 'labels', `${unlabeled.length} champ(s) de formulaire sans label`, unlabeled.slice(0, 4).map((i) => i.name || i.placeholder || i.type).join(', '), 'Associez un <label for> à chaque champ (le placeholder ne suffit pas).', { effort: 1 })
    const emptyBtn = p.buttons.filter((b) => !b.trim()).length
    if (emptyBtn) add('conformite', 'moyen', 'buttons', `${emptyBtn} bouton(s) sans nom accessible`, '', 'Ajoutez un texte ou aria-label (ex. bouton menu, recherche).', { effort: 1 })
    if (!p.hasMainLandmark) add('conformite', 'faible', 'landmarks', 'Pas de balise <main>', '', 'Structurez avec header / nav / main / footer (RGAA, lecteurs d’écran, et extraction par les IA).', { effort: 1 })
    if (U?.protocol === 'https:') {
      const mixed = [...p.images.map((i) => i.src), ...p.scripts.map((s) => s.src), ...p.stylesheets, ...p.iframes].filter((s) => /^http:\/\//.test(s || ''))
      if (mixed.length) add('conformite', 'important', 'mixed', `${mixed.length} ressource(s) en http:// sur une page https`, mixed.slice(0, 3).join(', '), 'Passez toutes les ressources en https:// (contenu mixte bloqué par les navigateurs).', { effort: 1 })
    }
  }

  // ───────────────────────── Crawl (plusieurs pages) ─────────────────────────
  if (ctx.crawl?.pages?.length > 1) { const n = F.length; crawlFindings(ctx.crawl, add); for (const f of F.slice(n)) f.scope = 'site' }

  // ───────────────────────── PageSpeed Insights ─────────────────────────
  if (ctx.psi && !ctx.psi.error) psiFindings(ctx.psi, add)
  else if (ctx.psi?.error) add('performance', 'info', 'psi-error', 'PageSpeed Insights indisponible', ctx.psi.error, 'Relancez avec une clé API gratuite (Google Cloud → PageSpeed Insights API).', { effort: 1 })

  return finalize(F, meta, ctx, local)
}

function crawlFindings(crawl, add) {
  const pages = crawl.pages.filter((x) => x.status === 200)
  const dup = (key) => {
    const m = new Map()
    for (const pg of pages) if (pg[key]) m.set(pg[key], [...(m.get(pg[key]) || []), pg.url])
    return [...m].filter(([, v]) => v.length > 1)
  }
  const dt = dup('title'), dd = dup('description')
  if (dt.length) add('contenu', 'important', 'dup-title', `${dt.reduce((s, [, v]) => s + v.length, 0)} pages partagent le même titre`, dt.slice(0, 3).map(([t, v]) => `« ${t.slice(0, 60)} » × ${v.length}`).join(' ; '), 'Chaque page doit avoir un titre unique décrivant son sujet précis.', { effort: 2 })
  if (dd.length) add('contenu', 'moyen', 'dup-desc', `${dd.reduce((s, [, v]) => s + v.length, 0)} pages partagent la même meta description`, '', 'Rédigez une description unique par page (ou laissez Google choisir sur les pages secondaires).', { effort: 2 })
  const noH1 = pages.filter((x) => !x.h1)
  if (noH1.length) add('contenu', 'moyen', 'crawl-h1', `${noH1.length} page(s) sans H1`, noH1.slice(0, 4).map((x) => x.url).join(' '), 'Ajoutez un H1 par page.', { effort: 1 })
  const noDesc = pages.filter((x) => !x.description)
  if (noDesc.length > 1) add('contenu', 'moyen', 'crawl-desc', `${noDesc.length} page(s) sans meta description`, '', 'Rédigez les descriptions des pages stratégiques en priorité.', { effort: 2 })
  const thin = pages.filter((x) => x.words < 200)
  if (thin.length > 1) add('contenu', 'moyen', 'crawl-thin', `${thin.length} page(s) de moins de 200 mots`, thin.slice(0, 4).map((x) => x.url).join(' '), 'Enrichissez, fusionnez ou passez en noindex les pages pauvres.', { effort: 3 })
  const noidx = pages.filter((x) => x.noindex)
  if (noidx.length) add('technique', 'info', 'crawl-noindex', `${noidx.length} page(s) en noindex`, noidx.slice(0, 4).map((x) => x.url).join(' '), 'Vérifiez que c’est voulu.', { effort: 1 })
  const broken = crawl.broken || []
  if (broken.length) add('technique', 'important', 'broken', `${broken.length} lien(s) interne(s) cassé(s)`, broken.slice(0, 5).map((b) => `${b.status} ${b.url} (depuis ${b.from})`).join(' ; '), 'Corrigez les liens ou redirigez (301) les URL supprimées.', { effort: 2 })
  const slow = pages.filter((x) => x.timeMs > 1500)
  if (slow.length > 1) add('performance', 'moyen', 'crawl-slow', `${slow.length} page(s) répondent en plus de 1,5 s`, '', 'Cache serveur / CDN.', { effort: 3 })
  add('technique', 'ok', 'crawl', `${crawl.pages.length} pages explorées`)
}

function psiFindings(psi, add) {
  const fd = psi.field || {}
  const cwv = [
    ['LCP', fd.LCP, 2500, 4000, 'ms', 'Largest Contentful Paint : temps d’affichage du plus grand élément.', 'Optimisez l’image/texte principal : poids, préchargement, fetchpriority="high", serveur rapide.'],
    ['INP', fd.INP, 200, 500, 'ms', 'Interaction to Next Paint : réactivité aux clics et saisies.', 'Allégez le JavaScript, découpez les tâches longues, retardez les scripts tiers.'],
    ['CLS', fd.CLS, 0.1, 0.25, '', 'Cumulative Layout Shift : stabilité visuelle.', 'Réservez la place des images, pubs, iframes et polices (width/height, aspect-ratio, font-display).'],
  ]
  let anyField = false
  for (const [k, v, good, poor, unit, what, fix] of cwv) {
    if (v == null) continue
    anyField = true
    const shown = unit ? `${Math.round(v)} ${unit}` : v.toFixed(2)
    if (v > poor) add('performance', 'critique', `cwv-${k}`, `${k} mauvais chez vos visiteurs : ${shown}`, `${what} Seuil « bon » : ${unit ? good + ' ' + unit : good}. Données réelles Chrome (CrUX, 28 jours).`, fix, { effort: 3 })
    else if (v > good) add('performance', 'important', `cwv-${k}`, `${k} à améliorer : ${shown}`, `${what} Seuil « bon » : ${unit ? good + ' ' + unit : good}.`, fix, { effort: 3 })
    else add('performance', 'ok', `cwv-${k}`, `${k} bon : ${shown}`)
  }
  if (!anyField) add('performance', 'info', 'crux', 'Pas encore de données terrain Chrome (trafic insuffisant)', 'Les scores ci-dessous viennent d’un test labo (Lighthouse, mobile).', '', { effort: 1 })
  const s = psi.scores || {}
  if (s.performance != null) {
    if (s.performance < 50) add('performance', 'important', 'lh-perf', `Score Lighthouse performance mobile : ${s.performance}/100`, `LCP labo ${psi.lab?.LCP ?? '?'} · TBT ${psi.lab?.TBT ?? '?'} · CLS ${psi.lab?.CLS ?? '?'}`, 'Traitez les opportunités listées (images, JS, serveur).', { effort: 3 })
    else if (s.performance < 90) add('performance', 'moyen', 'lh-perf', `Score Lighthouse performance mobile : ${s.performance}/100`, '', 'Objectif ≥ 90.', { effort: 3 })
    else add('performance', 'ok', 'lh-perf', `Lighthouse performance : ${s.performance}/100`)
  }
  if (s.seo != null && s.seo < 90) add('technique', 'moyen', 'lh-seo', `Score Lighthouse SEO : ${s.seo}/100`, '', 'Voir les points SEO Lighthouse ci-dessous.', { effort: 1 })
  if (s.accessibility != null && s.accessibility < 85) add('conformite', 'moyen', 'lh-a11y', `Score Lighthouse accessibilité : ${s.accessibility}/100`, 'Accessibilité = obligation légale croissante (loi 2025 sur l’accessibilité des services numériques, RGAA).', 'Contrastes, labels, alt, ordre de focus.', { effort: 2 })
  for (const o of (psi.opportunities || []).slice(0, 12)) {
    const cat = o.group === 'seo' ? 'technique' : o.group === 'accessibility' ? 'conformite' : o.group === 'best-practices' ? 'conformite' : 'performance'
    const sev = o.savingsMs > 1500 || o.score === 0 && o.weight >= 3 ? 'important' : o.savingsMs > 300 ? 'moyen' : 'faible'
    add(cat, sev, `lh-${o.id}`, `Lighthouse : ${o.title}`, [o.displayValue, o.savingsMs ? `gain estimé ≈ ${Math.round(o.savingsMs)} ms` : '', o.savingsBytes ? `≈ ${Math.round(o.savingsBytes / 1024)} Ko` : ''].filter(Boolean).join(' · '), o.description || '', { effort: 2 })
  }
}

// Score honnête : une catégorie n'est notée que si elle a été mesurée ; pas de note globale sans la page ;
// plafonds quand un blocage annule tout le reste (noindex, Google bloqué, canonical externe, page vide).
function finalize(F, meta, ctx, local) {
  const p = ctx.page, psiOk = ctx.psi?.scores?.performance != null
  const measured = {
    technique: !!(p || ctx.fetch?.status > 0), contenu: !!p, donnees: !!p, ia: !!p, social: !!p, conformite: !!p, local: !!p && local,
    performance: psiOk || !!p,
  }
  const ids = new Set(F.map((f) => f.id))
  const caps = []
  if (ids.has('noindex')) caps.push([30, 'la page est en noindex : Google ne l’affichera pas'])
  if (ids.has('robots-all') || ids.has('robots-block')) caps.push([30, 'robots.txt bloque Google'])
  if (ids.has('canonical-host')) caps.push([40, 'la canonical renvoie vers un autre domaine'])
  if (F.some((f) => f.id === 'js-render' && f.sev === 'critique')) caps.push([40, 'le contenu n’existe qu’après JavaScript'])
  else if (p && p.wordCount < 150) caps.push([60, `la page ne contient que ${p.wordCount} mots`])
  const scoreOf = (list) => {
    const scores = {}
    for (const [k, c] of Object.entries(CATEGORIES)) {
      if (k === 'local' && !local) continue
      const items = list.filter((f) => f.cat === k)
      const pen = items.reduce((s, f) => s + SEVERITY[f.sev].penalty, 0)
      let score = measured[k] ? Math.max(0, Math.min(100, Math.round(100 - pen))) : null
      if (k === 'performance' && psiOk) score = Math.round(score * 0.5 + ctx.psi.scores.performance * 0.5)
      if (k === 'contenu' && score != null && p && p.wordCount < 150) score = Math.min(score, 40)
      scores[k] = { label: c.label, score, measured: measured[k], issues: items.filter((f) => SEVERITY[f.sev].penalty > 0).length, estimated: k === 'performance' && !psiOk && measured[k] }
    }
    const keys = Object.keys(scores)
    const w = (k) => CATEGORIES[k].weight * (scores[k].estimated ? 0.5 : 1)
    const total = keys.reduce((s, k) => s + CATEGORIES[k].weight, 0)
    const done = keys.filter((k) => scores[k].score != null)
    const coverage = done.reduce((s, k) => s + w(k), 0) / total
    const raw = done.length ? Math.round(done.reduce((s, k) => s + scores[k].score * w(k), 0) / done.reduce((s, k) => s + w(k), 0)) : null
    let global = raw
    for (const [cap] of caps) if (global != null) global = Math.min(global, cap)
    return { scores, global, raw, coverage }
  }
  const all = scoreOf(F), page = scoreOf(F.filter((f) => f.scope !== 'site'))
  let incomplete = null
  if (!p) incomplete = ctx.blocked ? `le site a refusé l’accès au robot d’audit (${ctx.blocked.status || 'protection'})` : ctx.fetch?.status >= 400 ? `la page répond ${ctx.fetch.status}` : ctx.fetch?.source === 'psi' ? (ctx.psi?.scores ? 'seule la vitesse a été mesurée (page non lue)' : 'rien n’a pu être mesuré : page non lue et PageSpeed indisponible') : 'la page n’a pas pu être lue'
  else if (all.coverage < 0.6) incomplete = 'trop peu de contrôles ont pu être faits'
  const global = incomplete ? null : all.global
  const issues = F.filter((f) => SEVERITY[f.sev].penalty > 0)
    .map((f) => ({ ...f, priority: Math.round((f.impact * 3 + (6 - f.effort) * 2) * 10) / 10 }))
    .sort((a, b) => SEVERITY[a.sev].rank - SEVERITY[b.sev].rank || b.priority - a.priority)
  return {
    global, grade: global == null ? null : global >= 85 ? 'A' : global >= 70 ? 'B' : global >= 55 ? 'C' : global >= 40 ? 'D' : 'E',
    coverage: Math.round(all.coverage * 100) / 100, incomplete, caps: caps.filter(([c]) => all.raw != null && all.raw > c).map(([c, why]) => `${c}/100 maximum car ${why}`),
    scores: all.scores, pageScores: Object.fromEntries(Object.entries(page.scores).map(([k, v]) => [k, v.score])), pageGlobal: incomplete ? null : page.global,
    issues, passed: F.filter((f) => f.sev === 'ok'), infos: F.filter((f) => f.sev === 'info'), meta,
    counts: Object.fromEntries(Object.keys(SEVERITY).map((s) => [s, F.filter((f) => f.sev === s).length])),
  }
}

const REQUIRED = {
  product: ['name', 'image', ['offers', 'aggregateRating', 'review']],
  localbusiness: ['name', 'address', 'telephone'],
  organization: ['name', 'url', 'logo'],
  article: ['headline', 'datePublished', 'author', 'image'],
  blogposting: ['headline', 'datePublished', 'author'],
  event: ['name', 'startDate', 'location'],
  recipe: ['name', 'image', 'recipeIngredient'],
  faqpage: ['mainEntity'],
  jobposting: ['title', 'datePosted', 'hiringOrganization', 'jobLocation'],
  softwareapplication: ['name', ['offers', 'aggregateRating'], 'applicationCategory'],
}
function checkSchemaProps(t, add) {
  const key = t.type.toLowerCase().split(',')[0]
  const isLocal = LOCAL_TYPES.has(key)
  const req = REQUIRED[key] || (isLocal ? REQUIRED.localbusiness : null)
  if (!req) return
  const miss = req.filter((r) => Array.isArray(r) ? !r.some((x) => t.node[x]) : !t.node[r]).map((r) => [].concat(r).join(' ou '))
  if (miss.length) add('donnees', 'moyen', `schema-${key}`, `Schéma ${t.type} incomplet : ${miss.join(', ')}`, '', 'Complétez les propriétés requises/recommandées par Google.', { effort: 1 })
}

export function schemaTemplate(sector, input = {}, origin = 'https://votre-site.fr') {
  const type = sector.schema[0]
  const isLocal = sector.local || input.local
  const o = {
    '@context': 'https://schema.org', '@type': type, name: input.brand || 'Votre marque', url: origin + '/', logo: origin + '/logo.png',
    image: origin + '/photo-principale.jpg', description: '…',
    sameAs: ['https://www.linkedin.com/company/…', 'https://www.instagram.com/…', 'https://www.facebook.com/…'],
  }
  if (isLocal) Object.assign(o, {
    telephone: '+33 …', priceRange: '€€',
    address: { '@type': 'PostalAddress', streetAddress: '…', postalCode: '…', addressLocality: input.city || '…', addressCountry: 'FR' },
    geo: { '@type': 'GeoCoordinates', latitude: 0, longitude: 0 },
    openingHoursSpecification: [{ '@type': 'OpeningHoursSpecification', dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'], opens: '09:00', closes: '18:00' }],
  })
  return `<script type="application/ld+json">\n${JSON.stringify(o, null, 2)}\n</script>`
}

function ogTemplate(p, url) {
  const t = (p.title || 'Titre de la page').replace(/"/g, '&quot;'), d = (p.metaDescription || 'Description').replace(/"/g, '&quot;')
  return `<meta property="og:type" content="website">\n<meta property="og:title" content="${t}">\n<meta property="og:description" content="${d}">\n<meta property="og:image" content="${new URL('/og-image.jpg', url || 'https://votre-site.fr').href}">\n<meta property="og:url" content="${url || ''}">\n<meta property="og:locale" content="fr_FR">\n<meta name="twitter:card" content="summary_large_image">`
}

export function llmsTemplate(input = {}, origin = 'https://votre-site.fr', p = null) {
  return `# ${input.brand || p?.og?.site_name || 'Votre marque'}

> ${p?.metaDescription || 'Une phrase qui résume qui vous êtes, pour qui, et ce qui vous distingue.'}

## Offres
- [Produit / service 1](${origin}/…): description en une ligne
- [Produit / service 2](${origin}/…): description en une ligne

## Ressources
- [À propos](${origin}/a-propos): histoire, équipe, chiffres clés
- [FAQ](${origin}/faq): réponses aux questions fréquentes
- [Tarifs](${origin}/tarifs)

## Contact
- ${input.city ? 'Adresse : … ' + input.city : 'Adresse : …'}
- Téléphone : …
`
}

const norm = (s) => (s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, ' ').trim()
const cap = (s) => s ? s[0].toUpperCase() + s.slice(1) : s
function normalize(u) { try { const x = new URL(u); return (x.origin + x.pathname).replace(/\/index\.(html?|php)$/, '/').replace(/\/$/, '') + x.search } catch { return u } }

// Score générique pour d'autres cibles (dépôt GitHub, application) : cats = { id: { label, weight } }
export function scoreFindings(F, cats, meta = {}, scale = 1.6) {
  const pen = (f) => f.penalty ?? SEVERITY[f.sev].penalty * scale
  const scores = {}
  for (const [k, c] of Object.entries(cats)) {
    const items = F.filter((f) => f.cat === k)
    scores[k] = { label: c.label, score: Math.max(0, Math.round(100 - items.reduce((s, f) => s + pen(f), 0))), issues: items.filter((f) => SEVERITY[f.sev].penalty > 0).length }
  }
  const keys = Object.keys(scores), w = keys.reduce((s, k) => s + cats[k].weight, 0)
  const global = Math.round(keys.reduce((s, k) => s + scores[k].score * cats[k].weight, 0) / w)
  const issues = F.filter((f) => SEVERITY[f.sev].penalty > 0).map((f) => ({ ...f, priority: f.impact * 3 + (6 - f.effort) * 2 }))
    .sort((a, b) => SEVERITY[a.sev].rank - SEVERITY[b.sev].rank || b.priority - a.priority)
  return { global, grade: global >= 85 ? 'A' : global >= 70 ? 'B' : global >= 55 ? 'C' : global >= 40 ? 'D' : 'E', coverage: 1, incomplete: null, caps: [], scores, pageScores: Object.fromEntries(Object.entries(scores).map(([k, v]) => [k, v.score])), issues, passed: F.filter((f) => f.sev === 'ok'), infos: F.filter((f) => f.sev === 'info'), meta, counts: Object.fromEntries(Object.keys(SEVERITY).map((s) => [s, F.filter((f) => f.sev === s).length])) }
}
export function finding(cat, sev, id, title, detail = '', fix = '', o = {}) {
  return { cat, sev, id, title, detail, fix, impact: o.impact ?? ({ critique: 5, important: 4, moyen: 3, faible: 2, info: 1, ok: 0 }[sev]), effort: o.effort ?? 1, code: o.code || '', ref: o.ref || '', ...(o.penalty != null ? { penalty: o.penalty } : {}) }
}

function decodeSafe(x) { try { return decodeURIComponent(x) } catch { return x } }
function tryHost(u) { try { return new URL(u).hostname.replace(/^www\./, '') } catch { return '' } }

// Téléphone français : 04 78 00 00 00, 04.78.00.00.00, +33 4 78 00 00 00, +33 (0)4 78…
export const PHONE_RE = /(?:\+33\s?(?:\(0\)\s?)?|\b0)[1-9](?:[\s.-]?\d{2}){4}\b/

function findAddress(p) {
  const walk = (n) => {
    if (!n || typeof n !== 'object') return null
    if (Array.isArray(n)) { for (const x of n) { const r = walk(x); if (r) return r } return null }
    if (/PostalAddress/.test([].concat(n['@type'] || '').join(',')) && (n.postalCode || n.addressLocality)) return { street: n.streetAddress || '', postalCode: String(n.postalCode || ''), locality: n.addressLocality || '' }
    for (const v of Object.values(n)) if (typeof v === 'object') { const r = walk(v); if (r) return r }
    return null
  }
  const fromLd = walk(p.jsonLd)
  if (fromLd && fromLd.postalCode && fromLd.locality) return fromLd
  const m = p.text.match(/(\d{1,4}(?:\s?(?:bis|ter))?,?\s+(?:rue|avenue|av\.|boulevard|bd|place|chemin|route|all[ée]e|impasse|quai|cours|square|zone|za|zi|lieu-dit|parc)\b[^,\n]{2,60}?)[,\s–-]+(\d{5})\s+([A-ZÀ-Ý][A-Za-zÀ-ÿ'’ -]{1,40}?)(?=[\s,.;|]|$)/i)
  const c = p.text.match(/\b(\d{5})\s+([A-ZÀ-Ý][A-Za-zÀ-ÿ'’-]{2,30}(?:[ -][A-ZÀ-Ý][A-Za-zÀ-ÿ'’-]{2,30}){0,3})/)
  const fromText = m ? { street: m[1].trim(), postalCode: m[2], locality: m[3].trim() } : c ? { street: '', postalCode: c[1], locality: c[2] } : null
  if (!fromLd) return fromText
  return { street: fromLd.street || fromText?.street || '', postalCode: fromLd.postalCode || fromText?.postalCode || '', locality: fromLd.locality || fromText?.locality || '' }
}

// Nom de l'entreprise déclaré dans les données structurées (sert de marque par défaut)
function orgName(jsonLd) {
  let name = ''
  const walk = (n) => {
    if (name || !n || typeof n !== 'object') return
    if (Array.isArray(n)) return n.forEach(walk)
    const t = [].concat(n['@type'] || '').join(',').toLowerCase()
    if (n.name && typeof n.name === 'string' && t.split(',').some((x) => ORG_TYPES.has(x) || LOCAL_TYPES.has(x))) { name = n.name; return }
    for (const v of Object.values(n)) if (typeof v === 'object') walk(v)
  }
  walk(jsonLd)
  return name
}

// Codes pays ISO 3166-1 alpha-2 (hreflang)
const REGIONS = new Set('ad ae af ag ai al am ao aq ar as at au aw ax az ba bb bd be bf bg bh bi bj bl bm bn bo bq br bs bt bv bw by bz ca cc cd cf cg ch ci ck cl cm cn co cr cu cv cw cx cy cz de dj dk dm do dz ec ee eg eh er es et fi fj fk fm fo fr ga gb gd ge gf gg gh gi gl gm gn gp gq gr gs gt gu gw gy hk hm hn hr ht hu id ie il im in io iq ir is it je jm jo jp ke kg kh ki km kn kp kr kw ky kz la lb lc li lk lr ls lt lu lv ly ma mc md me mf mg mh mk ml mm mn mo mp mq mr ms mt mu mv mw mx my mz na nc ne nf ng ni nl no np nr nu nz om pa pe pf pg ph pk pl pm pn pr ps pt pw py qa re ro rs ru rw sa sb sc sd se sg sh si sj sk sl sm sn so sr ss st sv sx sy sz tc td tf tg th tj tk tl tm tn to tr tt tv tw tz ua ug um us uy uz va vc ve vg vi vn vu wf ws ye yt za zm zw 419'.split(' '))

// Types schema.org : sous-types de LocalBusiness (et lieux physiques) / organisations
export const LOCAL_TYPES = new Set(`localbusiness store restaurant bakery cafeorcoffeeshop barorpub brewery winery distillery fastfoodrestaurant icecreamshop foodestablishment beautysalon hairsalon nailsalon dayspa tattooparlor healthandbeautybusiness dentist physician medicalclinic medicalbusiness optician pharmacy veterinarycare realestateagent homeandconstructionbusiness generalcontractor plumber electrician roofingcontractor hvacbusiness housepainter locksmith movingcompany autorepair autodealer autobodyshop autopartsstore autorental automotivebusiness autowash gasstation motorcycledealer motorcyclerepair legalservice attorney notary accountingservice financialservice insuranceagency bankorcreditunion lodgingbusiness hotel motel bedandbreakfast hostel campground resort vacationrental sportsactivitylocation exercisegym healthclub golfcourse sportsclub bowlingalley skiresort stadiumorarena publicswimmingpool entertainmentbusiness nightclub movietheater amusementpark artgallery casino comedyclub professionalservice travelagency childcare drycleaningorlaundry employmentagency emergencyservice library recyclingcenter selfstorage shoppingcenter touristinformationcenter animalshelter archiveorganization governmentoffice internetcafe radiostation televisionstation petstore jewelrystore furniturestore clothingstore florist grocerystore hardwarestore homegoodsstore bookstore bikestore shoestore sportinggoodsstore toystore electronicsstore liquorstore mobilephonestore musicstore officeequipmentstore outletstore pawnshop computerstore conveniencestore departmentstore gardenstore hobbyshop tirestore wholesalestore`.split(/\s+/))
const ORG_TYPES = new Set('organization corporation onlinestore onlinebusiness ngo educationalorganization medicalorganization sportsorganization performinggroup musicgroup newsmediaorganization researchorganization airline consortium cooperative fundingscheme governmentorganization librarysystem politicalparty project workersunion person brand'.split(' '))

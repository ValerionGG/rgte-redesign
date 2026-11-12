// Extracteur HTML sans dépendance (navigateur + Node). Tolérant : on ne construit pas de DOM,
// on lit les balises dans l'ordre et on récupère tout ce qui compte pour le SEO.

const ENTITIES = {
  amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ', eacute: 'é', egrave: 'è', ecirc: 'ê', euml: 'ë',
  agrave: 'à', acirc: 'â', auml: 'ä', ccedil: 'ç', icirc: 'î', iuml: 'ï', ocirc: 'ô', ouml: 'ö', ugrave: 'ù',
  ucirc: 'û', uuml: 'ü', Eacute: 'É', Egrave: 'È', Agrave: 'À', Ccedil: 'Ç', oelig: 'œ', OElig: 'Œ', laquo: '«',
  raquo: '»', rsquo: '’', lsquo: '‘', ldquo: '“', rdquo: '”', hellip: '…', ndash: '–', mdash: '—', euro: '€',
  copy: '©', reg: '®', trade: '™', middot: '·', bull: '•', deg: '°', times: '×', shy: '',
}

export function decode(s = '') {
  return s.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+\d*);/gi, (m, e) => {
    if (e[0] === '#') {
      const n = e[1] === 'x' || e[1] === 'X' ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10)
      try { return String.fromCodePoint(n) } catch { return m }
    }
    return ENTITIES[e] ?? m
  })
}

const clean = (s) => decode(s).replace(/\s+/g, ' ').trim()

function attrs(src) {
  const out = {}
  const re = /([^\s"'>\/=]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+)))?/g
  let m
  while ((m = re.exec(src))) out[m[1].toLowerCase()] = decode(m[2] ?? m[3] ?? m[4] ?? '')
  return out
}

const INLINE_SEP = new Set(['a', 'button', 'label', 'option', 'img', 'input', 'select', 'textarea', 'time', 'abbr'])
const RAW = new Set(['script', 'style', 'textarea', 'template', 'noscript', 'xmp'])
const VOID = new Set(['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'source', 'track', 'wbr'])
const BLOCK = new Set(['p', 'div', 'li', 'td', 'th', 'tr', 'section', 'article', 'header', 'footer', 'nav', 'main', 'aside', 'br', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'table', 'blockquote', 'figcaption', 'dd', 'dt', 'form', 'label', 'button', 'option'])

export function resolve(href, base) {
  try { return new URL(href, base).href } catch { return null }
}

export function extract(html = '', baseUrl = 'https://exemple.invalid/') {
  const p = {
    url: baseUrl, htmlBytes: new TextEncoder().encode(html).length, doctype: /^\s*(?:<!--[\s\S]*?-->\s*)*<!doctype html/i.test(html),
    lang: null, titles: [], title: null, metas: [], metaDescription: null, robots: null, googlebot: null, viewport: null,
    charset: null, canonical: [], hreflang: [], icons: [], manifest: null, preconnect: [], preload: [], stylesheets: [],
    og: {}, twitter: {}, headings: [], images: [], links: [], scripts: [], jsonLd: [], jsonLdErrors: [], microdata: false,
    iframes: [], forms: 0, inputs: [], buttons: [], videos: 0, text: '', wordCount: 0, inHeadBlocking: 0, amp: null,
    generator: null, themeColor: null, verification: [], appleApp: null, googlePlayApp: null, inlineStyleBytes: 0,
    deprecated: [], base: null, labelsFor: [], times: 0, authorMeta: null, microdataTypes: [], dataNosnippet: 0, areaServed: false, addressSeen: false, paragraphs: [], iframesSrc: [], hasMainLandmark: false, hasNav: false, rssFeeds: [],
  }
  const stack = [] // éléments capturant du texte : {tag, text}
  const textParts = []
  // Blocs H2/H3 (pour la citabilité) : position dans le texte visible à l'ouverture et à la fermeture du titre
  const marks = []
  let tlen = 0, footerAt = -1
  let inHead = true, inBody = false, inSvg = 0
  const HEADISH = new Set(['html', 'head', 'title', 'meta', 'link', 'script', 'style', 'base', 'noscript', 'template'])
  const tagRe = /<!--[\s\S]*?-->|<!\[CDATA\[[\s\S]*?\]\]>|<!doctype[^>]*>|<\?[\s\S]*?\?>|<(\/?)([a-zA-Z][\w:-]*)((?:\s+(?:[^\s"'>\/=]+(?:\s*=\s*(?:"[^"]*"|'[^']*'|[^\s"'=<>`]+))?)|\s*\/(?!>))*)\s*(\/?)>/g
  let last = 0, m
  const pushText = (raw) => {
    if (!raw) return
    const t = decode(raw)
    if (!inSvg && (inBody || !inHead)) { textParts.push(t); tlen += t.length }
    for (const s of stack) if (s.text.length < 3000) s.text += t
  }
  // Séparateur de mots entre éléments en ligne (sinon « Accueil » + « Nos gâteaux » = « AccueilNos gâteaux »)
  const sep = () => { textParts.push(' '); tlen++; for (const s of stack) s.text += ' ' }
  while ((m = tagRe.exec(html))) {
    pushText(html.slice(last, m.index))
    last = tagRe.lastIndex
    if (!m[2]) continue
    const closing = m[1] === '/', tag = m[2].toLowerCase(), a = closing ? {} : attrs(m[3] || '')
    if (closing) {
      if (tag === 'svg') inSvg = Math.max(0, inSvg - 1)
      if (tag === 'head') inHead = false
      for (let i = stack.length - 1; i >= 0; i--) if (stack[i].tag === tag) { finish(stack.splice(i, 1)[0]); break }
      if (BLOCK.has(tag) || INLINE_SEP.has(tag)) sep()
      continue
    }
    if (BLOCK.has(tag) || INLINE_SEP.has(tag)) sep()
    // HTML interdit <a> dans <a> et un titre dans un titre : le navigateur ferme le précédent, nous aussi
    // (évite aussi un coût quadratique sur des balises jamais fermées).
    if (tag === 'a' || /^h[1-6]$/.test(tag) || tag === 'p') {
      const same = tag === 'a' ? (x) => x.tag === 'a' : tag === 'p' ? (x) => x.tag === 'p' : (x) => /^h[1-6]$/.test(x.tag)
      for (let i = stack.length - 1; i >= 0; i--) if (same(stack[i])) { finish(stack.splice(i, 1)[0]); break }
    }
    if (tag === 'body') { inBody = true; inHead = false }
    if ((tag === 'h2' || tag === 'h3') && !inSvg) marks.push({ level: +tag[1], open: tlen })
    if (tag === 'footer' && footerAt < 0) footerAt = tlen
    else if (inHead && !HEADISH.has(tag)) inHead = false
    if (tag === 'svg' && m[4] !== '/') inSvg++ // « <svg … /> » fermé sur lui-même : rien à ignorer ensuite
    if (RAW.has(tag)) {
      const endRe = new RegExp(`</${tag}`, 'gi'); endRe.lastIndex = last
      const end = endRe.exec(html)?.index ?? -1
      const content = end < 0 ? html.slice(last) : html.slice(last, end)
      if (end >= 0) { last = end; tagRe.lastIndex = html.indexOf('>', end) + 1 || html.length; last = tagRe.lastIndex }
      else { last = tagRe.lastIndex = html.length }
      rawElement(tag, a, content)
      continue
    }
    element(tag, a)
    if (!VOID.has(tag) && !m[4] && (['title', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'a', 'button', 'label'].includes(tag) || (tag === 'p' && p.paragraphs.length < 12))) {
      stack.push({ tag, attrs: a, text: '' })
    }
  }
  pushText(html.slice(last))
  while (stack.length) finish(stack.pop())

  function element(tag, a) {
    switch (tag) {
      case 'html': p.lang = a.lang || a['xml:lang'] || null; if ('amp' in a || '⚡' in a) p.amp = 'self'; break
      case 'base': p.base = a.href || null; break
      case 'meta': {
        const name = (a.name || a.property || a['http-equiv'] || a.itemprop || '').toLowerCase()
        if (a.charset) p.charset = a.charset.toLowerCase()
        if (name === 'content-type' && /charset=([\w-]+)/i.test(a.content || '')) p.charset = RegExp.$1.toLowerCase()
        if (!name) break
        p.metas.push({ name, content: a.content ?? '' })
        const c = (a.content ?? '').trim()
        if (name === 'description' && p.metaDescription === null) p.metaDescription = clean(c)
        else if (name === 'robots') p.robots = c.toLowerCase()
        else if (name === 'googlebot') p.googlebot = c.toLowerCase()
        else if (name === 'viewport') p.viewport = c
        else if (name === 'generator') p.generator = c
        else if (name === 'theme-color') p.themeColor = c
        else if (name === 'apple-itunes-app') p.appleApp = c
        else if (name === 'google-play-app') p.googlePlayApp = c
        else if (/verification|^msvalidate|^p:domain_verify|^facebook-domain-verification|^yandex/.test(name)) p.verification.push(name)
        else if (name.startsWith('og:')) p.og[name.slice(3)] ??= clean(c)
        else if (name.startsWith('twitter:')) p.twitter[name.slice(8)] ??= clean(c)
        else if (name === 'keywords') p.metaKeywords = c
        else if (name === 'author' || name === 'article:author') p.authorMeta = c
        else if (name === 'article:published_time' || name === 'article:modified_time') p.articleDate = c
        break
      }
      case 'link': {
        const rel = (a.rel || '').toLowerCase().split(/\s+/)
        const href = a.href ? resolve(a.href, p.base ? resolve(p.base, baseUrl) : baseUrl) : null
        if (rel.includes('canonical')) p.canonical.push(href)
        if (rel.includes('alternate') && a.hreflang) p.hreflang.push({ lang: a.hreflang.toLowerCase(), href })
        if (rel.includes('alternate') && /rss|atom/.test(a.type || '')) p.rssFeeds.push(href)
        if (rel.some((r) => r === 'icon' || r === 'apple-touch-icon' || r === 'shortcut')) p.icons.push({ rel: a.rel, href, sizes: a.sizes || '' })
        if (rel.includes('manifest')) p.manifest = href
        if (rel.includes('preconnect') || rel.includes('dns-prefetch')) p.preconnect.push(href)
        if (rel.includes('preload')) p.preload.push({ href, as: a.as || '' })
        if (rel.includes('amphtml')) p.amp = href
        if (rel.includes('stylesheet')) {
          p.stylesheets.push(href)
          if (inHead && !a.media?.match(/print/) && !a.disabled) p.inHeadBlocking++
        }
        break
      }
      case 'img': {
        const src = a.src || a['data-src'] || a['data-lazy-src'] || (a.srcset || '').split(/[\s,]/)[0] || ''
        p.images.push({
          src: src ? resolve(src, baseUrl) : '', alt: a.alt ?? null, loading: a.loading || (a['data-src'] ? 'lazy-js' : ''),
          width: a.width || null, height: a.height || null, srcset: !!(a.srcset || a['data-srcset']), fetchpriority: a.fetchpriority || '',
          decorative: a.role === 'presentation' || a['aria-hidden'] === 'true',
        })
        // Le texte alternatif d'une image dans un lien ou un titre en est le texte accessible (logo cliquable)
        if (a.alt) for (const s of stack) if (s.tag === 'a' || s.tag === 'button' || /^h[1-6]$/.test(s.tag)) s.text += ` ${a.alt} `
        break
      }
      case 'source': if (a.type === 'image/avif' || a.type === 'image/webp') p.modernSources = (p.modernSources || 0) + 1; break
      case 'iframe': p.iframes.push(a.src ? resolve(a.src, baseUrl) : ''); break
      case 'video': p.videos++; break
      case 'form': p.forms++; break
      case 'input': case 'select':
        if (!['hidden', 'submit', 'button', 'image', 'reset'].includes((a.type || '').toLowerCase()))
          p.inputs.push({ id: a.id || '', name: a.name || '', label: a['aria-label'] || a['aria-labelledby'] || a.title || '', placeholder: a.placeholder || '', type: a.type || 'text' })
        break
      case 'label': if (a.for) p.labelsFor.push(a.for); break
      case 'time': p.times++; break
      case 'main': p.hasMainLandmark = true; break
      case 'nav': p.hasNav = true; break
      case 'font': case 'center': case 'marquee': case 'blink': case 'frame': case 'frameset': p.deprecated.push(tag); break
    }
    if (a['data-nosnippet'] !== undefined) p.dataNosnippet++
    if (a.itemprop === 'areaServed') p.areaServed = true
    if (a.itemprop === 'address' || a.itemprop === 'streetAddress') p.addressSeen = true
    if (a.itemscope !== undefined && a.itemtype) { p.microdata = true; p.microdataTypes.push(...a.itemtype.split(/\s+/).filter(Boolean).map((t) => t.replace(/^https?:\/\/schema\.org\//i, ''))) }
    if (a.style) p.inlineStyleBytes += a.style.length
  }

  function rawElement(tag, a, content) {
    if (tag === 'script') {
      const type = (a.type || '').toLowerCase()
      if (type === 'application/ld+json') {
        try { const j = JSON.parse(content.trim().replace(/^<!\[CDATA\[|\]\]>$/g, '')); if (depthOver(j, 64)) p.jsonLdErrors.push('bloc ignoré : plus de 64 niveaux d’imbrication'); else p.jsonLd.push(j) }
        catch (e) { p.jsonLdErrors.push(String(e.message || e).slice(0, 120)) }
        return
      }
      const s = { src: a.src ? resolve(a.src, baseUrl) : null, async: 'async' in a, defer: 'defer' in a, module: type === 'module', inline: !a.src, bytes: content.length, sample: a.src ? '' : content.slice(0, 4000) }
      p.scripts.push(s)
      if (inHead && s.src && !s.async && !s.defer && !s.module && !/json|template|text\/(?!javascript)/.test(type)) p.inHeadBlocking++
    } else if (tag === 'style') p.inlineStyleBytes += content.length
    else if (tag === 'noscript') { /* ignoré pour le texte */ }
  }

  function finish(s) {
    const text = clean(s.text)
    if (s.tag === 'title') { if (!inSvg) { p.titles.push(text); if (p.title === null) p.title = text } }
    else if (/^h[1-6]$/.test(s.tag)) {
      p.headings.push({ level: +s.tag[1], text })
      if (s.tag === 'h2' || s.tag === 'h3') { const mk = marks.findLast((x) => x.start == null && x.level === +s.tag[1]); if (mk) { mk.start = tlen; mk.text = text } }
    }
    else if (s.tag === 'a') {
      const raw = s.attrs.href
      const href = raw != null ? resolve(raw, p.base ? resolve(p.base, baseUrl) : baseUrl) : null
      let internal = false
      try { internal = !!href && new URL(href).hostname.replace(/^www\./, '') === new URL(baseUrl).hostname.replace(/^www\./, '') } catch {}
      p.links.push({
        href, raw: raw ?? null, text: text || clean(s.attrs['aria-label'] || s.attrs.title || ''), rel: (s.attrs.rel || '').toLowerCase(),
        internal, target: s.attrs.target || '', imgOnly: !text,
      })
    } else if (s.tag === 'button') p.buttons.push(text || s.attrs['aria-label'] || s.attrs.title || '')
    else if (s.tag === 'p') { if (text.length >= 40) p.paragraphs.push(text) }
  }

  const raw = textParts.join('')
  p.text = raw.replace(/\s+/g, ' ').trim()
  p.wordCount = p.text ? p.text.split(' ').filter((w) => /[\p{L}\p{N}]/u.test(w)).length : 0
  const done = marks.filter((x) => x.start != null && x.text && !(footerAt >= 0 && x.open >= footerAt))
  p.blocks = done.slice(0, 40).map((x, i) => {
    let end = i + 1 < done.length ? done[i + 1].open : raw.length
    if (footerAt > x.start && footerAt < end) end = footerAt
    const text = raw.slice(x.start, end).replace(/\s+/g, ' ').trim()
    return { level: x.level, heading: x.text, text: text.slice(0, 2500), words: text ? text.split(' ').filter((w) => /[\p{L}\p{N}]/u.test(w)).length : 0 }
  })
  return p
}

// Profondeur d'un objet JSON, mesurée sans récursion (une page piège peut imbriquer des milliers de niveaux).
export function depthOver(v, max) {
  const stack = [[v, 0]]
  let n = 0
  while (stack.length) {
    const [x, d] = stack.pop()
    if (d > max || ++n > 200000) return true
    if (x && typeof x === 'object') for (const k in x) if (x[k] && typeof x[k] === 'object') stack.push([x[k], d + 1])
  }
  return false
}

// Recherche des types schema.org dans le JSON-LD (blocs déjà limités à 64 niveaux par depthOver)
export function schemaTypes(jsonLd) {
  const out = []
  const walk = (n) => {
    if (Array.isArray(n)) return n.forEach(walk)
    if (!n || typeof n !== 'object') return
    if (n['@type']) out.push({ type: [].concat(n['@type']).join(','), node: n })
    if (n['@graph']) walk(n['@graph'])
    for (const k of Object.keys(n)) if (k !== '@graph' && typeof n[k] === 'object') walk(n[k])
  }
  walk(jsonLd)
  return out
}

const STOP = new Set(`a à au aux avec ce ces cet cette dans de des du elle en et eux il ils je la le les leur leurs lui ma mais me même mes moi mon ne nos notre nous on ou où par pas pour qu que qui sa se ses son sur ta te tes toi ton tu un une vos votre vous c d j l m n s t y été être avoir fait faire plus tout tous toute toutes très bien aussi comme sans sous entre chez vers est sont ont a été cela ceci ici là ainsi alors donc car si non oui peut peuvent nous votre the and for with that this from you your are our was were will have has not but all can more about into over than then them they their what when where which who why how its it's of to in on at by an or as be is it we us new get one two also out up just like accueil contact menu mentions légales cookies politique confidentialité droits réservés copyright suivant précédent lire voir savoir découvrir cliquez ici page site www com fr http https`.split(/\s+/))

// Termes et expressions dominants d'une page (sujets détectés)
export function topTerms(text, n = 15) {
  const words = (text.toLowerCase().normalize('NFC').match(/[\p{L}][\p{L}'’-]{2,}/gu) || []).map((w) => w.replace(/^[ldjmnst][’']/, ''))
  const uni = new Map(), bi = new Map()
  for (let i = 0; i < words.length; i++) {
    const w = words[i]
    if (STOP.has(w) || w.length < 3) continue
    uni.set(w, (uni.get(w) || 0) + 1)
    const nx = words[i + 1]
    if (nx && !STOP.has(nx) && nx.length >= 3) bi.set(`${w} ${nx}`, (bi.get(`${w} ${nx}`) || 0) + 1)
  }
  const sort = (m) => [...m].sort((x, y) => y[1] - x[1])
  return {
    words: sort(uni).slice(0, n).map(([term, count]) => ({ term, count })),
    phrases: sort(bi).filter(([, c]) => c > 1).slice(0, n).map(([term, count]) => ({ term, count })),
  }
}

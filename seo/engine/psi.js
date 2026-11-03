// Google PageSpeed Insights API v5 (CORS ouvert : utilisable depuis le navigateur et Node).
// Clé gratuite conseillée (sans clé : quota partagé, erreurs 429 fréquentes).

const CATS = ['performance', 'seo', 'accessibility', 'best-practices']

export async function runPSI(url, { strategy = 'mobile', key = '', fetchImpl = fetch, timeoutMs = 90000 } = {}) {
  const q = new URLSearchParams({ url, strategy, locale: 'fr' })
  for (const c of CATS) q.append('category', c)
  if (key) q.set('key', key)
  const ctrl = typeof AbortController !== 'undefined' ? new AbortController() : null
  const t = ctrl && setTimeout(() => ctrl.abort(), timeoutMs)
  try {
    const r = await fetchImpl(`https://www.googleapis.com/pagespeedonline/v5/runPagespeed?${q}`, ctrl ? { signal: ctrl.signal } : {})
    const j = await r.json()
    if (!r.ok || j.error) return { error: `${r.status} — ${j.error?.message || 'réponse invalide'}${r.status === 429 ? ' (quota dépassé : ajoutez une clé API)' : ''}` }
    return mapPSI(j, strategy)
  } catch (e) {
    return { error: e.name === 'AbortError' ? 'Délai dépassé (le test Lighthouse prend 20–60 s)' : String(e.message || e) }
  } finally { t && clearTimeout(t) }
}

export function mapPSI(j, strategy = 'mobile') {
  const lh = j.lighthouseResult || {}
  const cats = lh.categories || {}, audits = lh.audits || {}
  const scores = {}
  for (const c of CATS) if (cats[c]) scores[c === 'best-practices' ? 'bestPractices' : c] = Math.round(cats[c].score * 100)
  const m = j.loadingExperience?.metrics || {}
  const field = {
    LCP: m.LARGEST_CONTENTFUL_PAINT_MS?.percentile ?? null,
    INP: m.INTERACTION_TO_NEXT_PAINT?.percentile ?? null,
    CLS: m.CUMULATIVE_LAYOUT_SHIFT_SCORE?.percentile != null ? m.CUMULATIVE_LAYOUT_SHIFT_SCORE.percentile / 100 : null,
    FCP: m.FIRST_CONTENTFUL_PAINT_MS?.percentile ?? null,
    TTFB: m.EXPERIMENTAL_TIME_TO_FIRST_BYTE?.percentile ?? null,
    overall: j.loadingExperience?.overall_category || null,
    origin: j.originLoadingExperience?.overall_category || null,
  }
  const dv = (id) => audits[id]?.displayValue || null
  const lab = { LCP: dv('largest-contentful-paint'), FCP: dv('first-contentful-paint'), TBT: dv('total-blocking-time'), CLS: dv('cumulative-layout-shift'), SI: dv('speed-index') }
  // Audits en échec, quel que soit leur nom (Lighthouse 12/13 : « insights »), triés par gain
  const opportunities = []
  for (const c of CATS) {
    for (const ref of cats[c]?.auditRefs || []) {
      const a = audits[ref.id]
      if (!a || a.score == null || a.score >= 0.9 || ['manual', 'notApplicable', 'informative'].includes(a.scoreDisplayMode)) continue
      if (ref.group === 'metrics') continue
      opportunities.push({
        id: ref.id, group: c, weight: ref.weight || 0, score: a.score, title: a.title, displayValue: a.displayValue || '',
        description: (a.description || '').replace(/\[([^\]]+)\]\([^)]+\)/g, '$1').slice(0, 280),
        savingsMs: a.metricSavings?.LCP || a.metricSavings?.FCP || a.details?.overallSavingsMs || a.numericValue && a.numericUnit === 'millisecond' && c === 'performance' && ref.id !== 'total-blocking-time' ? (a.metricSavings?.LCP || a.details?.overallSavingsMs || 0) : 0,
        savingsBytes: a.details?.overallSavingsBytes || 0,
      })
    }
  }
  opportunities.sort((a, b) => (b.savingsMs - a.savingsMs) || (b.weight - a.weight))
  return {
    strategy, fetchedAt: lh.fetchTime, finalUrl: lh.finalDisplayedUrl || lh.finalUrl, scores, field, lab, opportunities,
    screenshot: audits['final-screenshot']?.details?.data || null,
  }
}

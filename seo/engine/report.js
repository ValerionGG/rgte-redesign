// Export Markdown du rapport (CLI, bouton « Exporter » de l'interface, skills Claude).
import { SEVERITY } from './audit.js'
import { CHANNELS } from './ads.js'

const eur = (n) => n == null ? '—' : `${Math.round(n).toLocaleString('fr-FR')} €`
const rng = (a, f = (x) => Math.round(x).toLocaleString('fr-FR')) => (a && a[0] != null ? `${f(a[0])} – ${a[1] != null ? f(a[1]) : '?'}` : '—')

export function toMarkdown(r) {
  const L = []
  const R = r.result
  L.push(`# Rapport SEO 360 — ${r.target}`, '', `Généré le ${new Date(r.generatedAt).toLocaleString('fr-FR')} · type : ${r.kind} · secteur : ${r.hashtags?.sector || r.input.sector}${r.input.city ? ' · ' + r.input.city : ''}`, '')
  if (r.error) L.push(`> ⚠️ ${r.error}`, '')
  if (R) {
    L.push(`## Score global : ${R.global}/100 (${R.grade})`, '', '| Catégorie | Score | Points à corriger |', '|---|---:|---:|')
    for (const s of Object.values(R.scores)) L.push(`| ${s.label}${s.estimated ? ' (estimé)' : ''} | ${s.score} | ${s.issues} |`)
    L.push('', `Critiques : ${R.counts.critique} · Importants : ${R.counts.important} · Moyens : ${R.counts.moyen} · Faibles : ${R.counts.faible} · Validés : ${R.counts.ok}`, '')
    L.push('## Corrections à faire (par priorité)', '')
    R.issues.forEach((i, n) => {
      L.push(`### ${n + 1}. [${SEVERITY[i.sev].label}] ${i.title}`)
      if (i.detail) L.push('', i.detail)
      if (i.fix) L.push('', `**Correction :** ${i.fix}`)
      L.push('', `Impact ${i.impact}/5 · Effort ${i.effort}/5`)
      if (i.code) L.push('', '```' + (i.code.trim().startsWith('<') ? 'html' : 'text'), i.code, '```')
      L.push('')
    })
    if (R.passed.length) L.push('## Déjà bien', '', ...R.passed.map((p) => `- ✅ ${p.title}`), '')
    const m = R.meta || {}
    if (m.cms?.length || m.trackers?.length) L.push('## Technologies détectées', '', `- CMS / framework : ${m.cms?.join(', ') || '—'}`, `- Mesure & pixels : ${m.trackers?.join(', ') || 'aucun'}`, `- Bandeau cookies : ${m.cmp?.join(', ') || 'non détecté'}`, '')
    if (m.bots) L.push('## Robots moteurs & IA (robots.txt)', '', '| Robot | Usage | Accès |', '|---|---|---|', ...m.bots.map((b) => `| ${b.ua} | ${b.owner} | ${b.allowed ? '✅ autorisé' : '⛔ bloqué'} |`), '')
    if (m.terms?.phrases?.length) L.push('## Sujets détectés dans la page', '', m.terms.phrases.map((t) => `${t.term} (${t.count})`).join(' · '), '')
  }
  if (r.plan) {
    L.push('## Plan d’action', '')
    for (const s of r.plan.steps) {
      L.push(`### ${s.title}`, '', `_${s.why}_`, '')
      for (const i of s.items) L.push(`- [ ] ${i.title}${i.fix ? ' — ' + i.fix : ''}`)
      for (const e of s.extra) L.push(`- [ ] ${e}`)
      L.push('')
    }
    L.push('### Indicateurs à suivre', '', '| KPI | Aujourd’hui | Objectif |', '|---|---|---|', ...r.plan.kpis.map((k) => `| ${k.kpi} | ${k.now} | ${k.target} |`), '')
  }
  if (r.keywords) {
    L.push('## Mots-clés à travailler', '')
    for (const [intent, list] of Object.entries(r.keywords.groups)) L.push(`**${intent}** : ${list.map((k) => k.keyword).join(' · ')}`, '')
    if (r.suggestions?.length) L.push(`**Suggestions Google réelles** : ${r.suggestions.join(' · ')}`, '')
  }
  if (r.hashtags) {
    L.push('## Hashtags par réseau', '')
    for (const n of Object.values(r.hashtags.networks)) {
      L.push(`### ${n.label} — ${n.rules?.recommended_count || n.max} hashtags conseillés`, '', n.tags.map((t) => '#' + t.camel).join(' ') || '—', '')
      if (n.rules) L.push(`- Limite : ${n.rules.hashtag_limit}`, `- Placement : ${n.rules.placement}`, `- Fréquence : ${n.rules.posting_frequency || '—'} · Meilleurs moments : ${n.rules.best_times_fr || '—'}`, '')
      if (n.reserve.length) L.push(`Réserve (à faire tourner) : ${n.reserve.map((t) => '#' + t.camel).join(' ')}`, '')
    }
    L.push(`À bannir : ${r.hashtags.banned.map((t) => '#' + t).join(' ')}`, '')
  }
  if (r.budget) {
    const b = r.budget
    L.push(`## Budget publicitaire — ${eur(b.monthly)}/mois (${eur(b.daily)}/jour) · objectif : ${b.goalLabel}`, '')
    L.push(`Repère Google Ads secteur « ${b.bench.industry} » : CPC France estimé ${rng(b.bench.cpcFR, (x) => x.toFixed(2))} €, taux de conversion ${(b.bench.cvr * 100).toFixed(1)} % (base WordStream/LocaliQ 2026 US, ajustée FR).`, '')
    L.push('| Canal | Budget/mois | €/jour | CPC | Clics | Conversions | CPA |', '|---|---:|---:|---|---|---|---|')
    for (const c of b.channels) L.push(`| ${c.label} | ${eur(c.budget)} | ${c.daily} € | ${rng(c.cpc, (x) => x.toFixed(2))} € | ${rng(c.clicks)} | ${rng(c.conversions)} | ${rng(c.cpa)} € |`)
    L.push('', `**Total estimé** : ${rng(b.totals.clicks)} clics · ≈ ${b.totals.mid} conversions (${rng(b.totals.conversions)}) · CPA ≈ ${eur(b.totals.cpaMid)} (${rng(b.totals.cpa)} €)${b.totals.roas ? ` · ROAS ${rng(b.totals.roas, (x) => x.toFixed(1))}${b.close < 1 ? ` (en supposant ${Math.round(b.close * 100)} % de leads transformés)` : ''}` : ''}`, '')
    if (b.needed) L.push(`Pour ${b.needed.target} conversions/mois : prévoir ≈ ${eur(b.needed.mid)}/mois (fourchette ${rng(b.needed.budget)} €).`, '')
    if (b.dropped.length) L.push(`Canaux écartés à ce budget (pour sortir de l’apprentissage) : ${b.dropped.join(', ')}.`, '')
    if (b.warnings.length) L.push('**Alertes :**', '', ...b.warnings.map((w) => `- ${w}`), '')
    for (const p of b.rampUp) L.push(`### ${p.phase}`, '', ...p.actions.map((a) => `- ${a}`), '')
    L.push('### SEO : budget et répartition', '', b.seo.note, '', b.seo.split, '', ...b.seo.items.map((i) => `- ${i.item} : ${i.cost}`), '')
  }
  if (r.competitors?.length) {
    L.push('## Benchmark concurrents', '', '| Site | Score | Perf. mobile | Mots | Données structurées |', '|---|---:|---:|---:|---|')
    for (const c of r.competitors) L.push(`| ${c.url} | ${c.global ?? '—'} | ${c.perf ?? '—'} | ${c.words ?? '—'} | ${c.schema ?? '—'} |`)
    L.push('')
  }
  L.push('---', '_Estimations indicatives : benchmarks publics 2025–2026 (voir seo/data/research). Vérifiez avec vos données (Search Console, GA4, comptes publicitaires)._')
  return L.join('\n')
}

export { CHANNELS }

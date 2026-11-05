// Export Markdown (CLI, bouton « Markdown », skills) : la synthèse et les 3 actions d'abord, puis le détail.
import { SEVERITY } from './audit.js'
import { driftMarkdown } from './drift.js'
import { recommendTools, toolsMarkdown } from './outils.js'
import { CHANNELS } from './ads.js'
import research from '../data/research/benchmarks.js'
// Données datées (prix, CPC, règles) : signalées dès que leur date de revérification est passée.
export function staleNote(now = new Date()) {
  const due = research.review_by && Date.parse(research.review_by)
  return due && now.getTime() > due ? `⚠ Données de référence vérifiées le ${research.generated}, à revérifier depuis le ${research.review_by} : prix, CPC et règles ont pu changer.` : null
}
import { buildFixes, whereToApply } from './fixes.js'

const eur = (n) => (n == null || !Number.isFinite(+n) ? '—' : `${Math.round(n).toLocaleString('fr-FR')} €`)
const rng = (a, f = (x) => Math.round(x).toLocaleString('fr-FR')) => (a && a[0] != null ? `${f(a[0])} – ${a[1] != null ? f(a[1]) : '?'}` : '—')
// Chaque ligne du code est un élément du tableau : l'indentation ajoutée par l'appelant s'applique à toutes les lignes.
const fence = (lang, code) => {
  const body = String(code ?? '').replace(/\s+$/, '').split('\n'), tick = body.some((l) => l.trimStart().startsWith('```')) ? '````' : '```'
  return [tick + (lang === 'apache' || lang === 'text' ? 'text' : lang === 'json' ? 'json' : 'html'), ...body, tick]
}

export function toMarkdown(r, { fixes, done = {} } = {}) {
  const L = [], R = r.result
  fixes ??= R ? buildFixes(r) : {}
  L.push(`# Audit SEO 360 — ${r.target}`, '', `${new Date(r.generatedAt).toLocaleString('fr-FR')} · ${r.kind === 'site' ? 'site web' : r.kind === 'app' ? 'application' : 'dépôt GitHub'} · secteur : ${r.hashtags?.sector || r.input.sector}${r.input.city ? ' · ' + r.input.city : ''}`, '')
  if (r.error) L.push(`> ⚠️ ${r.error}`, '')
  if (!R && r.drift) L.push(driftMarkdown(r.drift))
  if (R) {
    if (R.incomplete) L.push(`> **Audit incomplet : ${R.incomplete}.** Pas de note globale (elle serait trompeuse). Pour l’audit complet : bouton-favori, code collé ou ligne de commande.`, '')
    if (r.provenance === 'import' || r.provenance === 'partage') L.push(`> Rapport ${r.provenance === 'import' ? 'importé' : 'partagé'} : la note n’a pas été revérifiée par SEO 360.`, '')
    if (staleNote()) L.push(`> ${staleNote()}`, '')
    L.push(`## En bref`, '', `- **Note : ${R.global == null ? 'non notée' : `${R.global}/100 (${R.grade})`}** · part mesurée (catégories lues, pondérées) : ${Math.round((R.coverage || 0) * 100)} %${(R.caps || []).length ? ` · plafonnée : ${R.caps.join(' ; ')}` : ''}`)
    L.push(`- Critiques : ${R.counts.critique} · Importants : ${R.counts.important} · Moyens : ${R.counts.moyen} · Faibles : ${R.counts.faible} · Validés : ${R.counts.ok}`)
    if (r.budget?.verdict) L.push(`- **Publicité :** ${r.budget.verdict.text}${r.budget.checks?.blocked ? ` — ${r.budget.checks.message}` : ''}`)
    L.push('')
    if (r.drift) L.push(driftMarkdown(r.drift))
    if (r.plan?.week?.length) {
      L.push('## Vos 3 actions cette semaine', '')
      r.plan.week.forEach((i, n) => L.push(`${n + 1}. **${i.title}** — ${i.who}${i.time ? ', ' + i.time : ''}${i.fix ? `\n   ${i.fix}` : ''}`))
      L.push('')
    }
    L.push('| Catégorie | Note | Points à corriger |', '|---|---:|---:|')
    for (const s of Object.values(R.scores)) L.push(`| ${s.label}${s.estimated ? ' (estimé)' : ''} | ${s.score == null ? 'non mesuré' : s.score} | ${s.issues} |`)
    L.push('')
  }
  if (r.plan) {
    L.push('## Plan d’action détaillé', '', '_Avant de coller un correctif : sauvegardez le site (ou testez sur une copie), changez une chose à la fois, notez comment revenir en arrière, puis relancez l’audit._', '')
    for (const s of r.plan.steps) {
      const items = [...s.items, ...s.extra]
      if (!items.length) continue
      L.push(`### ${s.title}`, '', `_${s.why}_`, '')
      for (const i of items) {
        L.push(`- [${done[i.id] ? 'x' : ' '}] ${i.extra ? '' : `**[${SEVERITY[i.sev]?.label || ''}]** `}${i.title} — _${i.who}${i.time ? ', ' + i.time : ''}_`)
        if (i.extra) continue
        if (i.detail) L.push(`  - ${i.detail}`)
        if (i.fix) L.push(`  - À faire : ${i.fix}`)
        const w = whereToApply(i.id, R?.meta?.cms)
        if (w) L.push(`  - Où le faire sur ${w.cms} : ${w.text}`)
        const fx = fixes[i.id]
        if (fx) L.push('', `  ${fx.label}${fx.note ? ' — ' + fx.note : ''}`, '', ...fence(fx.lang, fx.value).map((l) => '  ' + l), '')
        else if (i.code) L.push('', ...fence(i.code.trim().startsWith('<') ? 'html' : 'text', i.code).map((l) => '  ' + l), '')
      }
      L.push('')
    }
    if (R?.infos?.length) L.push('### Non vérifié ou à vérifier hors site', '', ...R.infos.map((p) => `- ${p.title}${p.fix ? ' — ' + p.fix : ''}`), '')
    if (R?.passed?.length) L.push('### Déjà bien', '', ...R.passed.map((p) => `- ✅ ${p.title}`), '')
    L.push('### Indicateurs à suivre', '', '| Indicateur | Aujourd’hui | Objectif |', '|---|---|---|', ...r.plan.kpis.map((k) => `| ${k.kpi} | ${k.now} | ${k.target} |`), '')
  }
  const m = R?.meta || {}
  if (m.cms?.length || m.trackers?.length) L.push('## Technologies détectées', '', `- CMS / framework : ${m.cms?.join(', ') || '—'}`, `- Mesure & pixels : ${m.trackers?.join(', ') || 'aucun'}`, `- Bandeau cookies : ${m.cmp?.join(', ') || 'non détecté'}`, '')
  if (m.bots) L.push('## Robots des moteurs et des IA', '', '| Robot | Usage | Accès |', '|---|---|---|', ...m.bots.map((b) => `| ${b.ua} | ${b.owner} | ${b.allowed ? 'autorisé' : '**bloqué**'} |`), '')
  if (r.budget) L.push(...budgetSection(r.budget))
  if (R && r.kind) L.push(toolsMarkdown(recommendTools(r), { guides: true }))
  if (r.veille) {
    const v = r.veille
    L.push(`## Ce que disent les internautes (veille Agent Reach, ${v.total} publications)`, '', ...v.recommandations.map((x) => `- ${x}`), '')
    if (v.questions.length) L.push('**Questions réelles** :', '', ...v.questions.slice(0, 12).map((q) => `- ${q.question} (${q.channel})`), '')
    if (v.hashtags.length) L.push(`**Hashtags observés** : ${v.hashtags.slice(0, 20).map((h) => `#${h.camel} (${h.count})`).join(' · ')}`, '')
  }
  if (r.keywords) {
    L.push('## Mots-clés', '')
    if (r.suggestions?.length) L.push(`**Suggestions Google réelles** : ${r.suggestions.join(' · ')}`, '')
    else if (r.suggestionsError) L.push('_Suggestions Google indisponibles pendant cet audit : les idées ci-dessus sont des gabarits, sans preuve de demande. Vérifiez-les dans Search Console ou Keyword Planner avant d’y consacrer une page._', '')
    for (const [intent, list] of Object.entries(r.keywords.groups)) L.push(`**${intent}** : ${list.map((k) => k.keyword).join(' · ')}`, '')
  }
  if (r.hashtags) {
    L.push('## Hashtags par réseau', '')
    for (const n of Object.values(r.hashtags.networks)) {
      L.push(`### ${n.label} — ${n.rules?.recommended_count || n.max} hashtags`, '', n.tags.map((t) => '#' + t.camel).join(' ') || '—', '', n.tags.length ? `_Niveaux attendus : ${n.tags.map((t) => `#${t.camel} ${t.niveau || '?'}`).join(' · ')} (niche < 50 000 publications, moyen 50 000–500 000, large au-delà : à vérifier sur le réseau)._` : '', '')
      if (n.rules) L.push(`- Limite : ${n.rules.hashtag_limit}`, `- Placement : ${n.rules.placement}`, `- Rythme : ${n.rules.posting_frequency || '—'} · Moments : ${n.rules.best_times_fr || '—'}`)
      if (n.reserve?.length) L.push(`- Réserve à faire tourner : ${n.reserve.slice(0, 10).map((t) => '#' + t.camel).join(' ')}`)
      L.push('')
    }
    L.push(`À bannir : ${r.hashtags.banned.map((t) => '#' + t).join(' ')}`, '')
  }
  if (r.competitors?.length) {
    L.push('## Concurrents (page d’accueil, mêmes conditions)', '', '| Site | Note | Vitesse mobile | Mots |', '|---|---:|---:|---:|')
    for (const c of r.competitors) L.push(`| ${c.url} | ${c.global ?? (c.error ? 'non comparable' : '—')} | ${c.perf ?? '—'} | ${c.words ?? '—'} |`)
    L.push('')
  }
  L.push('---', '_Estimations indicatives : benchmarks publics 2025–2026 (seo/data/research). À recaler sur vos données (Search Console, GA4, comptes publicitaires)._')
  return L.join('\n')
}

export { CHANNELS }

export function budgetSection(b) {
  const L = []
  L.push(b.verdict.level === 'non' ? `## Budget publicitaire — pas recommandé pour l’instant` : `## Budget publicitaire — ${eur(b.monthly)}/mois${b.recommendedUsed ? ' (minimum pour tester)' : ''}`, '', `**${b.verdict.text}**${b.verdict.detail ? ' ' + b.verdict.detail : ''}`, '')
  if (b.checks) L.push('### Contrôle avant dépense', '', `**${b.checks.message}**`, '', ...b.checks.checks.map((c) => `- ${c.status} **${c.label}** — ${c.detail}`), '')
  if (b.roasBreakEven) L.push(`ROAS d’équilibre : ${b.roasBreakEven.toFixed(1).replace('.', ',')} (1 ÷ marge).`, '')
  if (b.verdict.level === 'non') L.push(`_Si vous testez malgré tout : ${eur(b.monthly)}/mois minimum, répartis ainsi :_`, '')
  L.push('| Canal | Budget/mois | €/jour | Clics ≈ | ' + b.unit[0].toUpperCase() + b.unit.slice(1) + 's ≈ | Coût par ' + b.unit + ' ≈ |', '|---|---:|---:|---:|---:|---:|')
  for (const c of b.channels) L.push(`| ${c.label} | ${eur(c.budget)} | ${c.daily} € | ${c.mid ? c.mid.clicks : '—'} | ${c.mid ? Math.round(c.mid.conv) : '—'} | ${c.mid?.cpa ? eur(c.mid.cpa) : '—'} |`)
  L.push('', `Fourchette indicative : ${rng(b.totals.band)} ${b.unit}s/mois. ${b.cpcSource || ''}`, '')
  if (b.needed) L.push(`Pour ${b.needed.target} ${b.unit}s/mois : ≈ ${eur(b.needed.mid)}/mois (${rng(b.needed.band)} €). ${b.needed.capped || ''}`, '')
  if (b.dropped.length) L.push(`Canaux écartés à ce budget : ${b.dropped.join(', ')}.`, '')
  if (b.warnings.length) L.push(...b.warnings.map((w) => `- ⚠️ ${w}`), '')
  for (const p of b.rampUp) L.push(`### ${p.phase}`, '', ...p.actions.map((a) => `- ${a}`), '')
  return L
}

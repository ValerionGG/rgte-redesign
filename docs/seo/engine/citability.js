// Citabilité par bloc : les moteurs de réponse (AI Overviews, ChatGPT, Perplexity…) reprennent des passages
// qui se suffisent à eux-mêmes. Règles déterministes, alignées sur le skill geo-visibilite-ia :
// intertitre explicite (idéalement une vraie question), réponse dès la 1re phrase, sujet nommé (pas de pronom
// qui renvoie plus haut), au moins un fait précis (chiffre, prix, délai, date), 50 à 200 mots.
const GENERIC_H = /^(nos?|notre|vos|accueil|bienvenue|pr[ée]sentation|[àa] propos|services?|prestations?|contact|actualit[ée]s|blog|en savoir plus|d[ée]couvr|galerie|t[ée]moignages|avis|r[ée]alisations|engagements?|pourquoi nous)\b/i
const CONNECT = /^(mais|cependant|toutefois|ainsi|donc|par ailleurs|en effet|de plus|enfin|bienvenue|dans cet article|nous allons|il est important|vous l['’]aurez compris|comme (nous l['’]avons|vu))\b/i
const PRONOUN = /^(il|elle|ils|elles|cela|ceci|ça|ce|c['’]est|celui|celle|ceux|celles|on|it|this|they|these|those)\b/i

export const RULES = ['intertitre explicite', 'réponse en 1re phrase', 'sujet nommé', 'fait précis', '50 à 200 mots']

export function scoreBlocks(blocks = []) {
  return blocks.filter((b) => b && b.words >= 15 && b.heading).map((b) => {
    const first = ((b.text || '').match(/^.+?[.!?](?=\s|$)/) || [b.text || ''])[0].trim()
    const checks = [
      /\?\s*$/.test(b.heading) || (b.heading.split(/\s+/).length >= 3 && !GENERIC_H.test(b.heading)),
      !CONNECT.test(first) && first.split(/\s+/).length <= 60,
      !PRONOUN.test(first),
      /\d/.test(b.text),
      b.words >= 50 && b.words <= 200,
    ]
    const fails = RULES.filter((_, i) => !checks[i])
    return { heading: b.heading.slice(0, 160), level: b.level, words: b.words, score: 5 - fails.length, fails, first: first.slice(0, 240) }
  })
}

// Correctif : les 3 blocs les plus faibles, avec la structure à suivre
export function citabilityTemplate(weak) {
  return weak.map((b) => `<!-- À réécrire : « ${b.heading} » — manque : ${b.fails.join(', ')}
     Aujourd’hui : « ${b.first} » -->
<h2>[Question réelle de vos clients, ex. « Combien coûte … à … ? »]</h2>
<p>[Réponse directe en 1re phrase qui nomme le sujet (40 à 60 mots).] [Un fait précis : prix, délai, lieu, chiffre daté et sourcé.]</p>
<p>[Détail, exemple ou preuve : 50 à 200 mots au total pour le bloc.]</p>`).join('\n\n')
}

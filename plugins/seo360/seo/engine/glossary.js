// Glossaire : chaque sigle affiché dans l'interface est expliqué au survol / au focus (<abbr title>).
export const GLOSSARY = {
  'Core Web Vitals': 'Les 3 mesures de vitesse de Google chez les vrais visiteurs : LCP, INP, CLS.',
  LCP: 'Largest Contentful Paint : temps d’affichage du plus grand élément (image ou titre). Bon : ≤ 2,5 s.',
  INP: 'Interaction to Next Paint : délai de réaction après un clic ou une saisie. Bon : ≤ 200 ms.',
  CLS: 'Cumulative Layout Shift : sauts de mise en page pendant le chargement. Bon : ≤ 0,1.',
  TTFB: 'Time To First Byte : temps de réponse du serveur. Objectif : < 800 ms.',
  CrUX: 'Chrome User Experience Report : mesures de vitesse réelles collectées par Chrome sur 28 jours.',
  Lighthouse: 'Outil de test de Google (labo) : performance, SEO, accessibilité, bonnes pratiques.',
  'PageSpeed': 'Service gratuit de Google qui lance Lighthouse et affiche les données réelles CrUX.',
  'JSON-LD': 'Format de données structurées (code invisible) qui décrit votre entreprise, vos produits, vos avis aux moteurs et aux IA.',
  'schema.org': 'Vocabulaire commun des données structurées reconnu par Google, Bing et les IA.',
  sameAs: 'Liste des profils officiels de la marque (LinkedIn, Instagram…) dans les données structurées : aide Google et les IA à reconnaître l’entreprise.',
  canonical: 'Balise qui indique à Google l’adresse officielle d’une page quand plusieurs URL affichent le même contenu.',
  hreflang: 'Balises qui relient les versions d’une page dans différentes langues ou pays.',
  noindex: 'Consigne qui interdit à Google d’afficher la page dans ses résultats.',
  nofollow: 'Consigne qui demande aux moteurs de ne pas suivre les liens.',
  'robots.txt': 'Fichier à la racine du site qui autorise ou interdit l’exploration aux robots (Google, Bing, IA…).',
  sitemap: 'Fichier qui liste les pages du site pour aider les moteurs à les découvrir.',
  'llms.txt': 'Fichier texte proposé pour résumer un site aux IA. Effet non démontré ; Google ne l’utilise pas.',
  'Open Graph': 'Balises qui définissent le titre, le texte et l’image affichés quand on partage un lien (Facebook, LinkedIn, WhatsApp…).',
  'meta description': 'Texte de 140–155 caractères proposé à Google pour l’extrait sous votre titre.',
  H1: 'Titre principal visible de la page (un seul par page).',
  alt: 'Texte alternatif d’une image : lu par les malvoyants et par Google Images.',
  CMP: 'Consent Management Platform : bandeau de gestion des cookies (obligatoire avant tout traceur publicitaire).',
  'Consent Mode': 'Mode de Google qui adapte la mesure au consentement cookies ; v2 obligatoire pour Google Ads dans l’UE.',
  RGPD: 'Règlement européen sur la protection des données personnelles.',
  CNIL: 'Autorité française de protection des données (contrôle les cookies).',
  HSTS: 'En-tête de sécurité qui force le navigateur à n’utiliser que HTTPS.',
  SSR: 'Rendu côté serveur : la page arrive déjà remplie de texte, lisible par Google et les IA.',
  'E-E-A-T': 'Expérience, Expertise, Autorité, Fiabilité : ce que Google cherche à reconnaître dans un contenu.',
  GEO: 'Generative Engine Optimization : être cité par les IA (ChatGPT, Perplexity, AI Overviews…).',
  SEO: 'Référencement naturel (résultats gratuits).',
  SEA: 'Référencement payant (Google Ads, Microsoft Ads).',
  SERP: 'Page de résultats d’un moteur de recherche.',
  NAP: 'Name, Address, Phone : nom, adresse, téléphone, identiques partout (site, fiche Google, annuaires).',
  CTR: 'Taux de clic : clics ÷ impressions.',
  CPC: 'Coût par clic.',
  CPM: 'Coût pour 1 000 affichages.',
  CPA: 'Coût par acquisition : ce que coûte un contact ou une vente.',
  ROAS: 'Return On Ad Spend : chiffre d’affaires ÷ dépense publicitaire.',
  PMax: 'Performance Max : campagne Google automatisée sur tous ses espaces (Search, Shopping, YouTube…).',
  'Search Console': 'Outil gratuit de Google : vos vraies requêtes, positions, clics et problèmes d’indexation.',
  'Bing Webmaster': 'Équivalent de Search Console chez Microsoft ; Bing alimente aussi ChatGPT Search et Copilot.',
  IndexNow: 'Protocole qui prévient instantanément Bing (et d’autres) qu’une page a changé.',
  ASO: 'App Store Optimization : référencement d’une application dans l’App Store et Google Play.',
}

const keys = Object.keys(GLOSSARY).sort((a, b) => b.length - a.length)
const re = new RegExp(`(^|[^\\w-])(${keys.map((k) => k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})(?=$|[^\\w-])`, 'g')

// À appliquer sur du texte DÉJÀ échappé. Une seule explication par terme et par bloc.
export function gloss(escaped) {
  const seen = new Set()
  return String(escaped).replace(re, (m, pre, term) => {
    if (seen.has(term)) return m
    seen.add(term)
    return `${pre}<abbr title="${GLOSSARY[term].replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;')}" tabindex="0">${term}</abbr>`
  })
}

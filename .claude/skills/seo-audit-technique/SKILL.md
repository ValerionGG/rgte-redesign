---
name: seo-audit-technique
description: Audit SEO technique et on-page approfondi d'un site (indexation, robots.txt, sitemap, canonical, hreflang, redirections, Core Web Vitals, rendu JavaScript, titres, H1, images, maillage, données structurées, sécurité) avec correctifs en code et vérification. À utiliser pour « pourquoi mon site n'est pas indexé / ne remonte pas », une migration, une refonte, ou pour corriger les points remontés par seo-360.
---

# Audit technique & on-page

## Collecte
`node seo/cli.mjs <url> --crawl 50 --mot-cle "<mot-clé>" --secteur <id>` puis lire `rapports-seo/<slug>.json`.
Pour un point précis, le moteur est importable : `import { extract } from './seo/engine/html.js'`, `parseRobots/allowed` (`robots.js`), `runPSI` (`psi.js`).

## Ordre de diagnostic (du bloquant au fin)
1. **Accessibilité** : statut HTTP, HTTPS, chaîne de redirections, http→https, www↔non-www, robots.txt 5xx.
2. **Indexabilité** : `noindex` (meta + X-Robots-Tag), `Disallow`, canonical (absente, multiple, vers une autre URL), sitemap (présent, déclaré, URL canoniques, `lastmod`).
3. **Rendu** : contenu dans le HTML initial ? (constat `js-render`) — sinon SSR/SSG/pré-rendu.
4. **Vitesse réelle** : CrUX (LCP ≤ 2,5 s, INP ≤ 200 ms, CLS ≤ 0,1) puis opportunités Lighthouse.
5. **On-page** : titre 50–60 car., meta description 140–155, H1 unique, hiérarchie, mot-clé (titre/H1/intro), contenu ≥ 500 mots utiles sur les pages clés, alt, maillage (3–10 liens contextuels), ancres descriptives.
6. **Site** (crawl) : titres/descriptions dupliqués, pages minces, 404 internes, profondeur.
7. **Données structurées** : JSON-LD valide, type le plus précis, propriétés requises (Product, LocalBusiness, Article, Organization + sameAs, BreadcrumbList). Rappel 2026 : rich results FAQ plus affichés par Google (utile malgré tout pour les IA).
8. **Conformité** : mentions légales (LCEN), confidentialité, CMP + Consent Mode v2 si traceurs, accessibilité (labels, boutons nommés, `<main>`, zoom).

## Livrer
Pour chaque problème : URL(s) concernées → preuve (extrait, en-tête) → correctif exact (code, règle serveur, réglage CMS : WordPress/Yoast/Rank Math, Shopify, Wix, Webflow…) → comment vérifier (relancer la CLI, test des résultats enrichis, inspection d'URL Search Console).

## Note honnête et pages pièges
- Catégorie non mesurée = `score: null` ; pas de note globale sans la page (`result.incomplete`) ni sous 60 % de couverture.
- Plafonds : noindex ou `none` → 30 ; robots.txt qui bloque Google → 30 ; canonical vers un autre domaine → 40 ; contenu seulement après JavaScript → 40 ; moins de 150 mots → 60.
- Pare-feu (401/403/429/503, page de défi Cloudflare/DataDome) : la page d'erreur n'est pas auditée (constat « blocked »).
- Statut 0 (non lu) sur robots.txt, sitemap ou llms.txt = « non vérifié », jamais « absent ».
- Ces cas sont figés dans `seo/test/engine.test.mjs` : ajoutez-y tout nouveau faux positif rencontré.

## Pièges
- Ne pas recommander `noindex` + `Disallow` ensemble (Google ne voit plus le noindex).
- Canonical ≠ redirection : pour fusionner des pages, préférer la 301.
- Ne pas bloquer CSS/JS dans robots.txt.
- Plusieurs H1 ne sont pas une pénalité : priorité faible.

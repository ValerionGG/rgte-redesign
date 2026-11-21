# Audit SEO 360 — rgte.eu

08/11/2026 12:56:25 · site web · secteur : Équipement professionnel / industrie B2B

## En bref

- **Note : 76/100 (B)** · part mesurée (catégories lues, pondérées) : 91 %
- Critiques : 0 · Importants : 6 · Moyens : 12 · Faibles : 10 · Validés : 8
- **Publicité :** Minimum pour tester : 950 € par mois (ce n’est pas un budget rentable calculé). ≈ 26 contacts par mois à ≈ 37 € chacun. — Verdict suspendu : corrigez d’abord le Consent Mode v2.

## Vos 3 actions cette semaine

1. **« Mentions légales » est écrit, mais ce n’est pas un lien** — Vous, 15 min
   Faites de « Mentions légales » un lien vers une page qui donne la raison sociale, l’adresse, le SIRET, le directeur de la publication et l’hébergeur.
2. **Traceurs sans bandeau de consentement détecté** — Webmaster, 1 h
   Installez une CMP certifiée Google (Axeptio, Didomi, Cookiebot…) et le Consent Mode v2 (obligatoire pour Google Ads dans l’EEE).
3. **Politique de confidentialité introuvable** — Vous, 15 min
   Ajoutez la page et liez-la dans le pied de page et sous chaque formulaire.

| Catégorie | Note | Points à corriger |
|---|---:|---:|
| Indexation & technique | 86 | 5 |
| Contenu & on-page | 58 | 5 |
| Vitesse & Core Web Vitals (estimé) | 76 | 4 |
| Données structurées | 88 | 1 |
| Visibilité IA (GEO) | 88 | 4 |
| Partage social & marque | 78 | 4 |
| Mesure, RGPD & accessibilité | 62 | 5 |

## Plan d’action détaillé

_Avant de coller un correctif : sauvegardez le site (ou testez sur une copie), changez une chose à la fois, notez comment revenir en arrière, puis relancez l’audit._

### Cette semaine

_Les points bloquants et les risques juridiques, puis les corrections de moins d’une heure à fort effet._

- [ ] **[Important]** « Mentions légales » est écrit, mais ce n’est pas un lien — _Vous, 15 min_
  - Le texte figure dans la page sans lien : ni les visiteurs ni Google ne peuvent ouvrir vos mentions. Obligatoires en France (LCEN) pour tout site professionnel.
  - À faire : Faites de « Mentions légales » un lien vers une page qui donne la raison sociale, l’adresse, le SIRET, le directeur de la publication et l’hébergeur.

  Liens obligatoires (pied de page)

  ```html
  <a href="/mentions-legales">Mentions légales</a> · <a href="/confidentialite">Politique de confidentialité</a> · <a href="/cookies">Gestion des cookies</a>
  ```

- [ ] **[Important]** Traceurs sans bandeau de consentement détecté — _Webmaster, 1 h_
  - Traceurs : Google Analytics 4, Google Ads. La CNIL sanctionne le dépôt de cookies avant consentement.
  - À faire : Installez une CMP certifiée Google (Axeptio, Didomi, Cookiebot…) et le Consent Mode v2 (obligatoire pour Google Ads dans l’EEE).

  Consent Mode v2 (avant le chargement de gtag) — Votre CMP met ensuite à jour le consentement (« update »).

  ```html
  <script>
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('consent', 'default', { ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied', analytics_storage: 'denied' });
  </script>
  ```

- [ ] **[Moyen]** Politique de confidentialité introuvable — _Vous, 15 min_
  - Obligatoire dès que vous collectez des données (formulaire, cookies).
  - À faire : Ajoutez la page et liez-la dans le pied de page et sous chaque formulaire.

  Liens obligatoires (pied de page)

  ```html
  <a href="/mentions-legales">Mentions légales</a> · <a href="/confidentialite">Politique de confidentialité</a> · <a href="/cookies">Gestion des cookies</a>
  ```

- [ ] **[Important]** Meta description absente — _Vous ou webmaster, 15 min_
  - Google invente alors un extrait : vous perdez le contrôle du message et du taux de clic.
  - À faire : Rédigez 140–155 caractères : bénéfice + preuve + appel à l’action.

  Meta description proposée (à relire) — 136 caractères. Remplacez les crochets s’il y en a.

  ```html
  <meta name="description" content="Agencement de vitrines réfrigérées à Puget-sur-Argens : [votre bénéfice principal + une preuve chiffrée]. Demandez une démo ou un devis.">
  ```

- [ ] **[Important]** Balises Open Graph manquantes : og:title, og:description, og:image, og:url, og:type — _Webmaster, 15 min_
  - Sans elles, vos liens partagés sur Facebook, LinkedIn, WhatsApp, Slack s’affichent sans image ni titre propre.
  - À faire : Ajoutez les balises Open Graph.

  Open Graph + Twitter — Image : celle de la page (idéal : 1200 × 630 px).

  ```html
  <meta property="og:type" content="website">
  <meta property="og:title" content="Agencement de vitrines réfrigérées à Puget-sur-Argens">
  <meta property="og:description" content="Agencement de vitrines réfrigérées à Puget-sur-Argens : [votre bénéfice principal + une preuve chiffrée]. Demandez une démo ou un devis.">
  <meta property="og:image" content="https://www.rgte.eu/images/tel.png">
  <meta property="og:url" content="https://www.rgte.eu/">
  <meta property="og:locale" content="fr_FR">
  <meta name="twitter:card" content="summary_large_image">
  ```

- [ ] **[Important]** Aucune donnée structurée — _Webmaster, 1 h_
  - Les données structurées décrivent votre entreprise, vos produits, vos avis : résultats enrichis + compréhension par les IA.
  - À faire : Ajoutez au minimum Organization + Product en JSON-LD.

  Données structurées (avec ce qui a été détecté sur la page) — Ajoutez les horaires (openingHoursSpecification) et l’adresse exacte si absents. Testez sur search.google.com/test/rich-results.

  ```html
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "Organization",
    "url": "https://www.rgte.eu/",
    "image": "https://www.rgte.eu/images/tel.png",
    "telephone": "+33 8 00 95 13 13"
  }
  </script>
  ```

- [ ] **[Important]** 2 pages partagent le même titre — _Vous ou webmaster, 1 h_
  - « Vitrines boulangerie, pâtisserie, chocolatiers » × 2
  - À faire : Chaque page doit avoir un titre unique décrivant son sujet précis.

  Un titre unique par page (à partir de leur H1) — Écrivez ensuite une meta description propre à chaque page.

  ```text
  https://www.rgte.eu/
    <title>Agencement de vitrines réfrigérées</title>
  https://www.rgte.eu/index.htm
    <title>Agencement de vitrines réfrigérées</title>
  https://www.rgte.eu/lignes-d-agencement/
    <title>Lignes d agencement</title>
  https://www.rgte.eu/lignes-d-agencement/ligne-basique/
    <title>Ligne Basique</title>
  https://www.rgte.eu/lignes-d-agencement/ligne-basique/module-comptoir-bar/
    <title>Module comptoir bar</title>
  https://www.rgte.eu/lignes-d-agencement/ligne-basique/module-comptoir-caisse/
    <title>Module comptoir caisse</title>
  ```

- [ ] **[Moyen]** Pas de balise canonical — _Webmaster, 15 min_
  - Sans canonical, les variantes d’URL (paramètres, majuscules, /index.html) peuvent créer du contenu dupliqué.
  - À faire : Ajoutez une canonical auto-référente absolue sur chaque page.

  Canonical

  ```html
  <link rel="canonical" href="https://www.rgte.eu/">
  ```

- [ ] **[Moyen]** 2 lien(s) sans texte accessible — _Webmaster, 15 min_
  - Liens-icônes sans aria-label : illisibles pour les lecteurs d’écran et sans ancre pour Google.
  - À faire : Ajoutez un aria-label ou un texte masqué visuellement, ou un alt sur l’image du lien.

  Lien-icône accessible

  ```html
  <a href="https://www.instagram.com/compte" aria-label="Instagram de la marque">
    <svg aria-hidden="true">…</svg>
  </a>
  ```

- [ ] **[Moyen]** 23 image(s) sans width/height — _Webmaster, 15 min_
  - Provoque des sauts de mise en page (CLS).
  - À faire : Indiquez width et height (ou aspect-ratio en CSS) sur chaque image.

  Dimensions des images

  ```html
  <img src="photo.webp" width="800" height="600" alt="…">
  /* ou en CSS */
  img { aspect-ratio: 4 / 3; height: auto; }
  ```

- [ ] Créer Google Search Console et Bing Webmaster Tools, y déclarer le sitemap — _Vous_

### Dans les 30 jours

_Indexation, technique et pages clés propres._

- [ ] Lister 10 à 20 mots-clés cibles (onglet Mots-clés) et attribuer UNE page à chacun — _Vous_
- [ ] Réécrire titres, H1 et descriptions des 10 pages qui ont le plus d’impressions (Search Console) — _Vous ou webmaster_

### Dans les 60 jours

_Contenu et autorité : ce qui fait monter durablement._

- [ ] **[Moyen]** 20 images hors écran sans chargement différé — _Webmaster, 15 min_
  - À faire : Ajoutez loading="lazy" aux images sous la ligne de flottaison.

  Images sous la ligne de flottaison (pas la première) — Remplacez LARGEUR et HAUTEUR par les dimensions réelles de chaque image. La première image (héros) reste sans lazy.

  ```html
  <img src="https://www.rgte.eu/images/tel.png" loading="lazy" decoding="async" width="LARGEUR" height="HAUTEUR" alt="…">
  <img src="https://www.rgte.eu/images/tel.png" loading="lazy" decoding="async" width="LARGEUR" height="HAUTEUR" alt="…">
  <img src="https://www.rgte.eu/library/slide03.png" loading="lazy" decoding="async" width="LARGEUR" height="HAUTEUR" alt="…">
  ```

- [ ] **[Moyen]** 3 page(s) sans H1 — _Vous, 15 min_
  - https://www.rgte.eu/lignes-d-agencement/ https://www.rgte.eu/lignes-d-agencement/ligne-basique/module-comptoir-bar/ https://www.rgte.eu/lignes-d-agencement/ligne-basique/module-comptoir-caisse/
  - À faire : Ajoutez un H1 par page.

  Un titre unique par page (à partir de leur H1) — Écrivez ensuite une meta description propre à chaque page.

  ```text
  https://www.rgte.eu/
    <title>Agencement de vitrines réfrigérées</title>
  https://www.rgte.eu/index.htm
    <title>Agencement de vitrines réfrigérées</title>
  https://www.rgte.eu/lignes-d-agencement/
    <title>Lignes d agencement</title>
  https://www.rgte.eu/lignes-d-agencement/ligne-basique/
    <title>Ligne Basique</title>
  https://www.rgte.eu/lignes-d-agencement/ligne-basique/module-comptoir-bar/
    <title>Module comptoir bar</title>
  https://www.rgte.eu/lignes-d-agencement/ligne-basique/module-comptoir-caisse/
    <title>Module comptoir caisse</title>
  ```

- [ ] **[Moyen]** 4 image(s) sans attribut alt sur 23 — _Vous ou webmaster, 1 h_
  - logo.png, tel.png, tel.png, logo-dark.png
  - À faire : Décrivez chaque image utile (ex. alt="Fabricant : ce que montre la photo") ; alt="" pour les images décoratives. Gain : Google Images + accessibilité.

  Textes alternatifs à écrire — Décrivez ce que montre réellement chaque image ; alt="" pour les images purement décoratives.

  ```html
  <img src="https://www.rgte.eu/images/logo.png" alt="Logo – Puget-sur-Argens">
  <img src="https://www.rgte.eu/images/tel.png" alt="Tel – Puget-sur-Argens">
  <img src="https://www.rgte.eu/images/tel.png" alt="Tel – Puget-sur-Argens">
  <img src="https://www.rgte.eu/images/logo-dark.png" alt="Logo dark – Puget-sur-Argens">
  ```

- [ ] **[Moyen]** 23 images en JPEG/PNG — _Webmaster, 1 h_
  - WebP/AVIF pèsent 25 à 50 % de moins à qualité égale.
  - À faire : Convertissez en WebP/AVIF (plugin, CDN d’images) et servez des srcset.

  Conversion WebP / AVIF

  ```text
  # En ligne de commande (libwebp) :
  cwebp -q 80 photo.jpg -o photo.webp
  # WordPress : plugin de conversion (ex. Converter for Media) ou CDN d’images ;
  # Shopify / Wix : conversion automatique.
  ```

- [ ] **[Moyen]** 6 page(s) sans meta description — _Vous, 1 h_
  - À faire : Rédigez les descriptions des pages stratégiques en priorité.

  Un titre unique par page (à partir de leur H1) — Écrivez ensuite une meta description propre à chaque page.

  ```text
  https://www.rgte.eu/
    <title>Agencement de vitrines réfrigérées</title>
  https://www.rgte.eu/index.htm
    <title>Agencement de vitrines réfrigérées</title>
  https://www.rgte.eu/lignes-d-agencement/
    <title>Lignes d agencement</title>
  https://www.rgte.eu/lignes-d-agencement/ligne-basique/
    <title>Ligne Basique</title>
  https://www.rgte.eu/lignes-d-agencement/ligne-basique/module-comptoir-bar/
    <title>Module comptoir bar</title>
  https://www.rgte.eu/lignes-d-agencement/ligne-basique/module-comptoir-caisse/
    <title>Module comptoir caisse</title>
  ```

- [ ] **[Faible]** Aperçus d’image en grand non autorisés (Discover) — _Webmaster, 15 min_
  - Sans « max-image-preview:large », vos images apparaissent en petit dans Google Discover.
  - À faire : Ajoutez la directive dans la meta robots.

  Meta robots — Vérifiez aussi l’en-tête X-Robots-Tag côté serveur et l’option « Demander aux moteurs de ne pas indexer » de votre CMS.

  ```html
  <meta name="robots" content="index, follow, max-image-preview:large">
  ```

- [ ] **[Faible]** Doctype HTML5 absent — _Webmaster, 15 min_
  - Le navigateur passe en mode « quirks ».
  - À faire : Commencez le document par <!doctype html>.

  Doctype — Première ligne du document.

  ```html
  <!doctype html>
  ```

- [ ] **[Faible]** robots.txt ne déclare pas le sitemap — _Webmaster, 15 min_
  - À faire : Ajoutez « Sitemap: https://www.rgte.eu/sitemap.xml » à la fin du fichier.

  Votre robots.txt corrigé (vos autres règles sont conservées)

  ```text
  # Votre robots.txt, avec seulement les robots de recherche IA débloqués : vos autres règles sont conservées.
  User-agent: *
  Allow: /
  Disallow: /cms.html?
  Disallow: /index.html?
  
  Sitemap: https://www.rgte.eu/sitemap.xml
  ```

- [ ] **[Faible]** Le sitemap n’indique pas <lastmod> — _Webmaster, 15 min_
  - À faire : Ajoutez des dates de modification fiables : Google et Bing s’en servent pour recrawler.

  sitemap.xml (pages explorées) — Mieux : activez le sitemap automatique de votre CMS (WordPress : Yoast / Rank Math ; Shopify et Wix : natif).

  ```html
  <?xml version="1.0" encoding="UTF-8"?>
  <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    <url><loc>https://www.rgte.eu/</loc><lastmod>2026-11-08</lastmod></url>
    <url><loc>https://www.rgte.eu/index.htm</loc><lastmod>2026-11-08</lastmod></url>
    <url><loc>https://www.rgte.eu/lignes-d-agencement/</loc><lastmod>2026-11-08</lastmod></url>
    <url><loc>https://www.rgte.eu/lignes-d-agencement/ligne-basique/</loc><lastmod>2026-11-08</lastmod></url>
    <url><loc>https://www.rgte.eu/lignes-d-agencement/ligne-basique/module-comptoir-bar/</loc><lastmod>2026-11-08</lastmod></url>
    <url><loc>https://www.rgte.eu/lignes-d-agencement/ligne-basique/module-comptoir-caisse/</loc><lastmod>2026-11-08</lastmod></url>
  </urlset>
  ```

- [ ] **[Moyen]** 13 ressources bloquantes dans <head> — _Webmaster, ½ journée_
  - CSS et scripts synchrones retardent l’affichage (LCP).
  - À faire : Ajoutez defer/async aux scripts, regroupez/inlinez le CSS critique.

  Scripts non bloquants

  ```html
  <script src="/js/app.js" defer></script>
  <link rel="preload" href="/css/critique.css" as="style">
  ```

- [ ] Publier 4 à 8 contenus experts (guides, comparatifs, FAQ, cas clients) qui répondent aux vraies questions — _Vous_
- [ ] Obtenir 5 à 10 liens de sites français du même domaine ou de la même ville (partenaires, fournisseurs, presse locale) — _Vous_
- [ ] Données structurées sur tous les gabarits (produit, article, FAQ) — _Webmaster_

### Dans les 90 jours

_Mesurer, étendre, être cité par les IA._

- [ ] **[Moyen]** Aucun lien vers vos réseaux sociaux — _Webmaster, 15 min_
  - Les liens site ↔ réseaux renforcent l’entité de marque et le trafic croisé.
  - À faire : Ajoutez les icônes de vos profils dans le pied de page (avec aria-label) + sameAs dans le schéma.

  Liens vers vos réseaux (pied de page)

  ```html
  <a href="https://www.instagram.com/votre-compte" aria-label="Instagram de notre entreprise" rel="me noopener">…icône…</a>
  <a href="https://www.linkedin.com/company/votre-entreprise" aria-label="Linkedin de notre entreprise" rel="me noopener">…icône…</a>
  ```

- [ ] **[Moyen]** Aucun intertitre sous forme de question — _Vous, 1 h_
  - Les moteurs de réponse (AI Overviews, ChatGPT, Perplexity) citent des passages qui répondent directement à une question.
  - À faire : Ajoutez une section FAQ (5–8 vraies questions clients) avec des réponses de 40–60 mots, factuelles et chiffrées.

  Section FAQ (à compléter avec vos vraies réponses)

  ```html
  <section aria-labelledby="faq">
    <h2 id="faq">Questions fréquentes</h2>
    <h3>Combien coûte fabricant ?</h3>
    <p>[Réponse directe en 40–60 mots, avec un chiffre précis.]</p>
    <h3>Quels sont les délais ?</h3>
    <p>[Réponse directe en 40–60 mots, avec un chiffre précis.]</p>
    <h3>Intervenez-vous autour de Puget-sur-Argens ?</h3>
    <p>[Réponse directe en 40–60 mots, avec un chiffre précis.]</p>
    <h3>Comment se passe la commande ou le devis ?</h3>
    <p>[Réponse directe en 40–60 mots, avec un chiffre précis.]</p>
    <h3>Quelles garanties proposez-vous ?</h3>
    <p>[Réponse directe en 40–60 mots, avec un chiffre précis.]</p>
  </section>
  ```

- [ ] **[Faible]** Pas de twitter:card — _Webmaster, 15 min_
  - X/Twitter et certaines messageries l’utilisent pour la grande vignette.
  - À faire : Ajoutez <meta name="twitter:card" content="summary_large_image">.

  Twitter / X

  ```html
  <meta name="twitter:card" content="summary_large_image">
  ```

- [ ] **[Faible]** Pas d’apple-touch-icon — _Webmaster, 15 min_
  - À faire : Ajoutez une icône 180×180 pour les raccourcis iOS.

  Icône iOS — PNG 180 × 180 px.

  ```html
  <link rel="apple-touch-icon" href="/apple-touch-icon.png">
  ```

- [ ] **[Faible]** Pas de balise <main> — _Webmaster, 15 min_
  - À faire : Structurez avec header / nav / main / footer (RGAA, lecteurs d’écran, et extraction par les IA).

  Structure de page

  ```html
  <header>…menu…</header>
  <main>…contenu principal…</main>
  <footer>…NAP, liens légaux…</footer>
  ```

- [ ] **[Faible]** Pas de lien vers une page « À propos » — _Vous, 1 h_
  - E-E-A-T : montrer qui est derrière le site (équipe, expérience, preuves).
  - À faire : Créez une page À propos riche (histoire, équipe, chiffres, certifications) et liez-la dans le menu/pied de page.

  Plan d’une page « À propos » qui inspire confiance

  ```text
  # À propos de nous
  - Notre histoire (date de création, lieu, fondateurs)
  - L’équipe (photos, rôles, expérience)
  - Chiffres clés (clients, projets, années, zone)
  - Certifications, labels, garanties, assurances
  - Avis et références clients
  - Coordonnées complètes (NAP)
  ```

- [ ] **[Faible]** Peu de faits chiffrés — _Vous, 1 h_
  - Les IA citent volontiers des données précises (chiffres, dates, prix, délais).
  - À faire : Ajoutez des preuves chiffrées : années d’expérience, nombre de clients, délais, garanties, prix indicatifs.

  Phrases de preuve à compléter

  ```text
  Depuis [année], nous [verbe] pour [N] clients à Puget-sur-Argens et alentour.
  Délai moyen : [N] jours. Garantie : [N] ans. Note Google : [4,8]/5 sur [N] avis.
  Prix indicatif : à partir de [N] € (devis gratuit sous 48 h).
  ```

- [ ] **[Faible]** 1 bloc(s) sur 5 peu citables par les IA — _Vous, 1 h_
  - Un passage est repris par les moteurs de réponse quand il se suffit à lui-même. À réécrire d’abord : « secteurs d'activité » (manque : intertitre explicite, fait précis, 50 à 200 mots).
  - À faire : Pour chaque bloc : intertitre en vraie question, réponse directe dès la 1re phrase qui nomme le sujet, un fait précis (prix, délai, lieu, chiffre daté), 50 à 200 mots.

  ```html
  <!-- À réécrire : « secteurs d'activité » — manque : intertitre explicite, fait précis, 50 à 200 mots
       Aujourd’hui : « Boulangerie Patisserie Chocolats Sandwichs Traiteur Poissonnerie Bar à Salades Bar à Couscous Fromagerie Bar Bar à Topping Coffee Shop / Café Pizza Al Taglio » -->
  <h2>[Question réelle de vos clients, ex. « Combien coûte … à … ? »]</h2>
  <p>[Réponse directe en 1re phrase qui nomme le sujet (40 à 60 mots).] [Un fait précis : prix, délai, lieu, chiffre daté et sourcé.]</p>
  <p>[Détail, exemple ou preuve : 50 à 200 mots au total pour le bloc.]</p>
  ```

- [ ] Poser 10 questions types à ChatGPT, Perplexity, Gemini et Copilot : noter si vous êtes cité, et qui l’est à votre place — _Vous_
- [ ] Relancer un audit SEO 360 et comparer (onglet Synthèse : vos progrès) — _Vous_
- [ ] Réallouer le budget pub vers les canaux au meilleur coût par client réel — _Vous_

### Non vérifié ou à vérifier hors site

- Pas de /llms.txt (optionnel) — Créez /llms.txt : qui vous êtes, offres, pages clés, contacts.
- Bing Webmaster Tools non vérifié (balise absente) — Inscrivez le site sur bing.com/webmasters (import depuis Search Console en 2 clics) et activez IndexNow.

### Déjà bien

- ✅ La page répond 200
- ✅ HTTPS actif
- ✅ Sitemap trouvé : 1 URL
- ✅ Titre de bonne longueur (46 car.)
- ✅ H1 : « agencement de vitrines réfrigérées »
- ✅ 406 mots de contenu
- ✅ Mesure : Google Analytics 4, Google Ads
- ✅ 6 pages explorées

### Indicateurs à suivre

| Indicateur | Aujourd’hui | Objectif |
|---|---|---|
| Note de l’audit (à couverture égale) | 76/100 | 96/100 en 90 jours |
| Pages indexées (Search Console) | à relever | ≈ 100 % des pages utiles |
| Clics Google / mois | à relever | +30 à +100 % en 6 mois selon la concurrence |
| Vitesse réelle mobile | voir Synthèse | LCP ≤ 2,5 s · INP ≤ 200 ms · CLS ≤ 0,1 |
| Contacts ou ventes venus de Google | à relever (GA4) | suivre la tendance mensuelle |
| Sites qui vous citent (liens) | à relever | +5 à +10 par mois |
| Citations dans les IA | test manuel | cité sur au moins 3 questions types sur 10 |

## Technologies détectées

- CMS / framework : Magento
- Mesure & pixels : Google Analytics 4, Google Ads
- Bandeau cookies : non détecté

## Robots des moteurs et des IA

| Robot | Usage | Accès |
|---|---|---|
| Googlebot | Google Search (y compris AI Overviews et AI Mode) | autorisé |
| Bingbot | Bing (alimente aussi Copilot, DuckDuckGo et en partie ChatGPT Search) | autorisé |
| Applebot | Apple (Siri, Spotlight) | autorisé |
| OAI-SearchBot | OpenAI — index de ChatGPT Search | autorisé |
| PerplexityBot | Perplexity — index | autorisé |
| Claude-SearchBot | Anthropic — index de recherche de Claude | autorisé |
| DuckAssistBot | DuckDuckGo — DuckAssist | autorisé |
| ChatGPT-User | OpenAI — lecture à la demande | autorisé |
| Perplexity-User | Perplexity — lecture à la demande | autorisé |
| Claude-User | Anthropic — lecture à la demande | autorisé |
| MistralAI-User | Mistral — Le Chat, lecture à la demande | autorisé |
| GPTBot | OpenAI — entraînement | autorisé |
| ClaudeBot | Anthropic — entraînement | autorisé |
| Google-Extended | Google — entraînement et réponses de Gemini (sans effet sur la recherche Google ni AI Overviews) | autorisé |
| Applebot-Extended | Apple Intelligence — entraînement | autorisé |
| CCBot | Common Crawl | autorisé |
| Meta-ExternalAgent | Meta AI | autorisé |
| Bytespider | ByteDance | autorisé |
| Amazonbot | Amazon (Alexa, Rufus) | autorisé |

## Budget publicitaire — 950 €/mois (minimum pour tester)

**Minimum pour tester : 950 € par mois (ce n’est pas un budget rentable calculé). ≈ 26 contacts par mois à ≈ 37 € chacun.** Indiquez la valeur d’un client (et votre marge) pour savoir si c’est rentable.

### Contrôle avant dépense

**Verdict suspendu : corrigez d’abord le Consent Mode v2.**

- ✓ **Conversion suivie** — Balise Google Ads détectée : vérifiez que l’action de conversion (appel, formulaire, achat) est « principale ».
- ✗ **Consent Mode v2** — Traceurs sans gestion du consentement : obligatoire (CNIL) et indispensable pour que Google Ads modélise les conversions.
- ? **Vitesse mobile** — Vitesse non mesurée : lancez l’audit avec PageSpeed.
- ✓ **Téléphone et formulaire** — Téléphone cliquable détecté(s) sur la page.
- ? **Prix identiques à l’annonce** — À vérifier vous-même : même offre, même prix, même promesse dans l’annonce et sur la page (sinon clics perdus, et risque de pratique trompeuse).
- ? **UTM et numéro suivi** — Ajoutez des paramètres UTM aux liens des réseaux et un suivi des appels (extension d’appel Google ou numéro dédié) pour savoir quel canal rapporte.

| Canal | Budget/mois | €/jour | Clics ≈ | Contacts ≈ | Coût par contact ≈ |
|---|---:|---:|---:|---:|---:|
| Google Ads — Search | 950 € | 31 € | 384 | 26 | 37 € |

Fourchette indicative : 17 – 35 contacts/mois. CPC Google : estimé d’après des médianes américaines ajustées pour la France ; saisissez votre CPC réel (Keyword Planner) pour un calcul fiable.

Canaux écartés à ce budget : LinkedIn, Microsoft, Meta.

### Semaines 1–2 : lancement

- Mesure des conversions vérifiée : GA4 + Google Ads, Consent Mode v2.
- Démarrez à ~70 % du budget (665 €/mois) ; gardez 10–20 % pour tester de nouveaux mots-clés.
- 2 ou 3 annonces par groupe, avec le mot-clé dans le titre ; extensions (appel, lieu, liens annexes) activées.
- Ne touchez à rien pendant 7 jours (apprentissage), sauf erreur flagrante.

### Semaines 3–6 : optimisation

- Coupez les annonces et mots-clés dont le coût par client dépasse 2× la cible après 50–100 clics.
- Ajoutez chaque semaine les recherches non pertinentes en mots-clés négatifs (Google).
- Augmentez les gagnants de 15–20 % maximum tous les 3–7 jours (au-delà, l’algorithme réapprend).
- Ajustez les enchères par appareil, horaire et zone selon le coût par client réel.

### Mois 2–3 : montée en charge

- Enchères automatiques (CPA ou ROAS cible) dès 30 conversions par mois et par campagne.
- Montez vers 1235–1520 €/mois si le coût réel reste sous votre seuil de rentabilité.
- Remarketing des visiteurs (30 jours) quand le volume le permet.
- Ajoutez un 2e canal seulement quand le 1er est rentable et stable.

## Outils recommandés et guides d’installation

Sélection faite d’après votre audit, votre secteur et vos réseaux. Prix d’entrée indicatifs, vérifiés le 05/11/2026 (hors taxes sauf mention) : à reconfirmer chez l’éditeur.

### Cette semaine (gratuit, dans cet ordre)

- **[Google Search Console](https://search.google.com/search-console)** — Gratuit
  Indispensable : vos vraies requêtes, et la preuve que chaque correction marche.
  Offre gratuite : Entièrement gratuit ; jusqu'à 1 000 propriétés par compte ; une propriété Domaine se valide uniquement par enregistrement DNS (sauf sites Blogger / Google Sites) ; envoi de sitemap réservé aux propriétaires.
  1. Ouvrez le sélecteur de propriétés de la Search Console et choisissez « + Ajouter une propriété ».
  2. Choisissez le type « Domaine » et saisissez le domaine racine, sans http(s)://, sans chemin et sans www (la propriété couvre tous les sous-domaines et protocoles).
  3. Si votre registraire figure dans la liste, lancez la validation automatique ; sinon choisissez « Tous fournisseurs DNS », type TXT, et copiez la valeur fournie.
  4. Chez votre hébergeur DNS, créez un enregistrement TXT (hôte vide ou « @ ») avec cette valeur, puis cliquez sur « Valider » ; comptez jusqu'à 72 h et ne supprimez pas l'enregistrement (aide : support.google.com/webmasters/answer/9008080).
  5. Ouvrez le rapport Sitemaps, collez l'URL du sitemap (ex. /sitemap.xml) dans « Ajouter un nouveau sitemap » puis « Envoyer » (aide : support.google.com/webmasters/answer/7451001).
  6. Revenez quelques jours plus tard : statut « Opération effectuée » attendu, sinon corrigez les erreurs signalées.
  Aide officielle : https://support.google.com/webmasters/answer/34592?hl=fr
- **[tarteaucitron.js](https://tarteaucitron.io)** — Pro : 25 € pour 1 mois (sans reconduction), 190 € HT/an, 490 € HT/3 ans, 690 € HT à vie — sites et trafic illimités, essai 7 jours sans carte
  Traceurs sans bandeau de consentement détecté : risque de sanction CNIL.
  Offre gratuite : Version open source gratuite, sans limite de durée ni de trafic ; chaque service doit être déclaré à la main ; pas de détection automatique des services ni de tableau de bord (réservés à la version Pro).
  1. Récupérez la bibliothèque (dépôt GitHub AmauriC/tarteaucitron.js ou npm).
  2. Chargez tarteaucitron.min.js le plus tôt possible dans la page, sans defer ni async.
  3. Appelez tarteaucitron.init({…}) avec vos options, notamment « highPrivacy »: true (pas de consentement implicite), « googleConsentMode »: true et « bodyPosition ».
  4. Pour chaque service (GA4, Meta…), retirez le code d'origine et remplacez-le par son équivalent tarteaucitron, du type tarteaucitron.user.xxx = '…'; (tarteaucitron.job = tarteaucitron.job || []).push('xxx');
  5. Testez : aucun cookie tiers avant consentement, bandeau et panneau de gestion fonctionnels.
  Aide officielle : https://tarteaucitron.io/en/free-installation-open-source/
- **[Consent Mode v2 (Google)](https://developers.google.com/tag-platform/security/guides/consent)** — Gratuit (hors coût éventuel de la CMP)
  Sans Consent Mode v2, Google Ads perd le remarketing et une partie des conversions.
  Offre gratuite : Fonction Google gratuite ; nécessite une bannière (CMP), éventuellement payante ; une CMP partenaire de Google ne garantit pas à elle seule la conformité aux règles de consentement de l'UE.
  1. Installez d'abord la balise Google (GA4 / Google Ads) si ce n'est pas déjà fait.
  2. Choisissez une CMP partenaire ; dans Google Ads : Admin > Gestion des balises Google > « Configurer le mode Consentement » > bannière créée par un tiers > Suivant > Plate-forme.
  3. Avec Tag Manager : installez le modèle de la CMP depuis la galerie, cochez l'option Mode Consentement Google et utilisez le déclencheur « Initialisation du consentement – Toutes les pages ».
  4. Sans modèle : appelez gtag('consent', 'default', …) sur chaque page avant toute commande de mesure, avec au minimum ad_storage, analytics_storage, ad_user_data et ad_personalization, puis gtag('consent', 'update', …) au choix du visiteur (doc : developers.google.com/tag-platform/security/guides/consent).
  5. Testez en mode Prévisualisation : l'onglet Consentement de Tag Assistant doit montrer les valeurs par défaut puis mises à jour ; publiez le conteneur.
  Aide officielle : https://support.google.com/google-ads/answer/14546213?hl=fr
- **[Google Analytics 4](https://analytics.google.com)** — Gratuit (GA4 standard) ; Analytics 360 : sur devis, tarif non public (frais fixes incluant 25 M d'événements/mois + coût par événement au-delà).
  Déclarer vos appels, formulaires et achats comme événements clés.
  Offre gratuite : GA4 standard gratuit ; 30 événements clés maximum par propriété standard (50 en Analytics 360) ; rôle Éditeur requis pour créer un flux de données.
  1. Dans Administration, créez un compte Analytics (ou gardez le compte existant), puis « Créer » > « Propriété » : nom, fuseau horaire et devise.
  2. Ajoutez un flux de données Web : URL principale du site et nom du flux ; la mesure améliorée (pages vues et autres événements) est activée par défaut.
  3. Installez la balise Google : saisissez l'ID de mesure « G-… » dans votre CMS (Shopify, Wix…) ou collez la balise juste après l'ouverture de <head> sur chaque page, une seule balise Google par page (ou passez par Tag Manager).
  4. Événements clés : Administration > Affichage des données > Événements, cliquez sur l'étoile de l'événement (ou « Événements clés » > nouvel événement clé) ; non rétroactif, jusqu'à 24 h de délai (aide : support.google.com/analytics/answer/13128484).
  5. Contrôlez la collecte dans le rapport Temps réel ou dans DebugView.
  Aide officielle : https://support.google.com/analytics/answer/9304153?hl=fr
- **[Bing Webmaster Tools + IndexNow](https://www.bing.com/webmasters)** — Gratuit
  Bing alimente Copilot et une partie de ChatGPT Search ; IndexNow accélère l’indexation.
  Offre gratuite : Gratuit ; import de 100 sites maximum par opération, 1 000 sites par compte ; IndexNow : 10 000 URL maximum par requête POST ; l'API URL Submission de Bing pourrait être abandonnée au profit d'IndexNow.
  1. Connectez-vous à Bing Webmaster Tools, page « My Sites », puis cliquez sur « Import ».
  2. Connectez votre compte Google, cliquez sur « Allow », sélectionnez les sites vérifiés dans Search Console puis « Import » : ils sont vérifiés automatiquement avec leurs sitemaps (données sous 48 h).
  3. Contrôlez la section Sitemaps (statut, dernière lecture, erreurs) et ajoutez au besoin une ligne Sitemap: dans robots.txt.
  4. IndexNow : générez une clé et publiez le fichier {clé}.txt (UTF-8) à la racine du site (doc : www.bing.com/indexnow/getstarted).
  5. Soumettez les URL nouvelles ou modifiées : GET pour une URL, POST JSON (host, key, urlList) pour plusieurs, vers api.indexnow.org — ou activez un CMS, plugin ou CDN compatible.
  6. Suivez les envois dans l'onglet IndexNow de Bing Webmaster Tools.
  Aide officielle : https://www.bing.com/webmasters/help/add-and-verify-site-12184f8b
- **[Microsoft Clarity](https://clarity.microsoft.com)** — Gratuit
  Voir où les visiteurs hésitent ou abandonnent.
  Offre gratuite : Gratuit à vie, sans limite de trafic ni de projets ; enregistrements plafonnés à 100 000 sessions par projet et par jour (échantillonnage au-delà) ; à ne pas utiliser sur un site visant les moins de 18 ans ; consentement exigé pour les visiteurs UE / Royaume-Uni / Suisse depuis le 31 octobre 2025.
  1. Sur clarity.microsoft.com, cliquez sur « Sign up » et suivez l'inscription : vous arrivez sur la page Projects.
  2. « New project » : nom du projet, URL du site et secteur d'activité.
  3. Settings > Setup > Installation methods > « Install manually » > « Get tracking code », puis collez le code dans le <head> du gabarit principal (ou installez via Google Tag Manager ou l'intégration WordPress, Shopify, Wix…).
  4. Transmettez le consentement des visiteurs UE/UK/CH : Clarity lit les signaux Google Consent Mode, sinon utilisez l'API ConsentV2 (doc : learn.microsoft.com/en-us/clarity/setup-and-installation/consent-management).
  5. Attendez au moins 30 minutes avant de consulter cartes de chaleur et enregistrements.
  Aide officielle : https://learn.microsoft.com/en-us/clarity/setup-and-installation/clarity-setup

### Ce mois-ci (gratuit)

- **[Test des résultats enrichis + validateur Schema.org](https://search.google.com/test/rich-results)** — Gratuit
  Des données structurées manquent ou sont à corriger.
  1. Ouvrir le Test des résultats enrichis et coller l'adresse de la page (ou son code).
  2. Lire les éléments détectés et corriger les erreurs signalées.
  3. Pour un schéma sans résultat enrichi Google (Organization, LocalBusiness), vérifier aussi sur validator.schema.org.
  4. Relancer le test après correction, puis demander l'indexation de la page dans Search Console.
  Aide officielle : https://validator.schema.org
- **[Google Keyword Planner](https://ads.google.com/aw/keywordplanner/home)** — Gratuit (aucune campagne obligatoire ; des guides tiers signalent une possible vérification du moyen de paiement)
  Volumes et CPC réels de vos mots-clés.
  Offre gratuite : Outil gratuit mais compte Google Ads en mode Expert obligatoire (inaccessible en mode intelligent) ; l'aide officielle exige les informations de facturation pour « Découvrir de nouveaux mots clés » ; sans dépenses actives, volumes souvent affichés en fourchettes larges (sources tierces).
  1. Créez un compte Google Ads en mode Expert (le mode intelligent ne donne pas accès à l'outil).
  2. Pour ne pas lancer d'annonce, des guides tiers concordants indiquent « Passer en mode Expert » puis « Créer un compte sans campagne » (parcours non décrit dans l'aide officielle).
  3. Complétez la configuration du compte avec les informations de facturation, exigées par l'aide officielle pour les fonctions de base.
  4. Outils > Planification > Keyword Planner > « Découvrir de nouveaux mots clés » : partez de mots-clés séparés par une virgule et/ou d'une URL.
  5. Pour une liste existante : « Obtenir le volume de recherche et les prévisions » (saisie ou import).
  Aide officielle : https://support.google.com/google-ads/answer/7337243?hl=fr
- **[Canva](https://www.canva.com)** — à vérifier — aucun prix en euros trouvé sur une page officielle Canva ; sources françaises de 2026 divergentes : 110 €/an (12 €/mois) ou 119,99 €/an (14,99 €/mois) ; essai gratuit de 30 jours
  Visuels, carrousels et miniatures aux formats de chaque réseau.
  Offre gratuite : Canva reste gratuit pour les particuliers (modèles et contenus gratuits) ; contenus premium, suppression d'arrière-plan et la plupart des outils d'IA réservés aux offres payantes ; Canva Pro n'a qu'un seul titulaire.
  1. Sur canva.com, inscrivez-vous par e-mail (code de confirmation), Google ou Facebook ; adresses jetables refusées (aide : canva.com/help/sign-up-log-in/).
  2. Depuis l'accueil, choisissez de passer à un forfait supérieur ou de commencer l'essai gratuit.
  3. Sélectionnez Canva Pro puis l'essai gratuit si vous y avez droit (un essai par compte et par moyen de paiement).
  4. Choisissez la facturation mensuelle ou annuelle, saisissez le moyen de paiement et confirmez.
  Aide officielle : https://www.canva.com/help/upgrade-to-canva-pro-or-business/
- **[CapCut](https://www.capcut.com)** — à vérifier — prix variable selon la région, l'appareil et les promotions ; page officielle en USD : Pro 19,99 $/mois ou 179,99 $/an ; prix en euros à lire dans l'appli (Moi > Rejoindre CapCut Pro)
  Monter Reels, TikTok et Shorts au téléphone, sous-titres compris.
  Offre gratuite : Version gratuite sans carte bancaire, mais certains modèles, effets et éléments premium ajoutent un filigrane ; clip de fin avec logo à retirer ; depuis janvier 2026, l'export 2K/4K dépend de l'appareil et de la plateforme, avec des limites possibles pour les comptes gratuits.
  1. Téléchargez CapCut depuis capcut.com, le Microsoft Store, l'App Store ou Google Play (évitez les APK « Pro » de sites tiers).
  2. Connectez-vous avec un e-mail, Google, TikTok ou Facebook.
  3. Avant l'export, remplacez les éléments marqués Pro et retirez le clip de fin pour éviter le filigrane (aide : capcut.com/fr-fr/help/video-without-watermark).
  4. Pour passer Pro : bouton « Rejoindre Pro » sur ordinateur ou Moi > Rejoindre CapCut Pro sur mobile, puis plan mensuel ou annuel.
  Aide officielle : https://www.capcut.com/fr-fr/help/monthly-and-yearly-plans
- **[Ahrefs Webmaster Tools](https://ahrefs.com/webmaster-tools)** — Gratuit (sites dont vous prouvez la propriété). Option : ahrefs Starter : 29 $/mois hors taxes (renouvellement mensuel uniquement) ; Lite : 129 $/mois ; grille inchangée depuis juin 2024
  Vos liens entrants et un audit de site, gratuitement.
  Offre gratuite : Gratuit pour les sites dont la propriété est vérifiée (projets illimités) ; Site Audit : 5 000 crédits de crawl par projet vérifié et par mois ; Site Explorer : 500 crédits/mois sur les projets vérifiés ; Web Analytics gratuit jusqu'à 1 million d'événements/mois.
  1. Créez un compte gratuit sur ahrefs.com/webmaster-tools.
  2. Ajoutez votre site comme projet.
  3. Vérifiez la propriété : import Google Search Console (recommandé, même variante www / sans www que dans GSC), enregistrement TXT DNS (« @ » ou vide), fichier HTML à la racine ou balise meta dans le <head> de la page d'accueil.
  4. Laissez le fichier, la balise ou l'enregistrement en place : la propriété est revérifiée régulièrement.
  5. Lancez Site Audit (plafonnez au besoin « Max number of internal pages ») et consultez Site Explorer.
  Aide officielle : https://help.ahrefs.com/en/articles/3275938-verifying-ownership-of-your-project-or-website
- **[Google Trends](https://trends.google.fr)** — Gratuit
  La saison de votre activité : quand publier et quand investir.
  1. Ouvrir trends.google.fr et saisir le mot-clé principal.
  2. Régler le pays (France ou votre région) et la période sur 5 ans pour voir la saison.
  3. Ajouter jusqu'à 4 termes à comparer (variantes, concurrents).
  4. Noter les mois de pic : préparer contenus et publicité 4 à 6 semaines avant.
- **[Clé API PageSpeed Insights](https://developers.google.com/speed/docs/insights/v5/get-started)** — Gratuit
  Mesurer la vitesse réelle à chaque audit sans dépasser le quota gratuit.
  Offre gratuite : API gratuite, utilisable même sans clé ; une clé est recommandée pour les requêtes automatisées fréquentes ; quotas non publiés dans la doc consultée (visibles dans le projet Google Cloud).
  1. Ouvrez la page « Get Started with the PageSpeed Insights API » et cliquez sur « Get a Key » (ou passez par la page Credentials de la console Google Cloud).
  2. Choisissez ou créez un projet Google Cloud, puis créez la clé API.
  3. Copiez la clé.
  4. Ajoutez key=VOTRE_CLE à chaque requête runPagespeed de l'API v5 (les versions v1 à v4 sont obsolètes).
  Aide officielle : https://developers.google.com/speed/docs/insights/v5/get-started

### Recommandés (gratuits ou petit budget)

- **[Axeptio](https://www.axeptio.eu/fr/pricing)** — à vérifier — la page tarifs officielle (lecture difficile, devises mélangées) indique « Extra Small » à 7,50 €/mois en paiement annuel (jusqu'à 2 500 pages vues/mois) ; Capterra cite « Small » à 29 €/mois (5 000 pages vues/mois)
  Alternative clés en main au bandeau gratuit.
  Offre gratuite : Offre gratuite tant que le site reste sous 200 visiteurs uniques sur 30 jours, 1 domaine, un seul projet en essai par compte ; au-delà, 21 jours pour repasser sous le seuil, sinon le widget est dépublié.
  1. Créez un compte puis « Create a new project » avec l'adresse du site et le nom du projet.
  2. Créez une configuration du bandeau : services déclarés (GA4, Meta, YouTube…), textes, langues et style — ou générez-la avec l'audit des traceurs.
  3. Si GA4 ou Google Ads sont déclarés, l'écran Consent Mode v2 s'active : laissez les 4 signaux refusés par défaut pour l'UE (aide : support.axeptio.eu/en/articles/704808-configure-google-consent-mode-v2-gtm-integration).
  4. Cliquez sur « Publish » dans le back-office.
  5. Integration > General : choisissez la configuration, copiez le script et collez-le avant tout script Google — ou utilisez le modèle GTM (déclencheur « Consent Initialization – All Pages ») ou le module WordPress, Shopify, PrestaShop.
  Aide officielle : https://support.axeptio.eu/en/articles/273981-embed-the-axeptio-script-on-your-site
- **[Cloudflare (offre gratuite)](https://www.cloudflare.com)** — Pro : 20 $/mois en facturation annuelle (25 $ au mois) ; Business : 200 $/mois en annuel (250 $ au mois)
  Cache et CDN gratuits pour accélérer le site.
  Offre gratuite : Offre Free à 0 $ prévue pour des projets non critiques ; sur Free, AI Crawl Control identifie les robots IA par leur user-agent ; robots.txt et Content Signals expriment des préférences que les robots peuvent ignorer.
  1. Tableau de bord > Domains > « Onboard a domain » : saisissez le domaine racine, laissez Cloudflare scanner les DNS et choisissez l'offre Free.
  2. Vérifiez les enregistrements importés (apex, sous-domaines, MX, SPF, DKIM) pour éviter les erreurs DNS_PROBE_FINISHED_NXDOMAIN.
  3. Désactivez DNSSEC chez le registraire, puis remplacez ses serveurs de noms par les deux serveurs Cloudflare attribués, copiés à l'identique.
  4. Attendez l'activation (jusqu'à 24 h, e-mail et statut « Active »), réactivez DNSSEC via Cloudflare et terminez la configuration SSL/TLS.
  5. AI Crawl Control (ex-AI Audit, renommé le 27 août 2025) : onglet Crawlers, action « Block » pour les robots à refuser (doc : developers.cloudflare.com/ai-crawl-control/get-started/).
  6. Content Signals : réglez la politique Training sur Disallow et activez « Bot Preference Sync » pour servir un robots.txt géré avec Content-Signal (search, ai-input, ai-train).
  Aide officielle : https://developers.cloudflare.com/fundamentals/manage-domains/add-site/
- **[Screaming Frog SEO Spider](https://www.screamingfrog.co.uk/seo-spider/)** — 199 £/an par utilisateur, soit 245 €/an ou 279 $/an depuis l'ajustement monétaire de mai 2025 (prix de base inchangé depuis 2023) ; dégressif dès 5 licences
  Explorer tout le site comme Google, avant et après chaque refonte.
  Offre gratuite : Version gratuite limitée à 500 URL par crawl, sans sauvegarde des crawls ; configuration et fonctions avancées (rendu JavaScript, extraction personnalisée, intégrations API) bloquées.
  1. Téléchargez l'installeur sur screamingfrog.co.uk (Windows, macOS ou Ubuntu ; système 64 bits et au moins 4 Go de RAM disponibles).
  2. Installez puis lancez le SEO Spider.
  3. Mode Spider (par défaut) : saisissez l'URL de départ et lancez le crawl ; mode List pour contrôler une liste d'URL.
  4. Licence : menu « Licence » > « Enter Licence Key », puis redémarrez l'application pour lever la limite de 500 URL.
  5. À l'expiration de la licence annuelle, le logiciel repasse en version gratuite restreinte.
  Aide officielle : https://www.screamingfrog.co.uk/seo-spider/user-guide/general/
- **[AlsoAsked](https://alsoasked.com)** — Basic : 12 $/mois HT (100 crédits/mois, historique 24 h) ou 144 $/an
  Les questions de vos clients pour la FAQ, les intertitres et les vidéos.
  Offre gratuite : Quelques recherches gratuites (3 selon l'aide, mais renouvellement quotidien, mensuel ou unique selon les articles, contradictoires) ; export PNG gratuit ; crédits mensuels non reportés.
  1. Créez un compte sur alsoasked.com.
  2. Saisissez la requête puis choisissez pays et langue (la ville la plus peuplée est choisie par défaut ; le dernier réglage est mémorisé).
  3. Lancez la recherche : aucun crédit n'est débité si aucun résultat n'est trouvé.
  4. Exportez le graphe en PNG (tous comptes) ou en CSV, XLSX ou Google Sheets (données complètes sur Lite et Pro).
  Aide officielle : https://help.alsoasked.com/en/collections/3394820-alsoasked-user-guides
- **[Data Studio (ex-Looker Studio)](https://lookerstudio.google.com)** — Data Studio Pro : 9 $/utilisateur/projet Google Cloud/mois (essai gratuit de 30 jours)
  Un tableau de bord mensuel gratuit (Search Console et GA4).
  Offre gratuite : Gratuit pour créer et consulter des rapports ; rapports GA4 soumis aux quotas de l'API Google Analytics Data ; segments et comparaisons GA4 indisponibles via le connecteur ; une source Search Console = une seule table (site ou URL).
  1. Sur l'accueil de Data Studio (nom repris par Looker Studio en avril 2026), cliquez sur « Create » > « Data Source ».
  2. Choisissez le connecteur Search Console, autorisez l'accès et sélectionnez la propriété (même compte Google que dans Search Console, au moins en lecture).
  3. Choisissez la table « Site Impression » ou « URL Impression » et le type de recherche, puis « Connect » ; créez deux sources pour comparer les deux tables.
  4. GA4 : « Create » > « Data Source » > connecteur Google Analytics > compte > propriété > « Connect » (droit Lire et analyser requis ; doc : docs.cloud.google.com/looker/docs/studio/connect-to-google-analytics).
  5. Cliquez sur « Create Report » > « Add to Report » pour construire les graphiques.
  Aide officielle : https://cloud.google.com/looker/docs/studio/connect-to-search-console
- **[Calendly](https://calendly.com/pricing)** — Standard : 10 $/siège/mois (facturation annuelle)
  Prise de rendez-vous en ligne quand le contact direct manque.
  Offre gratuite : Plan Free permanent : 1 type d'événement, 1 calendrier connecté, rendez-vous en tête-à-tête, page de réservation personnalisable.
  1. Créez un compte gratuit sur calendly.com.
  2. Availability > Calendar settings > « + Connect calendar account » (Google, Outlook/Office 365, Exchange) et choisissez les calendriers à vérifier pour les conflits.
  3. Page Scheduling > « + Create » > type d'événement : nom, couleur, durée, lieu (un événement 1:1 de 30 min existe déjà).
  4. Sur la carte de l'événement, « Copy link » ; ou partagez la page de tous vos événements, intégrez le planificateur au site ou créez un lien à usage unique (aide : calendly.com/help/how-to-share-your-scheduling-link).
  Aide officielle : https://calendly.com/help/how-to-set-up-an-event-type
- **[LinkedIn Campaign Manager + Insight Tag](https://www.linkedin.com/campaignmanager)** — Gratuit
  LinkedIn est prioritaire pour votre secteur.
  Offre gratuite : Gratuit (publicités payantes) ; à ne pas installer sur des pages contenant des données sensibles (santé, finances…) ; validation du domaine de quelques minutes à 24 h.
  1. Dans Campaign Manager, ouvrez le compte publicitaire > « Measure » > « Signals manager ».
  2. Section « Sources catalog » : cliquez sur Insight Tag, puis « Create Insight Tag » si aucun tag n'existe.
  3. Choisissez « I will install the tag myself » et copiez le code (guillemets droits, pas typographiques).
  4. Collez le JavaScript sur toutes les pages du domaine, de préférence juste avant la fermeture de </body> dans le pied de page global ; avec un gestionnaire de balises, copiez plutôt l'ID partenaire et utilisez le modèle de la galerie GTM.
  5. Après une visite du site, le tag passe « Active » dans les sources de données (quelques minutes à 24 h).
  Aide officielle : https://www.linkedin.com/help/lms/answer/a418880
- **[YouTube Studio](https://studio.youtube.com)** — Gratuit
  YouTube est prioritaire pour votre secteur, et les IA le citent souvent.
  1. Créer la chaîne de l'entreprise avec un compte Google (compte de marque si plusieurs personnes la gèrent).
  2. Remplir la description, les liens et la bannière (Studio → Personnalisation).
  3. Publier les Shorts avec un titre et une description qui contiennent le mot-clé.
  4. Suivre la rétention et les sources de trafic dans Studio → Statistiques.
- **[Metricool](https://metricool.com/pricing/)** — Starter : à partir de 16 €/mois en facturation annuelle (20 €/mois en mensuel), 5 marques
  Planifier tous les réseaux et suivre les statistiques au même endroit.
  Offre gratuite : Plan gratuit permanent sans carte : 1 marque, 20 publications par mois (compteur remis à zéro le 1er), 5 concurrents, 30 jours d'historique ; LinkedIn et X non inclus. (Certaines pages marketing parlent encore de 50 publications.)
  1. Inscrivez-vous par e-mail, Google ou Facebook (gratuit, sans moyen de paiement) et activez le compte via le lien reçu.
  2. Menu en haut à droite > « Connections ».
  3. Choisissez la marque dans la liste, puis la plateforme, et suivez l'autorisation (droits administrateur ou propriétaire ; acceptez toutes les permissions).
  4. Instagram : compte professionnel (Business ou Créateur) lié à une Page Facebook pour toutes les fonctions ; Facebook : Pages uniquement.
  5. Une marque = un compte par réseau ; Metricool importe les 30 derniers jours de données.
  Aide officielle : https://help.metricool.com/how-to-connect-social-media-and-ad-platforms-to-metricool-qrkvn
- **[Brevo](https://www.brevo.com/fr/pricing/)** — Starter : à partir de 7 €/mois (palier 5 000 e-mails/mois, sans limite quotidienne ; 9 $ en USD) ; SMS : packs de 100 crédits sans expiration, coût selon le pays
  Relancer vos clients par e-mail et SMS, et leur demander un avis.
  Offre gratuite : Plan Free permanent sans carte : 300 e-mails/jour (9 000/mois), jusqu'à 100 000 contacts stockés, 1 utilisateur, automatisations limitées à 2 000 contacts, logo Brevo ; SMS uniquement par crédits prépayés.
  1. Créez le compte avec une adresse sur votre propre domaine (les domaines gratuits ne s'authentifient pas).
  2. Senders, Domains & Dedicated IPs > Domains : ajoutez le domaine et publiez les enregistrements DNS (code Brevo, DKIM, DMARC), automatiquement chez un hébergeur partenaire ou à la main (aide : help.brevo.com/hc/en-us/articles/12163873383186).
  3. Senders : créez l'expéditeur (nom et adresse), vérifié automatiquement si le domaine est authentifié.
  4. CRM > Contacts > « Import contacts » (fichier ou copier-coller ; contacts consentants uniquement).
  5. Marketing > Campaigns > « Create campaign » > Email (Regular) : expéditeur, destinataires, objet, puis envoi ou programmation.
  6. SMS : enregistrez un Sender ID alphanumérique pour la France, achetez des crédits (compte > My Plan > SMS & WhatsApp) et respectez les plages horaires françaises (aide : help.brevo.com/hc/en-us/articles/16603051344146).
  Aide officielle : https://help.brevo.com/hc/en-us/articles/360016175440-Getting-started-with-Emails-campaigns

### Pour aller plus loin (payants)

- **[Otterly.AI](https://otterly.ai/pricing)** — Lite : 29 $/mois (15 prompts suivis sur ChatGPT, Google AI Overviews, Perplexity et Copilot) ; 25 $/mois en annuel
  Savoir si ChatGPT, Perplexity et AI Overviews vous citent, mois après mois.
- **[Haloscan](https://www.haloscan.com/)** — Starter : 59 €/mois — montant confirmé sur la page tarifs officielle ; la mention HT vient de plusieurs sources françaises concordantes mais n'apparaît pas dans l'extrait de la page officielle ; environ 590 € HT/an en annuel selon des sources tierces ; Agency : 179 €/mois
  Pour suivre vos positions et vos concurrents chaque semaine.
- **[Make](https://www.make.com/en/pricing)** — Core : 9 $/mois en facturation annuelle (10 000 crédits/mois)
  Automatiser les tâches répétitives : formulaire → e-mail → demande d’avis.

**Budget outils** : 0 € pour démarrer · ≈ 87 €/mois si vous prenez les offres payantes des outils recommandés · ≈ 92 €/mois de plus au niveau pro (prix d’entrée connus seulement).

## Mots-clés

**Suggestions Google réelles** : vitrine réfrigérée occasion · vitrine réfrigérée metro · vitrine réfrigérée à poser · vitrine réfrigérée comptoir · vitrine réfrigérée marché · vitrine réfrigérée professionnelle · vitrine réfrigérée à poser sur table · vitrine réfrigérée pâtisserie · vitrine réfrigérée occasion le bon coin · prix vitrine réfrigérée · prix vitrine réfrigérée en tunisie · prix vitrine réfrigérée boucherie · prix vitrine réfrigérée boulangerie · prix armoire réfrigérée tunisie · armoire réfrigérée prix · prix vitrine refrigeree occasion · prix vitrine frigo · prix comptoir frigo tunisie · prix armoire froide positive · vitrine réfrigérée a poser · vitrine réfrigérée amazon · vitrine réfrigérée atosa · vitrine réfrigérée avec comptoir · vitrine refrigeree a poser metro · vitrine refrigeree a louer · vitrine refrigeree angle · vitrine refrigeree a poser sur table · vitrine réfrigérée ambulante · vitrine refrigeree a roulette · vitrine réfrigérée boisson · vitrine réfrigérée boisson occasion · vitrine réfrigérée boucherie · vitrine réfrigérée boulangerie · vitrine réfrigérée boucherie occasion · vitrine réfrigérée buffet · vitrine réfrigérée boulangerie occasion · vitrine réfrigérée bonnet neve · vitrine réfrigérée charcuterie · vitrine réfrigérée chocolat · vitrine réfrigérée coca cola · vitrine réfrigérée casablanca · vitrine refrigeree combisteel · vitrine refrigeree casselin · vitrine refrigeree colonne · vitrine refrigeree coffee shop · vitrine refrigeree costan · vitrine réfrigérée de comptoir · vitrine réfrigérée de table · vitrine réfrigérée d'occasion · vitrine réfrigérée diamond · vitrine réfrigérée de marché · vitrine réfrigérée dessert · vitrine réfrigérée de bar · vitrine réfrigérée de marché occasion · vitrine réfrigérée de table occasion · vitrine réfrigérée drop in · vitrine réfrigérée encastrable · vitrine réfrigérée en anglais · vitrine refrigeree electro depot · vitrine refrigeree epicerie

**transactionnel** : vitrine réfrigérée prix · vitrine réfrigérée devis · vitrine réfrigérée tarif · acheter vitrine réfrigérée · vitrine réfrigérée sur mesure · vitrine réfrigérée livraison · équipement professionnel prix · agencement magasin prix

**commercial** : vitrine réfrigérée avis · vitrine réfrigérée comparatif · vitrine réfrigérée professionnel · vitrine réfrigérée haut de gamme

**informationnel** : comment choisir vitrine réfrigérée · combien coûte vitrine réfrigérée · guide vitrine réfrigérée · entretien vitrine réfrigérée · comment choisir équipement professionnel · comment choisir agencement magasin

## Hashtags par réseau

### Instagram — 3-5 hashtags

#VitrineRefrigeree #agencementmagasin #industrie #surmesure #bureaudetudes

_Niveaux attendus : #VitrineRefrigeree niche · #agencementmagasin niche · #industrie large · #surmesure niche · #bureaudetudes niche (niche < 50 000 publications, moyen 50 000–500 000, large au-delà : à vérifier sur le réseau)._

- Limite : 5 hashtags max par post et Reel (annonce Adam Mosseri / @creators, déc. 2025 ; avant : 30).
- Placement : Dans la légende, en fin de texte ; privilégier des mots-clés dans la légende (indexés par la recherche Instagram) plutôt que des hashtags génériques (#reels, #explore inutiles). Effet réel faible : 5 hashtags ≈ +2 % de portée par rapport à aucun (Fanpage Karma, 1,6 M publications) ; dans la légende plutôt qu'en commentaire (test Agorapulse).
- Rythme : 3-5 posts/semaine + Stories quotidiennes · Moments : Lun-jeu 10h-15h (Sprout Social) ; pic du soir 18h-20h en France ; éviter samedi.
- Réserve à faire tourner : #fabricantfrancais #industriedufutur #froidcommercial #metiersdebouche #pmeindustrielle #frenchfab #ModuleRefrigeree #ModuleVitrine #ModuleComptoir #ComptoirBar

### TikTok — 3-5 hashtags

#agencementmagasin #surmesure #VitrineRefrigeree #nouveaute #bureaudetudes

_Niveaux attendus : #agencementmagasin niche · #surmesure niche · #VitrineRefrigeree niche · #nouveaute large · #bureaudetudes niche (niche < 50 000 publications, moyen 50 000–500 000, large au-delà : à vérifier sur le réseau)._

- Limite : 5 hashtags max signalé depuis août 2025 (message « Maximum 5 hashtags » ; sources contradictoires, certains guides 2026 indiquent encore 30). Considérer 5 comme plafond sûr.
- Placement : Fin de légende ; mots-clés recherchés aussi dans le texte parlé, le texte à l'écran et la légende (TikTok = moteur de recherche). Les hashtags pèsent peu : environ 10 % des vues (Metricool 2026), le fil Pour toi domine.
- Rythme : 3-7 posts/semaine (1/jour idéal pour croissance) · Moments : Semaine 12h-15h et 18h-22h (Sprout : midi à début de soirée) ; Buffer trouve le samedi meilleur jour : tester.
- Réserve à faire tourner : #fabricantfrancais #industriedufutur #froidcommercial #metiersdebouche #pmeindustrielle #frenchfab #ModuleRefrigeree #ModuleVitrine #ModuleComptoir #ComptoirBar

### LinkedIn — 0-3 hashtags

#industrie #agencementmagasin #surmesure

_Niveaux attendus : #industrie large · #agencementmagasin niche · #surmesure niche (niche < 50 000 publications, moyen 50 000–500 000, large au-delà : à vérifier sur le réseau)._

- Limite : Pas de limite officielle publiée.
- Placement : Fin de post ; les hashtags ne sont plus un levier de distribution (le modèle 360Brew lit le sens du texte).
- Rythme : 2-5 posts/semaine ; page entreprise 2-3/semaine · Moments : Mar-jeu 8h-10h et 12h-13h (Sprout : matinée en semaine ; Buffer : mer/ven 15h-16h) ; éviter week-end.
- Réserve à faire tourner : #bureaudetudes #fabricantfrancais #industriedufutur #froidcommercial #metiersdebouche #pmeindustrielle #frenchfab #VitrineRefrigeree #ModuleRefrigeree #ModuleVitrine

### YouTube — 2-3 hashtags

#agencementmagasin #VitrineRefrigeree #surmesure

_Niveaux attendus : #agencementmagasin niche · #VitrineRefrigeree niche · #surmesure niche (niche < 50 000 publications, moyen 50 000–500 000, large au-delà : à vérifier sur le réseau)._

- Limite : Règle officielle : au-delà de 60 hashtags, YouTube ignore tous les hashtags de la vidéo ; les 3 premiers s'affichent au-dessus du titre.
- Placement : Description (les 3 premiers apparaissent au-dessus du titre) ; mots-clés dans le titre et les 2 premières lignes.
- Rythme : 1 vidéo longue/semaine + 2-5 Shorts/semaine · Moments : Semaine 12h-16h ; week-end 9h-11h
- Réserve à faire tourner : #bureaudetudes #fabricantfrancais #industriedufutur #froidcommercial #metiersdebouche #pmeindustrielle #frenchfab #ModuleRefrigeree #ModuleVitrine #ModuleComptoir

### Facebook — 0-2 hashtags

#agencementmagasin #surmesure

_Niveaux attendus : #agencementmagasin niche · #surmesure niche (niche < 50 000 publications, moyen 50 000–500 000, large au-delà : à vérifier sur le réseau)._

- Limite : Pas de limite officielle.
- Placement : Fin de post ; peu d'impact sur la portée.
- Rythme : 3-5 posts/semaine · Moments : Mar-mer 12h-20h (Sprout, heure locale)
- Réserve à faire tourner : #bureaudetudes #fabricantfrancais #industriedufutur #froidcommercial #metiersdebouche #pmeindustrielle #frenchfab #VitrineRefrigeree #ModuleRefrigeree #ModuleVitrine

### X (Twitter) — 1-2 hashtags

#agencementmagasin #VitrineRefrigeree

_Niveaux attendus : #agencementmagasin niche · #VitrineRefrigeree niche (niche < 50 000 publications, moyen 50 000–500 000, large au-delà : à vérifier sur le réseau)._

- Limite : Pas de limite technique ; hashtags comptent dans les caractères.
- Placement : Intégrés dans la phrase ou en fin de post.
- Rythme : 1-5 posts/jour · Moments : Semaine 9h-12h
- Réserve à faire tourner : #surmesure #bureaudetudes #fabricantfrancais #industriedufutur #froidcommercial #metiersdebouche #pmeindustrielle #frenchfab #ModuleRefrigeree #ModuleVitrine

### Pinterest — 0-2 hashtags

#agencementmagasin #VitrineRefrigeree

_Niveaux attendus : #agencementmagasin niche · #VitrineRefrigeree niche (niche < 50 000 publications, moyen 50 000–500 000, large au-delà : à vérifier sur le réseau)._

- Limite : Pas de limite ; hashtags quasi sans effet.
- Placement : Préférer des mots-clés naturels dans titre, description et nom de tableau.
- Rythme : 3-10 épingles/semaine, régulières · Moments : Soir 20h-23h et week-end ; anticiper les saisons de 45-90 jours.
- Réserve à faire tourner : #surmesure #bureaudetudes #fabricantfrancais #industriedufutur #froidcommercial #metiersdebouche #pmeindustrielle #frenchfab #ModuleRefrigeree #ModuleVitrine

### Threads — 1 hashtags

#agencementmagasin

_Niveaux attendus : #agencementmagasin niche (niche < 50 000 publications, moyen 50 000–500 000, large au-delà : à vérifier sur le réseau)._

- Limite : 1 seul tag de sujet (topic tag) par post.
- Placement : Tag de sujet intégré au texte ou ajouté via le sélecteur de sujet.
- Rythme : 1-3 posts/jour · Moments : Semaine 8h-10h et 18h-21h (peu de données dédiées)
- Réserve à faire tourner : #surmesure #bureaudetudes #fabricantfrancais #industriedufutur #froidcommercial #metiersdebouche #pmeindustrielle #frenchfab #VitrineRefrigeree #ModuleRefrigeree

### Bluesky — 1-2 hashtags

#agencementmagasin #industrie

_Niveaux attendus : #agencementmagasin niche · #industrie large (niche < 50 000 publications, moyen 50 000–500 000, large au-delà : à vérifier sur le réseau)._

- Limite : Pas de limite ; les hashtags comptent dans les 300 graphèmes.
- Placement : Fin de post ; utiles pour la recherche et les flux personnalisés.
- Rythme : 1-3 posts/jour · Moments : Semaine 9h-12h (peu de données)
- Réserve à faire tourner : #surmesure #bureaudetudes #fabricantfrancais #industriedufutur #froidcommercial #metiersdebouche #pmeindustrielle #frenchfab #VitrineRefrigeree #ModuleRefrigeree

### Snapchat (Spotlight) — 1-3 (Spotlight) hashtags

#agencementmagasin #nouveaute #surmesure

_Niveaux attendus : #agencementmagasin niche · #nouveaute large · #surmesure niche (niche < 50 000 publications, moyen 50 000–500 000, large au-delà : à vérifier sur le réseau)._

- Limite : Pas de limite publiée ; « #Topics » sur Spotlight.
- Placement : Légende Spotlight / sujets.
- Rythme : Stories quotidiennes ; 3-5 Spotlight/semaine · Moments : Soir 18h-22h et pause déjeuner (public 15-24 ans)
- Réserve à faire tourner : #bureaudetudes #fabricantfrancais #industriedufutur #froidcommercial #metiersdebouche #pmeindustrielle #frenchfab #VitrineRefrigeree #ModuleRefrigeree #ModuleVitrine

À bannir : #followforfollow #follow4follow #f4f #like4like #l4l #likeforlike #followme #followback #tagsforlikes #instalike #likeforlikes #spam4spam #s4s #gainpost #gaintrain #teamfollowback #followall #pleasefollow #boostlikes #likes

---
_Estimations indicatives : benchmarks publics 2025–2026 (seo/data/research). À recaler sur vos données (Search Console, GA4, comptes publicitaires)._
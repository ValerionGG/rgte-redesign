# Leçons de terrain (chantier RaceLink, octobre-novembre 2026)

Ce qui a servi sur un vrai chantier (site + App Store + Google Play), tiré des packs relus (claude-seo, marketingskills, aso-skills) et vérifié à la main. À appliquer tel quel ; les erreurs trouvées dans ces packs sont listées en bas.

## 1. La forme d'un audit qui se lit et s'exécute

- **Une ligne en tête** : « 0 point corrigé sur 23 », ou la note, puis ce qui a bougé depuis la dernière mesure (tableau avant / après / lecture).
- **Un tableau par gravité** (Critique, Fort, Moyen, Bonus). Colonnes : n°, ce qui manque, **preuve datée** (ce qui a été vu, où), qui, temps, fichier ou correctif.
- **« Pas mesuré aujourd'hui »** : ce qui n'a pas pu être lu, et pourquoi.
- Un point passe à « corrigé » **seulement quand la correction est vue en ligne**. Remesurer avant d'agir : les faits ont une date.
- La conversion d'abord : un bouton qui ne mène nulle part coûte plus que n'importe quelle balise. Vérifier où mène chaque bouton principal.

## 2. Site : règles vérifiées

| Sujet | Règle |
|---|---|
| Domaine | Une seule version (www ou non), **301 en un seul saut**. Un ancien domaine qui sert encore une copie du site : le rediriger. Après une refonte, rediriger les anciennes adresses qui faisaient du trafic. |
| Canonical | Sur chaque page, vers elle-même. Les balises et le contenu sont dans le HTML envoyé par le serveur. |
| robots.txt | Il cite le sitemap. |
| Sitemap | Seulement des pages qui répondent 200 et sont canoniques ; `lastmod` vrai. Google ignore `priority` et `changefreq`. |
| Partage | `og:url` et `og:image` sur le bon domaine (contrôle `og-foreign` de la CLI). |
| Boutons | Aucun lien vers un site de test (`staging-links`) ; les boutons « Télécharger » mènent aux stores (`store-links`). UTM en minuscules, toujours les mêmes mots. |
| Images | Poids visés : moins de 50 Ko (vignette), 100 Ko (contenu), 200 Ko (grande image). WebP ou AVIF, `width` et `height` renseignés, pas de chargement différé sur la grande image du haut. Texte alternatif de 10 à 125 caractères ; `alt=""` pour le décoratif. |
| Serveur | Compression (gzip ou brotli) et cache long sur les fichiers statiques : deux réglages de 15 minutes. |
| Vitesse | Seuils : LCP ≤ 2,5 s, INP ≤ 200 ms, CLS ≤ 0,1. Distinguer le test (laboratoire) des vrais visiteurs (terrain). |
| Données structurées | JSON-LD seulement, un `@graph` avec des `@id`, rien d'invisible pour le visiteur. Les résultats enrichis FAQ et HowTo ne s'affichent plus : ne pas les promettre. Types utiles : Organization, WebSite, BreadcrumbList, Product, LocalBusiness, Event, JobPosting, ProfilePage, MobileApplication. |
| Indexation | Search Console en propriété de domaine. Une demande d'indexation par page. L'API Indexing est réservée aux offres d'emploi (`JobPosting`) et aux directs. |
| Pages en série (pilotes, villes, produits) | Au moins 40 % de contenu propre et environ 300 mots par page ; publier par paquets de 20 à 50, puis 50 à 100 ; `noindex` si la page est trop pauvre ; 3 à 5 liens internes ; URL en minuscules avec des tirets. |
| Nom de marque partagé | Si d'autres produits portent le même nom, toujours écrire le nom complet (« Marque, ce que c'est ») et relier les profils officiels (`sameAs`). |
| Accueil | Le H1 dit ce qu'est le produit (le nom et la catégorie). Un bloc « c'est quoi » et des questions-réponses visibles. |

## 3. Mesurer quand le terminal n'a pas accès au web

- La CLI passe par Jina Reader, ou lit un fichier fourni (`--html`, `--robots`).
- Sinon : lire le site dans le navigateur de l'utilisateur, et la vitesse sur pagespeed.web.dev.
- Ne jamais contourner un site ou un store qui refuse la lecture automatique : le mesurer depuis l'ordinateur de l'utilisateur.

## 4. Précautions avec les packs tiers

| Pack | Précaution |
|---|---|
| claude-seo (`audit-seo-avance`) | Sa connexion Google demande Search Console en lecture **et écriture**, Indexing et Analytics : préférer un compte de service en lecture seule. Retirer le pied de page publicitaire (« Community Footer ») des livrables. Ne pas installer les extensions Bing et Ahrefs (clés écrites en clair). Refuser `sudo apt install` et la réécriture d'images en place (`seo-images`). Passer par le plugin, pas par `install.sh`. |
| aso-skills | Ne pas brancher le service Appeeky (il demande la clé App Store Connect). Mode manuel : coller les textes des fiches. |
| marketingskills | Ignorer les mentions de partenaires payants. Ne pas lancer `teardown.mjs` sur une adresse interne. |
| Tous | Noter le commit relu et relire avant chaque mise à jour. Une skill tourne avec les mêmes droits que Claude. |

## 5. Erreurs trouvées dans ces packs (ne pas les répéter)

- Mots-clés Apple comptés en caractères : Apple compte en **octets** (voir le skill `aso-application`).
- Grille de note ASO dont les poids font 110 % : s'en servir comme liste de points, pas comme note.
- Demander « Tu aimes l'app ? » avant la fenêtre de note : interdit par les consignes Android.
- « Les notes se remettent à zéro à chaque version » : faux, c'est un choix du développeur.
- Rien sur la « Sécurité des données » de Google Play ni sur l'étiquette de confidentialité d'Apple : les vérifier à part, une fausse déclaration peut bloquer les mises à jour.

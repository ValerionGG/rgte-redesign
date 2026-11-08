# Gabarits de pages

Lire ce fichier à l'étape 2 du skill, et seulement la section du gabarit choisi. Les longueurs sont des repères à ajuster au type de page dominant dans les résultats, pas des quotas.

## Sommaire

1. Page service
2. Page ville (ou zone)
3. Comparatif
4. Guide pratique
5. FAQ
6. Étude de cas

## 1. Page service

But : convertir une recherche « service + ville » ou « service » en contact.

- **H1** : service + ville ou zone (« Pose de pompe à chaleur à Rennes »).
- **Bloc d'ouverture** (au-dessus de la ligne de flottaison) : promesse, preuve courte (années, nombre de réalisations, note des avis), bouton d'appel cliquable et bouton devis.
- **Intertitres-questions** : « Combien coûte … à … ? », « En combien de temps … ? », « Quelles aides … ? » (sans montant inventé : renvoyer vers la source officielle), « Pourquoi nous choisir ? ».
- **Preuves** : 3 réalisations avec photo, lieu et date ; avis réels ; labels et certifications vérifiables.
- **Objections** : prix, délais, garanties, déroulé.
- **Données structurées** : `Service` avec `provider` (LocalBusiness ou Organization), `areaServed` ; BreadcrumbList.
- **Repère** : 600 à 1 200 mots.
- **Pièges** : liste de services sans détail, prix « à partir de » sans condition, absence de téléphone sur mobile.

## 2. Page ville (ou zone)

But : se positionner sur une ville où l'entreprise intervient vraiment.

- **H1** : service + ville.
- **Contenu local obligatoire** : réalisations dans la ville (photos, quartier, date), délais d'intervention depuis l'agence, avis de clients de la ville, particularités locales (types de logements, règles d'urbanisme, accès, stationnement).
- **Données structurées** : `Service` avec `areaServed` = la ville ; pas de faux `LocalBusiness` à une adresse où l'entreprise n'est pas.
- **Repère** : 400 à 800 mots, dont au moins la moitié propre à la ville.
- **Garde-fou** : alerte dès 30 pages ville ; arrêt au-delà de 50 sans contenu local réel, et regroupement par zone.

## 3. Comparatif

But : répondre à « meilleur … », « … ou … », « comparatif … ».

- **H1** : la question exacte (« Pompe à chaleur air-eau ou air-air : laquelle choisir ? »).
- **Réponse en 2 phrases** dès l'introduction, puis tableau HTML comparatif (critères en lignes, options en colonnes).
- **Méthode affichée** : critères, sources, date du test ou de la mise à jour, lien d'intérêt éventuel (vous vendez l'une des options).
- **Liste « meilleurs X »** : 10 à 20 options quand le sujet le permet (Seer Interactive, 2026), chacune avec pour qui elle convient.
- **Données structurées** : `Article` (`author`, `dateModified`) ; `ItemList` pour une liste classée.
- **Repère** : 1 000 à 2 000 mots selon les pages qui se classent.

## 4. Guide pratique

But : répondre à « comment … », « que faire si … », et nourrir les réponses IA.

- **H1** : la question.
- **Réponse directe** de 40 à 60 mots, puis étapes numérotées, matériel, durée, coût indicatif sourcé, erreurs fréquentes, quand appeler un professionnel (lien vers la page service).
- **Expérience** : photos de chantier, astuce de terrain, auteur identifié avec sa fonction.
- **Données structurées** : `Article` (`author`, `datePublished`, `dateModified`). Pas de HowTo : ce résultat enrichi a été retiré en 2023.
- **Repère** : 800 à 1 800 mots.

## 5. FAQ

But : regrouper les vraies questions de clients, chacune avec sa réponse courte.

- 5 à 8 questions réelles (Search Console, veille sociale, questions reçues par téléphone), formulées comme les clients les posent.
- Réponse de 40 à 60 mots, autonome, avec un lien vers la page qui développe.
- Une question qui mérite plus de 300 mots devient sa propre page (« 1 question = 1 page »).
- **Données structurées** : FAQPage n'apporte plus de résultat enrichi Google depuis le 07/05/2026 ; le garder ou non est neutre, ne pas le présenter comme un gain.

## 6. Étude de cas

But : prouver par un exemple réel (utile en B2B et pour les travaux).

- **H1** : résultat + client ou contexte (exemple de forme : « Rénovation énergétique d'une longère à Vitré : −45 % de consommation »), avec des chiffres fournis par l'entreprise et vérifiables.
- **Plan** : situation de départ, contraintes, solution, déroulé, résultats chiffrés, avis du client (avec son accord), photos avant/après.
- **Données structurées** : `Article` ; `Review` seulement pour un avis réellement collecté.
- **Repère** : 600 à 1 200 mots.
- **Piège** : chiffre de résultat non mesuré ou client non consentant.

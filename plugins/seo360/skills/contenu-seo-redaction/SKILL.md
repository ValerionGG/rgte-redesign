---
name: contenu-seo-redaction
description: Rédaction SEO qui se classe et que les IA citent : brief (intention, type de page dominant, vraies questions, ce que le top 3 ne couvre pas), gabarits (page service, page ville, comparatif, guide, FAQ), écriture « réponse d'abord », chiffres vérifiés, relecture anti-tics d'IA, mise à jour des pages en déclin. À utiliser pour « écris-moi une page », « article de blog », « page pour ma ville », « texte pour mon site », « réécris ma page », « redaction seo ». Posts et vidéos → contenus-reseaux-video.
metadata:
  version: "1.0"
---

# Rédaction SEO : pages et articles

> **Contexte d'abord** : si `.claude/contexte-entreprise.md` existe, le lire avant toute question et ne demander que ce qui manque ; y enregistrer les nouvelles réponses. Sinon, proposer de le créer avec le skill `contexte-entreprise` (2 minutes).

Annoncer au début : « Je fais le brief, puis le texte, puis le contrôle avant publication. Je ne publie rien moi-même. »

## Règles essentielles

1. **Une intention = une page.** Avant d'écrire, vérifier qu'aucune page du site ne vise déjà cette requête (Search Console, ou `site:domaine.fr requête`). Sinon, mettre à jour la page existante plutôt qu'en créer une concurrente.
2. **Le type de page dominant décide du format.** Regarder les 10 premiers résultats de la requête (navigation privée, ville de l'entreprise) : fiches service locales, comparatifs, guides, fiches produit, vidéos, forums. Si Google montre surtout des comparatifs, une page service ne s'y classera pas telle quelle.
3. **L'expérience réelle fait la différence** : chantiers, photos, prix pratiqués, délais, cas clients, auteur identifié. C'est ce que le top 3 n'a pas.
4. **Aucun chiffre de mémoire.** Chaque statistique est reliée à une source lue (URL et date) ; sinon la marquer « non vérifié » ou la retirer. Les chiffres de l'entreprise viennent du contexte entreprise ou de l'utilisateur.
5. **La voix de la marque** vient du contexte entreprise (ton, allégations autorisées, histoires). Écrire pour le lecteur, sans bourrage de mots-clés.

## Étape 1 — Brief (à remplir avant d'écrire)

| Champ | Contenu |
|---|---|
| Requête cible | ex. « pose pompe à chaleur rennes » |
| Intention | information, comparaison, achat, local |
| Type de page dominant | vérifié le … (ou « non vérifié ») |
| Vraies questions | « Autres questions posées », suggestions Google, Search Console, veille sociale |
| Ce que le top 3 ne couvre pas | l'angle à prendre |
| Preuves disponibles | chiffres, photos, avis, réalisations |
| Maillage | 1 lien vers la page pilier, 2 liens vers des pages voisines, 2 liens entrants à ajouter depuis des pages existantes |
| Appel à l'action | devis, appel, réservation, achat |
| Données structurées | selon le gabarit |

Sources des vraies questions : `node "${CLAUDE_SKILL_DIR}/../../seo/cli.mjs" veille "<sujet>"` (skill veille-sociale), les suggestions Google de l'interface (onglet Mots-clés & réseaux), les requêtes de Search Console (`node "${CLAUDE_SKILL_DIR}/../../seo/cli.mjs" gsc export.zip`).

## Étape 2 — Choisir le gabarit

Gabarits détaillés : [references/gabarits.md](references/gabarits.md) (page service, page ville, comparatif, guide pratique, FAQ, étude de cas).

Garde-fou pages ville : à partir de 30 pages ville, alerter (risque de pages satellites) ; au-delà de 50 sans contenu local réel (réalisations, photos, avis, accès, prix locaux), arrêter et regrouper par zone. Ces seuils sont des heuristiques.

## Étape 3 — Rédiger « réponse d'abord »

- Intertitre = une vraie question. Juste dessous, une réponse directe de 40 à 60 mots qui se comprend seule : sujet nommé (pas « il » ou « cela » renvoyant plus haut), un fait précis. Puis les détails, une liste ou un tableau HTML, un exemple réel.
- Blocs autonomes de 50 à 200 mots : c'est ce que l'audit note dans le constat « citabilité » et ce que les IA reprennent.
- Introduction : la promesse et la réponse courte en 2 phrases. Pas de « Dans cet article, nous allons voir ».
- Comparatifs : selon Seer Interactive (2026), les listes qui progressent dans les citations de ChatGPT comptent 10 à 20 options, celles qui reculent 5 à 8 (https://www.seerinteractive.com/insights/the-listicle-window-is-closing-in-ai-search-30-decline-mom). Rester honnête sur les concurrents.
- Fraîcheur : selon Seer (mars-juin 2026, 47 097 citations), 75 % des pages citées par les IA avaient été mises à jour depuis moins d'un an (https://www.seerinteractive.com/insights/study-content-recencys-impact-on-ai-visibility-in-2026). Mettre à jour vaut mieux que republier.
- Viser à devenir la source primaire d'un chiffre : baromètre des prix locaux, données de chantiers, mini-étude auprès des clients.

## Étape 4 — Relire

- **Tics d'IA, jugés à la densité et non mot par mot** : connecteurs en série (« de plus », « en effet », « par ailleurs »), formules creuses (« il est important de noter », « n'hésitez pas à », « dans un monde où »), superlatifs vides (« incontournable », « véritable »), triplets d'adjectifs, tirets cadratins en rafale, conclusion « En résumé ». Plus d'un tic par paragraphe en moyenne : réécrire.
- Phrases courtes, verbes concrets, exemples locaux.
- Allégations encadrées (santé, prix barrés, « n° 1 », écologie) : voir conformite-marketing-fr.

## Étape 5 — Porte de publication

- [ ] Texte visible sans JavaScript (l'audit le vérifie : constat `js-render`).
- [ ] Title unique de 50 à 60 caractères avec la requête ; meta description unique de 140 à 155 caractères.
- [ ] Un seul H1 ; intertitres en vraies questions.
- [ ] Données structurées du gabarit (Service ou LocalBusiness, Article avec `author` et `dateModified`, Product, BreadcrumbList). FAQPage : plus aucun résultat enrichi Google depuis le 07/05/2026 (https://www.searchenginejournal.com/google-drops-faq-rich-results/574429/), neutre ailleurs ; ne pas le présenter comme un gain.
- [ ] `dateModified` réelle (jamais de fausse date de mise à jour).
- [ ] Images : `alt` descriptif, `width` et `height`, format WebP ou AVIF, pas de chargement différé sur la première image.
- [ ] Liens internes du brief posés, dont les 2 liens entrants.
- [ ] Chaque chiffre est sourcé ou marqué « non vérifié ».
- [ ] Sitemap à jour, IndexNow (Bing), Inspection d'URL puis « Demander une indexation » dans Search Console.

Verdict : **bloquer** si le texte est invisible sans JavaScript, si un chiffre ou un avis est inventé, si une allégation n'est pas prouvée ou si la page double une page existante ; **corriger** s'il manque un point de la liste ; **publier** sinon. Après publication : `node "${CLAUDE_SKILL_DIR}/../../seo/cli.mjs" <url-de-la-page>`, puis contrôle des positions à J+28.

## Étape 6 — Mettre à jour plutôt que multiplier

- Pages en déclin (comparaison de deux exports : `node "${CLAUDE_SKILL_DIR}/../../seo/cli.mjs" gsc actuel.zip --avant precedent.zip`) : actualiser les données, les exemples et la date.
- Plusieurs pages sur la même requête : fusionner dans la meilleure (redirection 301 et liens internes mis à jour) ; canonical seulement si les deux pages doivent rester en ligne.
- Code 410 en dernier recours : page sans valeur, sans lien et sans trafic.
- Revue chaque trimestre des pages sans impression depuis 6 mois (heuristique).

## Livrer

Le brief rempli, le texte (avec title, meta description, intertitres, maillage et données structurées), la porte de publication cochée avec son verdict, les chiffres à vérifier et la prochaine action.

## Quand ne pas l'utiliser

- Posts, Reels, TikTok, scripts vidéo → `contenus-reseaux-video`.
- Audit technique d'une page existante → `seo-audit-technique`.
- Textes de la fiche Google → `seo-local`.
- Annonces publicitaires et budget → `budget-publicite`.
- Fiche App Store ou Google Play → `aso-application`.

## Terminé quand

- [ ] Le brief est rempli et le type de page dominant est vérifié (ou noté « non vérifié »).
- [ ] Le texte est livré avec title, meta description, intertitres et maillage.
- [ ] Chaque chiffre est sourcé ou marqué.
- [ ] La porte de publication est cochée, avec un verdict.
- [ ] La prochaine action est donnée (publication, contrôle à J+28).

## Jamais

- Inventer un chiffre, un avis, un client, une réalisation ou un diplôme.
- Copier ou paraphraser de près le texte d'un concurrent.
- Générer des dizaines de pages ville identiques au nom de la ville près.
- Promettre une position ou une citation par une IA.
- Publier sans la validation du dirigeant.

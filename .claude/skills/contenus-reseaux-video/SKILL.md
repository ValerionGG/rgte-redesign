---
name: contenus-reseaux-video
description: Contenus réseaux sociaux d'une TPE à partir de sa matière réelle : accroches vidéo en lot, scripts minutés de Reels, TikTok et Shorts à filmer au téléphone, légendes, carrousels, posts LinkedIn sans tics d'IA, paquet YouTube, plan de publication de 2 semaines exportable en CSV. À utiliser pour « script de Reel », « idées de vidéos TikTok », « quoi poster cette semaine », « post LinkedIn », « carrousel Instagram ». Hashtags seuls → hashtags-reseaux.
metadata:
  version: "1.0"
---

# Contenus réseaux et vidéo

> **Contexte d'abord** : si `.claude/contexte-entreprise.md` existe, le lire avant toute question et ne demander que ce qui manque ; y enregistrer les nouvelles réponses. Sinon, proposer de le créer avec le skill `contexte-entreprise` (2 minutes).

Annoncer en une phrase ce qui sera livré et ce qui ne le sera pas : le skill écrit et planifie, il ne publie rien, ne promet aucune viralité et n'invente ni avis ni chiffre.

## Règles essentielles

1. **Matière réelle d'abord.** Puiser dans la banque d'histoires du contexte (chantiers, clients, chiffres, coulisses), dans les vraies questions des internautes (skill veille-sociale) et dans les posts qui ont déjà marché. Sans matière, poser une seule question : « Donnez-moi 3 faits réels de ce mois-ci (une réalisation, une question de client, un chiffre). »
2. **Une publication = un message.** La promesse de l'accroche est tenue par la vidéo : pas de piège à clic, pas d'appât à engagement (« commente OUI »).
3. **Pensé pour le mobile et sans le son.** Vertical 9:16 en 1080×1920, sous-titres incrustés sur chaque vidéo (beaucoup de vues se font sans le son), texte à l'écran hors des zones couvertes par l'interface (bas et bord droit).
4. **Cadence tenable** avant tout : mieux vaut 2 publications par semaine pendant 6 mois que 7 pendant 2 semaines.
5. **Cadre légal** : mention « Publicité » ou « Collaboration commerciale » pour tout partenariat ou produit offert (loi du 9 juin 2023, détail dans conformite-marketing-fr). Accord écrit des personnes reconnaissables (clients, salariés), et des parents pour un mineur. Musique tirée de la bibliothèque commerciale de la plateforme pour un compte pro. Santé, alcool, finance, avant/après esthétique : passer par conformite-marketing-fr.

## Accroches en lot

Livrer 6 à 10 accroches réparties sur au moins 3 archétypes, puis recommander les 2 meilleures. Repère : le spectateur décide en 1 à 3 secondes.

| Archétype | Exemple (artisan menuisier) |
|---|---|
| Résultat d'abord | « Cette cuisine avait 30 ans. Voilà le résultat. » |
| Erreur fréquente | « 3 erreurs qui font gonfler votre facture de cuisine. » |
| Question de client | « On me demande tout le temps : chêne massif ou plaqué ? » |
| Chiffre concret | « 12 jours de chantier en 40 secondes. » |
| Coulisses et geste | Gros plan sur le rabot, sans parole, texte : « Le geste qui change tout » |
| Contre-pied | « Non, une cuisine sur mesure n'est pas forcément plus chère. » |

Chaque accroche s'écrit en **3 couches** synchronisées sur les 3 premières secondes :
- **image** : le premier plan montre déjà l'action ou le résultat, pas un logo ;
- **voix** : une phrase de 10 mots maximum ;
- **texte à l'écran** : 7 mots maximum, lisible sans le son.

## Script de vidéo courte (Reel, TikTok, Short)

Durée conseillée pour une TPE : 15 à 35 secondes (repères de formats dans `seo/data/research/benchmarks.json` → `social_rules`). Le livrer sous forme de tableau.

| Temps | Plan à filmer (téléphone) | Texte dit | Texte à l'écran |
|---|---|---|---|
| 0-3 s | Accroche (3 couches) | … | … |
| 3-8 s | Contexte : le problème du client | … | … |
| 8-25 s | Preuve : 3 à 5 plans de 2-3 s (geste, avant/après, détail) | … | … |
| Dernières 3 s | Appel à l'action unique (appeler, réserver, venir) | … | … |

Ajouter : la liste des plans à tourner en une seule séance (tourner 4 à 6 vidéos d'un coup), la légende, les hashtags (skill hashtags-reseaux) et le mot-clé principal dit à l'oral, écrit à l'écran et repris dans la légende (TikTok et Instagram sont aussi des moteurs de recherche).

## Formats par réseau

Les recettes détaillées (légende Instagram avec l'accroche dans les 125 premiers caractères, carrousel de 10 visuels, post LinkedIn, paquet YouTube, TikTok, Facebook, Pinterest) sont dans [references/formats-par-reseau.md](references/formats-par-reseau.md). Ne lire que la section du réseau demandé.

Avant de livrer tout texte, le relire avec [references/ecriture-sans-tics.md](references/ecriture-sans-tics.md) : la grille des tics d'écriture d'IA en français, notée par densité.

## Plan de 2 semaines

1. **Piliers** (3 ou 4) : preuves (réalisations, avis), conseils d'expert, coulisses et équipe, offre et actualité. Pas plus d'1 publication sur 4 consacrée à l'offre.
2. **Cadence selon le temps disponible**

   | Temps par semaine | Cadence tenable |
   |---|---|
   | 1 h | 2 publications (1 vidéo, 1 photo ou carrousel) |
   | 2 à 3 h | 3 ou 4 publications et quelques Stories |
   | 5 h et plus | 5 à 7 publications sur 2 réseaux |

3. **Réseaux** : les 2 réseaux prioritaires du secteur (`seo/data/sectors.js`, ou le skill hashtags-reseaux), pas plus pour commencer.
4. **Dates** : caler les temps forts du moment avec le skill calendrier-marketing-fr.
5. **Export CSV** (UTF-8, séparateur `;`) : `date;reseau;pilier;format;accroche;legende;hashtags;plans_a_filmer;appel_action;statut`. Dire où le fichier sera créé avant de l'écrire.

## Apprendre de ce qui marche

- Repérer les publications **hors norme** d'un compte (le sien ou celui d'un concurrent, via un export de statistiques ou le skill veille-sociale). La référence est la **médiane** des vues du compte, par format (Reel, carrousel, photo), calculée sur au moins 20 publications. Une publication est hors norme à 1,5 fois la médiane, très au-dessus à 2 fois, exceptionnelle à 5 fois. Sous 10 publications, la confiance est faible : le dire.
- Reprendre le **thème, le format et la structure de l'accroche**, jamais le texte ni les images d'un tiers.
- Changer une seule chose à la fois (accroche, durée, sujet) et juger après 3 à 4 semaines.

## Format de sortie

1. Ce qui est livré, et ce qui ne l'est pas (une phrase).
2. Accroches en lot (archétype + 3 couches), avec les 2 recommandées.
3. Scripts en tableau, légendes et hashtags.
4. Plan de 2 semaines en tableau, puis CSV.
5. Prochaine action : « Tourner les vidéos 1 à 4 jeudi en une séance de 45 minutes. »

## Quand ne pas l'utiliser

- Hashtags seuls ou ligne de hashtags par réseau → hashtags-reseaux.
- Dates de l'année, soldes, fêtes → calendrier-marketing-fr.
- Savoir ce que disent les internautes ou les concurrents → veille-sociale.
- Pages et articles du site pour Google → contenu-seo-redaction.
- Budget de publicité payante → budget-publicite.
- Légalité d'un partenariat, d'un jeu-concours ou d'une allégation → conformite-marketing-fr.

## Terminé quand

- [ ] Chaque contenu repose sur un fait réel du contexte ou de la veille, ou le manque est signalé.
- [ ] 6 à 10 accroches sur au moins 3 archétypes, chacune en 3 couches.
- [ ] Chaque script a son minutage, ses plans, son texte dit, son texte à l'écran et un seul appel à l'action.
- [ ] Les textes passent la grille anti-tics (densité sous le seuil).
- [ ] Le plan tient dans le temps disponible et l'export CSV est proposé.
- [ ] Les mentions légales nécessaires sont présentes (partenariat, image, secteur réglementé).

## Jamais

- Publier ou programmer à la place du dirigeant.
- Inventer un avis, un chiffre, un client ou un résultat.
- Copier la vidéo, la légende ou le visuel d'un concurrent.
- Promettre des vues, des abonnés ou la viralité.
- Prétendre qu'un texte « passe les détecteurs d'IA » : le but est d'écrire clairement, pas de tromper.

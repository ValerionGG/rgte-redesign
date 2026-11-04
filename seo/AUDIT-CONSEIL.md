# Audit de SEO 360 par un conseil d’agents (4 novembre 2026)

Demande : « Atteins un objectif meilleur, fais auditer ta solution en termes d’UX et d’efficacité, et trouve mieux. »

## Méthode

1. **Cinq audits indépendants** de la v1, sans que les experts se voient, chacun avec un point de vue différent. Tous ont réellement utilisé le produit (Playwright en 1366 et 390 px, ligne de commande, pages pièges) et prouvé leurs constats (fichier:ligne, captures, scripts) :
   - un dirigeant de PME non expert ;
   - un designer produit ;
   - un consultant SEO/SEA ;
   - un avocat du diable (robustesse et sécurité) ;
   - un visionnaire.
2. **Relecture croisée à l’aveugle** : cinq relecteurs ont noté les cinq audits, anonymisés A à E, sur une grille commune. Ils ont vérifié les constats dans le code et signalé les erreurs de fait. La grille :

   | Critère | Poids |
   |---|---:|
   | Justesse | 25 |
   | Impact | 25 |
   | Faisabilité | 20 |
   | Ambition | 15 |
   | Priorisation | 15 |

3. **Synthèse** : l’audit gagnant sert d’ossature. On y greffe le meilleur des autres, on corrige les erreurs signalées et on traite les manques communs. Tout est ensuite implémenté et testé.
4. **Critique finale indépendante** : un dernier agent, qui n’a rien vu du processus, compare l’ancienne et la nouvelle version à l’aveugle (X / Y).

## Tableau du conseil

| Perspective | Score /100 | Rang | Ce qu’on a gardé |
|---|---:|---:|---|
| Dirigeant de PME (utilisateur final) | 86,2 | 1 | L’ossature : « Vos 3 actions cette semaine » avec qui, durée et coût ; verdict budget en une phrase (marge, taux de signature) ; mode simple ; glossaire ; import Search Console ; budget non pré-rempli |
| Visionnaire | 85,3 | 2 | La boucle diagnostiquer → corriger → revérifier → prouver ; correctifs prêts à coller (au lieu de 16 % des constats) ; bouton-favori ; lien de partage sans serveur ; historique ; un statut « fait » par constat |
| Designer produit | 81,3 | 3 | En-tête qui masquait les titres ; erreurs effacées par le compteur ; focus perdu ; 10 → 6 onglets ; contrastes WCAG AA ; rapport PDF complet ; restauration du rapport |
| Avocat du diable | 80,0 | 4 | Couche de vérité : `rgte.fr` pris pour une app ; montant de 45 € refusé (`step`) ; délais ; injection de code par rapport importé (CSP + vérification) ; proxy Cloudflare ouvert et SSRF ; ISO-8859-1 ; pare-feu ; coût quadratique |
| Consultant SEO/SEA | 76,8 | 5 | Pages pièges et plafonds (noindex, `none`, canonical externe, page vide) ; faux positifs (LocalBusiness, logo, +33, `en-uk`, statut 0) ; budget réaliste (minimum par canal, ±35 %, campagnes App) ; plan trié par gain, local dès la semaine 1 |

**Constat unanime (5 sur 5) :** la v1 affichait une excellente note quand rien n’avait été lu. Par exemple 93/100 « A, excellent socle » avec un proxy en panne, ou 100/100 en mode PageSpeed seul. La cause : une catégorie non mesurée valait 100.

**Garde-fou :** les dix agents sont le même modèle, donc un accord unanime n’est pas une preuve à lui seul. Ce constat-là a toutefois été reproduit par script et dans le navigateur par plusieurs agents.

**Erreurs relevées par les relecteurs**, corrigées dans la synthèse :
- Des numéros de ligne inexacts dans l’audit SEO.
- « La fiche Google à 90 jours » n’était vrai qu’à moitié.
- Un panier de 45 € restait possible dans le navigateur, mais l’application ne disait rien.
- Le bouton-favori ne doit pas envoyer seulement le DOM rendu, sinon il masque le problème JavaScript. Il envoie donc les deux.
- Il ne faut pas stocker de clé IA tant que l’import permet d’injecter du code.

**Manques communs traités :**
- Les skills : mis à jour.
- Les modes App et GitHub : une fiche Play mal lue n’est plus notée.
- L’export Search Console est un ZIP : il est lu tel quel.
- La base CPC « US ajustée » : vous pouvez saisir votre CPC réel.
- Les données des hashtags : chaque hashtag renvoie vers sa page sur le réseau.
- La confidentialité du proxy par défaut : c’est désormais dit clairement.
- Le budget 0 € remplacé par 1 000 €.
- Les faux positifs http/www en mode code collé.

## Critique finale indépendante (à l’aveugle)

Un agent qui n’avait rien vu du processus a comparé les deux versions, présentées comme « X » et « Y » sans savoir laquelle était la nouvelle. Il a testé dans le navigateur (1366 et 390 px), avec la ligne de commande et avec des fichiers piégés.

| Critère (poids) | v1 | v2 |
|---|---:|---:|
| Honnêteté (25) | 2/10 | 8/10 |
| Actionnabilité (25) | 4/10 | 7/10 |
| Parcours (20) | 4/10 | 6/10 |
| Décision (15) | 3/10 | 7/10 |
| Robustesse (15) | 2/10 | 7/10 |
| **Total pondéré** | **≈ 31/100** | **≈ 71/100** |

Son verdict : « Y est nettement meilleure […] Dès que la collecte échoue, X affiche 93 à 100/100 ou invente des comparaisons ; Y refuse de noter et dit ce qui manque. »

**Boucle de correction unique** sur ses 5 problèmes restants et ses 4 régressions, chacun vérifié par un test ou dans le navigateur :
- **Mobile** : un correctif ouvert élargissait la page jusqu’à 1 433 px. Elle reste à 390 px, tous correctifs ouverts.
- **Les correctifs corrigent vraiment.** Test « corriger puis revérifier » : le titre et la description proposés ne sont plus signalés au nouvel audit. S’y ajoutent :
  - la marque tirée des données structurées ;
  - le code postal complété depuis le texte ;
  - plus de lazy-loading sur l’image principale.
- **Messages exacts** :
  - limite de l’API GitHub = « non vérifié », plus un défaut ;
  - aucun concurrent lisible = « comparaison impossible » ;
  - « rien n’a pu être mesuré » quand PageSpeed est indisponible.
- **Sécurité** : les clés de catégorie importées sont filtrées et échappées, et un rapport importé sans mesure n’est plus noté.
- **Décision** :
  - mots-clés adaptés au secteur ;
  - champ mot-clé visible d’emblée ;
  - budget affiché comme « pas recommandé » quand ce n’est pas rentable ;
  - plan de lancement limité aux canaux retenus.
- **Régressions réparées** :
  - règles des hashtags dans l’export ;
  - plan exhaustif (aucun constat masqué) ;
  - la ligne de commande s’annonce « SEO360-Audit » et ne passe en navigateur que si le site refuse, ce que le rapport signale.
- **Accessibilité** : glossaire lisible au toucher et onglets au clavier.

## Ce qui a changé (v2)

Voir la section « Version 2 » du [README](README.md). En chiffres :
- les tests passent de 8 à 24, dont les pages pièges des experts et la boucle « corriger puis revérifier » ;
- 98 % des constats du rapport d’exemple ont un correctif prêt à coller (16 % en v1) ;
- la fourchette de budget est de ±35 % (jusqu’à ×22 en v1) ;
- 6 onglets au lieu de 10 ;
- 3 champs avant « Analyser » au lieu de 9.

## Ce qui reste à faire (non traité volontairement)

- **Rédaction par IA avec votre propre clé** (titres, descriptions, FAQ) et **panel mensuel de questions aux IA** : proposés par le visionnaire. Non livrés, car impossibles à tester ici (réseau bloqué, pas de clé). C’est la prochaine étape logique, maintenant que l’import est sûr.
- **Corpus de 30 sites français réels** relus à la main, pour mesurer le taux réel de faux positifs (objectif < 5 %).
- **Tests avec 5 dirigeants** : temps entre l’URL et la première action appliquée.
- **Fraîcheur des études** (datées du 3 novembre 2026) : à relancer chaque trimestre (`node seo/data/sync.mjs` après mise à jour des JSON).

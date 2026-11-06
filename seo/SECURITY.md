# Sécurité

## Ce qui est considéré comme hostile

Tout ce que SEO 360 lit vient de l'extérieur : la page auditée, ses robots.txt, sitemap et JSON-LD, les exports Search Console, les rapports importés, les liens de partage, les messages du bouton-favori. Une page piège ne doit ni faire planter l'outil, ni injecter du code, ni fausser un rapport sans que cela se voie.

## Protections en place (version 3.3)

| Risque | Protection | Test |
|---|---|---|
| Texte de la page affiché tel quel (injection HTML) | Tout texte externe est échappé avant affichage | audit du conseil v3 : 643 charges hostiles importées ou partagées, aucune injection |
| JSON-LD imbriqué sur des milliers de niveaux | Bloc refusé au-delà de 64 niveaux, mesuré sans récursion | `robustesse : JSON-LD sur 5 000 niveaux…` |
| « Bombe ZIP » dans un export Search Console | Octets réellement décompressés comptés : 30 Mo par fichier, 60 Mo en tout | `robustesse : … ZIP piégé` |
| Faux audit envoyé par une autre page ouverte | Le bouton-favori n'accepte que les données venant de la page qu'elles décrivent | contrôle d'origine du message |
| Rapport importé ou lien de partage modifié à la main | Types et valeurs vérifiés, mention « note non revérifiée par SEO 360 » | assainissement à l'import |
| Note trop haute quand robots.txt n'a pas été lu | Note provisoire, plafonnée à 79 | `robustesse : … robots.txt non lu` |
| Correctif « prêt à coller » qui casse un site | HSTS par paliers, redirection HTTPS compatible Cloudflare, règle « sauvegarder, une chose à la fois, savoir revenir en arrière » | relecture des modèles |
| Page claude.ai | Aucune connexion externe possible (politique de l'hôte), données réservées au propriétaire | règles de la base : lecture et écriture admin |

## Limites connues

- Un rapport calculé dans le navigateur peut toujours être falsifié par celui qui le fabrique. La mention « non revérifié » le signale, mais seul un nouvel audit fait foi.
- Les proxys publics (AllOrigins, CodeTabs) voient les adresses lues. Pour l'éviter, utilisez votre propre proxy, ou le réglage « Aucune » avec le code collé.
- Le proxy `seo/proxy/` déployé sans clé (`PROXY_KEY`) peut être utilisé par d'autres. Gardez-le pour vous et ajoutez une clé.

## Signaler une faille

Ouvrez un signalement privé dans l'onglet Security du dépôt GitHub (« Report a vulnerability »), ou écrivez au propriétaire du dépôt. Ne publiez pas les détails avant la correction.

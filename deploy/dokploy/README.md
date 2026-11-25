# SEO 360 sur Dokploy

Copie de GitHub Pages sur le Dokploy partagé de M3 (https://dokploy.m3.games), projet **SEO 360**, application
**site**. Site statique : le dossier `docs/` (galerie des maquettes RGTE + plateforme `/seo/`) servi par nginx.
Aucune donnée ni secret ; le serveur est partagé avec d'autres projets : ne toucher qu'au projet SEO 360.

| Réglage | Valeur |
|---|---|
| Type | Application, source **Git** publique `https://github.com/ValerionGG/rgte-redesign.git` |
| Branche | `recherche-enrichissement` (PR #11) tant qu'elle n'est pas fusionnée, puis `main` |
| Build | **Dockerfile**, chemin `deploy/dokploy/Dockerfile`, contexte `.` (racine) |
| Domaine | `seo360.217-160-124-232.nip.io`, port 80, HTTPS Let's Encrypt (nip.io : pas de DNS à créer) |

Mettre à jour : `node build.mjs` (régénère `docs/`), commit, push sur la branche suivie, puis *Deploy* dans Dokploy.

Vérifier :

```
curl -s -o /dev/null -w "%{http_code}\n" https://seo360.217-160-124-232.nip.io/
curl -s -o /dev/null -w "%{http_code}\n" https://seo360.217-160-124-232.nip.io/seo/
curl -s -o /dev/null -w "%{http_code}\n" https://seo360.217-160-124-232.nip.io/seo/engine/demande.js
```

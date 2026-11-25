# SEO 360 et galerie RGTE sur Dokploy : le dossier docs/ (déjà construit par `node build.mjs`) servi par nginx.
# Contexte de construction : la racine du dépôt. Aucune donnée, aucun secret : site statique uniquement.
FROM nginx:1.27-alpine
COPY deploy/dokploy/nginx.conf /etc/nginx/conf.d/default.conf
COPY docs/ /usr/share/nginx/html/
EXPOSE 80
HEALTHCHECK --interval=30s --timeout=3s CMD wget -qO /dev/null http://127.0.0.1/seo/ || exit 1

FROM node:22-alpine
WORKDIR /app
COPY package.json build.mjs ./
COPY docs ./docs
COPY server ./server
ENV NODE_ENV=production PORT=8080 DATA_DIR=/data
RUN mkdir -p /data && chown node:node /data
USER node
VOLUME ["/data"]
EXPOSE 8080
HEALTHCHECK CMD wget -qO- http://127.0.0.1:8080/healthz || exit 1
CMD ["node", "--disable-warning=ExperimentalWarning", "server/index.mjs"]

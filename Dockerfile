FROM node:24-bookworm-slim
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev && mkdir /data && chown node:node /data
COPY --chown=node:node server.js store.js community.js business.js operations.js metrics.js onboarding.js accounting.js shifts.js brand.js linked.js fair.js ./
COPY --chown=node:node public ./public
ENV NODE_ENV=production PORT=5180 DATA_DIR=/data
USER node
VOLUME ["/data"]
EXPOSE 5180
HEALTHCHECK --interval=30s --timeout=5s CMD node -e "fetch('http://127.0.0.1:5180/healthz').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"
CMD ["node","server.js"]









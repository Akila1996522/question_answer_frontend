FROM node:20-alpine AS builder
WORKDIR /app
COPY . .
RUN npm i --legacy-peer-deps

FROM node:20-alpine AS runner
WORKDIR /app

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/next.config.mjs ./next.config.mjs
COPY --from=builder /app/next-env.d.ts ./next-env.d.ts
COPY --from=builder /app/*.json .
RUN chown -R node:node /app

USER node
EXPOSE 3000
CMD ["next", "start"]
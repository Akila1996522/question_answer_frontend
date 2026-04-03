FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm i --legacy-peer-deps

FROM node:20-alpine AS runner
WORKDIR /app

COPY --from=builder /app/node_modules ./node_modules
COPY /app/.next ./.next
COPY /app/public ./public
COPY /app/next.config.mjs ./next.config.mjs
COPY /app/next-env.d.ts ./next-env.d.ts
COPY /app/*.json .
RUN chown -R node:node /app

USER node
EXPOSE 3000
CMD ["next", "start"]
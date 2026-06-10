# syntax=docker/dockerfile:1

# ---------- Builder ----------
# Gera o bundle standalone (next build) + client Prisma. Precisa das devDeps.
FROM node:22-alpine AS builder
WORKDIR /app

# O hook `prepare` (husky) não deve rodar no build — não há .git na imagem.
ENV HUSKY=0

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

# `generateStaticParams` lê o banco durante o build → DATABASE_URL via secret do
# BuildKit (não fica gravada em nenhuma camada). MINIMAX_API_KEY/GOOGLE_API_KEY
# não são usados no build, apenas em runtime.
RUN --mount=type=secret,id=database_url,required=true \
    DATABASE_URL="$(cat /run/secrets/database_url)" npm run build

# ---------- Runner ----------
# Imagem final mínima: apenas o artefato standalone auto-suficiente.
FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production \
    PORT=3000 \
    HOSTNAME=0.0.0.0 \
    NEXT_TELEMETRY_DISABLED=1

# Usuário sem privilégios.
RUN addgroup -g 1001 -S nodejs && adduser -u 1001 -S nextjs -G nodejs

# O standalone já embute o server.js e o mínimo de node_modules (inclui o client
# Prisma compilado e o driver pg). static/ e public/ entram à parte.
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

USER nextjs
EXPOSE 3000

CMD ["node", "server.js"]

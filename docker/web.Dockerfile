FROM node:22-alpine AS builder
WORKDIR /app

RUN corepack enable && corepack prepare pnpm@9.0.0 --activate

COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./
COPY apps/web ./apps/web
COPY packages ./packages

RUN pnpm install --filter web...
RUN pnpm -C apps/web build

FROM node:22-alpine AS runner
WORKDIR /app

RUN corepack enable && corepack prepare pnpm@9.0.0 --activate

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/web/.next ./apps/web/.next
COPY --from=builder /app/apps/web/package.json ./apps/web/package.json
COPY --from=builder /app/apps/web/public ./apps/web/public

ENV NODE_ENV=production
CMD ["pnpm", "-C", "apps/web", "start"]

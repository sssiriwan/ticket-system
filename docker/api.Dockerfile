# ---------------------------
# Build stage
# ---------------------------
FROM node:22-alpine AS builder
WORKDIR /app

RUN corepack enable && corepack prepare pnpm@9.0.0 --activate

# workspace + sources
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./
COPY apps/api ./apps/api
COPY packages ./packages

# insatll deps devDeps api
RUN pnpm install --filter ./apps/api...

# Build NestJS 
WORKDIR /app/apps/api
RUN pnpm build

# ---------------------------
# Runtime stage
# ---------------------------
FROM node:22-alpine AS runner
WORKDIR /app

RUN corepack enable && corepack prepare pnpm@9.0.0 --activate

# install production deps api
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./
COPY apps/api/package.json ./apps/api/package.json
RUN pnpm install --filter ./apps/api... --prod

#copy prisma schema 
COPY --from=builder /app/apps/api/prisma ./apps/api/prisma

# generate Prisma Client ใน runtime
WORKDIR /app/apps/api
RUN pnpm exec prisma generate --schema=./prisma/schema.prisma

# copy build output 
WORKDIR /app
COPY --from=builder /app/apps/api/dist ./apps/api/dist

ENV NODE_ENV=production
CMD ["node", "apps/api/dist/main.js"]
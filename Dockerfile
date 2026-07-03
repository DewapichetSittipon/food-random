# ---- build ----
FROM node:22-alpine AS build
RUN corepack enable
WORKDIR /app

COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY packages/shared/package.json packages/shared/
COPY apps/api/package.json apps/api/
COPY apps/web/package.json apps/web/
RUN pnpm install --frozen-lockfile

COPY . .
RUN pnpm --filter @fridgechef/web build \
  && cd apps/api && pnpm exec prisma generate

# ---- run ----
FROM node:22-alpine
RUN corepack enable
ENV NODE_ENV=production
ENV WEB_DIST=/app/apps/web/dist
WORKDIR /app
COPY --from=build /app ./

WORKDIR /app/apps/api
EXPOSE 3000
# migrate ทุกครั้งที่บูต, seed เฉพาะเมื่อ DB ว่าง (ensure-seed), แล้วค่อยสตาร์ทเซิร์ฟเวอร์
CMD ["sh", "-c", "pnpm exec prisma migrate deploy && pnpm exec tsx prisma/ensure-seed.ts && pnpm exec tsx src/index.ts"]

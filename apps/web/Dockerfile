# Build-Context: Repository-Wurzel (npm-Workspaces).
FROM node:22-slim AS builder
WORKDIR /app

# Manifeste zuerst fuer besseres Layer-Caching.
COPY package.json package-lock.json ./
COPY apps/web/package.json apps/web/package.json
COPY packages/contracts/package.json packages/contracts/package.json
COPY packages/ui/package.json packages/ui/package.json
RUN npm ci

COPY . .
RUN npm run build --workspace @bundesmonitor/web

FROM node:22-slim AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app /app
EXPOSE 3000
CMD ["npm", "run", "start", "--workspace", "@bundesmonitor/web"]

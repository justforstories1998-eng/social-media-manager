# Backend Dockerfile - Production Ready
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies for Prisma and native modules (argon2, etc.)
RUN apk add --no-cache openssl python3 make g++

COPY package*.json ./
COPY prisma ./prisma/

RUN npm ci

COPY . .

RUN npx prisma generate
RUN npm run build

# Production image
FROM node:20-alpine

WORKDIR /app

# Install runtime dependencies for native modules (argon2, etc.)
RUN apk add --no-cache openssl python3 make g++

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/prisma.config.ts ./
COPY --from=builder /app/package*.json ./

# Create necessary directories
RUN mkdir -p uploads logs

EXPOSE 3001

ENV NODE_ENV=production

CMD ["node", "dist/src/main"]
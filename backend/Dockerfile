# Stage 1: Build TypeScript
FROM node:20-slim AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (including TypeScript and devDependencies needed for build)
RUN npm ci

# Copy TypeScript configuration and source code
COPY tsconfig.json ./
COPY src ./src

# Build production bundle (compiles src/ to dist/)
RUN npm run build

# Stage 2: Production Container for Google Cloud Run
FROM node:20-slim AS runner

WORKDIR /app

# Production environment variables
ENV NODE_ENV=production
ENV PORT=8080

# Copy package manifests
COPY package*.json ./

# Install only production dependencies
RUN npm ci --omit=dev && npm cache clean --force

# Copy compiled JavaScript output from builder stage
COPY --from=builder /app/dist ./dist

# Create local data directory for embedded PGlite fallback if external DB is temporarily unreachable
RUN mkdir -p /app/data && chown -R node:node /app

# Run with non-root security context
USER node

# Cloud Run listens on port 8080 by default
EXPOSE 8080

# Production start command
CMD ["node", "dist/index.js"]

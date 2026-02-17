# ─────────────────────────────────────────────
# Stage 1: Build dependencies
# ─────────────────────────────────────────────
FROM node:18-alpine AS builder

# Sharp and bcryptjs require native build tools
RUN apk add --no-cache python3 make g++ vips-dev

WORKDIR /app

# Copy package files first for better layer caching
COPY package.json package-lock.json ./

# Install all dependencies (including devDependencies for build)
RUN npm ci

# ─────────────────────────────────────────────
# Stage 2: Production image
# ─────────────────────────────────────────────
FROM node:18-alpine AS production

# Runtime dependencies for Sharp
RUN apk add --no-cache vips-dev curl

WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./

# Copy node_modules from builder (already compiled native modules)
COPY --from=builder /app/node_modules ./node_modules

# Copy application source
COPY . .

# Remove any accidentally included sensitive files
RUN rm -f .env .env.* config/*firebase*.json config/*secret*.json config/*.pem

# Create non-root user for security
RUN addgroup -g 1001 -S appgroup && \
    adduser -S appuser -u 1001 -G appgroup

# Create logs directory with correct permissions
RUN mkdir -p logs && chown -R appuser:appgroup logs

# Switch to non-root user
USER appuser

# Expose the application port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD curl -sf http://localhost:3001/health || exit 1

# Start the application
CMD ["node", "--max-old-space-size=4096", "./bin/www"]

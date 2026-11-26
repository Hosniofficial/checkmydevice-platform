# ═══════════════════════════════════════════════════════════════════════
# Multi-stage build for Node.js Backend
# Production-ready Dockerfile for Railway deployment
# ═══════════════════════════════════════════════════════════════════════

# Stage 1: Dependencies
FROM node:20-alpine AS dependencies
WORKDIR /app

# Copy package files
COPY backend/package.json backend/yarn.lock ./

# Install production dependencies using npm (more reliable for Docker builds)
RUN npm install --omit=dev --ignore-scripts

# Stage 2: Production
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Install dumb-init to handle signals properly
RUN apk add --no-cache dumb-init

# Copy node_modules from dependencies stage
COPY --from=dependencies /app/node_modules ./node_modules

# Copy backend source code
COPY backend .

# Create uploads directory
RUN mkdir -p uploads/reports

# Set environment
ENV NODE_ENV=production

# Expose port (Railway will override this)
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:5000/api/system/health', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

# Use dumb-init to run Node process
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "src/server.js"]

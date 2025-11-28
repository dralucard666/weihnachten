# Build Stage - Backend
FROM node:22-alpine AS backend-builder

# Install pnpm
RUN npm install -g pnpm

WORKDIR /app/backend

# Copy backend package files
COPY backend/package.json backend/pnpm-lock.yaml ./

# Install backend dependencies
RUN pnpm install --frozen-lockfile

# Copy backend source and shared types
COPY backend/ ./
COPY shared/ ../shared/

# Build backend TypeScript
RUN pnpm run build

# Build Stage - Frontend
FROM node:22-alpine AS frontend-builder

# Install pnpm
RUN npm install -g pnpm

WORKDIR /app/frontend

# Copy frontend package files
COPY frontend/package.json frontend/pnpm-lock.yaml ./

# Install frontend dependencies
RUN pnpm install --frozen-lockfile

# Copy frontend source and shared types
COPY frontend/ ./
COPY shared/ ../shared/

# Set backend URL for production build (passed from docker-compose.yml)
ARG VITE_BACKEND_URL
ENV VITE_BACKEND_URL=$VITE_BACKEND_URL

# Build frontend
RUN pnpm run build

# Production Stage
FROM node:22-alpine

# Install pnpm
RUN npm install -g pnpm

WORKDIR /app

# Copy backend package files
COPY backend/package.json backend/pnpm-lock.yaml ./

# Install only production dependencies
RUN pnpm install --prod --frozen-lockfile

# Copy built backend from builder stage
COPY --from=backend-builder /app/backend/dist ./dist

# Copy data directory (for questions and media)
COPY --from=backend-builder /app/backend/src/data ./dist/backend/src/data

# Copy built frontend from frontend-builder stage (match server.ts path expectation)
COPY --from=frontend-builder /app/frontend/dist ./dist/frontend/dist

# Expose port
EXPOSE 3000

# Start the server
CMD ["node", "dist/backend/src/server.js"]

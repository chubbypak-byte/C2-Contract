# ==========================================
# Multi-Stage Build Dockerfile for Vite App
# ==========================================

# Stage 1: Build Dependencies and Static Assets
FROM node:22-alpine AS builder

WORKDIR /app

# Install dependencies based on lockfile
COPY package*.json ./
RUN npm ci

# Copy source code and build application
COPY . .
RUN npm run build

# Stage 2: Production Distributable Image
FROM nginx:alpine AS runner

WORKDIR /usr/share/nginx/html

# Clean default nginx files
RUN rm -rf ./*

# Copy built assets from builder stage
COPY --from=builder /app/dist .

# Copy custom nginx configuration for SPA routing if needed
RUN printf 'server {\n\
    listen 80;\n\
    server_name _;\n\
    root /usr/share/nginx/html;\n\
    index index.html;\n\
    location / {\n\
        try_files $uri $uri/ /index.html;\n\
    }\n\
}\n' > /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

# Vision Deficiency Simulator Dockerfile
# Build: docker build -t vision-deficiency-simulator .
# Run: docker run -p 3000:3000 vision-deficiency-simulator

FROM node:22-alpine AS builder

WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.json* ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build
RUN npm run build

# Production stage
FROM node:22-alpine AS runner

WORKDIR /app

# Copy built app
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json

# Set env vars
ENV NODE_ENV=production

# Expose port
EXPOSE 3000

# Start
CMD ["npm", "start"]

# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Copy source code
COPY . .

# Install ALL dependencies (including devDependencies needed for build)
RUN npm ci

# Build the application
RUN npm run build

# Production stage
FROM node:18-alpine as runner

WORKDIR /app
COPY --from=builder /app ./

EXPOSE 3333

CMD ["npm", "run", "start:prod"]

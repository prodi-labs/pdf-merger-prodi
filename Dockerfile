# Stage 1: Build the React application
FROM oven/bun:1.1-slim AS builder
WORKDIR /app

# Copy package manager files
COPY package.json bun.lockb ./

# Install dependencies
# Use --frozen-lockfile to ensure reproducible builds
RUN bun install

# Copy the rest of the application source code
COPY . .

# Build the application for production
RUN bun run build

# Stage 2: Serve the application using Nginx
FROM nginx:stable-alpine AS final

# Copy the built static files from the builder stage to the Nginx server
COPY --from=builder /app/dist /usr/share/nginx/html

# Add a custom Nginx configuration to handle client-side routing for SPAs
# This ensures that refreshing a page or navigating directly to a URL like /editor works correctly.
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80 to the outside world
EXPOSE 8080

# Command to start Nginx in the foreground
CMD ["nginx", "-g", "daemon off;"]

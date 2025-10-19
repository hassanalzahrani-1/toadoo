# Build frontend
FROM node:20-bullseye-slim AS frontend-builder
WORKDIR /frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

# Main image
FROM python:3.11-slim-bookworm
WORKDIR /app

# Install nginx with retry logic
RUN apt-get update --allow-releaseinfo-change || apt-get update || (sleep 10 && apt-get update) && \
    apt-get install --no-install-recommends -y nginx && \
    rm -rf /var/lib/apt/lists/*

# Set up backend
COPY backend/requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

COPY backend/alembic.ini ./alembic.ini
COPY backend/alembic ./alembic
COPY backend/app ./app
COPY backend/make_admin.py ./make_admin.py

# Copy frontend build
COPY --from=frontend-builder /frontend/dist /usr/share/nginx/html

# Copy nginx config
COPY nginx/default.conf /etc/nginx/conf.d/default.conf
RUN rm -f /etc/nginx/sites-enabled/default

# Create data directory and copy database
RUN mkdir -p /app/data && chmod 777 /app/data
COPY data/ /app/data/

# Copy and set up entrypoint script
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

# Create a file to indicate container was built successfully
RUN echo "Container built successfully at $(date)" > /container_ready.txt

# Add healthcheck
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
  CMD curl -f http://localhost/health || exit 1

EXPOSE 80

CMD ["/entrypoint.sh"]

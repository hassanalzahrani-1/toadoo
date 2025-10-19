#!/bin/bash
set -e

cd /app

echo "Starting container..."

# Run migrations if DATABASE_URL is set
if [[ -n "${DATABASE_URL:-}" ]]; then
  echo "Running database migrations via Alembic..."
  alembic upgrade head || { echo "Migration failed"; exit 1; }
else
  echo "DATABASE_URL not set; skipping Alembic migrations."
fi

# Check if database exists and is accessible
if [ -f "/app/data/toadoo.db" ]; then
  echo "Found database at /app/data/toadoo.db"
else
  echo "Warning: Database file not found at /app/data/toadoo.db"
  echo "Contents of /app/data:"
  ls -la /app/data || echo "Could not list /app/data"
fi

# Check if nginx is already running
if pgrep -x "nginx" > /dev/null; then
  echo "Nginx is already running, using existing instance"
else
  # Only start nginx if it's not already running
  echo "Starting nginx..."
  nginx || { echo "Failed to start nginx"; exit 1; }
fi

# Start backend in the foreground
echo "Starting backend application on port 8000..."
exec uvicorn app.main:app --host 0.0.0.0 --port 8000 --proxy-headers --forwarded-allow-ips="*"

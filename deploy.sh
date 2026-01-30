#!/bin/bash
set -e

APP_DIR="/home/softengine/papers-api"
REPO_URL="https://github.com/Team-Papers/papers-api.git"
BRANCH="${1:-develop}"

echo "=== Deploying Papers API (branch: $BRANCH) ==="

# Clone or pull
if [ -d "$APP_DIR" ]; then
  cd "$APP_DIR"
  git fetch origin
  git checkout "$BRANCH"
  git pull origin "$BRANCH"
else
  git clone -b "$BRANCH" "$REPO_URL" "$APP_DIR"
  cd "$APP_DIR"
fi

# Build and deploy with Docker Compose
echo "=== Building Docker images ==="
docker compose -f docker-compose.prod.yml build --no-cache api

echo "=== Starting services ==="
docker compose -f docker-compose.prod.yml up -d

echo "=== Waiting for API health ==="
sleep 10

# Run migrations
echo "=== Running database migrations ==="
docker exec papers-api npx prisma migrate deploy

echo "=== Seeding database (if needed) ==="
docker exec papers-api npx prisma db seed 2>/dev/null || echo "Seed skipped or already done"

# Health check
echo "=== Health check ==="
for i in {1..5}; do
  if curl -sf http://localhost:8050/api/v1/health > /dev/null; then
    echo "API is healthy!"
    break
  fi
  echo "Waiting... ($i/5)"
  sleep 5
done

echo "=== Deployment complete ==="
docker compose -f docker-compose.prod.yml ps

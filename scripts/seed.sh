#!/usr/bin/env bash
set -e

# Change to the root of the project
cd "$(dirname "$0")/.."

# Load environment variables if .env exists
if [ -f .env ]; then
  export $(grep -v '^#' .env | xargs)
fi

DB_USER=${POSTGRES_USER:-querylens_user}
DB_NAME=${POSTGRES_DB:-querylens}

echo "Seeding database with sample data..."
echo "This may take a few seconds..."

# Execute the seed script inside the Docker container
docker compose exec -T db psql -U "$DB_USER" -d "$DB_NAME" -f /docker-entrypoint-initdb.d/init.sql > /dev/null 2>&1 || true
docker compose exec -T db psql -U "$DB_USER" -d "$DB_NAME" < ./scripts/seed.sql

echo "Database seeded successfully!"

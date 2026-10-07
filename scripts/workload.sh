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

echo "Generating realistic workload..."

# Run it 5 times to generate some calls and mean time stats
for i in {1..5}; do
  docker compose exec -T db psql -U "$DB_USER" -d "$DB_NAME" < ./scripts/workload.sql > /dev/null 2>&1
done

echo "Workload generated successfully. You can now view the history in QueryLens!"

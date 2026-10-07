#!/bin/bash
set -e

DATA_DIR=/var/lib/postgresql/data

chown -R postgres:postgres "$DATA_DIR"
chown -R postgres:postgres /var/run/postgresql

if [ -z "$(ls -A "$DATA_DIR")" ]; then
    echo "Initializing PostgreSQL database..."
    su - postgres -c "/usr/lib/postgresql/16/bin/initdb -D $DATA_DIR"
    
    echo "shared_preload_libraries = 'pg_stat_statements'" >> "$DATA_DIR/postgresql.conf"
    echo "listen_addresses = '*'" >> "$DATA_DIR/postgresql.conf"
    
    # Start postgres temporarily
    su - postgres -c "/usr/lib/postgresql/16/bin/pg_ctl -D $DATA_DIR -l /tmp/pg.log start"
    
    # Wait for postgres to be ready
    until su - postgres -c "psql -c '\q'" > /dev/null 2>&1; do
      sleep 1
    done
    
    echo "Creating database and user..."
    su - postgres -c "psql -c \"CREATE DATABASE querylens;\""
    su - postgres -c "psql -c \"ALTER USER postgres WITH PASSWORD 'postgres';\""
    
    echo "Running init.sql and seed.sql..."
    su - postgres -c "psql -d querylens -f /opt/querylens/scripts/init.sql"
    su - postgres -c "psql -d querylens -f /opt/querylens/scripts/seed.sql"
    
    # Stop temporary postgres
    su - postgres -c "/usr/lib/postgresql/16/bin/pg_ctl -D $DATA_DIR stop"
fi

echo "Starting supervisord..."
exec /usr/bin/supervisord -c /etc/supervisor/conf.d/supervisord.conf

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
    
    echo "Running init.sql and schema.sql..."
    su - postgres -c "psql -d querylens -f /opt/querylens/scripts/init.sql"
    su - postgres -c "psql -d querylens -f /opt/querylens/scripts/schema.sql"
    
    # Stop temporary postgres
    su - postgres -c "/usr/lib/postgresql/16/bin/pg_ctl -D $DATA_DIR stop"
    
    # Mark that we need to seed data in the background
    touch /tmp/needs_seed
fi

echo "Starting supervisord..."
/usr/bin/supervisord -c /etc/supervisor/conf.d/supervisord.conf &
SUPERVISOR_PID=$!

if [ -f /tmp/needs_seed ]; then
    (
        echo "Waiting for postgres to be fully ready..."
        until su - postgres -c "psql -c '\q'" > /dev/null 2>&1; do sleep 1; done
        
        SCALE=${SEED_SCALE:-300000}
        CUSTOMERS=$(( SCALE / 20 ))
        PRODUCTS=$(( SCALE / 200 ))
        ORDER_ITEMS=$(( SCALE * 2 ))

        if [ "$CUSTOMERS" -eq 0 ]; then CUSTOMERS=1; fi
        if [ "$PRODUCTS" -eq 0 ]; then PRODUCTS=1; fi
        if [ "$ORDER_ITEMS" -eq 0 ]; then ORDER_ITEMS=1; fi

        echo "Seeding data with scale=$SCALE (customers=$CUSTOMERS, products=$PRODUCTS, order_items=$ORDER_ITEMS)..."
        su - postgres -c "psql -d querylens -v customers_count=$CUSTOMERS -v products_count=$PRODUCTS -v orders_count=$SCALE -v order_items_count=$ORDER_ITEMS -f /opt/querylens/scripts/seed.sql"
        echo "Seeding complete!"
        rm -f /tmp/needs_seed
    ) &
fi

wait $SUPERVISOR_PID

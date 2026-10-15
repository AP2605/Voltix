#!/bin/bash
set -e

echo "=== Initializing Voltix Database ==="

# Execute Schema
mysql -u root -p"$MYSQL_ROOT_PASSWORD" < /docker-entrypoint-initdb.d/schema/01_create_database.sql
mysql -u root -p"$MYSQL_ROOT_PASSWORD" voltix_db < /docker-entrypoint-initdb.d/schema/02_tables.sql
mysql -u root -p"$MYSQL_ROOT_PASSWORD" voltix_db < /docker-entrypoint-initdb.d/schema/03_constraints.sql
mysql -u root -p"$MYSQL_ROOT_PASSWORD" voltix_db < /docker-entrypoint-initdb.d/schema/04_indexes.sql

# Execute Views
for f in /docker-entrypoint-initdb.d/views/*.sql; do
    echo "Applying view: $f"
    mysql -u root -p"$MYSQL_ROOT_PASSWORD" voltix_db < "$f"
done

# Execute Functions
for f in /docker-entrypoint-initdb.d/functions/*.sql; do
    echo "Applying function: $f"
    mysql -u root -p"$MYSQL_ROOT_PASSWORD" voltix_db < "$f"
done

# Execute Stored Procedures
for f in /docker-entrypoint-initdb.d/procedures/*.sql; do
    echo "Applying procedure: $f"
    mysql -u root -p"$MYSQL_ROOT_PASSWORD" voltix_db < "$f"
done

# Execute Triggers
for f in /docker-entrypoint-initdb.d/triggers/*.sql; do
    echo "Applying trigger: $f"
    mysql -u root -p"$MYSQL_ROOT_PASSWORD" voltix_db < "$f"
done

# Seed Data
echo "Seeding sample data..."
mysql -u root -p"$MYSQL_ROOT_PASSWORD" voltix_db < /docker-entrypoint-initdb.d/data/sample_data.sql

echo "=== Voltix Database Initialization Complete ==="

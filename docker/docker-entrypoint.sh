#!/bin/sh
set -e

# Wait for DB to be available if MySQL or Postgres is used
if [ "$DB_CONNECTION" = "mysql" ] || [ "$DB_CONNECTION" = "pgsql" ]; then
    DB_HOST_IP=$(getent hosts "$DB_HOST" | awk '{ print $1 }')
    if [ -n "$DB_HOST_IP" ]; then
        echo "Waiting for database connection on $DB_HOST:$DB_PORT..."
        while ! nc -z "$DB_HOST" "$DB_PORT"; do
            sleep 1
        done
        echo "Database is up!"
    fi
fi

# Create SQLite database if defined and does not exist
if [ "$DB_CONNECTION" = "sqlite" ]; then
    DB_DATABASE_PATH="${DB_DATABASE:-database/database.sqlite}"
    if [ ! -f "$DB_DATABASE_PATH" ]; then
        echo "Creating SQLite database at $DB_DATABASE_PATH..."
        mkdir -p "$(dirname "$DB_DATABASE_PATH")"
        touch "$DB_DATABASE_PATH"
        chown -R www-data:www-data "$(dirname "$DB_DATABASE_PATH")"
    fi
fi

# Ensure storage and bootstrap directories are writable
echo "Setting folder permissions..."
chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache
chmod -R 775 /var/www/html/storage /var/www/html/bootstrap/cache

# Caching Laravel configurations for production
if [ "${APP_ENV:-production}" = "production" ]; then
    echo "Caching configuration, routes, and views..."
    php artisan config:cache
    php artisan route:cache
    php artisan view:cache
else
    echo "Clearing configuration and routes cache for development..."
    php artisan config:clear
    php artisan route:clear
    php artisan view:clear
fi

# Run migrations if configured
if [ "${RUN_MIGRATIONS:-false}" = "true" ]; then
    echo "Running migrations..."
    php artisan migrate --force
fi

# Execute the container's main command
echo "Starting application services..."
exec "$@"

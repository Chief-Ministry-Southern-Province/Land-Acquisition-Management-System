#!/bin/bash

cd /var/www/Land-Acquisition-Management-System

echo "Pulling latest code..."
git pull origin ec2-deploy

echo "Installing PHP dependencies..."
composer install --no-dev --optimize-autoloader

echo "Installing Node dependencies..."
npm install

echo "Building frontend..."
npm run build

echo "Running migrations..."
php artisan migrate --force

echo "Clearing caches..."
php artisan optimize:clear

echo "Caching configs..."
php artisan config:cache
php artisan route:cache
php artisan view:cache

echo "Restarting queue..."
php artisan queue:restart

echo "Deployment completed."
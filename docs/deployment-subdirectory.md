# Deploying LAMS at `/lams`

## Local development

`php artisan serve` always mounts Laravel at `/`, regardless of `APP_URL`. To
mirror the production `/lams` mount locally, start both PHP and Vite with:

```bash
composer run dev
```

Then open `http://localhost:8000/lams/`. To serve an existing production build
without Vite, use `npm run serve:lams`.

## Production

The frontend reads `VITE_APP_BASE_PATH` at build time. Laravel and Vite use
`APP_URL` and `ASSET_URL` for generated links and compiled assets.

Use these values in the server's `.env` before running `npm run build`:

```dotenv
APP_ENV=production
APP_DEBUG=false
APP_URL=http://124.43.163.175/lams
APP_BASE_PATH=/lams
ASSET_URL=/lams
VITE_APP_BASE_PATH="${APP_BASE_PATH}"
SESSION_PATH=/lams
```

After updating `.env`, deploy with:

```bash
composer install --no-dev --optimize-autoloader
npm ci
npm run build
php artisan storage:link
php artisan migrate --force
php artisan optimize:clear
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan queue:restart
```

`public/storage` must exist (normally as Laravel's storage symlink) for public
uploads to be available under `/lams/storage/...`.

The Nginx LAMS block should strip `/lams` only for the internal PHP request,
while allowing Nginx to serve real files from `public`:

```nginx
location = /lams {
    return 301 /lams/;
}

location /lams/ {
    alias /var/www/Land-Acquisition-Management-System/public/;
    index index.php;
    try_files $uri $uri/ @lams_front_controller;
}

location @lams_front_controller {
    include fastcgi_params;
    fastcgi_pass unix:/run/php/php8.4-fpm.sock;
    fastcgi_param SCRIPT_FILENAME /var/www/Land-Acquisition-Management-System/public/index.php;
    fastcgi_param SCRIPT_NAME /lams/index.php;
    fastcgi_param DOCUMENT_ROOT /var/www/Land-Acquisition-Management-System/public;
    fastcgi_param REQUEST_URI $request_uri;
    fastcgi_hide_header X-Powered-By;
}
```

After changing Nginx, run `sudo nginx -t` before reloading it.

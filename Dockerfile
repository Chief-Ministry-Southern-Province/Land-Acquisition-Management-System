# ==========================================
# Stage 1: Builder (PHP + Node + Composer)
# ==========================================
FROM php:8.4-fpm-alpine AS builder
WORKDIR /var/www/html

# Install system dependencies (build tools, nodejs, npm)
RUN apk add --no-cache \
    git \
    zip \
    unzip \
    nodejs \
    npm \
    libpng-dev \
    libjpeg-turbo-dev \
    freetype-dev \
    libzip-dev \
    icu-dev \
    libxml2-dev

# Install PHP extensions needed to run composer and artisan commands during build
RUN docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install -j$(nproc) \
        pdo_mysql \
        gd \
        zip \
        bcmath \
        opcache \
        exif \
        pcntl \
        intl \
        soap

# Copy official Composer binary
COPY --from=composer:2.8 /usr/bin/composer /usr/bin/composer

# Copy all application source code
COPY . .

# Run Composer installation
ENV COMPOSER_ALLOW_SUPERUSER=1
RUN composer install --no-dev --optimize-autoloader --no-interaction --no-progress

# Run NPM installation and build
# Since PHP, Laravel code, and composer vendor are present,
# the Wayfinder Vite plugin can successfully run `php artisan wayfinder:generate`.
RUN npm ci && npm run build

# ==========================================
# Stage 2: Production Runner (clean PHP/Nginx image)
# ==========================================
FROM php:8.4-fpm-alpine AS app-runner
WORKDIR /var/www/html

# Install production runtime dependencies
RUN apk add --no-cache \
    nginx \
    supervisor \
    libpng-dev \
    libjpeg-turbo-dev \
    freetype-dev \
    libzip-dev \
    zip \
    unzip \
    icu-dev \
    libxml2-dev

# Install production PHP extensions
RUN docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install -j$(nproc) \
        pdo_mysql \
        gd \
        zip \
        bcmath \
        opcache \
        exif \
        pcntl \
        intl \
        soap

# Copy custom configurations
COPY docker/nginx.conf /etc/nginx/nginx.conf
COPY docker/supervisord.conf /etc/supervisor/conf.d/supervisord.conf
COPY docker/php.ini /usr/local/etc/php/conf.d/custom-php.ini

# Copy application files from context
COPY . .

# Overwrite vendor and public/build with production artifacts from builder stage
COPY --from=builder /var/www/html/vendor ./vendor
COPY --from=builder /var/www/html/public/build ./public/build

# Ensure runtime directories exist and have proper permissions
RUN mkdir -p storage/framework/cache/data \
    && mkdir -p storage/framework/app/cache \
    && mkdir -p storage/framework/sessions \
    && mkdir -p storage/framework/views \
    && mkdir -p storage/logs \
    && mkdir -p bootstrap/cache \
    && chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache \
    && chmod -R 775 /var/www/html/storage /var/www/html/bootstrap/cache

EXPOSE 80

ENTRYPOINT ["/var/www/html/docker/docker-entrypoint.sh"]
CMD ["/usr/bin/supervisord", "-c", "/etc/supervisor/conf.d/supervisord.conf"]

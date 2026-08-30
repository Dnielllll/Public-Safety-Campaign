# Laravel Microservice Dockerfile for Railway
# Build context: services/auth-service (Railway root directory)
FROM php:8.3-fpm-alpine

# Install system dependencies
RUN apk add --no-cache \
    git \
    curl \
    libpng-dev \
    libxml2-dev \
    zip \
    unzip \
    oniguruma-dev \
    postgresql-dev \
    icu-dev \
    libzip-dev \
    nginx

# Install PHP extensions
RUN docker-php-ext-configure pgsql --with-pgsql=/usr/local/pgsql \
    && docker-php-ext-install pdo pdo_pgsql mbstring exif pcntl bcmath gd zip intl

# Install Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html

# Copy all files from current directory (services/auth-service)
COPY . ./

# Install PHP dependencies for this service
RUN composer install --optimize-autoloader --no-dev --no-interaction

# Configure environment
RUN cp .env.example .env \
    && php artisan key:generate

# Permissions
RUN chown -R www-data:www-data /var/www/html \
    && chmod -R 755 /var/www/html/storage \
    && chmod -R 755 /var/www/html/bootstrap/cache

EXPOSE 9000

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD php-fpm -t || exit 1

CMD ["php-fpm"]

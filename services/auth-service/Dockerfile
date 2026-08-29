# Laravel Microservice Dockerfile
# Used by: auth-service, campaign-service, content-service, workflow-service
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

# Copy shared Laravel bootstrap from the backend directory
# The build context must be the repo root so we can access backend/
COPY backend/ ./

# Override routes, controllers, models, and config with service-specific files
COPY services/auth-service/routes/        ./routes/
COPY services/auth-service/app/           ./app/
COPY services/auth-service/composer.json  ./composer.json
COPY services/auth-service/.env.example   ./.env.example

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
  CMD php artisan tinker --execute="echo 'ok';" || exit 1

CMD ["php-fpm"]

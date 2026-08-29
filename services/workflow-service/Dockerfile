# Workflow Service Dockerfile
FROM php:8.3-fpm-alpine

RUN apk add --no-cache git curl libpng-dev libxml2-dev zip unzip oniguruma-dev postgresql-dev icu-dev libzip-dev

RUN docker-php-ext-configure pgsql --with-pgsql=/usr/local/pgsql \
    && docker-php-ext-install pdo pdo_pgsql mbstring exif pcntl bcmath gd zip intl

COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html

# Build context = repo root
COPY backend/ ./
COPY services/workflow-service/routes/       ./routes/
COPY services/workflow-service/app/          ./app/
COPY services/workflow-service/.env.example  ./.env.example

RUN composer install --optimize-autoloader --no-dev --no-interaction

RUN cp .env.example .env \
    && php artisan key:generate

RUN chown -R www-data:www-data /var/www/html \
    && chmod -R 755 /var/www/html/storage \
    && chmod -R 755 /var/www/html/bootstrap/cache

EXPOSE 9000

CMD ["php-fpm"]

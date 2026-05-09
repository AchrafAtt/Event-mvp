FROM composer:2 AS composer_deps
WORKDIR /var/www
COPY composer.json composer.lock ./
RUN composer install --no-dev --prefer-dist --no-interaction --no-progress --optimize-autoloader --no-scripts

# PHP + Node: @laravel/vite-plugin-wayfinder shells out to `php artisan wayfinder:generate --with-form` during `vite build`.
FROM php:8.4-cli-alpine AS frontend_builder
WORKDIR /var/www

RUN apk add --no-cache \
    bash \
    git \
    nodejs \
    npm \
    libzip-dev \
    oniguruma-dev \
    postgresql-dev \
    icu-dev \
    linux-headers \
    $PHPIZE_DEPS \
    && docker-php-ext-install -j$(nproc) intl mbstring pdo_pgsql zip \
    && apk del --no-network $PHPIZE_DEPS

COPY --from=composer_deps /var/www/vendor ./vendor
COPY package*.json ./
RUN npm install --no-audit --no-fund
COPY . .

ENV APP_ENV=production \
    APP_DEBUG=false

RUN export APP_KEY="$(php -r 'echo "base64:".base64_encode(random_bytes(32));')" \
    && npm run build

FROM php:8.4-fpm-alpine AS app
WORKDIR /var/www

RUN apk add --no-cache \
    bash \
    curl \
    git \
    su-exec \
    libzip-dev \
    oniguruma-dev \
    postgresql-dev \
    icu-dev \
    linux-headers \
    $PHPIZE_DEPS \
    && docker-php-ext-install -j$(nproc) bcmath intl mbstring opcache pdo_pgsql zip \
    && apk del --no-network $PHPIZE_DEPS

COPY --from=composer_deps /var/www/vendor ./vendor
COPY . .
COPY --from=frontend_builder /var/www/public/build ./public/build
COPY docker/app/entrypoint.sh /usr/local/bin/docker-entrypoint.sh

RUN mkdir -p storage/framework/{cache,sessions,testing,views} storage/logs bootstrap/cache \
    && chown -R www-data:www-data storage bootstrap/cache \
    && chmod -R ug+rwx storage bootstrap/cache \
    && chmod +x /usr/local/bin/docker-entrypoint.sh

USER root

EXPOSE 9000
ENTRYPOINT ["/usr/local/bin/docker-entrypoint.sh"]
CMD ["php-fpm", "-F"]

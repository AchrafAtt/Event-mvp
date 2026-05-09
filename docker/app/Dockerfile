FROM composer:2 AS composer_deps
WORKDIR /var/www
COPY composer.json composer.lock ./
RUN composer install --no-dev --prefer-dist --no-interaction --no-progress --optimize-autoloader --no-scripts

FROM node:20-alpine AS frontend_builder
WORKDIR /var/www
COPY package*.json ./
RUN npm install --no-audit --no-fund
COPY resources ./resources
COPY public ./public
COPY vite.config.ts tsconfig.json .
COPY eslint.config.js .
COPY components.json .
COPY tailwind.config.js .
COPY postcss.config.js .
COPY resources/js/wayfinder.ts ./resources/js/wayfinder.ts
RUN npm run build

FROM php:8.3-fpm-alpine AS app
WORKDIR /var/www

RUN apk add --no-cache \
    bash \
    curl \
    git \
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

RUN mkdir -p storage/framework/{cache,sessions,testing,views} storage/logs bootstrap/cache \
    && chown -R www-data:www-data storage bootstrap/cache \
    && chmod -R ug+rwx storage bootstrap/cache

USER www-data
EXPOSE 9000
CMD ["php-fpm", "-F"]

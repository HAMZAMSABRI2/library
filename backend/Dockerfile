FROM php:8.2-fpm-alpine AS base

RUN apk add --no-cache \
    git unzip nginx openssl icu-dev libzip-dev \
    && docker-php-ext-install pdo_mysql opcache intl zip

COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html

# ── deps ──────────────────────────────────────────────────────────────────────
FROM base AS deps
COPY composer.json composer.lock ./
RUN composer install --no-dev --no-scripts --prefer-dist --optimize-autoloader

# ── final ─────────────────────────────────────────────────────────────────────
FROM base AS final
COPY --from=deps /var/www/html/vendor ./vendor
COPY . .

RUN composer dump-autoload --optimize \
    && php bin/console cache:warmup --env=prod 2>/dev/null || true

COPY docker/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

EXPOSE 8000
ENTRYPOINT ["/entrypoint.sh"]

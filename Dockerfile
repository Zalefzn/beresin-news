# BeresinNews production image: Nginx + PHP-FPM 8.4 + Inertia SSR (Node) in one container.
# The same image runs the queue worker, scheduler and Reverb with a different command.

FROM node:24-bookworm-slim AS node

FROM php:8.4-fpm-bookworm

COPY --from=mlocati/php-extension-installer:2.7 /usr/bin/install-php-extensions /usr/local/bin/
COPY --from=composer:2.8 /usr/bin/composer /usr/bin/composer
COPY --from=node /usr/local/bin/node /usr/local/bin/node
COPY --from=node /usr/local/lib/node_modules /usr/local/lib/node_modules

RUN apt-get update \
    && apt-get install -y --no-install-recommends nginx supervisor unzip ca-certificates \
    && rm -rf /var/lib/apt/lists/* \
    && install-php-extensions pdo_pgsql pgsql gd intl zip bcmath exif pcntl opcache \
    && ln -s ../lib/node_modules/npm/bin/npm-cli.js /usr/local/bin/npm \
    && ln -s ../lib/node_modules/npm/bin/npx-cli.js /usr/local/bin/npx \
    && rm -f /etc/nginx/sites-enabled/default

COPY docker/php.ini /usr/local/etc/php/conf.d/zz-beresinnews.ini
COPY docker/nginx.conf /etc/nginx/conf.d/beresinnews.conf
COPY docker/supervisord.conf /etc/supervisor/conf.d/beresinnews.conf
COPY docker/entrypoint.sh /usr/local/bin/beresinnews-entrypoint

WORKDIR /var/www/html

COPY composer.json composer.lock ./
RUN composer install --no-dev --no-scripts --no-autoloader --prefer-dist --no-interaction --no-progress

COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund

COPY . .

# Public Reverb settings are compiled into the browser bundle.
ARG VITE_APP_NAME=BeresinNews
ARG VITE_REVERB_APP_KEY
ARG VITE_REVERB_HOST
ARG VITE_REVERB_PORT=443
ARG VITE_REVERB_SCHEME=https

RUN composer dump-autoload --optimize --no-dev \
    && php artisan package:discover --ansi \
    && VITE_APP_NAME="$VITE_APP_NAME" VITE_REVERB_APP_KEY="$VITE_REVERB_APP_KEY" VITE_REVERB_HOST="$VITE_REVERB_HOST" \
       VITE_REVERB_PORT="$VITE_REVERB_PORT" VITE_REVERB_SCHEME="$VITE_REVERB_SCHEME" npm run build:ssr \
    && chmod +x /usr/local/bin/beresinnews-entrypoint \
    && chown -R www-data:www-data storage bootstrap/cache

EXPOSE 80

ENTRYPOINT ["beresinnews-entrypoint"]
CMD ["supervisord", "-n", "-c", "/etc/supervisor/supervisord.conf"]

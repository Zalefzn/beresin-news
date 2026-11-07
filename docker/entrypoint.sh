#!/bin/sh
set -e

cd /var/www/html

# Volumes start empty, so recreate the folders Laravel and the media library write to.
mkdir -p storage/app/public storage/framework/cache/data storage/framework/sessions storage/framework/views storage/logs

php artisan storage:link --force >/dev/null 2>&1 || true
php artisan optimize >/dev/null

chown -R www-data:www-data storage bootstrap/cache

exec "$@"

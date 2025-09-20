FROM php:8.3-cli

WORKDIR /var/www/html

RUN apt-get update \
    && apt-get install -y --no-install-recommends git zip unzip libpq-dev postgresql-client libicu-dev librabbitmq-dev libmagickwand-dev libzip-dev curl gnupg \
    && docker-php-ext-install pdo_pgsql \
    && apt-get install -y --no-install-recommends nodejs npm \
    && npm install --global npm@10 \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

COPY composer.json composer.lock package.json package-lock.json* ./
RUN composer install --no-interaction --prefer-dist --no-dev || true
RUN if [ -f package.json ]; then npm install --no-audit --no-fund || true; fi

COPY . .

RUN chmod +x docker/entrypoint.sh

EXPOSE 8000

CMD ["./docker/entrypoint.sh"]

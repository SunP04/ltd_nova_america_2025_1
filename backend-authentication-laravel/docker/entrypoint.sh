#!/bin/sh
set -euo pipefail

if [ ! -f composer.lock ]; then
  echo "[entrypoint] composer.lock não encontrado; executando composer update --lock";
  composer update --lock
fi

if [ -f composer.lock ]; then
  echo "[entrypoint] Instalando dependências PHP"
  composer install --no-interaction --prefer-dist --no-dev
fi

if [ -f package.json ]; then
  echo "[entrypoint] Instalando dependências JS"
  npm install --no-audit --no-fund
  npm run build
fi

php artisan config:clear
php artisan config:cache

if [ -z "${APP_KEY:-}" ]; then
  php artisan key:generate --force
fi

if [ -z "${JWT_SECRET:-}" ]; then
  php artisan jwt:secret --force
fi

auth_host="${DB_HOST:-postgres-auth}"
auth_port="${DB_PORT:-5432}"
auth_user="${DB_USERNAME:-postgres}"
auth_db="${DB_DATABASE:-db_auth}"
auth_pass="${DB_PASSWORD:-postgres}"

export PGPASSWORD="$auth_pass"

echo "[entrypoint] Aguardando Postgres em ${auth_host}:${auth_port}"
until pg_isready -h "$auth_host" -p "$auth_port" -U "$auth_user" -d "$auth_db" >/dev/null 2>&1; do
  sleep 2
  echo "[entrypoint] Ainda aguardando Postgres..."
done

echo "[entrypoint] Executando migrations e seeders"
php artisan migrate --force
php artisan db:seed --force

echo "[entrypoint] Gerando documentação Swagger"
php artisan l5-swagger:generate

echo "[entrypoint] Iniciando servidor"
exec php artisan serve --host=0.0.0.0 --port=8000

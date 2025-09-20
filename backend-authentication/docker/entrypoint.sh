#!/bin/sh
set -euo pipefail

if [ -f package-lock.json ]; then
  echo "[entrypoint] Installing dependencies with npm ci"
  npm ci --legacy-peer-deps
else
  echo "[entrypoint] Installing dependencies with npm install"
  npm install --legacy-peer-deps
fi

auth_host=${AUTH_PG_HOST:-postgres-auth}
auth_port=${AUTH_PG_PORT:-5432}
auth_user=${AUTH_PG_USER:-postgres}
auth_db=${AUTH_PG_DB:-auth_db}
auth_pass=${AUTH_PG_PASS:-postgres}

export PGPASSWORD="$auth_pass"

echo "[entrypoint] Waiting for Postgres at ${auth_host}:${auth_port} ..."
until pg_isready -h "$auth_host" -p "$auth_port" -U "$auth_user" -d "$auth_db" >/dev/null 2>&1; do
  echo "[entrypoint] Postgres not ready yet. Retrying in 2s..."
  sleep 2
done

echo "[entrypoint] Running database migrations"
npm run migration:run

echo "[entrypoint] Starting NestJS service"
exec npm run start:dev

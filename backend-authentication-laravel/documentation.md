# Autenticação JWT Laravel + Front-end

Este projeto entrega uma aplicação Laravel 11 com API JWT e um front-end simples (Blade + JS) para registrar, autenticar, renovar token e consultar o usuário.

## 1. Pré-requisitos
- PHP 8.2+
- Composer 2+
- Node.js 20+ (para build local) e npm 10+
- Docker/Docker Compose (para executar via containers)
- Banco Postgres disponível (o projeto assume o container `postgres-auth` já definido na raiz `docker-compose.yml`).

## 2. Configuração local
```bash
cd backend-authentication-laravel
cp .env.example .env  # se ainda não existir
# Ajuste APP_URL, JWT_SECRET (depois do comando jwt:secret) conforme necessário

composer install
php artisan key:generate --force
php artisan jwt:secret --force
php artisan l5-swagger:generate
npm install
npm run build
php artisan migrate --force
php artisan db:seed --force
php artisan serve --host=0.0.0.0 --port=8000
```
Acesse `http://localhost:8000` para usar o front-end e `http://localhost:8000/docs` para o Swagger.

## 3. Executar com Docker
1. Garanta que a rede `my-network` exista (caso use o compose raiz):
   ```bash
   docker network create my-network || true
   ```
2. Entre na raiz do projeto (`ltd_nova_america_2025_1`) e suba:
   ```bash
   docker compose up --build backend-authentication-laravel
   ```
3. O serviço sobe em http://localhost:8001. Swagger em `http://localhost:8001/docs`.

O entrypoint do container gera o `APP_KEY` e o `JWT_SECRET` (se estiverem vazios), executa migrations, seed, gera a documentação (`php artisan l5-swagger:generate`) e então inicia o servidor.

O entrypoint do container instala Composer/NPM, aguarda o Postgres (`postgres-auth`), roda migrations, seeders, gera o Swagger e garante chaves de criptografia.

## 4. API Endpoints
| Método | Rota                | Descrição | Autenticação |
|--------|---------------------|-----------|--------------|
| POST   | `/api/auth/register`| Cria usuário e retorna JWT | — |
| POST   | `/api/auth/login`   | Autentica via e-mail/senha | — |
| POST   | `/api/auth/refresh` | Renova token atual         | Bearer JWT |
| POST   | `/api/auth/logout`  | Invalida token             | Bearer JWT |
| GET    | `/api/me`           | Retorna usuário logado     | Bearer JWT |

### Exemplo (login)
```bash
curl -X POST http://localhost:8001/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"admin@example.com","password":"admin123"}'
```
Resposta:
```json
{
  "access_token": "eyJ0eXAiOiJKV1QiLCJhb...",
  "token_type": "bearer",
  "expires_in": 3600
}
```
Use o token no header `Authorization: Bearer <token>`.

### Usuário seedado
- e-mail: `admin@example.com`
- senha: `admin123`
- role: `admin`

## 5. Swagger
- `GET /docs`: UI com documentação interativa
- `GET /api/docs`: JSON OpenAPI gerado por `darkaonline/l5-swagger`
- Atualize a doc executando `php artisan l5-swagger:generate` (requer dependências instaladas).

## 6. Front-end
A página inicial (`/`) disponibiliza formulários para: registro, login, refresh e consulta do perfil. Os tokens são armazenados em `localStorage`.

## 7. Variáveis .env relevantes
```
DB_CONNECTION=pgsql
DB_HOST=postgres-auth
DB_PORT=5432
DB_DATABASE=db_auth
DB_USERNAME=authdb
DB_PASSWORD=eSt@c1oLTd
JWT_SECRET= (gerado por php artisan jwt:secret)
JWT_TTL=60  # opcional
```

## 8. Comandos úteis
```bash
php artisan migrate:fresh --seed
php artisan l5-swagger:generate
php artisan tinker
```

> Observação: se o build Docker falhar por falta de dependências, rode os comandos de instalação localmente antes de subir o container.

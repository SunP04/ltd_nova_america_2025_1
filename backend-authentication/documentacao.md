# Documentação do Serviço de Autenticação

## Visão Geral
Este serviço NestJS entrega autenticação JWT com chave assimétrica (RS256), tokens de atualização, fluxo completo de redefinição de senha, verificação de e-mail e suporte ao segundo fator de autenticação via Google Authenticator. O banco de dados é PostgreSQL e todas as tabelas são criadas via migrations.

O Swagger está disponível depois do bootstrap da aplicação em [`/docs`](http://localhost:3000/docs) (porta configurável via `PORT`). As requisições autenticadas usam Bearer Token.

## Esquema do Banco de Dados
Principais tabelas criadas pela migration `1700000000000-CreateAuthTables.ts`:

- **users**: guarda identidade, credenciais (hash Argon2), username, status de verificação, informações de 2FA.
- **roles** e **user_roles**: controle de perfis. O payload do JWT recebe os nomes das roles associadas ao usuário.
- **institutions** e **user_institutions**: suportam múltiplas instituições por usuário. O JWT inclui o array de códigos vinculados.
- **refresh_tokens**: tokens de atualização emitidos, com hash e data de expiração, permitindo revogação.
- **password_resets**: tokens de redefinição de senha com TTL configurável (`PASSWORD_RESET_TTL`).
- **verification_tokens**: tokens de verificação de e-mail (`VERIFICATION_TOKEN_TTL`).

## Estrutura do JWT
Payload padrão dos tokens de acesso e atualização:

```json
{
  "sub": "<user_id>",
  "user_id": "<user_id>",
  "user_name": "Nome completo",
  "email": "usuario@exemplo.com",
  "roles": ["admin", "user"],
  "institutions": ["i1", "i2"],
  "iss": "<issuer>",
  "aud": "<audience>",
  "iat": 1710000000,
  "exp": 1710000900,
  "jti": "<apenas no refresh token>"
}
```

## Recursos da API
### `/auth`
| Método | Rota | Descrição |
| --- | --- | --- |
| POST | `/auth/register` | Cria usuário, envia e-mail de verificação e devolve par de tokens. |
| POST | `/auth/login` | Autentica com `identifier` (username ou e-mail) e `password`. Se o usuário tiver 2FA ativo, enviar `twoFactorCode`. |
| POST | `/auth/refresh` | Gera novo par de tokens a partir do refresh token válido. |
| POST | `/auth/logout` | Revoga o refresh token informado. |
| GET | `/auth/me` | Retorna perfil do usuário autenticado (requer Bearer token). |
| POST | `/auth/introspect` | Valida um token (access ou refresh). |
| POST | `/auth/2fa/setup` | Gera secret + URL `otpauth://` para configurar Google Authenticator. |
| POST | `/auth/2fa/enable` | Confirma 2FA com o código de 6 dígitos. |
| POST | `/auth/2fa/disable` | Desativa 2FA validando o código atual. |

### `/reset-password`
| Método | Rota | Descrição |
| --- | --- | --- |
| POST | `/reset-password/request` | Solicita e-mail de redefinição de senha. |
| POST | `/reset-password/confirm` | Cria nova senha a partir do token recebido no e-mail e revoga tokens ativos. |

### `/verification-token`
| Método | Rota | Descrição |
| --- | --- | --- |
| POST | `/verification-token/request` | Reenvia token de verificação de e-mail. |
| POST | `/verification-token/verify` | Confirma posse do e-mail usando o token recebido. |

## Fluxo de Segundo Fator (Google Authenticator)
1. Autenticar-se e chamar `POST /auth/2fa/setup` para receber `secret` e `otpauthUrl`.
2. Escanear a URL no aplicativo Google Authenticator.
3. Confirmar com `POST /auth/2fa/enable` informando o código de 6 dígitos.
4. Depois de habilitado, toda chamada a `/auth/login` exigirá `twoFactorCode` válido.
5. Para remover o segundo fator, usar `POST /auth/2fa/disable` enviando o código atual.

## Usuário Administrador Inicial
Ao subir a aplicação, é garantida a existência de um usuário com:
- **username**: `admin`
- **email**: `admin@example.com`
- **senha**: `admin`
- **roles**: `admin`
- **institutions**: `['default']`

Ative o 2FA posteriormente se desejar reforçar a segurança.
As variáveis de ambiente `ADMIN_USERNAME`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `ADMIN_NAME` e `ADMIN_INSTITUTIONS` (lista separada por vírgula) podem sobrescrever esses valores padrão.

## Configuração e Execução
1. Ajuste as variáveis no `.env` (ex.: `AUTH_PG_HOST`, `AUTH_PG_USER=authdb`, `AUTH_PG_PASS=eSt@c1oLTd`, `AUTH_PG_DB=db_auth`, `PASSWORD_RESET_TTL`, `VERIFICATION_TOKEN_TTL`).
2. Rode `npm install` no diretório `backend-authentication`.
3. Execute as migrations: `npm run migration:run`.
4. Inicie o serviço: `npm run start:dev` (ou `npm run start`).
5. Acesse `http://localhost:3000/docs` para o Swagger.

## Observações
- E-mails de redefinição e verificação usam as configurações de SMTP definidas em `MAIL_*`.
- `PASSWORD_RESET_TTL` e `VERIFICATION_TOKEN_TTL` estão em segundos.
- Os tokens são assinados com chave privada (RS256) definida em `JWT_PRIVATE_KEY`; configure as variáveis no `.env` ou use arquivos conforme já existente no projeto.
- Ao redefinir a senha, todos os refresh tokens ativos são revogados automaticamente.

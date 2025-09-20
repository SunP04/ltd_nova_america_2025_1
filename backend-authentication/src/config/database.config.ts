import { registerAs } from '@nestjs/config';

export default registerAs('database', () => ({
  host: process.env.AUTH_PG_HOST ?? process.env.DB_HOST ?? 'localhost',
  port: parseInt(process.env.AUTH_PG_PORT ?? process.env.DB_PORT ?? '5432', 10),
  username: process.env.AUTH_PG_USER ?? process.env.DB_USER ?? 'postgres',
  password: process.env.AUTH_PG_PASS ?? process.env.DB_PASSWORD ?? 'postgres',
  database: process.env.AUTH_PG_DB ?? process.env.DB_NAME ?? 'auth_db',
  ssl: process.env.DB_SSL === 'true'
}));

import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { join } from 'path';
import * as dotenv from 'dotenv';

dotenv.config();

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.AUTH_PG_HOST ?? process.env.DB_HOST ?? 'localhost',
  port: parseInt(process.env.AUTH_PG_PORT ?? process.env.DB_PORT ?? '5432', 10),
  username: process.env.AUTH_PG_USER ?? process.env.DB_USER ?? 'postgres',
  password: process.env.AUTH_PG_PASS ?? process.env.DB_PASSWORD ?? 'postgres',
  database: process.env.AUTH_PG_DB ?? process.env.DB_NAME ?? 'auth_db',
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
  entities: [join(__dirname, '..', '**/*.entity.{ts,js}')],
  migrations: [join(__dirname, 'migrations/*.{ts,js}')],
  synchronize: false,
  logging: false
});

export default AppDataSource;

import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateAuthTables1700000000000 implements MigrationInterface {
  name = 'CreateAuthTables1700000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "roles" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "name" varchar(100) NOT NULL UNIQUE,
        "description" varchar(255),
        "created_at" timestamptz NOT NULL DEFAULT now(),
        "updated_at" timestamptz NOT NULL DEFAULT now()
      )
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "institutions" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "code" varchar(100) NOT NULL UNIQUE,
        "name" varchar(255) NOT NULL,
        "created_at" timestamptz NOT NULL DEFAULT now(),
        "updated_at" timestamptz NOT NULL DEFAULT now()
      )
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "users" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "email" varchar(255) NOT NULL UNIQUE,
        "username" varchar(150) NOT NULL UNIQUE,
        "password_hash" varchar(255) NOT NULL,
        "name" varchar(255) NOT NULL,
        "two_factor_secret" varchar(512),
        "two_factor_enabled" boolean NOT NULL DEFAULT false,
        "two_factor_recovery_codes" jsonb NOT NULL DEFAULT '[]'::jsonb,
        "is_email_verified" boolean NOT NULL DEFAULT false,
        "created_at" timestamptz NOT NULL DEFAULT now(),
        "updated_at" timestamptz NOT NULL DEFAULT now()
      )
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "user_roles" (
        "user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
        "role_id" uuid NOT NULL REFERENCES "roles"("id") ON DELETE CASCADE,
        "created_at" timestamptz NOT NULL DEFAULT now(),
        PRIMARY KEY ("user_id", "role_id")
      )
    `);
    await queryRunner.query(
      'CREATE INDEX IF NOT EXISTS "idx_user_roles_role_id" ON "user_roles" ("role_id")'
    );

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "user_institutions" (
        "user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
        "institution_id" uuid NOT NULL REFERENCES "institutions"("id") ON DELETE CASCADE,
        "created_at" timestamptz NOT NULL DEFAULT now(),
        PRIMARY KEY ("user_id", "institution_id")
      )
    `);
    await queryRunner.query(
      'CREATE INDEX IF NOT EXISTS "idx_user_institutions_institution_id" ON "user_institutions" ("institution_id")'
    );

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "refresh_tokens" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
        "token_id" varchar(255) NOT NULL UNIQUE,
        "token_hash" varchar(255) NOT NULL,
        "expires_at" timestamptz NOT NULL,
        "revoked_at" timestamptz,
        "created_at" timestamptz NOT NULL DEFAULT now()
      )
    `);
    await queryRunner.query(
      'CREATE INDEX IF NOT EXISTS "idx_refresh_tokens_user_id" ON "refresh_tokens" ("user_id")'
    );

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "password_resets" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
        "token_id" varchar(255) NOT NULL UNIQUE,
        "token_hash" varchar(255) NOT NULL,
        "expires_at" timestamptz NOT NULL,
        "used_at" timestamptz,
        "created_at" timestamptz NOT NULL DEFAULT now()
      )
    `);
    await queryRunner.query(
      'CREATE INDEX IF NOT EXISTS "idx_password_resets_user_id" ON "password_resets" ("user_id")'
    );

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "verification_tokens" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
        "token_id" varchar(255) NOT NULL UNIQUE,
        "token_hash" varchar(255) NOT NULL,
        "type" varchar(50) NOT NULL DEFAULT 'email',
        "expires_at" timestamptz NOT NULL,
        "used_at" timestamptz,
        "created_at" timestamptz NOT NULL DEFAULT now(),
        "updated_at" timestamptz NOT NULL DEFAULT now()
      )
    `);
    await queryRunner.query(
      'CREATE INDEX IF NOT EXISTS "idx_verification_tokens_user_id" ON "verification_tokens" ("user_id")'
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP INDEX IF EXISTS "idx_verification_tokens_user_id"');
    await queryRunner.query('DROP TABLE IF EXISTS "verification_tokens"');
    await queryRunner.query('DROP INDEX IF EXISTS "idx_password_resets_user_id"');
    await queryRunner.query('DROP TABLE IF EXISTS "password_resets"');
    await queryRunner.query('DROP INDEX IF EXISTS "idx_refresh_tokens_user_id"');
    await queryRunner.query('DROP TABLE IF EXISTS "refresh_tokens"');
    await queryRunner.query('DROP INDEX IF EXISTS "idx_user_institutions_institution_id"');
    await queryRunner.query('DROP TABLE IF EXISTS "user_institutions"');
    await queryRunner.query('DROP INDEX IF EXISTS "idx_user_roles_role_id"');
    await queryRunner.query('DROP TABLE IF EXISTS "user_roles"');
    await queryRunner.query('DROP TABLE IF EXISTS "users"');
    await queryRunner.query('DROP TABLE IF EXISTS "institutions"');
    await queryRunner.query('DROP TABLE IF EXISTS "roles"');
  }
}

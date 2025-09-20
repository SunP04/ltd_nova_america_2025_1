import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import appConfig from './config/app.config';
import jwtConfig from './config/jwt.config';
import databaseConfig from './config/database.config';
import mailConfig from './config/mail.config';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { JwksModule } from './jwks/jwks.module';
import { MailModule } from './mail/mail.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, jwtConfig, databaseConfig, mailConfig]
    }),
    ThrottlerModule.forRoot({ ttl: 60, limit: 1000 }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('database.host'),
        port: configService.get<number>('database.port'),
        username: configService.get<string>('database.username'),
        password: configService.get<string>('database.password'),
        database: configService.get<string>('database.database'),
        ssl: configService.get<boolean>('database.ssl') ? { rejectUnauthorized: false } : false,
        autoLoadEntities: true,
        synchronize: false,
        logging: configService.get<string>('app.nodeEnv') !== 'production'
      }),
      inject: [ConfigService]
    }),
    MailModule,
    UsersModule,
    AuthModule,
    JwksModule
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard
    }
  ]
})
export class AppModule {}

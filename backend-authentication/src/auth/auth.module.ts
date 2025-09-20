import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from '../users/users.module';
import { MailModule } from '../mail/mail.module';
import { RefreshToken } from './entities/refresh-token.entity';
import { PasswordReset } from './entities/password-reset.entity';
import { VerificationToken } from './entities/verification-token.entity';
import { ResetPasswordService } from './reset-password.service';
import { VerificationTokenService } from './verification-token.service';
import { ResetPasswordController } from './reset-password.controller';
import { VerificationTokenController } from './verification-token.controller';
import { LocalStrategy } from './strategies/local.strategy';
import { JwtAccessStrategy } from './strategies/jwt-access.strategy';
import { RolesGuard } from '../common/guards/roles.guard';
import { LocalAuthGuard } from './guards/local-auth.guard';

@Module({
  imports: [
    ConfigModule,
    UsersModule,
    MailModule,
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        privateKey: configService.get<string>('jwt.privateKey'),
        publicKey: configService.get<string>('jwt.publicKey'),
        signOptions: {
          algorithm: 'RS256',
          issuer: configService.get<string>('jwt.issuer'),
          audience: configService.get<string>('jwt.audience')
        },
        verifyOptions: {
          algorithms: ['RS256'],
          issuer: configService.get<string>('jwt.issuer'),
          audience: configService.get<string>('jwt.audience')
        }
      }),
      inject: [ConfigService]
    }),
    TypeOrmModule.forFeature([RefreshToken, PasswordReset, VerificationToken])
  ],
  providers: [
    AuthService,
    ResetPasswordService,
    VerificationTokenService,
    LocalStrategy,
    JwtAccessStrategy,
    RolesGuard,
    LocalAuthGuard
  ],
  controllers: [AuthController, ResetPasswordController, VerificationTokenController]
})
export class AuthModule {}

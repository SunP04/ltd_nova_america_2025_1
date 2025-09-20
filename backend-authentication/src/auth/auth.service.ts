import { BadRequestException, Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import * as argon2 from 'argon2';
import { randomUUID } from 'crypto';
import { JwtHeader } from 'jsonwebtoken';
import { authenticator } from 'otplib';
import ms from 'ms';
import { Repository } from 'typeorm';
import { UsersService } from '../users/users.service';
import { User } from '../users/entities/user.entity';
import { RefreshToken } from './entities/refresh-token.entity';
import { RegisterDto } from './dto/register.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { LogoutDto } from './dto/logout.dto';
import { IntrospectTokenDto } from './dto/introspect-token.dto';
import { JwtPayload } from '../common/interfaces/jwt-payload.interface';
import { VerificationTokenService } from './verification-token.service';

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly verificationTokenService: VerificationTokenService,
    @InjectRepository(RefreshToken)
    private readonly refreshTokensRepository: Repository<RefreshToken>
  ) {}

  async register(dto: RegisterDto): Promise<TokenPair> {
    const existing = await this.usersService.findByEmail(dto.email);
    if (existing) {
      throw new BadRequestException('Email already registered');
    }

    const usernameTaken = await this.usersService.findByUsername(dto.username);
    if (usernameTaken) {
      throw new BadRequestException('Username already registered');
    }

    const passwordHash = await argon2.hash(dto.password);
    const user = await this.usersService.create({
      email: dto.email,
      username: dto.username,
      passwordHash,
      name: dto.name,
      institutionCodes: dto.institutions,
      roleNames: dto.roles
    });

    try {
      await this.verificationTokenService.requestEmailVerification(user.email);
    } catch (error) {
      this.logger.warn(`Falha ao enviar e-mail de verificação para ${user.email}: ${error instanceof Error ? error.message : error}`);
    }
    await this.revokeActiveRefreshTokens(user.id);
    return this.issueTokenPair(user);
  }

  async validateUser(identifier: string, password: string): Promise<User | null> {
    const user = identifier.includes('@')
      ? await this.usersService.findByEmail(identifier)
      : await this.usersService.findByUsername(identifier);
    if (!user) {
      return null;
    }

    const passwordMatches = await argon2.verify(user.passwordHash, password);
    if (!passwordMatches) {
      return null;
    }

    return user;
  }

  async login(user: User, twoFactorCode?: string): Promise<TokenPair> {
    if (user.twoFactorEnabled) {
      if (!twoFactorCode) {
        throw new UnauthorizedException('Two-factor authentication code required');
      }

      const isValid = await this.verifyTwoFactorCode(user.id, twoFactorCode);
      if (!isValid) {
        throw new UnauthorizedException('Invalid two-factor authentication code');
      }
    }

    const freshUser = await this.usersService.findById(user.id);
    if (!freshUser) {
      throw new UnauthorizedException();
    }

    await this.revokeActiveRefreshTokens(user.id);
    return this.issueTokenPair(freshUser);
  }

  async refresh(dto: RefreshTokenDto): Promise<TokenPair> {
    const payload = await this.verifyRefreshToken(dto.refreshToken);

    if (!payload.jti) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const tokenRecord = await this.refreshTokensRepository.findOne({
      where: { tokenId: payload.jti },
      relations: { user: true }
    });

    if (!tokenRecord) {
      throw new UnauthorizedException('Refresh token revoked');
    }

    if (tokenRecord.revokedAt || tokenRecord.expiresAt <= new Date()) {
      throw new UnauthorizedException('Refresh token expired or revoked');
    }

    const isValid = await argon2.verify(tokenRecord.tokenHash, dto.refreshToken).catch(() => false);
    if (!isValid) {
      throw new UnauthorizedException('Refresh token mismatch');
    }

    tokenRecord.revokedAt = new Date();
    await this.refreshTokensRepository.save(tokenRecord);

    return this.issueTokenPair(tokenRecord.user);
  }

  async logout(dto: LogoutDto): Promise<void> {
    const payload = await this.verifyRefreshToken(dto.refreshToken).catch(() => null);

    if (!payload?.jti) {
      return;
    }

    const tokenRecord = await this.refreshTokensRepository.findOne({ where: { tokenId: payload.jti } });
    if (!tokenRecord) {
      return;
    }

    tokenRecord.revokedAt = new Date();
    await this.refreshTokensRepository.save(tokenRecord);
  }

  async introspect(dto: IntrospectTokenDto) {
    try {
      const payload = await this.jwtService.verifyAsync<JwtPayload>(dto.token, {
        algorithms: ['RS256']
      });

      if (payload.jti) {
        const tokenRecord = await this.refreshTokensRepository.findOne({ where: { tokenId: payload.jti } });
        if (!tokenRecord || tokenRecord.revokedAt || tokenRecord.expiresAt <= new Date()) {
          return { active: false };
        }

        const matches = await argon2.verify(tokenRecord.tokenHash, dto.token).catch(() => false);
        if (!matches) {
          return { active: false };
        }
      }

      return {
        active: true,
        sub: payload.sub,
        user_id: payload.user_id,
        user_name: payload.user_name,
        email: payload.email,
        roles: payload.roles,
        institutions: payload.institutions,
        exp: payload.exp,
        iat: payload.iat,
        iss: payload.iss,
        aud: payload.aud
      };
    } catch (error) {
      return { active: false };
    }
  }

  async generateTwoFactorSecret(userId: string) {
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new BadRequestException('User not found');
    }

    const secret = authenticator.generateSecret();
    const issuer = this.configService.get<string>('app.twoFactorIssuer') ?? 'Auth Service';
    const otpauthUrl = authenticator.keyuri(user.email, issuer, secret);

    await this.usersService.saveTwoFactorSecret(user.id, secret, []);

    return { secret, otpauthUrl };
  }

  async enableTwoFactor(userId: string, code: string): Promise<void> {
    const normalized = this.normalizeTwoFactorCode(code);
    const user = await this.usersService.findByIdWithSecret(userId);

    if (!user || !user.twoFactorSecret) {
      throw new BadRequestException('Two-factor setup not initialized');
    }

    const isValid = authenticator.check(normalized, user.twoFactorSecret);
    if (!isValid) {
      throw new BadRequestException('Invalid two-factor authentication code');
    }

    await this.usersService.setTwoFactorEnabled(userId, true);
  }

  async disableTwoFactor(userId: string, code: string): Promise<void> {
    const normalized = this.normalizeTwoFactorCode(code);
    const user = await this.usersService.findByIdWithSecret(userId);

    if (!user || !user.twoFactorSecret) {
      await this.usersService.clearTwoFactorSecret(userId);
      return;
    }

    const isValid = authenticator.check(normalized, user.twoFactorSecret);
    if (!isValid) {
      throw new BadRequestException('Invalid two-factor authentication code');
    }

    await this.usersService.clearTwoFactorSecret(userId);
  }

  async verifyTwoFactorCode(userId: string, code: string): Promise<boolean> {
    const user = await this.usersService.findByIdWithSecret(userId);
    if (!user || !user.twoFactorSecret) {
      return false;
    }

    const normalized = this.normalizeTwoFactorCode(code);
    return authenticator.check(normalized, user.twoFactorSecret);
  }

  private normalizeTwoFactorCode(code: string): string {
    return code.replace(/\s+/g, '');
  }

  private async issueTokenPair(user: User): Promise<TokenPair> {
    const kid = this.configService.get<string>('jwt.kid');
    const accessTtl = this.configService.get<string>('jwt.accessTtl', '900s');
    const refreshTtl = this.configService.get<string>('jwt.refreshTtl', '30d');
    const jti = randomUUID();

    const roleNames = user.roles.map((role) => role.name);
    const institutionCodes = user.institutions.map((institution) => institution.code);

    const jwtHeader: JwtHeader | undefined = kid
      ? {
          kid,
          alg: 'RS256'
        }
      : undefined;

    const accessToken = await this.jwtService.signAsync(
      {
        sub: user.id,
        user_id: user.id,
        user_name: user.name,
        email: user.email,
        roles: roleNames,
        institutions: institutionCodes
      },
      {
        expiresIn: accessTtl,
        subject: user.id,
        header: jwtHeader
      }
    );

    const refreshToken = await this.jwtService.signAsync(
      {
        sub: user.id,
        user_id: user.id,
        user_name: user.name,
        email: user.email,
        roles: roleNames,
        institutions: institutionCodes,
        jti
      },
      {
        expiresIn: refreshTtl,
        subject: user.id,
        jwtid: jti,
        header: jwtHeader
      }
    );

    await this.storeRefreshToken(user, refreshToken, jti, refreshTtl);

    return { accessToken, refreshToken };
  }

  private async storeRefreshToken(
    user: User,
    refreshToken: string,
    tokenId: string,
    refreshTtl: string
  ): Promise<void> {
    const expiresInMs = ms(refreshTtl);
    if (typeof expiresInMs !== 'number') {
      throw new Error('Invalid refresh token TTL configuration');
    }

    const expiresAt = new Date(Date.now() + expiresInMs);
    const tokenHash = await argon2.hash(refreshToken);

    await this.refreshTokensRepository.save(
      this.refreshTokensRepository.create({
        user,
        tokenId,
        tokenHash,
        expiresAt,
        revokedAt: null
      })
    );
  }

  private async verifyRefreshToken(token: string): Promise<JwtPayload> {
    try {
      return await this.jwtService.verifyAsync<JwtPayload>(token, {
        algorithms: ['RS256']
      });
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  private async revokeActiveRefreshTokens(userId: string): Promise<void> {
    await this.refreshTokensRepository
      .createQueryBuilder()
      .update()
      .set({ revokedAt: () => 'NOW()' })
      .where('"user_id" = :userId AND "revoked_at" IS NULL', { userId })
      .execute();
  }
}

import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import * as argon2 from 'argon2';
import { randomBytes, randomUUID } from 'crypto';
import { Repository } from 'typeorm';
import { UsersService } from '../users/users.service';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { PasswordReset } from './entities/password-reset.entity';
import { MailService } from '../mail/mail.service';
import { RefreshToken } from './entities/refresh-token.entity';

@Injectable()
export class ResetPasswordService {
  constructor(
    private readonly usersService: UsersService,
    private readonly configService: ConfigService,
    private readonly mailService: MailService,
    @InjectRepository(PasswordReset)
    private readonly passwordResetsRepository: Repository<PasswordReset>,
    @InjectRepository(RefreshToken)
    private readonly refreshTokensRepository: Repository<RefreshToken>
  ) {}

  async requestPasswordReset(dto: ForgotPasswordDto): Promise<void> {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user) {
      return;
    }

    const tokenId = randomUUID();
    const rawToken = randomBytes(32).toString('hex');
    const tokenHash = await argon2.hash(rawToken);
    const resetTtlSeconds = this.configService.get<number>('app.passwordResetTtl', 900);
    const expiresAt = new Date(Date.now() + resetTtlSeconds * 1000);

    await this.passwordResetsRepository.save(
      this.passwordResetsRepository.create({
        tokenId,
        tokenHash,
        expiresAt,
        user,
        usedAt: null
      })
    );

    const frontendUrl = this.configService.get<string>('app.frontendUrl') ?? '';
    const resetToken = `${tokenId}.${rawToken}`;
    const resetUrl = `${frontendUrl.replace(/\/$/, '')}/reset?token=${encodeURIComponent(resetToken)}`;

    await this.mailService.sendPasswordReset({
      to: user.email,
      name: user.name,
      resetUrl
    });
  }

  async confirmPasswordReset(dto: ResetPasswordDto): Promise<void> {
    const [tokenId, rawToken] = dto.token.split('.');
    if (!tokenId || !rawToken) {
      throw new BadRequestException('Invalid reset token');
    }

    const record = await this.passwordResetsRepository.findOne({
      where: { tokenId },
      relations: { user: true }
    });

    if (!record || record.usedAt) {
      throw new BadRequestException('Reset token invalid or used');
    }

    if (record.expiresAt <= new Date()) {
      throw new BadRequestException('Reset token expired');
    }

    const tokenMatches = await argon2.verify(record.tokenHash, rawToken).catch(() => false);
    if (!tokenMatches) {
      throw new BadRequestException('Reset token invalid');
    }

    const newHash = await argon2.hash(dto.newPassword);
    await this.usersService.updatePassword(record.user.id, newHash);

    record.usedAt = new Date();
    await this.passwordResetsRepository.save(record);
    await this.revokeActiveRefreshTokens(record.user.id);
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

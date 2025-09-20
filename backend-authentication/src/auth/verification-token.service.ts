import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import * as argon2 from 'argon2';
import { randomBytes, randomUUID } from 'crypto';
import { Repository } from 'typeorm';
import { UsersService } from '../users/users.service';
import { VerificationToken } from './entities/verification-token.entity';
import { MailService } from '../mail/mail.service';

@Injectable()
export class VerificationTokenService {
  constructor(
    private readonly usersService: UsersService,
    private readonly configService: ConfigService,
    private readonly mailService: MailService,
    @InjectRepository(VerificationToken)
    private readonly verificationTokensRepository: Repository<VerificationToken>
  ) {}

  async requestEmailVerification(email: string): Promise<void> {
    const user = await this.usersService.findByEmail(email);
    if (!user || user.isEmailVerified) {
      return;
    }

    await this.verificationTokensRepository
      .createQueryBuilder()
      .delete()
      .where('"user_id" = :userId AND type = :type', { userId: user.id, type: 'email' })
      .execute();

    const tokenId = randomUUID();
    const rawToken = randomBytes(32).toString('hex');
    const tokenHash = await argon2.hash(rawToken);
    const ttlSeconds = this.configService.get<number>('app.verificationTokenTtl', 86400);
    const expiresAt = new Date(Date.now() + ttlSeconds * 1000);

    await this.verificationTokensRepository.save(
      this.verificationTokensRepository.create({
        tokenId,
        tokenHash,
        type: 'email',
        expiresAt,
        user,
        usedAt: null
      })
    );

    const frontendUrl = this.configService.get<string>('app.frontendUrl') ?? '';
    const token = `${tokenId}.${rawToken}`;
    const verificationUrl = `${frontendUrl.replace(/\/$/, '')}/verify?token=${encodeURIComponent(token)}`;

    await this.mailService.sendEmailVerification({
      to: user.email,
      name: user.name,
      verificationUrl
    });
  }

  async verifyEmailToken(token: string): Promise<void> {
    const [tokenId, rawToken] = token.split('.');
    if (!tokenId || !rawToken) {
      throw new BadRequestException('Invalid verification token');
    }

    const record = await this.verificationTokensRepository.findOne({
      where: { tokenId, type: 'email' },
      relations: { user: true }
    });

    if (!record || record.usedAt) {
      throw new BadRequestException('Verification token invalid or used');
    }

    if (record.expiresAt <= new Date()) {
      throw new BadRequestException('Verification token expired');
    }

    const matches = await argon2.verify(record.tokenHash, rawToken).catch(() => false);
    if (!matches) {
      throw new BadRequestException('Verification token invalid');
    }

    record.usedAt = new Date();
    await this.verificationTokensRepository.save(record);
    await this.usersService.markEmailVerified(record.user.id);
  }
}

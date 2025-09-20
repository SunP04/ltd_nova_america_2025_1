import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import * as argon2 from 'argon2';
import { UsersService } from './users.service';

@Injectable()
export class UserBootstrapService implements OnApplicationBootstrap {
  private readonly logger = new Logger(UserBootstrapService.name);

  constructor(private readonly usersService: UsersService) {}

  async onApplicationBootstrap(): Promise<void> {
    const username = process.env.ADMIN_USERNAME ?? 'admin';
    const email = process.env.ADMIN_EMAIL ?? 'admin@example.com';
    const password = process.env.ADMIN_PASSWORD ?? 'admin';
    const name = process.env.ADMIN_NAME ?? 'Administrator';
    const institutions = (process.env.ADMIN_INSTITUTIONS ?? 'default')
      .split(',')
      .map((value) => value.trim())
      .filter((value) => value.length > 0);

    const existing = (await this.usersService.findByUsername(username)) ?? (await this.usersService.findByEmail(email));
    if (existing) {
      return;
    }

    const passwordHash = await argon2.hash(password);
    await this.usersService.create({
      email,
      username,
      passwordHash,
      name,
      institutionCodes: institutions.length > 0 ? institutions : ['default'],
      roleNames: ['admin'],
      emailVerified: true
    });

    this.logger.log(`Usuário administrador padrão criado (${username} / ${email}).`);
  }
}

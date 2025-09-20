import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { UserProfileDto } from './dto/user-profile.dto';
import { User } from './entities/user.entity';
import { Role } from './entities/role.entity';
import { Institution } from './entities/institution.entity';

interface CreateUserOptions {
  email: string;
  username: string;
  passwordHash: string;
  name: string;
  institutionCodes: string[];
  roleNames?: string[];
  emailVerified?: boolean;
}

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    @InjectRepository(Role)
    private readonly rolesRepository: Repository<Role>,
    @InjectRepository(Institution)
    private readonly institutionsRepository: Repository<Institution>
  ) {}

  async create(options: CreateUserOptions): Promise<User> {
    const roles = await this.resolveRoles(options.roleNames ?? ['user']);
    const institutions = await this.resolveInstitutions(options.institutionCodes);

    const user = this.usersRepository.create({
      email: options.email,
      username: options.username,
      passwordHash: options.passwordHash,
      name: options.name,
      roles,
      institutions,
      isEmailVerified: options.emailVerified ?? false
    });

    return this.usersRepository.save(user);
  }

  findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { email } });
  }

  findByUsername(username: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { username } });
  }

  findById(id: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { id } });
  }

  async updatePassword(userId: string, passwordHash: string): Promise<void> {
    await this.usersRepository.update({ id: userId }, { passwordHash });
  }

  async markEmailVerified(userId: string): Promise<void> {
    await this.usersRepository.update({ id: userId }, { isEmailVerified: true });
  }

  async saveTwoFactorSecret(userId: string, secret: string, recoveryCodes: string[]): Promise<void> {
    await this.usersRepository.update(
      { id: userId },
      { twoFactorSecret: secret, twoFactorRecoveryCodes: recoveryCodes, twoFactorEnabled: false }
    );
  }

  async clearTwoFactorSecret(userId: string): Promise<void> {
    await this.usersRepository.update(
      { id: userId },
      { twoFactorSecret: null, twoFactorRecoveryCodes: [], twoFactorEnabled: false }
    );
  }

  async setTwoFactorEnabled(userId: string, enabled: boolean): Promise<void> {
    await this.usersRepository.update({ id: userId }, { twoFactorEnabled: enabled });
  }

  async findByIdWithSecret(userId: string): Promise<User | null> {
    return this.usersRepository.findOne({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        username: true,
        passwordHash: true,
        name: true,
        createdAt: true,
        updatedAt: true,
        twoFactorEnabled: true,
        twoFactorSecret: true,
        twoFactorRecoveryCodes: true,
        isEmailVerified: true
      },
      relations: { roles: true, institutions: true }
    });
  }

  toProfile(user: User): UserProfileDto {
    return {
      id: user.id,
      email: user.email,
      username: user.username,
      name: user.name,
      roles: user.roles.map((role) => role.name),
      institutions: user.institutions.map((institution) => institution.code),
      twoFactorEnabled: user.twoFactorEnabled,
      isEmailVerified: user.isEmailVerified,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };
  }

  private async resolveRoles(roleNames: string[]): Promise<Role[]> {
    if (roleNames.length === 0) {
      roleNames = ['user'];
    }

    const existing = await this.rolesRepository.find({ where: { name: In(roleNames) } });
    const missingNames = roleNames.filter((name) => !existing.find((role) => role.name === name));

    const created = missingNames.map((name) => this.rolesRepository.create({ name }));
    if (created.length > 0) {
      await this.rolesRepository.save(created);
    }

    return [...existing, ...created];
  }

  private async resolveInstitutions(codes: string[]): Promise<Institution[]> {
    if (codes.length === 0) {
      throw new Error('At least one institution must be provided');
    }

    const existing = await this.institutionsRepository.find({ where: { code: In(codes) } });
    const missingCodes = codes.filter((code) => !existing.find((institution) => institution.code === code));

    const created = missingCodes.map((code) =>
      this.institutionsRepository.create({ code, name: code.toUpperCase() })
    );

    if (created.length > 0) {
      await this.institutionsRepository.save(created);
    }

    return [...existing, ...created];
  }
}

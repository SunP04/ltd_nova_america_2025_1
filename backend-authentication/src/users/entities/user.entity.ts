import { Exclude } from 'class-transformer';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn
} from 'typeorm';
import { PasswordReset } from '../../auth/entities/password-reset.entity';
import { RefreshToken } from '../../auth/entities/refresh-token.entity';
import { VerificationToken } from '../../auth/entities/verification-token.entity';
import { Institution } from './institution.entity';
import { Role } from './role.entity';

@Entity({ name: 'users' })
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ unique: true })
  email!: string;

  @Column({ unique: true })
  username!: string;

  @Column({ name: 'password_hash' })
  @Exclude()
  passwordHash!: string;

  @Column()
  name!: string;

  @Column({ name: 'two_factor_secret', type: 'varchar', length: 512, nullable: true, select: false })
  @Exclude()
  twoFactorSecret!: string | null;

  @Column({ name: 'two_factor_enabled', default: false })
  twoFactorEnabled!: boolean;

  @Column({ name: 'two_factor_recovery_codes', type: 'jsonb', default: () => "'[]'::jsonb" })
  @Exclude()
  twoFactorRecoveryCodes!: string[];

  @Column({ name: 'is_email_verified', default: false })
  isEmailVerified!: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  @ManyToMany(() => Role, (role) => role.users, { eager: true })
  @JoinTable({
    name: 'user_roles',
    joinColumn: { name: 'user_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'role_id', referencedColumnName: 'id' }
  })
  roles!: Role[];

  @ManyToMany(() => Institution, (institution) => institution.users, { eager: true })
  @JoinTable({
    name: 'user_institutions',
    joinColumn: { name: 'user_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'institution_id', referencedColumnName: 'id' }
  })
  institutions!: Institution[];

  @OneToMany(() => RefreshToken, (token) => token.user)
  refreshTokens!: RefreshToken[];

  @OneToMany(() => PasswordReset, (reset) => reset.user)
  passwordResets!: PasswordReset[];

  @OneToMany(() => VerificationToken, (token) => token.user)
  verificationTokens!: VerificationToken[];
}

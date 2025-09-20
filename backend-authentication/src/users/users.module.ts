import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import { Role } from './entities/role.entity';
import { Institution } from './entities/institution.entity';
import { UserBootstrapService } from './user-bootstrap.service';

@Module({
  imports: [TypeOrmModule.forFeature([User, Role, Institution])],
  providers: [UsersService, UserBootstrapService],
  exports: [UsersService]
})
export class UsersModule {}

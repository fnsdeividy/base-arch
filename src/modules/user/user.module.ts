import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserController } from '@modules/user/presentation/http/controllers/user.controller'
import { UserRoleController } from '@modules/user/presentation/http/controllers/user-role.controller'

import {
  UserRepository,
} from '@modules/user/infra/repositories/user.repository';
import { USER_REPOSITORY } from '@modules/user/presentation/interfaces/user.interface';
import { User } from '@modules/user/entities/user.entity';
import { Role } from '@modules/role/entities/role.entity';
import { UserService } from './application/services/user.service';
import { UserRoleService } from './application/services/user-role.service';
import { HashService } from '@shared/application/services/hash.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Role])
  ],
  controllers: [UserController, UserRoleController],
  providers: [
    UserService,
    UserRoleService,
    HashService,
    {
      provide: USER_REPOSITORY,
      useFactory: (userRepository) => new UserRepository(userRepository)
    },
  ],
  exports: [UserService, UserRoleService],
})
export class UserModule { }

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserController } from '@modules/user/presentation/http/controllers/user.controller'

import {
  UserRepository,
} from '@modules/user/infra/repositories/user.repository';
import { USER_REPOSITORY } from '@modules/user/presentation/interfaces/user.interface';
import { User } from '@modules/user/entities/user.entity';
import { UserService } from './application/services/user.service';
import { HashService } from '@shared/application/services/hash.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([User])
  ],
  controllers: [UserController],
  providers: [
    UserService,
    HashService,
    {
      provide: USER_REPOSITORY,
      useFactory: (userRepository) => new UserRepository(userRepository)
    },
  ],
  exports: [UserService],
})
export class UserModule { }

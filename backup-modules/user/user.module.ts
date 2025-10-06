import { Module } from '@nestjs/common';
import { UserController } from '@modules/user/presentation/http/controllers/user.controller'
import { UserService } from './application/services/user.service';
import { HashService } from '@shared/application/services/hash.service';

@Module({
  controllers: [UserController],
  providers: [UserService, HashService],
  exports: [UserService],
})
export class UserModule { }

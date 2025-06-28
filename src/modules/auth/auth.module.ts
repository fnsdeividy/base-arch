import { Module } from '@nestjs/common';
import { AuthController } from './presentation/http/controllers/auth.controller';
import { AuthService } from './application/services/auth.service';
import { JwtService } from '../../shared/core/services/jwt.service';
import { HashService } from '../../shared/core/services/hash.service';
import {
  UserRepository,

} from './infra/repositories/user.repository';
import { USER_REPOSITORY } from './presentation/interface/user.interface';

@Module({
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtService,
    HashService,
    {
      provide: USER_REPOSITORY,
      useClass: UserRepository,
    },
  ],
  exports: [AuthService],
})
export class AuthModule { }

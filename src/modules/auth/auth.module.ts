import { Module } from '@nestjs/common';
import { AuthController } from './presentation/controllers/auth.controller';
import { AuthService } from './application/services/auth.service';
import { JwtService } from '../../shared/core/services/jwt.service';
import { HashService } from '../../shared/core/services/hash.service';
import { UserRepository } from './infra/repositories/user.repository';

@Module({
  controllers: [AuthController],
  providers: [AuthService, JwtService, HashService, UserRepository],
  exports: [AuthService],
})
export class AuthModule {}

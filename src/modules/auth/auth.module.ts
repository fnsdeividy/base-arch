import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule, getRepositoryToken } from '@nestjs/typeorm';
import { AuthController } from './presentation/http/controllers/auth.controller';
import { AuthService } from './application/services/auth.service';
import { JwtService } from '../../shared/core/services/jwt.service';
import { HashService } from '../../shared/core/services/hash.service';
import {
  UserRepository,
} from './infra/repositories/user.repository';
import { USER_REPOSITORY } from './presentation/interface/user.interface';
import { User } from './domain/user.model';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'your-secret-key',
      signOptions: { expiresIn: '15m' },
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtService,
    HashService,
    {
      provide: USER_REPOSITORY,
      useFactory: (userRepository) => new UserRepository(userRepository),
      inject: [getRepositoryToken(User)],
    },
  ],
  exports: [AuthService],
})
export class AuthModule { }

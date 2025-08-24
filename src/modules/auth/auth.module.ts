import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule, getRepositoryToken } from '@nestjs/typeorm';
import { AuthController } from '@modules/auth/presentation/http/controllers/auth.controller';
import { AuthService } from '@modules/auth/application/services/auth.service';
import { JwtService } from '@shared/application/services/jwt.service';
import { HashService } from '@shared/application/services/hash.service';
import {
  UserRepository,
} from '@modules/user/infra/repositories/user.repository';
import { USER_REPOSITORY } from '@modules/user/presentation/interfaces/user.interface';
import { User } from '@modules/user/entities/user.entity';

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

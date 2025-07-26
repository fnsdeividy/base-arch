import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule, getRepositoryToken } from '@nestjs/typeorm';
import { AuthController } from '@modules/auth/presentation/http/controllers/auth.controller';
import { AuthService } from '@modules/auth/application/services/auth.service';
import { JwtService } from '@shared/application/services/jwt.service';
import { HashService } from '@shared/application/services/hash.service';
import { AuthorizationService } from '@shared/application/services/authorization.service';
import {
  UserRepository,
} from '@modules/user/infra/repositories/user.repository';
import { USER_REPOSITORY } from '@modules/user/presentation/interfaces/user.interface';
import { User } from '@modules/user/entities/user.model';
import { Role } from '@modules/role/entities/role.entity';
import { Permission } from '@modules/permission/entities/permission.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Role, Permission]),
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
    AuthorizationService,
    {
      provide: USER_REPOSITORY,
      useFactory: (userRepository) => new UserRepository(userRepository),
      inject: [getRepositoryToken(User)],
    },
  ],
  exports: [AuthService],
})
export class AuthModule { }

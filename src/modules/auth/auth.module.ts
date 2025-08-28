import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from '@modules/auth/presentation/http/controllers/auth.controller';
import { AuthService } from '@modules/auth/application/services/auth.service';
import { JwtService } from '@shared/application/services/jwt.service';
import { HashService } from '@shared/application/services/hash.service';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'your-secret-key',
      signOptions: { expiresIn: '15m' },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtService, HashService],
  exports: [AuthService],
})
export class AuthModule {}

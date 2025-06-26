import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';

// Controllers e Services HTTP
import { AppController } from './shared/adapters/http/controllers/app.controller';
import { AppService } from './app.service';

// Módulos de domínio
import { AuthModule } from './modules/auth/auth.module';

// Serviços compartilhados
import { JwtService } from './shared/core/services/jwt.service';
import { HashService } from './shared/core/services/hash.service';
import { DatabaseService } from './shared/infra/database/database.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'your-secret-key',
      signOptions: { expiresIn: '15m' },
    }),
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService, JwtService, HashService, DatabaseService],
})
export class AppModule { }

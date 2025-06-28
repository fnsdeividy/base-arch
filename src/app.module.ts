import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

// Controllers e Services HTTP
import { AppController } from './shared/presentation/http/controllers/app.controller';
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
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432'),
      database: process.env.DB_NAME || 'base_backend',
      username: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'password',
      entities: [],
      synchronize: process.env.NODE_ENV !== 'production',
      logging: process.env.NODE_ENV === 'development',
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

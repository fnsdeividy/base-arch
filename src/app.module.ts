import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';

// Controllers e Services HTTP
import { AppController } from './app.controller';
import { AppService } from './app.service';

// Prisma Module
import { PrismaModule } from './modules/prisma/prisma.module';

// Shared Module
import { SharedModule } from './shared/shared.module';

// Módulos de domínio
import { CashflowModule } from './modules/cashflow/cashflow.module';
import { StoresModule } from './modules/store/stores.module';
import { SalesModule } from './modules/sales/sales.module';
import { StockModule } from './modules/stock/stock.module';
import { ProductsModule } from './modules/product/products.module';
import { UserModule } from './modules/user/user.module';
import { AuthModule } from './modules/auth/auth.module';
import { ProductionModule } from './modules/production/production.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    PrismaModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET') || 'your-secret-key',
        signOptions: {
          expiresIn: configService.get<string>('JWT_EXPIRES_IN') || '24h',
        },
      }),
      inject: [ConfigService],
    }),
    SharedModule,
    CashflowModule,
    StoresModule,
    SalesModule,
    StockModule,
    ProductsModule,
    UserModule,
    AuthModule,
    ProductionModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }

import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';

// Controllers e Services HTTP
import { AppController } from '@shared/presentation/http/controllers/app.controller';
import { AppService } from './app.service';

// Módulos de domínio
import { AuthModule } from '@modules/auth/auth.module';

// Serviços compartilhados
import { JwtService } from '@shared/application/services/jwt.service';
import { HashService } from '@shared/application/services/hash.service';

// Modules
import { UserModule } from '@modules/user/user.module';
import { StoresModule } from '@modules/store/stores.module';
import { ProductsModule } from '@modules/product/products.module';
import { CustomersModule } from '@modules/customer/customers.module';
import { InvoicesModule } from '@modules/invoice/invoices.module';
import { OrdersModule } from '@modules/order/orders.module';
import { StockModule } from '@modules/stock/stock.module';
import { DashboardModule } from '@modules/dashboard/dashboard.module';

// Prisma Module
import { PrismaModule } from '@modules/prisma';

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
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: configService.get<string>('JWT_EXPIRES_IN') || '24h'
        },
      }),
      inject: [ConfigService],
    }),
    AuthModule,
    UserModule,
    StoresModule,
    ProductsModule,
    StockModule,
    CustomersModule,
    OrdersModule,
    InvoicesModule,
    DashboardModule,
  ],
  controllers: [AppController],
  providers: [AppService, JwtService, HashService],
})
export class AppModule { }

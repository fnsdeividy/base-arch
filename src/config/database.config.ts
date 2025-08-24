import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { User } from '@modules/user/entities/user.entity';
import { Store } from '@modules/store/entities/store.entity';
import { Product } from '@modules/product/entities/product.entity';
import { Customer } from '@modules/customer/entities/customer.entity';
import { Invoice } from '@modules/invoice/entities/invoice.entity';
import { Order } from '@modules/order/entities/order.entity';
import { Stock } from '@modules/stock/entities/stock.entity';

export const getDatabaseConfig = (configService: ConfigService): TypeOrmModuleOptions => ({
  type: 'postgres',
  host: configService.get<string>('DB_HOST') || 'localhost',
  port: configService.get<number>('DB_PORT') || 5433,
  username: configService.get<string>('DB_USERNAME') || 'cloro_user',
  password: configService.get<string>('DB_PASSWORD') || 'cloro_password',
  database: configService.get<string>('DB_NAME') || 'cloro_db',
  entities: [User, Store, Product, Customer, Invoice, Order, Stock],
  synchronize: configService.get<string>('NODE_ENV') === 'development',
  logging: configService.get<string>('NODE_ENV') === 'development',
  ssl: configService.get<string>('NODE_ENV') === 'production' ? { rejectUnauthorized: false } : false,
  migrations: ['dist/database/migrations/*.js'],
  migrationsTableName: 'migrations',
});

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { Order } from '@modules/order/entities/order.entity';
import { Customer } from '@modules/customer/entities/customer.entity';
import { Product } from '@modules/product/entities/product.entity';
import { Stock } from '@modules/stock/entities/stock.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Order, Customer, Product, Stock])
  ],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule { }

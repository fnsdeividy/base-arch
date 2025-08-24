import { Module } from '@nestjs/common';
import { OrderController } from '@modules/order/presentation/http/controllers/order.controller';
import { OrderService } from './application/services/order.service';

@Module({
  controllers: [OrderController],
  providers: [OrderService],
  exports: [OrderService],
})
export class OrdersModule { }

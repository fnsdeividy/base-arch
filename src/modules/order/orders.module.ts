import { Module } from '@nestjs/common';
import { TypeOrmModule, getRepositoryToken } from '@nestjs/typeorm';
import { OrderController } from '@modules/order/presentation/http/controllers/order.controller';
import { OrderRepository } from '@modules/order/infra/repositories/order.repository';
import { ORDER_REPOSITORY } from '@modules/order/presentation/interfaces/order.interface';
import { Order } from '@modules/order/entities/order.entity';
import { OrderService } from './application/services/order.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Order])
  ],
  controllers: [OrderController],
  providers: [
    OrderService,
    {
      provide: ORDER_REPOSITORY,
      useFactory: (orderRepository) => new OrderRepository(orderRepository),
      inject: [getRepositoryToken(Order)],
    },
  ],
  exports: [OrderService],
})
export class OrdersModule { }

import { Order, OrderStatus } from '@modules/order/entities/order.entity';
import { CreateOrderDto } from '@modules/order/presentation/dto/createOrder.dto';
import { UpdateOrderDto } from '@modules/order/presentation/dto/updateOrder.dto';

export { CreateOrderDto, UpdateOrderDto };

export const ORDER_REPOSITORY = 'ORDER_REPOSITORY';

export interface IOrderRepository {
  create(data: Partial<Order>): Promise<Order>;
  findById(id: string): Promise<Order | null>;
  findByOrderNumber(orderNumber: string): Promise<Order | null>;
  findAll(filters?: { status?: OrderStatus; customerId?: string; storeId?: string }): Promise<Order[]>;
  update(criteria: Partial<Order>, data: Partial<Order>): Promise<void>;
  delete(criteria: Partial<Order>): Promise<void>;
}

export interface IOrderService {
  create(createOrderDto: CreateOrderDto): Promise<Order>;
  findAll(filters?: { status?: OrderStatus; customerId?: string; storeId?: string }): Promise<Order[]>;
  findOne(id: string): Promise<Order>;
  update(id: string, updateOrderDto: UpdateOrderDto): Promise<Order>;
  remove(id: string): Promise<void>;
  updateStatus(id: string, status: OrderStatus): Promise<Order>;
}

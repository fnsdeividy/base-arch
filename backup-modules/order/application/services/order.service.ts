import { Injectable, NotFoundException, ConflictException, Inject } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { Order } from '@modules/order/entities/order.entity';
import { CreateOrderDto } from '@modules/order/presentation/dto/createOrder.dto';
import { UpdateOrderDto } from '@modules/order/presentation/dto/updateOrder.dto';
import { IOrderService, IOrderRepository, ORDER_REPOSITORY } from '@modules/order/presentation/interfaces/order.interface';

@Injectable()
export class OrderService implements IOrderService {
  constructor(
    @Inject(ORDER_REPOSITORY)
    private readonly orderRepository: IOrderRepository
  ) { }

  async createOrder(createOrderDto: CreateOrderDto): Promise<Order> {
    // Check if order with same number already exists
    const existingOrder = await this.orderRepository.findByOrderNumber(createOrderDto.orderNumber);
    if (existingOrder) {
      throw new ConflictException('Order with this number already exists');
    }

    // Calculate final amount if not provided
    const finalAmount = createOrderDto.finalAmount ||
      (createOrderDto.totalAmount + (createOrderDto.taxAmount || 0) - (createOrderDto.discountAmount || 0) + (createOrderDto.shippingCost || 0));

    const order = await this.orderRepository.create({
      id: randomUUID(),
      ...createOrderDto,
      finalAmount,
      shippingCost: createOrderDto.shippingCost || 0,
      isActive: createOrderDto.isActive ?? true
    });

    return order;
  }

  async updateOrder(id: string, payload: UpdateOrderDto): Promise<Order | null> {
    const order = await this.orderRepository.findById(id);
    if (!order) {
      throw new NotFoundException('Order not found');
    }

    // Check if order number is being updated and if it already exists
    if (payload.orderNumber && payload.orderNumber !== order.orderNumber) {
      const existingOrder = await this.orderRepository.findByOrderNumber(payload.orderNumber);
      if (existingOrder) {
        throw new ConflictException('Order with this number already exists');
      }
    }

    // Recalculate final amount if amounts are being updated
    if (payload.totalAmount || payload.taxAmount || payload.discountAmount || payload.shippingCost) {
      const totalAmount = payload.totalAmount ?? order.totalAmount;
      const taxAmount = payload.taxAmount ?? order.taxAmount;
      const discountAmount = payload.discountAmount ?? order.discountAmount;
      const shippingCost = payload.shippingCost ?? order.shippingCost;
      payload.finalAmount = totalAmount + taxAmount - discountAmount + shippingCost;
    }

    await this.orderRepository.update({ id }, payload);
    return this.orderRepository.findById(id);
  }

  async findById(id: string): Promise<Order | null> {
    return this.orderRepository.findById(id);
  }

  async deleteOrder(id: string): Promise<void> {
    const order = await this.orderRepository.findById(id);
    if (!order) {
      throw new NotFoundException('Order not found');
    }

    await this.orderRepository.update({ id }, { isActive: false });
  }

  async findByStore(storeId: string): Promise<Order[]> {
    return this.orderRepository.findByStore(storeId);
  }

  async findByCustomer(customerId: string): Promise<Order[]> {
    return this.orderRepository.findByCustomer(customerId);
  }

  async findByStatus(status: string): Promise<Order[]> {
    return this.orderRepository.findByStatus(status);
  }
} 
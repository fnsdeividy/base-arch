import { Injectable, NotFoundException, ConflictException, Inject } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { Order, OrderStatus } from '@modules/order/entities/order.entity';
import { CreateOrderDto } from '@modules/order/presentation/dto/createOrder.dto';
import { UpdateOrderDto } from '@modules/order/presentation/dto/updateOrder.dto';
import { IOrderService, IOrderRepository, ORDER_REPOSITORY } from '@modules/order/presentation/interfaces/order.interface';

@Injectable()
export class OrderService implements IOrderService {
  constructor(
    @Inject(ORDER_REPOSITORY)
    private readonly orderRepository: IOrderRepository
  ) { }

  async create(createOrderDto: CreateOrderDto): Promise<Order> {
    // Generate order number
    const orderNumber = this.generateOrderNumber();

    // Check if order number already exists
    const existingOrder = await this.orderRepository.findByOrderNumber(orderNumber);
    if (existingOrder) {
      throw new ConflictException('Order number already exists');
    }

    // Calculate total
    const total = this.calculateTotal(createOrderDto);

    const order = await this.orderRepository.create({
      id: randomUUID(),
      orderNumber,
      ...createOrderDto,
      total,
      status: createOrderDto.status || OrderStatus.PENDING
    });

    return order;
  }

  async findAll(filters?: {
    status?: OrderStatus;
    customerId?: string;
    storeId?: string
  }): Promise<Order[]> {
    return this.orderRepository.findAll(filters);
  }

  async findOne(id: string): Promise<Order> {
    const order = await this.orderRepository.findById(id);
    if (!order) {
      throw new NotFoundException('Order not found');
    }
    return order;
  }

  async update(id: string, updateOrderDto: UpdateOrderDto): Promise<Order> {
    const order = await this.orderRepository.findById(id);
    if (!order) {
      throw new NotFoundException('Order not found');
    }

    // Recalculate total if items changed
    let total = order.total;
    if (updateOrderDto.items && updateOrderDto.items.length > 0) {
      total = this.calculateTotal(updateOrderDto);
    }

    await this.orderRepository.update({ id }, { ...updateOrderDto, total });
    return await this.orderRepository.findById(id) as Order;
  }

  async remove(id: string): Promise<void> {
    const order = await this.orderRepository.findById(id);
    if (!order) {
      throw new NotFoundException('Order not found');
    }
    await this.orderRepository.delete({ id });
  }

  async updateStatus(id: string, status: OrderStatus): Promise<Order> {
    const order = await this.orderRepository.findById(id);
    if (!order) {
      throw new NotFoundException('Order not found');
    }

    await this.orderRepository.update({ id }, { status });
    return await this.orderRepository.findById(id) as Order;
  }

  private generateOrderNumber(): string {
    const timestamp = Date.now().toString();
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `ORD-${timestamp}-${random}`;
  }

  private calculateTotal(orderData: CreateOrderDto | UpdateOrderDto): number {
    if (!orderData.items || orderData.items.length === 0) return 0;

    const itemsTotal = orderData.items.reduce((sum, item) => {
      const itemTotal = item.quantity * item.unitPrice;
      const itemDiscount = item.discount || 0;
      return sum + (itemTotal - itemDiscount);
    }, 0);

    const discount = orderData.discount || 0;
    const tax = orderData.tax || 0;

    return itemsTotal - discount + tax;
  }
}
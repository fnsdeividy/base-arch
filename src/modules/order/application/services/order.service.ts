import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { randomUUID } from 'crypto';
import { CreateOrderDto } from '@modules/order/presentation/dto/createOrder.dto';
import { UpdateOrderDto } from '@modules/order/presentation/dto/updateOrder.dto';
import { PrismaService } from '@modules/prisma/prisma.service';

@Injectable()
export class OrderService {
  constructor(
    private readonly prisma: PrismaService,
  ) { }

  async create(createOrderDto: CreateOrderDto) {
    // Generate order number
    const orderNumber = this.generateOrderNumber();

    // Check if order number already exists
    const existingOrder = await this.prisma.order.findUnique({
      where: { orderNumber },
    });
    if (existingOrder) {
      throw new ConflictException('Order number already exists');
    }

    // Calculate total
    const total = this.calculateTotal(createOrderDto);

    const order = await this.prisma.order.create({
      data: {
        id: randomUUID(),
        orderNumber,
        customerId: createOrderDto.customerId,
        storeId: createOrderDto.storeId,
        status: createOrderDto.status || 'pending',
        totalAmount: total as any,
        discount: (createOrderDto.discount || 0) as any,
        taxAmount: (createOrderDto.tax || 0) as any,
        notes: createOrderDto.notes,
      },
    });

    return order;
  }

  async findAll(filters?: {
    status?: string;
    customerId?: string;
    storeId?: string;
  }) {
    return this.prisma.order.findMany({
      where: filters,
    });
  }

  async findOne(id: string) {
    const order = await this.prisma.order.findUnique({
      where: { id },
    });
    if (!order) {
      throw new NotFoundException('Order not found');
    }
    return order;
  }

  async update(id: string, updateOrderDto: UpdateOrderDto) {
    const order = await this.prisma.order.findUnique({
      where: { id },
    });
    if (!order) {
      throw new NotFoundException('Order not found');
    }

    // Recalculate total if items changed
    let total: any = order.totalAmount;
    if (updateOrderDto.items && updateOrderDto.items.length > 0) {
      total = this.calculateTotal(updateOrderDto);
    }

    const updatedOrder = await this.prisma.order.update({
      where: { id },
      data: {
        ...updateOrderDto,
        totalAmount: total as any,
        discount: (updateOrderDto.discount || 0) as any,
        taxAmount: (updateOrderDto.tax || 0) as any,
      },
    });
    return updatedOrder;
  }

  async remove(id: string): Promise<void> {
    const order = await this.prisma.order.findUnique({
      where: { id },
    });
    if (!order) {
      throw new NotFoundException('Order not found');
    }
    await this.prisma.order.delete({
      where: { id },
    });
  }

  async updateStatus(id: string, status: string) {
    const order = await this.prisma.order.findUnique({
      where: { id },
    });
    if (!order) {
      throw new NotFoundException('Order not found');
    }

    const updatedOrder = await this.prisma.order.update({
      where: { id },
      data: { status },
    });
    return updatedOrder;
  }

  private generateOrderNumber(): string {
    const timestamp = Date.now().toString();
    const random = Math.floor(Math.random() * 1000)
      .toString()
      .padStart(3, '0');
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

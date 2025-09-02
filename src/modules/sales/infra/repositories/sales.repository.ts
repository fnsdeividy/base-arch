import { Injectable } from '@nestjs/common';
import { PrismaService } from '@modules/prisma/prisma.service';
import { Sale, SaleItem } from '@modules/sales/entities/sale.entity';
import { ISalesRepository } from '@modules/sales/presentation/interfaces/sales.interface';

@Injectable()
export class SalesRepository implements ISalesRepository {
  constructor(private readonly prisma: PrismaService) { }

  async findAll(page: number, limit: number): Promise<{ sales: Sale[]; total: number; totalPages: number }> {
    const skip = (page - 1) * limit;

    const [sales, total] = await Promise.all([
      this.prisma.order.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          orderItems: true,
          customer: true,
          store: true,
        },
      }),
      this.prisma.order.count(),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      sales: sales.map(this.mapPrismaOrderToSale),
      total,
      totalPages,
    };
  }

  async findById(id: string): Promise<Sale | null> {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: {
        orderItems: true,
        customer: true,
        store: true,
      },
    });

    return order ? this.mapPrismaOrderToSale(order) : null;
  }

  async findByOrderNumber(orderNumber: string): Promise<Sale | null> {
    const order = await this.prisma.order.findUnique({
      where: { orderNumber },
      include: {
        orderItems: true,
        customer: true,
        store: true,
      },
    });

    return order ? this.mapPrismaOrderToSale(order) : null;
  }

  async findByCustomerId(customerId: string, page: number, limit: number): Promise<{ sales: Sale[]; total: number; totalPages: number }> {
    const skip = (page - 1) * limit;

    const [sales, total] = await Promise.all([
      this.prisma.order.findMany({
        where: { customerId },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          orderItems: true,
          customer: true,
          store: true,
        },
      }),
      this.prisma.order.count({ where: { customerId } }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      sales: sales.map(this.mapPrismaOrderToSale),
      total,
      totalPages,
    };
  }

  async findByStoreId(storeId: string, page: number, limit: number): Promise<{ sales: Sale[]; total: number; totalPages: number }> {
    const skip = (page - 1) * limit;

    const [sales, total] = await Promise.all([
      this.prisma.order.findMany({
        where: { storeId },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          orderItems: true,
          customer: true,
          store: true,
        },
      }),
      this.prisma.order.count({ where: { storeId } }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      sales: sales.map(this.mapPrismaOrderToSale),
      total,
      totalPages,
    };
  }

  async create(data: Partial<Sale>): Promise<Sale> {
    const order = await this.prisma.order.create({
      data: {
        orderNumber: data.orderNumber!,
        customerId: data.customerId!,
        customerName: data.customerName!,
        storeId: data.storeId!,
        status: data.status!,
        totalAmount: data.totalAmount!,
        discount: data.discount,
        taxAmount: data.taxAmount,
        paymentMethod: data.paymentMethod!,
        notes: data.notes,
        orderItems: {
          create: data.items?.map(item => ({
            productId: item.productId,
            productName: item.productName,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            discount: item.discount,
            total: item.total,
          })) || [],
        },
      },
      include: {
        orderItems: true,
        customer: true,
        store: true,
      },
    });

    return this.mapPrismaOrderToSale(order);
  }

  async update(id: string, data: Partial<Sale>): Promise<void> {
    await this.prisma.order.update({
      where: { id },
      data: {
        customerName: data.customerName,
        status: data.status,
        totalAmount: data.totalAmount,
        discount: data.discount,
        taxAmount: data.taxAmount,
        paymentMethod: data.paymentMethod,
        notes: data.notes,
      },
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.order.delete({
      where: { id },
    });
  }

  private mapPrismaOrderToSale(order: any): Sale {
    return {
      id: order.id,
      orderNumber: order.orderNumber,
      customerId: order.customerId,
      customerName: order.customerName,
      storeId: order.storeId,
      status: order.status,
      totalAmount: Number(order.totalAmount),
      discount: order.discount ? Number(order.discount) : null,
      taxAmount: order.taxAmount ? Number(order.taxAmount) : null,
      paymentMethod: order.paymentMethod,
      notes: order.notes,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
      items: order.orderItems.map((item: any) => ({
        id: item.id,
        orderId: item.orderId,
        productId: item.productId,
        productName: item.productName,
        quantity: item.quantity,
        unitPrice: Number(item.unitPrice),
        discount: item.discount ? Number(item.discount) : null,
        total: Number(item.total),
        createdAt: item.createdAt,
      })),
    };
  }
}

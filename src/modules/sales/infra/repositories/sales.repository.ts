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
    // Gerar orderNumber se não fornecido
    const orderNumber = data.orderNumber || `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Calcular totalAmount se não fornecido
    let totalAmount = data.totalAmount || 0;
    if (data.items && data.items.length > 0) {
      totalAmount = data.items.reduce((sum, item) => {
        const itemTotal = (item.unitPrice || 0) * (item.quantity || 1);
        return sum + itemTotal;
      }, 0);
    }

    // Criar ou encontrar cliente baseado nos dados fornecidos
    let customerId = '4F461257-2F49-4667-83E4-A9510DDAE575'; // Cliente padrão como fallback

    if (data.customerName) {
      // Tentar encontrar cliente existente pelo nome
      const existingCustomer = await this.prisma.customer.findFirst({
        where: {
          OR: [
            { firstName: { contains: data.customerName, mode: 'insensitive' } },
            { lastName: { contains: data.customerName, mode: 'insensitive' } },
            { email: data.customerEmail || undefined }
          ]
        }
      });

      if (existingCustomer) {
        customerId = existingCustomer.id;
        console.log(`Using existing customer: ${existingCustomer.firstName} ${existingCustomer.lastName}`);
      } else {
        // Criar novo cliente
        const newCustomer = await this.prisma.customer.create({
          data: {
            firstName: data.customerName.split(' ')[0] || data.customerName,
            lastName: data.customerName.split(' ').slice(1).join(' ') || '',
            email: data.customerEmail || null,
            phone: data.customerPhone || null,
            isActive: true,
          }
        });
        customerId = newCustomer.id;
        console.log(`Created new customer: ${newCustomer.firstName} ${newCustomer.lastName}`);
      }
    }

    // Verificar se o storeId existe, senão usar o padrão
    let storeId = data.storeId || 'c2eebc99-9c0b-4ef8-bb6d-6bb9bd380a33';
    if (data.storeId) {
      const storeExists = await this.prisma.store.findUnique({
        where: { id: data.storeId }
      });
      if (!storeExists) {
        console.warn(`Store with ID ${data.storeId} not found, using default store`);
        storeId = 'c2eebc99-9c0b-4ef8-bb6d-6bb9bd380a33';
      }
    }

    const order = await this.prisma.order.create({
      data: {
        orderNumber,
        customerId,
        storeId,
        status: data.status || 'pending',
        total: totalAmount,
        discount: data.discount || 0,
        tax: data.taxAmount || 0,
        paymentMethod: data.paymentMethod || 'cash',
        notes: data.notes || '',
        orderItems: {
          create: data.items?.map(item => {
            const unitPrice = item.unitPrice || item.price || 0;
            const quantity = item.quantity || 1;
            const total = unitPrice * quantity;

            return {
              productId: item.productId,
              productName: item.productName || 'Produto',
              quantity: quantity,
              unitPrice: unitPrice,
              discount: item.discount || 0,
              total: total,
            };
          }) || [],
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
        status: data.status,
        total: data.totalAmount,
        discount: data.discount,
        tax: data.taxAmount,
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

  async getStatistics(filters: any): Promise<{
    totalSales: number;
    totalRevenue: number;
    averageTicket: number;
    salesByStatus: Record<string, number>;
    salesByPaymentMethod: Record<string, number>;
  }> {
    console.log('SalesRepository.getStatistics called with filters:', filters);
    const where: any = {};

    if (filters.startDate && filters.endDate) {
      where.createdAt = {
        gte: new Date(filters.startDate),
        lte: new Date(filters.endDate),
      };
    }

    if (filters.storeId) {
      where.storeId = filters.storeId;
    }

    const [totalSales, totalRevenue, salesByStatus] = await Promise.all([
      this.prisma.order.count({ where }),
      this.prisma.order.aggregate({
        where: {
          ...where,
          status: 'completed', // Apenas vendas concluídas contam para receita
        },
        _sum: { total: true },
      }),
      this.prisma.order.groupBy({
        by: ['status'],
        where,
        _count: { status: true },
      }),
    ]);

    // Calcular ticket médio apenas com vendas concluídas
    const completedSalesCount = salesByStatus.find(s => s.status === 'completed')?._count.status || 0;
    const averageTicket = completedSalesCount > 0 ? Number(totalRevenue._sum.total || 0) / completedSalesCount : 0;

    return {
      totalSales,
      totalRevenue: Number(totalRevenue._sum.total || 0),
      averageTicket,
      salesByStatus: salesByStatus.reduce((acc, item) => {
        acc[item.status] = item._count.status;
        return acc;
      }, {} as Record<string, number>),
      salesByPaymentMethod: { cash: totalSales }, // Fallback para compatibilidade
    };
  }

  private mapPrismaOrderToSale(order: any): Sale {
    return {
      id: order.id,
      orderNumber: order.orderNumber,
      customerId: order.customerId,
      customerName: order.customer ? `${order.customer.firstName} ${order.customer.lastName}` : 'Cliente',
      customerEmail: order.customer?.email || null,
      customerPhone: order.customer?.phone || null,
      storeId: order.storeId,
      status: order.status,
      totalAmount: Number(order.total),
      total: Number(order.total), // Para compatibilidade com frontend
      discount: order.discount ? Number(order.discount) : null,
      taxAmount: order.tax ? Number(order.tax) : null,
      paymentMethod: order.paymentMethod || 'cash',
      notes: order.notes,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
      userId: 'system', // Fallback para compatibilidade
      items: order.orderItems?.map(item => ({
        id: item.id,
        orderId: order.id,
        productId: item.productId,
        productName: item.productName,
        quantity: item.quantity,
        unitPrice: Number(item.unitPrice),
        price: Number(item.unitPrice), // Para compatibilidade com frontend
        discount: item.discount ? Number(item.discount) : null,
        total: Number(item.total),
        createdAt: item.createdAt,
      })) || [],
    };
  }
}

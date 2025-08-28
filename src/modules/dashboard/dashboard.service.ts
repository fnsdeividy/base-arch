import { Injectable } from '@nestjs/common';
import { PrismaService } from '@modules/prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(
    private readonly prisma: PrismaService,
  ) { }

  async getMetrics() {
    const [
      totalRevenue,
      totalOrders,
      activeCustomers,
      productsInStock,
      lowStockProducts,
    ] = await Promise.all([
      this.getTotalRevenue(),
      this.getTotalOrders(),
      this.getActiveCustomers(),
      this.getProductsInStock(),
      this.getLowStockProducts(),
    ]);

    return {
      totalRevenue: {
        value: totalRevenue.current,
        change: this.calculatePercentageChange(
          totalRevenue.previous,
          totalRevenue.current,
        ),
        label: 'Receita Total',
      },
      totalOrders: {
        value: totalOrders.current,
        change: this.calculatePercentageChange(
          totalOrders.previous,
          totalOrders.current,
        ),
        label: 'Vendas',
      },
      activeCustomers: {
        value: activeCustomers.current,
        change: this.calculatePercentageChange(
          activeCustomers.previous,
          activeCustomers.current,
        ),
        label: 'Clientes Ativos',
      },
      productsInStock: {
        value: productsInStock,
        lowStock: lowStockProducts,
        label: 'Produtos em Estoque',
      },
    };
  }

  async getRecentSales() {
    const recentOrders = await this.prisma.order.findMany({
      include: {
        customer: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 5,
    });

    return recentOrders.map(order => ({
      id: order.id,
      customer: {
        name: `${order.customer.firstName} ${order.customer.lastName}`,
        email: order.customer.email,
      },
      amount: order.totalAmount,
      status: order.status,
      createdAt: order.createdAt,
    }));
  }

  async getSalesChart() {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const salesData = await this.prisma.$queryRaw`
      SELECT 
        DATE_TRUNC('month', "created_at") as month,
        SUM("total_amount") as revenue,
        COUNT(*) as orders
      FROM orders 
      WHERE "created_at" >= ${sixMonthsAgo}
      GROUP BY DATE_TRUNC('month', "created_at")
      ORDER BY month ASC
    `;

    const months = [
      'Jan',
      'Fev',
      'Mar',
      'Abr',
      'Mai',
      'Jun',
      'Jul',
      'Ago',
      'Set',
      'Out',
      'Nov',
      'Dez',
    ];

    return (salesData as any[]).map(data => ({
      month: months[new Date(data.month).getMonth()],
      revenue: parseFloat(data.revenue) || 0,
      orders: parseInt(data.orders) || 0,
    }));
  }

  private async getTotalRevenue() {
    const currentMonth = new Date();
    currentMonth.setDate(1);

    const previousMonth = new Date(currentMonth);
    previousMonth.setMonth(previousMonth.getMonth() - 1);

    const [current, previous] = await Promise.all([
      this.prisma.order.aggregate({
        _sum: {
          totalAmount: true,
        },
        where: {
          createdAt: {
            gte: currentMonth,
          },
        },
      }),
      this.prisma.order.aggregate({
        _sum: {
          totalAmount: true,
        },
        where: {
          createdAt: {
            gte: previousMonth,
            lt: currentMonth,
          },
        },
      }),
    ]);

    return {
      current: parseFloat(current._sum.totalAmount?.toString() || '0'),
      previous: parseFloat(previous._sum.totalAmount?.toString() || '0'),
    };
  }

  private async getTotalOrders() {
    const currentMonth = new Date();
    currentMonth.setDate(1);

    const previousMonth = new Date(currentMonth);
    previousMonth.setMonth(previousMonth.getMonth() - 1);

    const [current, previous] = await Promise.all([
      this.prisma.order.count({
        where: { createdAt: { gte: currentMonth } },
      }),
      this.prisma.order.count({
        where: {
          createdAt: {
            gte: previousMonth,
            lt: currentMonth,
          },
        },
      }),
    ]);

    return { current, previous };
  }

  private async getActiveCustomers() {
    const currentMonth = new Date();
    currentMonth.setDate(1);

    const previousMonth = new Date(currentMonth);
    previousMonth.setMonth(previousMonth.getMonth() - 1);

    const [current, previous] = await Promise.all([
      this.prisma.customer.count({
        where: { isActive: true, createdAt: { gte: currentMonth } },
      }),
      this.prisma.customer.count({
        where: {
          isActive: true,
          createdAt: {
            gte: previousMonth,
            lt: currentMonth,
          },
        },
      }),
    ]);

    return { current, previous };
  }

  private async getProductsInStock() {
    return await this.prisma.stock.count({
      where: { quantity: { gt: 0 } },
    });
  }

  private async getLowStockProducts() {
    const result = await this.prisma.$queryRaw`
      SELECT COUNT(*) as count 
      FROM stocks 
      WHERE quantity <= "min_quantity"
    `;
    return parseInt((result as any[])[0]?.count || '0');
  }

  private calculatePercentageChange(previous: number, current: number): number {
    if (previous === 0) return current > 0 ? 100 : 0;
    return Math.round(((current - previous) / previous) * 100);
  }
}

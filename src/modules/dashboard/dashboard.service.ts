import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThanOrEqual, LessThan, Between } from 'typeorm';
import { Order } from '@modules/order/entities/order.entity';
import { Customer } from '@modules/customer/entities/customer.entity';
import { Product } from '@modules/product/entities/product.entity';
import { Stock } from '@modules/stock/entities/stock.entity';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(Customer)
    private readonly customerRepository: Repository<Customer>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(Stock)
    private readonly stockRepository: Repository<Stock>,
  ) { }

  async getMetrics() {
    const [totalRevenue, totalOrders, activeCustomers, productsInStock, lowStockProducts] = await Promise.all([
      this.getTotalRevenue(),
      this.getTotalOrders(),
      this.getActiveCustomers(),
      this.getProductsInStock(),
      this.getLowStockProducts(),
    ]);

    return {
      totalRevenue: {
        value: totalRevenue.current,
        change: this.calculatePercentageChange(totalRevenue.previous, totalRevenue.current),
        label: 'Receita Total'
      },
      totalOrders: {
        value: totalOrders.current,
        change: this.calculatePercentageChange(totalOrders.previous, totalOrders.current),
        label: 'Vendas'
      },
      activeCustomers: {
        value: activeCustomers.current,
        change: this.calculatePercentageChange(activeCustomers.previous, activeCustomers.current),
        label: 'Clientes Ativos'
      },
      productsInStock: {
        value: productsInStock,
        lowStock: lowStockProducts,
        label: 'Produtos em Estoque'
      }
    };
  }

  async getRecentSales() {
    const recentOrders = await this.orderRepository.find({
      relations: ['customer'],
      order: { createdAt: 'DESC' },
      take: 5,
    });

    return recentOrders.map(order => ({
      id: order.id,
      customer: {
        name: `${order.customer.firstName} ${order.customer.lastName}`,
        email: order.customer.email,
      },
      amount: order.total,
      status: order.status,
      createdAt: order.createdAt,
    }));
  }

  async getSalesChart() {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const salesData = await this.orderRepository
      .createQueryBuilder('order')
      .select('DATE_TRUNC(\'month\', order.created_at)', 'month')
      .addSelect('SUM(order.total)', 'revenue')
      .addSelect('COUNT(*)', 'orders')
      .where('order.created_at >= :date', { date: sixMonthsAgo })
      .groupBy('DATE_TRUNC(\'month\', order.created_at)')
      .orderBy('month', 'ASC')
      .getRawMany();

    const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

    return salesData.map(data => ({
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
      this.orderRepository
        .createQueryBuilder('order')
        .select('SUM(order.total)', 'total')
        .where('order.created_at >= :date', { date: currentMonth })
        .getRawOne(),
      this.orderRepository
        .createQueryBuilder('order')
        .select('SUM(order.total)', 'total')
        .where('order.created_at >= :startDate AND order.created_at < :endDate', {
          startDate: previousMonth,
          endDate: currentMonth,
        })
        .getRawOne(),
    ]);

    return {
      current: parseFloat(current?.total) || 0,
      previous: parseFloat(previous?.total) || 0,
    };
  }

  private async getTotalOrders() {
    const currentMonth = new Date();
    currentMonth.setDate(1);

    const previousMonth = new Date(currentMonth);
    previousMonth.setMonth(previousMonth.getMonth() - 1);

    const [current, previous] = await Promise.all([
      this.orderRepository.count({
        where: { createdAt: MoreThanOrEqual(currentMonth) },
      }),
      this.orderRepository.count({
        where: {
          createdAt: Between(previousMonth, currentMonth),
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
      this.customerRepository.count({
        where: { isActive: true, createdAt: MoreThanOrEqual(currentMonth) },
      }),
      this.customerRepository.count({
        where: {
          isActive: true,
          createdAt: Between(previousMonth, currentMonth),
        },
      }),
    ]);

    return { current, previous };
  }

  private async getProductsInStock() {
    return await this.stockRepository
      .createQueryBuilder('stock')
      .select('COUNT(*)', 'count')
      .where('stock.quantity > 0')
      .getRawOne()
      .then(result => parseInt(result.count) || 0);
  }

  private async getLowStockProducts() {
    return await this.stockRepository
      .createQueryBuilder('stock')
      .select('COUNT(*)', 'count')
      .where('stock.quantity <= stock.minQuantity')
      .getRawOne()
      .then(result => parseInt(result.count) || 0);
  }

  private calculatePercentageChange(previous: number, current: number): number {
    if (previous === 0) return current > 0 ? 100 : 0;
    return Math.round(((current - previous) / previous) * 100);
  }
}

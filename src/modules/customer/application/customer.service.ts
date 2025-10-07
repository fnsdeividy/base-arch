import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class CustomerService {
  constructor(private readonly prisma: PrismaService) { }

  async findAll(page: number = 1, limit: number = 20, filters: any = {}) {
    const skip = (page - 1) * limit;

    const where: any = {};
    
    if (filters.search) {
      where.OR = [
        { firstName: { contains: filters.search, mode: 'insensitive' } },
        { lastName: { contains: filters.search, mode: 'insensitive' } },
        { email: { contains: filters.search, mode: 'insensitive' } },
        { phone: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    if (filters.isActive !== undefined) {
      where.isActive = filters.isActive;
    }

    if (filters.city) {
      where.city = { contains: filters.city, mode: 'insensitive' };
    }

    if (filters.state) {
      where.state = { contains: filters.state, mode: 'insensitive' };
    }

    if (filters.hasEmail !== undefined) {
      if (filters.hasEmail) {
        where.email = { not: null };
      } else {
        where.email = null;
      }
    }

    if (filters.hasPhone !== undefined) {
      if (filters.hasPhone) {
        where.phone = { not: null };
      } else {
        where.phone = null;
      }
    }

    const [customers, total] = await Promise.all([
      this.prisma.customer.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.customer.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      customers,
      total,
      totalPages,
      currentPage: page,
    };
  }

  async findById(id: string) {
    const customer = await this.prisma.customer.findUnique({
      where: { id },
    });

    if (!customer) {
      throw new NotFoundException(`Customer with ID ${id} not found`);
    }

    return customer;
  }

  async create(data: any) {
    return this.prisma.customer.create({
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
        address: data.address,
        city: data.city,
        state: data.state,
        zipCode: data.zipCode,
        birthDate: data.birthDate ? new Date(data.birthDate) : null,
        isActive: data.isActive ?? true,
      },
    });
  }

  async update(id: string, data: any) {
    const customer = await this.findById(id);

    return this.prisma.customer.update({
      where: { id },
      data: {
        firstName: data.firstName ?? customer.firstName,
        lastName: data.lastName ?? customer.lastName,
        email: data.email ?? customer.email,
        phone: data.phone ?? customer.phone,
        address: data.address ?? customer.address,
        city: data.city ?? customer.city,
        state: data.state ?? customer.state,
        zipCode: data.zipCode ?? customer.zipCode,
        birthDate: data.birthDate ? new Date(data.birthDate) : customer.birthDate,
        isActive: data.isActive ?? customer.isActive,
      },
    });
  }

  async delete(id: string) {
    await this.findById(id);

    return this.prisma.customer.delete({
      where: { id },
    });
  }

  async activate(id: string) {
    await this.findById(id);

    return this.prisma.customer.update({
      where: { id },
      data: { isActive: true },
    });
  }

  async deactivate(id: string) {
    await this.findById(id);

    return this.prisma.customer.update({
      where: { id },
      data: { isActive: false },
    });
  }

  async getStatistics() {
    const now = new Date();
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [
      totalCustomers,
      activeCustomers,
      inactiveCustomers,
      newCustomersThisMonth,
      newCustomersLastMonth,
    ] = await Promise.all([
      this.prisma.customer.count(),
      this.prisma.customer.count({ where: { isActive: true } }),
      this.prisma.customer.count({ where: { isActive: false } }),
      this.prisma.customer.count({
        where: { createdAt: { gte: thisMonth } },
      }),
      this.prisma.customer.count({
        where: {
          createdAt: {
            gte: lastMonth,
            lt: thisMonth,
          },
        },
      }),
    ]);

    return {
      totalCustomers,
      activeCustomers,
      inactiveCustomers,
      newCustomersThisMonth,
      newCustomersLastMonth,
    };
  }

  async getCustomerOrders(customerId: string, page: number = 1, limit: number = 10) {
    await this.findById(customerId);

    const skip = (page - 1) * limit;

    // Por enquanto retorna uma lista vazia, pois não temos o módulo de orders implementado
    return {
      orders: [],
      total: 0,
      totalPages: 0,
      currentPage: page,
    };
  }
}

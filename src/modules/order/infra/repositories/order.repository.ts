import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Order, OrderStatus } from '@modules/order/entities/order.entity';
import { IOrderRepository } from '@modules/order/presentation/interfaces/order.interface';

@Injectable()
export class OrderRepository implements IOrderRepository {
  constructor(private readonly repository: Repository<Order>) { }

  async create(data: Partial<Order>): Promise<Order> {
    const order = this.repository.create(data);
    return await this.repository.save(order);
  }

  async findById(id: string): Promise<Order | null> {
    return await this.repository.findOne({
      where: { id },
      relations: ['customer', 'store']
    });
  }

  async findByOrderNumber(orderNumber: string): Promise<Order | null> {
    return await this.repository.findOne({ where: { orderNumber } });
  }

  async findAll(filters?: {
    status?: OrderStatus;
    customerId?: string;
    storeId?: string
  }): Promise<Order[]> {
    const queryBuilder = this.repository.createQueryBuilder('order')
      .leftJoinAndSelect('order.customer', 'customer')
      .leftJoinAndSelect('order.store', 'store');

    if (filters?.status) {
      queryBuilder.andWhere('order.status = :status', { status: filters.status });
    }

    if (filters?.customerId) {
      queryBuilder.andWhere('order.customerId = :customerId', { customerId: filters.customerId });
    }

    if (filters?.storeId) {
      queryBuilder.andWhere('order.storeId = :storeId', { storeId: filters.storeId });
    }

    return await queryBuilder
      .orderBy('order.createdAt', 'DESC')
      .getMany();
  }

  async update(criteria: Partial<Order>, data: Partial<Order>): Promise<void> {
    await this.repository.update(criteria, data);
  }

  async delete(criteria: Partial<Order>): Promise<void> {
    await this.repository.delete(criteria);
  }
}

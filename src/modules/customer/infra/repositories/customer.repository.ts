import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Customer } from '@modules/customer/entities/customer.entity';
import { ICustomerRepository } from '@modules/customer/presentation/interfaces/customer.interface';

@Injectable()
export class CustomerRepository implements ICustomerRepository {
  constructor(private readonly repository: Repository<Customer>) {}

  async create(data: Partial<Customer>): Promise<Customer> {
    const customer = this.repository.create(data);
    return await this.repository.save(customer);
  }

  async findById(id: string): Promise<Customer | null> {
    return await this.repository.findOne({ where: { id } });
  }

  async findByEmail(email: string): Promise<Customer | null> {
    return await this.repository.findOne({ where: { email } });
  }

  async findAll(filters?: {
    search?: string;
    isActive?: boolean;
  }): Promise<Customer[]> {
    const queryBuilder = this.repository.createQueryBuilder('customer');

    if (filters?.search) {
      queryBuilder.where(
        'customer.firstName ILIKE :search OR customer.lastName ILIKE :search OR customer.email ILIKE :search',
        { search: `%${filters.search}%` },
      );
    }

    if (filters?.isActive !== undefined) {
      queryBuilder.andWhere('customer.isActive = :isActive', {
        isActive: filters.isActive,
      });
    }

    return await queryBuilder.orderBy('customer.createdAt', 'DESC').getMany();
  }

  async update(
    criteria: Partial<Customer>,
    data: Partial<Customer>,
  ): Promise<void> {
    await this.repository.update(criteria, data);
  }

  async delete(criteria: Partial<Customer>): Promise<void> {
    await this.repository.delete(criteria);
  }
}

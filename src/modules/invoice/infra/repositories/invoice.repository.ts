import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Invoice, InvoiceStatus } from '@modules/invoice/entities/invoice.entity';
import { IInvoiceRepository } from '@modules/invoice/presentation/interfaces/invoice.interface';

@Injectable()
export class InvoiceRepository implements IInvoiceRepository {
  constructor(private readonly repository: Repository<Invoice>) { }

  async create(data: Partial<Invoice>): Promise<Invoice> {
    const invoice = this.repository.create(data);
    return await this.repository.save(invoice);
  }

  async findById(id: string): Promise<Invoice | null> {
    return await this.repository.findOne({
      where: { id },
      relations: ['customer', 'order']
    });
  }

  async findByInvoiceNumber(invoiceNumber: string): Promise<Invoice | null> {
    return await this.repository.findOne({ where: { invoiceNumber } });
  }

  async findAll(filters?: {
    status?: InvoiceStatus;
    customerId?: string;
    overdue?: boolean
  }): Promise<Invoice[]> {
    const queryBuilder = this.repository.createQueryBuilder('invoice')
      .leftJoinAndSelect('invoice.customer', 'customer')
      .leftJoinAndSelect('invoice.order', 'order');

    if (filters?.status) {
      queryBuilder.andWhere('invoice.status = :status', { status: filters.status });
    }

    if (filters?.customerId) {
      queryBuilder.andWhere('invoice.customerId = :customerId', { customerId: filters.customerId });
    }

    if (filters?.overdue) {
      queryBuilder.andWhere('invoice.dueDate < :now AND invoice.status != :paidStatus', {
        now: new Date(),
        paidStatus: InvoiceStatus.PAID
      });
    }

    return await queryBuilder
      .orderBy('invoice.createdAt', 'DESC')
      .getMany();
  }

  async update(criteria: Partial<Invoice>, data: Partial<Invoice>): Promise<void> {
    await this.repository.update(criteria, data);
  }

  async delete(criteria: Partial<Invoice>): Promise<void> {
    await this.repository.delete(criteria);
  }
}

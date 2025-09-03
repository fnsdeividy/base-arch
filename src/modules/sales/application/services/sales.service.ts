import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { Sale } from '@modules/sales/entities/sale.entity';
import { ISalesService, ISalesRepository, SALES_REPOSITORY } from '@modules/sales/presentation/interfaces/sales.interface';

@Injectable()
export class SalesService implements ISalesService {
  constructor(
    @Inject(SALES_REPOSITORY)
    private readonly salesRepository: ISalesRepository
  ) { }

  async findAll(page: number = 1, limit: number = 10): Promise<{ sales: Sale[]; total: number; totalPages: number }> {
    return await this.salesRepository.findAll(page, limit);
  }

  async findById(id: string): Promise<Sale | null> {
    const sale = await this.salesRepository.findById(id);
    if (!sale) {
      throw new NotFoundException('Sale not found');
    }
    return sale;
  }

  async findByOrderNumber(orderNumber: string): Promise<Sale | null> {
    return await this.salesRepository.findByOrderNumber(orderNumber);
  }

  async findByCustomerId(customerId: string, page: number = 1, limit: number = 10): Promise<{ sales: Sale[]; total: number; totalPages: number }> {
    return await this.salesRepository.findByCustomerId(customerId, page, limit);
  }

  async findByStoreId(storeId: string, page: number = 1, limit: number = 10): Promise<{ sales: Sale[]; total: number; totalPages: number }> {
    return await this.salesRepository.findByStoreId(storeId, page, limit);
  }

  async create(data: Partial<Sale>): Promise<Sale> {
    return await this.salesRepository.create(data);
  }

  async update(id: string, data: Partial<Sale>): Promise<void> {
    const existingSale = await this.salesRepository.findById(id);
    if (!existingSale) {
      throw new NotFoundException('Sale not found');
    }
    await this.salesRepository.update(id, data);
  }

  async delete(id: string): Promise<void> {
    const existingSale = await this.salesRepository.findById(id);
    if (!existingSale) {
      throw new NotFoundException('Sale not found');
    }
    await this.salesRepository.delete(id);
  }

  async cancel(id: string, reason?: string): Promise<Sale> {
    const existingSale = await this.salesRepository.findById(id);
    if (!existingSale) {
      throw new NotFoundException('Sale not found');
    }
    
    await this.salesRepository.update(id, { 
      status: 'cancelled',
      notes: reason ? `Cancelado: ${reason}` : 'Cancelado'
    });
    
    return await this.salesRepository.findById(id) as Sale;
  }

  async refund(id: string, amount: number, reason?: string): Promise<Sale> {
    const existingSale = await this.salesRepository.findById(id);
    if (!existingSale) {
      throw new NotFoundException('Sale not found');
    }
    
    await this.salesRepository.update(id, { 
      status: 'refunded',
      notes: reason ? `Reembolsado: ${reason} - Valor: R$ ${amount}` : `Reembolsado - Valor: R$ ${amount}`
    });
    
    return await this.salesRepository.findById(id) as Sale;
  }

  async getStatistics(filters: any): Promise<{
    totalSales: number;
    totalRevenue: number;
    averageTicket: number;
    salesByStatus: Record<string, number>;
    salesByPaymentMethod: Record<string, number>;
  }> {
    return await this.salesRepository.getStatistics(filters);
  }
}

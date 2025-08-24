import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Stock } from '@modules/stock/entities/stock.entity';
import { IStockRepository } from '@modules/stock/presentation/interfaces/stock.interface';

@Injectable()
export class StockRepository implements IStockRepository {
  constructor(private readonly repository: Repository<Stock>) { }

  async create(data: Partial<Stock>): Promise<Stock> {
    const stock = this.repository.create(data);
    return await this.repository.save(stock);
  }

  async findById(id: string): Promise<Stock | null> {
    return await this.repository.findOne({ where: { id } });
  }

  async findAll(): Promise<Stock[]> {
    return await this.repository.find({
      relations: ['product', 'store'],
      order: { createdAt: 'DESC' },
    });
  }

  async findByProduct(productId: string): Promise<Stock[]> {
    return await this.repository.find({
      where: { productId },
      relations: ['product', 'store'],
    });
  }

  async findByStore(storeId: string): Promise<Stock[]> {
    return await this.repository.find({
      where: { storeId },
      relations: ['product', 'store'],
    });
  }

  async findByStatus(status: string): Promise<Stock[]> {
    // Implementar lógica de status se necessário
    return await this.repository.find({
      relations: ['product', 'store'],
    });
  }

  async findByStoreAndProduct(storeId: string, productId: string): Promise<Stock | null> {
    return await this.repository.findOne({
      where: { storeId, productId },
      relations: ['product', 'store'],
    });
  }

  async findLowStock(): Promise<Stock[]> {
    return await this.repository
      .createQueryBuilder('stock')
      .leftJoinAndSelect('stock.product', 'product')
      .leftJoinAndSelect('stock.store', 'store')
      .where('stock.quantity <= stock.minQuantity')
      .orderBy('stock.quantity', 'ASC')
      .getMany();
  }

  async update(id: string, data: Partial<Stock>): Promise<Stock | null> {
    await this.repository.update({ id }, data);
    return await this.findById(id);
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete({ id });
  }
}

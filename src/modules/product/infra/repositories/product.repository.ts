import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Product } from '@modules/product/entities/product.entity';
import { IProductRepository } from '@modules/product/presentation/interfaces/product.interface';

@Injectable()
export class ProductRepository implements IProductRepository {
  constructor(private readonly repository: Repository<Product>) {}

  async create(data: Partial<Product>): Promise<Product> {
    const product = this.repository.create(data);
    return await this.repository.save(product);
  }

  async findById(id: string): Promise<Product | null> {
    return await this.repository.findOne({ where: { id } });
  }

  async findAll(): Promise<Product[]> {
    return await this.repository.find({
      where: { isActive: true },
      relations: ['store'],
      order: { createdAt: 'DESC' },
    });
  }

  async findByCategory(category: string): Promise<Product[]> {
    return await this.repository.find({
      where: { category, isActive: true },
      relations: ['store'],
      order: { createdAt: 'DESC' },
    });
  }

  async findByStore(storeId: string): Promise<Product[]> {
    return await this.repository.find({
      where: { storeId, isActive: true },
      relations: ['store'],
      order: { createdAt: 'DESC' },
    });
  }

  async update(
    criteria: Partial<Product>,
    data: Partial<Product>,
  ): Promise<void> {
    await this.repository.update(criteria, data);
  }

  async delete(criteria: Partial<Product>): Promise<void> {
    await this.repository.delete(criteria);
  }
}

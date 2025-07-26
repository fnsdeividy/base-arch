import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Product } from '@modules/product/entities/product.entity';
import {
  IProductRepository,
} from '@modules/product/presentation/interfaces/product.interface';
import { BaseRepository } from '@shared/infra/repository/baseRepository';

@Injectable()
export class ProductRepository extends BaseRepository<Product> implements IProductRepository {
  constructor(
    private readonly productRepository: Repository<Product>
  ) {
    super(productRepository);
  }

  async findById(id: string): Promise<Product | null> {
    const result = await this.findBy('id', id, {
      relations: ['store']
    });
    return result || null;
  }

  async findByName(name: string): Promise<Product | null> {
    const result = await this.findBy('name', name);
    return result || null;
  }

  async findBySku(sku: string): Promise<Product | null> {
    const result = await this.findBy('sku', sku);
    return result || null;
  }

  async findByStore(storeId: string): Promise<Product[]> {
    const result = await this.list({
      where: { storeId },
      relations: ['store']
    });
    return result;
  }

  async findByCategory(category: string): Promise<Product[]> {
    const result = await this.list({
      where: { category }
    });
    return result;
  }

  async findLowStock(): Promise<Product[]> {
    const result = await this.list({
      where: {
        stockQuantity: () => `"stockQuantity" <= "minStockLevel"`
      } as any
    });
    return result;
  }
} 
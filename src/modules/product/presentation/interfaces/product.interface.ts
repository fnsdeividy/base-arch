import { Product } from '../../entities/product.entity';
import { Decimal } from '@prisma/client/runtime/library';

export interface IProductService {
  findAll(): Promise<Product[]>;
  findOne(id: string): Promise<Product>;
  create(data: CreateProductDto): Promise<Product>;
  update(id: string, data: UpdateProductDto): Promise<Product>;
  remove(id: string): Promise<void>;
}

export interface CreateProductDto {
  name: string;
  description?: string;
  sku?: string;
  barcode?: string;
  price: Decimal | number;
  costPrice?: Decimal | number;
  category?: string;
  brand?: string;
  weight?: Decimal | number;
  dimensions?: string;
  storeId: string;
}

export interface UpdateProductDto {
  name?: string;
  description?: string;
  sku?: string;
  barcode?: string;
  price?: Decimal | number;
  costPrice?: Decimal | number;
  category?: string;
  brand?: string;
  weight?: Decimal | number;
  dimensions?: string;
  isActive?: boolean;
}
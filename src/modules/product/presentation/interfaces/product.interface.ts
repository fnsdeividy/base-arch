import { IBaseRepository } from '@shared/presentation/interfaces/baseRepository';
import { Product } from '@modules/product/entities/product.entity';

export interface IProduct {
  id: string;
  name: string;
  description?: string;
  price: number;
  costPrice?: number;
  stockQuantity: number;
  minStockLevel: number;
  sku?: string;
  barcode?: string;
  category?: string;
  brand?: string;
  unit?: string;
  weight?: number;
  weightUnit?: string;
  imageUrl?: string;
  isActive: boolean;
  storeId: string;
  store?: any;
  createdAt: Date;
  updatedAt: Date;
}

export interface IProductService {
  createProduct(createProductDto: CreateProductDto): Promise<Product>
  updateProduct(id: string, payload: UpdateProductDto): Promise<Product | null>
  findById(id: string): Promise<Product | null>
  findAll(): Promise<Product[]>
  findByStore(storeId: string): Promise<Product[]>
  findByCategory(category: string): Promise<Product[]>
  findLowStock(): Promise<Product[]>
  deleteProduct(id: string): Promise<void>
  updateStock(id: string, quantity: number): Promise<Product | null>
}

export interface IProductRepository extends IBaseRepository<Product> {
  findById(id: string): Promise<Product | null>;
  findByName(name: string): Promise<Product | null>;
  findBySku(sku: string): Promise<Product | null>;
  findByStore(storeId: string): Promise<Product[]>;
  findByCategory(category: string): Promise<Product[]>;
  findLowStock(): Promise<Product[]>;
}

export interface CreateProductDto {
  name: string;
  description?: string;
  price: number;
  costPrice?: number;
  stockQuantity: number;
  minStockLevel?: number;
  sku?: string;
  barcode?: string;
  category?: string;
  brand?: string;
  unit?: string;
  weight?: number;
  weightUnit?: string;
  imageUrl?: string;
  storeId: string;
}

export interface UpdateProductDto {
  name?: string;
  description?: string;
  price?: number;
  costPrice?: number;
  stockQuantity?: number;
  minStockLevel?: number;
  sku?: string;
  barcode?: string;
  category?: string;
  brand?: string;
  unit?: string;
  weight?: number;
  weightUnit?: string;
  imageUrl?: string;
  isActive?: boolean;
}

export interface UpdateStockDto {
  quantity: number;
}

export const PRODUCT_REPOSITORY = 'PRODUCT_REPOSITORY'; 
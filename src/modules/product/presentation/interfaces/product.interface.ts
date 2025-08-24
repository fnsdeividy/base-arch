import { Product } from '@modules/product/entities/product.entity';
import { CreateProductDto } from '@modules/product/presentation/dto/createProduct.dto';
import { UpdateProductDto } from '@modules/product/presentation/dto/updateProduct.dto';

export { CreateProductDto, UpdateProductDto };

export const PRODUCT_REPOSITORY = 'PRODUCT_REPOSITORY';

export interface IProductRepository {
  create(data: Partial<Product>): Promise<Product>;
  findById(id: string): Promise<Product | null>;
  findAll(): Promise<Product[]>;
  findByCategory(category: string): Promise<Product[]>;
  findByStore(storeId: string): Promise<Product[]>;
  update(criteria: Partial<Product>, data: Partial<Product>): Promise<void>;
  delete(criteria: Partial<Product>): Promise<void>;
}

export interface IProductService {
  create(createProductDto: CreateProductDto): Promise<Product>;
  findAll(): Promise<Product[]>;
  findOne(id: string): Promise<Product>;
  update(id: string, updateProductDto: UpdateProductDto): Promise<Product>;
  remove(id: string): Promise<void>;
  findByCategory(category: string): Promise<Product[]>;
  findByStore(storeId: string): Promise<Product[]>;
}

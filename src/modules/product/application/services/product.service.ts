import {
  Injectable,
  Inject,
  ConflictException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { CreateProductDto, IProductRepository, IProductService, PRODUCT_REPOSITORY } from '@modules/product/presentation/interfaces/product.interface';
import { UpdateProductDto } from '@modules/product/presentation/dto/updateProduct.dto';
import { Product } from '@modules/product/entities/product.entity';
import { randomUUID } from 'crypto';

@Injectable()
export class ProductService implements IProductService {
  constructor(
    @Inject(PRODUCT_REPOSITORY)
    private readonly productRepository: IProductRepository,
  ) { }

  async createProduct(createProductDto: CreateProductDto): Promise<Product> {
    // Verificar se SKU já existe (se fornecido)
    if (createProductDto.sku) {
      const existingProduct = await this.productRepository.findBySku(createProductDto.sku);
      if (existingProduct) {
        throw new ConflictException('SKU already exists');
      }
    }

    // Verificar se nome já existe na mesma loja
    const existingProductByName = await this.productRepository.findByName(createProductDto.name);
    if (existingProductByName && existingProductByName.storeId === createProductDto.storeId) {
      throw new ConflictException('Product name already exists in this store');
    }

    const product = await this.productRepository.create({
      id: randomUUID(),
      ...createProductDto,
      minStockLevel: createProductDto.minStockLevel || 0,
    });

    return product;
  }

  async updateProduct(id: string, payload: UpdateProductDto): Promise<Product | null> {
    // Verificar se produto existe
    const existingProduct = await this.productRepository.findById(id);
    if (!existingProduct) {
      throw new NotFoundException('Product not found');
    }

    // Se SKU está sendo atualizado, verificar se já existe
    if (payload.sku && payload.sku !== existingProduct.sku) {
      const productWithSku = await this.productRepository.findBySku(payload.sku);
      if (productWithSku) {
        throw new ConflictException('SKU already exists');
      }
    }

    // Se nome está sendo atualizado, verificar se já existe na mesma loja
    if (payload.name && payload.name !== existingProduct.name) {
      const productWithName = await this.productRepository.findByName(payload.name);
      if (productWithName && productWithName.storeId === existingProduct.storeId) {
        throw new ConflictException('Product name already exists in this store');
      }
    }

    await this.productRepository.update({ id }, payload);
    const updatedProduct = await this.productRepository.findById(id);

    return updatedProduct;
  }

  async findById(id: string): Promise<Product | null> {
    const product = await this.productRepository.findById(id);
    return product;
  }

  async findAll(): Promise<Product[]> {
    const products = await this.productRepository.list({
      relations: ['store']
    });
    return products;
  }

  async findByStore(storeId: string): Promise<Product[]> {
    const products = await this.productRepository.findByStore(storeId);
    return products;
  }

  async findByCategory(category: string): Promise<Product[]> {
    const products = await this.productRepository.findByCategory(category);
    return products;
  }

  async findLowStock(): Promise<Product[]> {
    const products = await this.productRepository.findLowStock();
    return products;
  }

  async deleteProduct(id: string): Promise<void> {
    const existingProduct = await this.productRepository.findById(id);
    if (!existingProduct) {
      throw new NotFoundException('Product not found');
    }

    await this.productRepository.delete({ id });
  }

  async updateStock(id: string, quantity: number): Promise<Product | null> {
    if (quantity < 0) {
      throw new BadRequestException('Quantity cannot be negative');
    }

    const existingProduct = await this.productRepository.findById(id);
    if (!existingProduct) {
      throw new NotFoundException('Product not found');
    }

    await this.productRepository.update({ id }, { stockQuantity: quantity });
    const updatedProduct = await this.productRepository.findById(id);

    return updatedProduct;
  }
} 
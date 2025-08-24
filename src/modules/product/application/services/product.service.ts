import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { Product } from '@modules/product/entities/product.entity';
import { CreateProductDto } from '@modules/product/presentation/dto/createProduct.dto';
import { UpdateProductDto } from '@modules/product/presentation/dto/updateProduct.dto';
import { IProductService, IProductRepository, PRODUCT_REPOSITORY } from '@modules/product/presentation/interfaces/product.interface';

@Injectable()
export class ProductService implements IProductService {
  constructor(
    @Inject(PRODUCT_REPOSITORY)
    private readonly productRepository: IProductRepository,
  ) { }

  async create(createProductDto: CreateProductDto): Promise<Product> {
    const product = await this.productRepository.create(createProductDto);
    return product;
  }

  async findAll(): Promise<Product[]> {
    return await this.productRepository.findAll();
  }

  async findOne(id: string): Promise<Product> {
    const product = await this.productRepository.findById(id);

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return product;
  }

  async update(id: string, updateProductDto: UpdateProductDto): Promise<Product> {
    const product = await this.findOne(id);

    await this.productRepository.update({ id }, updateProductDto);

    const updatedProduct = await this.productRepository.findById(id);
    if (!updatedProduct) {
      throw new NotFoundException('Product not found after update');
    }

    return updatedProduct;
  }

  async remove(id: string): Promise<void> {
    const product = await this.findOne(id);
    await this.productRepository.delete({ id });
  }

  async findByCategory(category: string): Promise<Product[]> {
    return await this.productRepository.findByCategory(category);
  }

  async findByStore(storeId: string): Promise<Product[]> {
    return await this.productRepository.findByStore(storeId);
  }
}
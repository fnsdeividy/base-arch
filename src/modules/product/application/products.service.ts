import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Product } from '../entities/product.entity';
import { CreateProductDto, UpdateProductDto } from '../presentation/interfaces/product.interface';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) { }

  async findAll(): Promise<Product[]> {
    console.log('🔍 Buscando produtos no banco de dados...');

    const products = await this.prisma.product.findMany({
      include: {
        stock: true
      }
    });

    console.log(`📦 Encontrados ${products.length} produtos:`, products);

    return products.map(product => ({
      ...product,
      description: product.description || undefined,
      sku: product.sku || undefined,
      barcode: product.barcode || undefined,
      costPrice: product.costPrice || undefined,
      category: product.category || undefined,
      brand: product.brand || undefined,
      weight: product.weight || undefined,
      dimensions: product.dimensions || undefined,
    })) as Product[];
  }

  async findOne(id: string): Promise<Product> {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: {
        stock: true
      }
    });

    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    return {
      ...product,
      description: product.description || undefined,
      sku: product.sku || undefined,
      barcode: product.barcode || undefined,
      costPrice: product.costPrice || undefined,
      category: product.category || undefined,
      brand: product.brand || undefined,
      weight: product.weight || undefined,
      dimensions: product.dimensions || undefined,
    } as Product;
  }

  async create(data: CreateProductDto): Promise<Product> {
    const product = await this.prisma.product.create({
      data: {
        ...data,
        isActive: true,
      },
      include: {
        stock: true
      }
    });

    return {
      ...product,
      description: product.description || undefined,
      sku: product.sku || undefined,
      barcode: product.barcode || undefined,
      costPrice: product.costPrice || undefined,
      category: product.category || undefined,
      brand: product.brand || undefined,
      weight: product.weight || undefined,
      dimensions: product.dimensions || undefined,
    } as Product;
  }

  async update(id: string, data: UpdateProductDto): Promise<Product> {
    const product = await this.findOne(id);

    const updatedProduct = await this.prisma.product.update({
      where: { id },
      data,
      include: {
        stock: true
      }
    });

    return {
      ...updatedProduct,
      description: updatedProduct.description || undefined,
      sku: updatedProduct.sku || undefined,
      barcode: updatedProduct.barcode || undefined,
      costPrice: updatedProduct.costPrice || undefined,
      category: updatedProduct.category || undefined,
      brand: updatedProduct.brand || undefined,
      weight: updatedProduct.weight || undefined,
      dimensions: updatedProduct.dimensions || undefined,
    } as Product;
  }

  async remove(id: string): Promise<void> {
    await this.findOne(id);
    await this.prisma.product.delete({
      where: { id }
    });
  }
}
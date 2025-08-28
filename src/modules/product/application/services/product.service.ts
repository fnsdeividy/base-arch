import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateProductDto } from '@modules/product/presentation/dto/createProduct.dto';
import { UpdateProductDto } from '@modules/product/presentation/dto/updateProduct.dto';
import { PrismaService } from '@modules/prisma/prisma.service';

@Injectable()
export class ProductService {
  constructor(
    private readonly prisma: PrismaService,
  ) { }

  async create(createProductDto: CreateProductDto) {
    const product = await this.prisma.product.create({
      data: {
        name: createProductDto.name,
        description: createProductDto.description,
        sku: createProductDto.sku || '',
        price: createProductDto.price as any,
        category: createProductDto.category || '',
        isActive: createProductDto.isActive ?? true,
        storeId: createProductDto.storeId,
      },
    });
    return product;
  }

  async findAll() {
    return await this.prisma.product.findMany({
      where: { isActive: true },
    });
  }

  async findOne(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return product;
  }

  async update(
    id: string,
    updateProductDto: UpdateProductDto,
  ) {
    const product = await this.findOne(id);

    const updatedProduct = await this.prisma.product.update({
      where: { id },
      data: updateProductDto,
    });

    return updatedProduct;
  }

  async remove(id: string): Promise<void> {
    const product = await this.findOne(id);
    await this.prisma.product.delete({
      where: { id },
    });
  }

  async findByCategory(category: string) {
    return await this.prisma.product.findMany({
      where: {
        category,
        isActive: true,
      },
    });
  }

  async findByStore(storeId: string) {
    return await this.prisma.product.findMany({
      where: {
        storeId,
        isActive: true,
      },
    });
  }
}

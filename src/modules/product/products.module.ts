import { Module } from '@nestjs/common';
import { TypeOrmModule, getRepositoryToken } from '@nestjs/typeorm';
import { ProductController } from '@modules/product/presentation/http/controllers/product.controller';
import { Product } from '@modules/product/entities/product.entity';
import { ProductService } from './application/services/product.service';
import { ProductRepository } from './infra/repositories/product.repository';
import { PRODUCT_REPOSITORY } from './presentation/interfaces/product.interface';

@Module({
  imports: [
    TypeOrmModule.forFeature([Product])
  ],
  controllers: [ProductController],
  providers: [
    ProductService,
    {
      provide: PRODUCT_REPOSITORY,
      useFactory: (productRepository) => new ProductRepository(productRepository),
      inject: [getRepositoryToken(Product)],
    },
  ],
  exports: [ProductService],
})
export class ProductsModule { }

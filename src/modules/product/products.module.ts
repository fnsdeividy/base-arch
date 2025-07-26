import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductController } from '@modules/product/presentation/http/controllers/product.controller'

import {
  ProductRepository,
} from '@modules/product/infra/repositories/product.repository';
import { PRODUCT_REPOSITORY } from '@modules/product/presentation/interfaces/product.interface';
import { Product } from '@modules/product/entities/product.entity';
import { ProductService } from './application/services/product.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Product])
  ],
  controllers: [ProductController],
  providers: [
    ProductService,
    {
      provide: PRODUCT_REPOSITORY,
      useFactory: (productRepository) => new ProductRepository(productRepository)
    },
  ],
  exports: [ProductService],
})
export class ProductsModule { }

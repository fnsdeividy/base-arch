import { Module } from '@nestjs/common';
import { ProductController } from '@modules/product/presentation/http/controllers/product.controller'
import { ProductService } from './application/services/product.service';

@Module({
  controllers: [ProductController],
  providers: [ProductService],
  exports: [ProductService],
})
export class ProductsModule { }

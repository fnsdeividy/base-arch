import { Module } from '@nestjs/common';
import { ProductsController } from './presentation/products.controller';
import { ProductsService } from './application/products.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [ProductsController],
  providers: [ProductsService],
  exports: [ProductsService],
})
export class ProductsModule { }

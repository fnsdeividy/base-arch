import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Put,
  Get,
  Param,
  Delete,
  UseGuards
} from '@nestjs/common';
import {
  CreateProductDto,
  IProductService,
  UpdateProductDto
} from '@modules/product/presentation/interfaces/product.interface';
import { JwtAuthGuard } from '@shared/presentation/http/guards/jwt-auth.guard';

@Controller('api/v1/products')
@UseGuards(JwtAuthGuard)
export class ProductController {
  constructor(private readonly productService: IProductService) { }

  @Post('create')
  @HttpCode(HttpStatus.CREATED)
  create(@Body() payload: CreateProductDto) {
    return this.productService.createProduct(payload);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  findAll() {
    return this.productService.findAll();
  }

  @Get('store/:storeId')
  @HttpCode(HttpStatus.OK)
  findByStore(@Param('storeId') storeId: string) {
    return this.productService.findByStore(storeId);
  }

  @Get('category/:category')
  @HttpCode(HttpStatus.OK)
  findByCategory(@Param('category') category: string) {
    return this.productService.findByCategory(category);
  }

  @Get('low-stock')
  @HttpCode(HttpStatus.OK)
  findLowStock() {
    return this.productService.findLowStock();
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  findById(@Param('id') id: string) {
    return this.productService.findById(id);
  }

  @Put(':id')
  @HttpCode(HttpStatus.OK)
  update(@Param('id') id: string, @Body() payload: UpdateProductDto) {
    return this.productService.updateProduct(id, payload);
  }


  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  delete(@Param('id') id: string) {
    return this.productService.deleteProduct(id);
  }
} 
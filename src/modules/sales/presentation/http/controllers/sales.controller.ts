import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { SalesService } from '@modules/sales/application/services/sales.service';

@Controller('sales')
export class SalesController {
  constructor(private readonly salesService: SalesService) { }

  @Get()
  @HttpCode(HttpStatus.OK)
  async findAll(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
  ) {
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    return await this.salesService.findAll(pageNum, limitNum);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async findById(@Param('id') id: string) {
    return await this.salesService.findById(id);
  }

  @Get('order/:orderNumber')
  @HttpCode(HttpStatus.OK)
  async findByOrderNumber(@Param('orderNumber') orderNumber: string) {
    return await this.salesService.findByOrderNumber(orderNumber);
  }

  @Get('customer/:customerId')
  @HttpCode(HttpStatus.OK)
  async findByCustomerId(
    @Param('customerId') customerId: string,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
  ) {
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    return await this.salesService.findByCustomerId(customerId, pageNum, limitNum);
  }

  @Get('store/:storeId')
  @HttpCode(HttpStatus.OK)
  async findByStoreId(
    @Param('storeId') storeId: string,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
  ) {
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    return await this.salesService.findByStoreId(storeId, pageNum, limitNum);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() data: any) {
    return await this.salesService.create(data);
  }

  @Put(':id')
  @HttpCode(HttpStatus.OK)
  async update(@Param('id') id: string, @Body() data: any) {
    await this.salesService.update(id, data);
    return { message: 'Sale updated successfully' };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('id') id: string) {
    await this.salesService.delete(id);
  }
}

import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Patch,
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

  @Post('simple')
  @HttpCode(HttpStatus.CREATED)
  async createSimple(@Body() data: any) {
    // Endpoint simples que cria apenas a order sem items
    const orderData = {
      orderNumber: data.orderNumber || `ORD-${Date.now()}`,
      customerId: data.customerId || '4F461257-2F49-4667-83E4-A9510DDAE575',
      storeId: data.storeId || 'c2eebc99-9c0b-4ef8-bb6d-6bb9bd380a33',
      status: data.status || 'pending',
      totalAmount: data.totalAmount || 0,
      items: []
    };
    return await this.salesService.create(orderData);
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

  @Patch(':id/cancel')
  @HttpCode(HttpStatus.OK)
  async cancel(@Param('id') id: string, @Body() body: { reason?: string }) {
    return await this.salesService.cancel(id, body.reason);
  }

  @Patch(':id/refund')
  @HttpCode(HttpStatus.OK)
  async refund(@Param('id') id: string, @Body() body: { amount: number; reason?: string }) {
    return await this.salesService.refund(id, body.amount, body.reason);
  }

  @Get('statistics')
  @HttpCode(HttpStatus.OK)
  async getStatistics(@Query() filters: any) {
    return await this.salesService.getStatistics(filters);
  }
}

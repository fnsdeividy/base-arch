import { Controller, Get, Post, Body, Param, Put, Delete } from '@nestjs/common';
import { StockService } from '../application/stock.service';

@Controller('stock')
export class StockController {
  constructor(private readonly stockService: StockService) { }

  @Get()
  async findAll() {
    return this.stockService.findAll();
  }

  @Get('low-stock')
  async getLowStock() {
    return this.stockService.getLowStock();
  }

  @Get('transactions')
  async getTransactions() {
    return this.stockService.getTransactions();
  }

  @Get('statistics')
  async getStatistics() {
    return this.stockService.getStatistics();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.stockService.findOne(id);
  }

  @Post()
  async create(@Body() data: any) {
    return this.stockService.create(data);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() data: any) {
    return this.stockService.update(id, data);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.stockService.remove(id);
  }
}



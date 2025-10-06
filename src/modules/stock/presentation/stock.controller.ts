import { Controller, Get, Post, Body, Param, Put, Delete } from '@nestjs/common';
import { StockService } from '../application/stock.service';
import { CreateStockDto } from './dto/createStock.dto';

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

  @Get('alerts')
  async getStockAlerts() {
    return this.stockService.getStockAlerts();
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
  async create(@Body() data: CreateStockDto) {
    return this.stockService.create(data);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() data: any) {
    await this.stockService.update(id, data);
    return this.stockService.findOne(id);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.stockService.remove(id);
  }
}



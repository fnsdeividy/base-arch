import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  ParseBoolPipe,
  ParseIntPipe,
} from '@nestjs/common';
import { StockService } from '@modules/stock/application/services/stock.service';
import { CreateStockDto } from '@modules/stock/presentation/dto/createStock.dto';
import { UpdateStockDto } from '@modules/stock/presentation/dto/updateStock.dto';
import { JwtAuthGuard } from '@shared/presentation/http/guards/jwt-auth.guard';

@Controller('stock')
@UseGuards(JwtAuthGuard)
export class StockController {
  constructor(private readonly stockService: StockService) {}

  @Post()
  create(@Body() createStockDto: CreateStockDto) {
    return this.stockService.create(createStockDto);
  }

  @Get()
  findAll(
    @Query('productId') productId?: string,
    @Query('storeId') storeId?: string,
    @Query('lowStock', new ParseBoolPipe({ optional: true }))
    lowStock?: boolean,
    @Query('threshold', new ParseIntPipe({ optional: true }))
    threshold?: number,
  ) {
    if (lowStock === true) {
      return this.stockService.findLowStock(threshold);
    }
    if (productId) {
      return this.stockService.findByProduct(productId);
    }
    if (storeId) {
      return this.stockService.findByStore(storeId);
    }
    return this.stockService.findAll();
  }

  @Get('low-stock')
  findLowStock(
    @Query('threshold', new ParseIntPipe({ optional: true }))
    threshold?: number,
  ) {
    return this.stockService.findLowStock(threshold);
  }

  @Get('alerts')
  getStockAlerts() {
    return this.stockService.getStockAlerts();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.stockService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateStockDto: UpdateStockDto) {
    return this.stockService.update(id, updateStockDto);
  }

  @Patch(':id/quantity')
  updateQuantity(
    @Param('id') id: string,
    @Body('quantity', ParseIntPipe) quantity: number,
  ) {
    return this.stockService.updateQuantity(id, quantity);
  }

  @Patch(':productId/:storeId/quantity')
  updateQuantityByProductAndStore(
    @Param('productId') productId: string,
    @Param('storeId') storeId: string,
    @Body('quantity', ParseIntPipe) quantity: number,
  ) {
    return this.stockService.updateQuantityByProductAndStore(
      productId,
      storeId,
      quantity,
    );
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.stockService.remove(id);
  }
}

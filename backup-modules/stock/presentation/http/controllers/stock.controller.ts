import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { StockService } from '@modules/stock/application/services/stock.service';
import { CreateStockDto } from '@modules/stock/presentation/dto/createStock.dto';
import { UpdateStockDto } from '@modules/stock/presentation/dto/updateStock.dto';
import { JwtAuthGuard } from '@shared/presentation/http/guards/jwt-auth.guard';

@Controller('stock')
@UseGuards(JwtAuthGuard)
export class StockController {
  constructor(private readonly stockService: StockService) { }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createStock(@Body() createStockDto: CreateStockDto) {
    return this.stockService.createStock(createStockDto);
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    return this.stockService.findById(id);
  }

  @Put(':id')
  async updateStock(
    @Param('id') id: string,
    @Body() updateStockDto: UpdateStockDto,
  ) {
    return this.stockService.updateStock(id, updateStockDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteStock(@Param('id') id: string) {
    return this.stockService.deleteStock(id);
  }

  @Get('store/:storeId')
  async findByStore(@Param('storeId') storeId: string) {
    return this.stockService.findByStore(storeId);
  }

  @Get('product/:productId')
  async findByProduct(@Param('productId') productId: string) {
    return this.stockService.findByProduct(productId);
  }

  @Get('status/:status')
  async findByStatus(@Param('status') status: string) {
    return this.stockService.findByStatus(status);
  }

  @Put(':id/quantity')
  async updateQuantity(
    @Param('id') id: string,
    @Body() body: { quantity: number },
  ) {
    return this.stockService.updateQuantity(id, body.quantity);
  }
} 
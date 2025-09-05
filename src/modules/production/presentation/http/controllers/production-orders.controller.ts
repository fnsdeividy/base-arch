import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  ParseUUIDPipe,
  Query,
} from '@nestjs/common';
import { ProductionOrdersService } from '../../../application/services/production-orders.service';
import { CostCalculationService } from '../../../application/services/cost-calculation.service';
import {
  CreateProductionOrderDto,
  UpdateProductionOrderDto,
  StartProductionOrderDto,
  FinishProductionOrderDto,
} from '../../dto/production-order.dto';

@Controller('production/orders')
export class ProductionOrdersController {
  constructor(
    private readonly productionOrdersService: ProductionOrdersService,
    private readonly costCalculationService: CostCalculationService
  ) {}

  @Get()
  async findAll() {
    return this.productionOrdersService.findAll();
  }

  @Get('metrics')
  async getProductionMetrics() {
    return this.productionOrdersService.getProductionMetrics();
  }

  @Get(':id')
  async findById(@Param('id', ParseUUIDPipe) id: string) {
    return this.productionOrdersService.findById(id);
  }

  @Post()
  async create(@Body() data: CreateProductionOrderDto) {
    return this.productionOrdersService.create(data);
  }

  @Put(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() data: UpdateProductionOrderDto
  ) {
    return this.productionOrdersService.update(id, data);
  }

  @Delete(':id')
  async delete(@Param('id', ParseUUIDPipe) id: string) {
    await this.productionOrdersService.delete(id);
    return { message: 'Production order deleted successfully' };
  }

  @Post(':id/start')
  async startProduction(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() data: StartProductionOrderDto
  ) {
    return this.productionOrdersService.startProduction(id, data);
  }

  @Post(':id/finish')
  async finishProduction(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() data: FinishProductionOrderDto
  ) {
    return this.productionOrdersService.finishProduction(id, data);
  }

  @Post(':id/cancel')
  async cancelProduction(@Param('id', ParseUUIDPipe) id: string) {
    return this.productionOrdersService.cancelProduction(id);
  }

  @Get(':id/material-availability')
  async checkMaterialAvailability(@Param('id', ParseUUIDPipe) id: string) {
    return this.productionOrdersService.checkMaterialAvailability(id);
  }

  @Get(':id/cost-breakdown')
  async getCostBreakdown(@Param('id', ParseUUIDPipe) id: string) {
    return this.productionOrdersService.getCostBreakdown(id);
  }
}

@Controller('production/costs')
export class CostCalculationController {
  constructor(private readonly costCalculationService: CostCalculationService) {}

  @Get('suggested-price/:productId')
  async getSuggestedPrice(
    @Param('productId', ParseUUIDPipe) productId: string,
    @Query('markup') markup: number = 30
  ) {
    const suggestedPrice = await this.costCalculationService.getSuggestedPrice(
      productId,
      markup
    );
    return { productId, markup, suggestedPrice };
  }

  @Get('history/:productId')
  async getProductCostHistory(
    @Param('productId', ParseUUIDPipe) productId: string,
    @Query('limit') limit?: number
  ) {
    return this.costCalculationService.getProductCostHistory(
      productId,
      limit ? parseInt(limit.toString()) : 10
    );
  }
}

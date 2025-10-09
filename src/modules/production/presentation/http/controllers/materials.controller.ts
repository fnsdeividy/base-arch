import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  Query,
  ParseUUIDPipe,
} from '@nestjs/common';
import { MaterialsService } from '../../../application/services/materials.service';
import { UnitConversionService } from '../../../application/services/unit-conversion.service';
import {
  CreateMaterialDto,
  UpdateMaterialDto,
  CreateMaterialBatchDto,
  UpdateMaterialBatchDto,
  CreateProductBomDto,
  UpdateProductBomDto,
  CreateUnitConversionDto,
  ScaleRecipeDto,
} from '../../dto/material.dto';

@Controller('production/materials')
export class MaterialsController {
  constructor(
    private readonly materialsService: MaterialsService,
    private readonly unitConversionService: UnitConversionService
  ) {}

  // Materials endpoints
  @Get()
  async findAllMaterials() {
    return this.materialsService.findAllMaterials();
  }

  @Get('low-stock')
  async getLowStockMaterials() {
    return this.materialsService.getLowStockMaterials();
  }

  @Get(':id')
  async findMaterialById(@Param('id', ParseUUIDPipe) id: string) {
    return this.materialsService.findMaterialById(id);
  }

  @Post()
  async createMaterial(@Body() data: CreateMaterialDto) {
    return this.materialsService.createMaterial(data);
  }

  @Put(':id')
  async updateMaterial(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() data: UpdateMaterialDto
  ) {
    return this.materialsService.updateMaterial(id, data);
  }

  @Delete(':id')
  async deleteMaterial(@Param('id', ParseUUIDPipe) id: string) {
    await this.materialsService.deleteMaterial(id);
    return { message: 'Material deleted successfully' };
  }

  // Material availability check
  @Get(':id/availability')
  async checkMaterialAvailability(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('qty') qty: number,
    @Query('unit') unit: string
  ) {
    return this.materialsService.checkMaterialAvailability(id, qty, unit as any);
  }
}

@Controller('production/batches')
export class MaterialBatchesController {
  constructor(private readonly materialsService: MaterialsService) {}

  @Get('material/:materialId')
  async findMaterialBatches(@Param('materialId', ParseUUIDPipe) materialId: string) {
    return this.materialsService.findMaterialBatches(materialId);
  }

  @Get(':id')
  async findBatchById(@Param('id', ParseUUIDPipe) id: string) {
    return this.materialsService.findBatchById(id);
  }

  @Post()
  async createMaterialBatch(@Body() data: CreateMaterialBatchDto) {
    return this.materialsService.createMaterialBatch(data);
  }

  @Put(':id')
  async updateMaterialBatch(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() data: UpdateMaterialBatchDto
  ) {
    return this.materialsService.updateMaterialBatch(id, data);
  }

  @Delete(':id')
  async deleteMaterialBatch(@Param('id', ParseUUIDPipe) id: string) {
    await this.materialsService.deleteMaterialBatch(id);
    return { message: 'Material batch deleted successfully' };
  }
}

@Controller('production/bom')
export class BomController {
  constructor(private readonly materialsService: MaterialsService) {}

  @Get('product/:productId')
  async findProductBom(@Param('productId', ParseUUIDPipe) productId: string) {
    return this.materialsService.findProductBom(productId);
  }

  @Post('batch/products')
  async findMultipleProductsBom(@Body() data: { productIds: string[] }) {
    return this.materialsService.findMultipleProductsBom(data.productIds);
  }

  @Post()
  async createBomItem(@Body() data: CreateProductBomDto) {
    return this.materialsService.createBomItem(data);
  }

  @Post('batch')
  async createBomItemsBatch(@Body() data: CreateProductBomDto[]) {
    return this.materialsService.createBomItemsBatch(data);
  }

  @Put(':id')
  async updateBomItem(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() data: UpdateProductBomDto
  ) {
    return this.materialsService.updateBomItem(id, data);
  }

  @Delete(':id')
  async deleteBomItem(@Param('id', ParseUUIDPipe) id: string) {
    await this.materialsService.deleteBomItem(id);
    return { message: 'BOM item deleted successfully' };
  }

  @Post('scale-recipe')
  async scaleRecipe(@Body() data: ScaleRecipeDto) {
    return this.materialsService.scaleRecipe(data);
  }
}

@Controller('production/unit-conversions')
export class UnitConversionsController {
  constructor(private readonly unitConversionService: UnitConversionService) {}

  @Get()
  async getConversions(@Query('materialId') materialId?: string) {
    return this.unitConversionService.getConversions(materialId);
  }

  @Post()
  async createConversion(@Body() data: CreateUnitConversionDto) {
    return this.unitConversionService.createConversion(data);
  }

  @Delete(':id')
  async deleteConversion(@Param('id', ParseUUIDPipe) id: string) {
    await this.unitConversionService.deleteConversion(id);
    return { message: 'Unit conversion deleted successfully' };
  }

  @Get('available/:unit')
  async getAvailableConversions(
    @Param('unit') unit: string,
    @Query('materialId') materialId?: string
  ) {
    return this.unitConversionService.getAvailableConversions(unit as any, materialId);
  }
}

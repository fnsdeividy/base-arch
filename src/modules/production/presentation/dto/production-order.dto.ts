import { IsString, IsOptional, IsNumber, IsEnum, IsDateString, IsNotEmpty, Min, Max } from 'class-validator';
import { Unit, CostingMethod, ProductionOrderStatus } from '../../entities/material.entity';

export class CreateProductionOrderDto {
  @IsString()
  @IsNotEmpty()
  productId: string;

  @IsNumber()
  @Min(0.001)
  plannedOutputQty: number;

  @IsEnum(Unit)
  plannedUnit: Unit;

  @IsEnum(CostingMethod)
  costingMethodSnapshot: CostingMethod;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  overheadPercent?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  packagingCostPerOutputUnit?: number;
}

export class UpdateProductionOrderDto {
  @IsOptional()
  @IsNumber()
  @Min(0.001)
  plannedOutputQty?: number;

  @IsOptional()
  @IsEnum(Unit)
  plannedUnit?: Unit;

  @IsOptional()
  @IsNumber()
  @Min(0)
  actualOutputQty?: number;

  @IsOptional()
  @IsDateString()
  startedAt?: string;

  @IsOptional()
  @IsDateString()
  finishedAt?: string;

  @IsOptional()
  @IsEnum(ProductionOrderStatus)
  status?: ProductionOrderStatus;

  @IsOptional()
  @IsEnum(CostingMethod)
  costingMethodSnapshot?: CostingMethod;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  overheadPercent?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  packagingCostPerOutputUnit?: number;

  @IsOptional()
  @IsString()
  batchCode?: string;
}

export class StartProductionOrderDto {
  @IsDateString()
  startedAt: string;
}

export class FinishProductionOrderDto {
  @IsDateString()
  finishedAt: string;

  @IsNumber()
  @Min(0.001)
  actualOutputQty: number;

  @IsOptional()
  @IsString()
  batchCode?: string;
}

export class ReserveMaterialsDto {
  @IsString()
  @IsNotEmpty()
  productionOrderId: string;
}

export class MaterialAvailabilityDto {
  materialId: string;
  materialName: string;
  requiredQty: number;
  requiredUnit: Unit;
  availableQty: number;
  status: 'available' | 'partial' | 'unavailable';
  shortfall?: number;
}

export class ProductionOrderSummaryDto {
  id: string;
  productName: string;
  plannedOutputQty: number;
  plannedUnit: Unit;
  actualOutputQty?: number;
  status: ProductionOrderStatus;
  totalCost?: number;
  unitCost?: number;
  batchCode?: string;
  createdAt: Date;
  startedAt?: Date;
  finishedAt?: Date;
  materialAvailability?: MaterialAvailabilityDto[];
}

export class CostBreakdownDto {
  materialCost: number;
  packagingCost: number;
  overheadCost: number;
  totalCost: number;
  unitCost: number;
  materialBreakdown: {
    materialName: string;
    qty: number;
    unit: Unit;
    unitCost: number;
    totalCost: number;
    batchInfo?: string;
  }[];
}

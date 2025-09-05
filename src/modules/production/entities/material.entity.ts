import { Decimal } from '@prisma/client/runtime/library';
import { Unit as PrismaUnit, CostingMethod as PrismaCostingMethod, BatchStatus as PrismaBatchStatus, ProductionOrderStatus as PrismaProductionOrderStatus } from '@prisma/client';

export interface Material {
  id: string;
  name: string;
  baseUnit: PrismaUnit;
  densityGPerMl?: Decimal | null;
  sku?: string | null;
  minStock: Decimal;
  createdAt: Date;
  updatedAt: Date;
  batches?: MaterialBatch[];
  bomItems?: ProductBom[];
  conversions?: UnitConversion[];
  consumptions?: ProductionConsumption[];
}

export interface MaterialBatch {
  id: string;
  materialId: string;
  qty: Decimal;
  unit: PrismaUnit;
  unitCost: Decimal;
  totalCost: Decimal;
  supplier?: string | null;
  lotCode?: string | null;
  expiryDate?: Date | null;
  receivedAt: Date;
  status: PrismaBatchStatus;
  createdAt: Date;
  updatedAt: Date;
  material?: Material;
  consumptions?: ProductionConsumption[];
}

export interface ProductBom {
  id: string;
  productId: string;
  materialId: string;
  qty: Decimal;
  unit: PrismaUnit;
  wastePercent: Decimal;
  notes?: string | null;
  createdAt: Date;
  updatedAt: Date;
  material?: Material;
}

export interface ProductionOrder {
  id: string;
  productId: string;
  plannedOutputQty: Decimal;
  plannedUnit: PrismaUnit;
  actualOutputQty?: Decimal | null;
  startedAt?: Date | null;
  finishedAt?: Date | null;
  status: PrismaProductionOrderStatus;
  costingMethodSnapshot: PrismaCostingMethod;
  overheadPercent: Decimal;
  packagingCostPerOutputUnit: Decimal;
  totalMaterialCost?: Decimal | null;
  totalPackagingCost?: Decimal | null;
  totalOverheadCost?: Decimal | null;
  totalCost?: Decimal | null;
  unitCost?: Decimal | null;
  batchCode?: string | null;
  createdAt: Date;
  updatedAt: Date;
  consumptions?: ProductionConsumption[];
  finishedGoods?: FinishedGoodsInventory[];
}

export interface ProductionConsumption {
  id: string;
  productionOrderId: string;
  materialId: string;
  batchId?: string | null;
  qty: Decimal;
  unit: PrismaUnit;
  unitCostApplied: Decimal;
  totalCost: Decimal;
  createdAt: Date;
  productionOrder?: ProductionOrder;
  material?: Material;
  batch?: MaterialBatch;
}

export interface UnitConversion {
  id: string;
  materialId?: string | null;
  fromUnit: PrismaUnit;
  toUnit: PrismaUnit;
  factor: Decimal;
  createdAt: Date;
  material?: Material;
}

export interface FinishedGoodsInventory {
  id: string;
  productId: string;
  productionOrderId: string;
  qty: Decimal;
  unit: PrismaUnit;
  unitCost: Decimal;
  batchCode: string;
  createdAt: Date;
  productionOrder?: ProductionOrder;
}

export interface ProductCostCache {
  id: string;
  productId: string;
  lastCalculatedAt: Date;
  unitCost: Decimal;
  method: PrismaCostingMethod;
  createdAt: Date;
  updatedAt: Date;
}

// Re-export Prisma enums for convenience
export const Unit = PrismaUnit;
export const CostingMethod = PrismaCostingMethod;
export const BatchStatus = PrismaBatchStatus;
export const ProductionOrderStatus = PrismaProductionOrderStatus;

export type Unit = PrismaUnit;
export type CostingMethod = PrismaCostingMethod;
export type BatchStatus = PrismaBatchStatus;
export type ProductionOrderStatus = PrismaProductionOrderStatus;

import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { UnitConversionService } from './unit-conversion.service';
import { MaterialsService } from './materials.service';
import {
  CostingMethod,
  Unit,
  BatchStatus,
  ProductionOrderStatus
} from '../../entities/material.entity';
import { toNumber, toDecimal } from './decimal-utils';

interface MaterialConsumption {
  materialId: string;
  materialName: string;
  requiredQty: number;
  requiredUnit: Unit;
  wastePercent: number;
  finalQty: number;
}

interface BatchAllocation {
  batchId: string;
  materialId: string;
  materialName?: string;
  qty: number;
  unit: Unit;
  unitCost: number;
  totalCost: number;
  lotCode?: string;
}

interface CostBreakdown {
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

@Injectable()
export class CostCalculationService {
  constructor(
    private prisma: PrismaService,
    private unitConversionService: UnitConversionService,
    private materialsService: MaterialsService
  ) { }

  /**
   * Calculate material consumptions for a production order
   */
  async calculateMaterialConsumptions(
    productId: string,
    outputQty: number,
    outputUnit: Unit
  ): Promise<MaterialConsumption[]> {
    // Get product BOM
    const bom = await this.materialsService.findProductBom(productId);

    if (bom.length === 0) {
      throw new BadRequestException(`No recipe found for product ${productId}`);
    }

    // Get product info
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      throw new BadRequestException(`Product with ID ${productId} not found`);
    }

    // Calculate scaling factor (assume base recipe is for 100 units)
    const baseRecipeSize = 100;
    const baseRecipeUnit = product.baseUnit || Unit.L;

    let scalingFactor: number;

    if (outputUnit === baseRecipeUnit) {
      scalingFactor = outputQty / baseRecipeSize;
    } else {
      const convertedOutput = await this.unitConversionService.convertUnit(
        outputQty,
        outputUnit,
        baseRecipeUnit
      );
      scalingFactor = convertedOutput / baseRecipeSize;
    }

    // Calculate consumption for each material
    const consumptions: MaterialConsumption[] = [];

    for (const bomItem of bom) {
      const scaledQty = toNumber(bomItem.qty) * scalingFactor;
      const wasteMultiplier = 1 + (toNumber(bomItem.wastePercent) / 100);
      const finalQty = scaledQty * wasteMultiplier;

      consumptions.push({
        materialId: bomItem.materialId,
        materialName: bomItem.material?.name || 'Unknown Material',
        requiredQty: scaledQty,
        requiredUnit: bomItem.unit,
        wastePercent: toNumber(bomItem.wastePercent),
        finalQty: finalQty,
      });
    }

    return consumptions;
  }

  /**
   * Allocate materials using FIFO method
   */
  async allocateMaterialsFIFO(
    consumptions: MaterialConsumption[]
  ): Promise<BatchAllocation[]> {
    const allocations: BatchAllocation[] = [];

    for (const consumption of consumptions) {
      // Get available batches ordered by received date (FIFO)
      const availableBatches = await this.prisma.materialBatch.findMany({
        where: {
          materialId: consumption.materialId,
          status: BatchStatus.available,
          qty: { gt: 0 },
        },
        include: {
          material: true,
        },
        orderBy: { receivedAt: 'asc' },
      });

      let remainingQty = consumption.finalQty;

      for (const batch of availableBatches) {
        if (remainingQty <= 0) break;

        // Convert batch quantity to required unit
        const material = batch.material;
        const convertedBatchQty = await this.unitConversionService.convertUnit(
          toNumber(batch.qty),
          batch.unit,
          consumption.requiredUnit,
          consumption.materialId,
          material?.densityGPerMl ? toNumber(material.densityGPerMl) : undefined
        );

        // Determine how much to allocate from this batch
        const allocatedQty = Math.min(remainingQty, convertedBatchQty);

        // Convert unit cost to required unit
        const convertedUnitCost = await this.convertUnitCost(
          toNumber(batch.unitCost),
          batch.unit,
          consumption.requiredUnit,
          consumption.materialId,
          material?.densityGPerMl ? toNumber(material.densityGPerMl) : undefined
        );

        allocations.push({
          batchId: batch.id,
          materialId: consumption.materialId,
          materialName: consumption.materialName,
          qty: allocatedQty,
          unit: consumption.requiredUnit,
          unitCost: convertedUnitCost,
          totalCost: allocatedQty * convertedUnitCost,
          lotCode: batch.lotCode || undefined,
        });

        remainingQty -= allocatedQty;
      }

      if (remainingQty > 0) {
        throw new BadRequestException(
          `Insufficient stock for material ${consumption.materialName}. Missing: ${remainingQty} ${consumption.requiredUnit}`
        );
      }
    }

    return allocations;
  }

  /**
   * Allocate materials using Weighted Average Cost method
   */
  async allocateMaterialsWAC(
    consumptions: MaterialConsumption[]
  ): Promise<BatchAllocation[]> {
    const allocations: BatchAllocation[] = [];

    for (const consumption of consumptions) {
      // Get all available batches
      const availableBatches = await this.prisma.materialBatch.findMany({
        where: {
          materialId: consumption.materialId,
          status: BatchStatus.available,
          qty: { gt: 0 },
        },
        include: {
          material: true,
        },
      });

      if (availableBatches.length === 0) {
        throw new BadRequestException(
          `No available batches for material ${consumption.materialName}`
        );
      }

      // Calculate weighted average cost
      let totalValue = 0;
      let totalQty = 0;

      for (const batch of availableBatches) {
        const material = batch.material;

        // Convert to required unit for calculation
        const convertedQty = await this.unitConversionService.convertUnit(
          toNumber(batch.qty),
          batch.unit,
          consumption.requiredUnit,
          consumption.materialId,
          material?.densityGPerMl ? toNumber(material.densityGPerMl) : undefined
        );

        const convertedUnitCost = await this.convertUnitCost(
          toNumber(batch.unitCost),
          batch.unit,
          consumption.requiredUnit,
          consumption.materialId,
          material?.densityGPerMl ? toNumber(material.densityGPerMl) : undefined
        );

        totalQty += convertedQty;
        totalValue += convertedQty * convertedUnitCost;
      }

      if (totalQty < consumption.finalQty) {
        throw new BadRequestException(
          `Insufficient stock for material ${consumption.materialName}. Available: ${totalQty}, Required: ${consumption.finalQty}`
        );
      }

      const weightedAverageCost = totalValue / totalQty;

      // Create single allocation with WAC (no specific batch)
      allocations.push({
        batchId: '', // Empty for WAC
        materialId: consumption.materialId,
        materialName: consumption.materialName,
        qty: consumption.finalQty,
        unit: consumption.requiredUnit,
        unitCost: weightedAverageCost,
        totalCost: consumption.finalQty * weightedAverageCost,
      });
    }

    return allocations;
  }

  /**
   * Calculate total production cost
   */
  async calculateProductionCost(
    allocations: BatchAllocation[],
    outputQty: number,
    packagingCostPerUnit: number,
    overheadPercent: number
  ): Promise<CostBreakdown> {
    // Calculate material cost
    const materialCost = allocations.reduce((sum, allocation) => sum + allocation.totalCost, 0);

    // Calculate packaging cost
    const packagingCost = outputQty * packagingCostPerUnit;

    // Calculate overhead cost (percentage of material + packaging cost)
    const baseForOverhead = materialCost + packagingCost;
    const overheadCost = baseForOverhead * (overheadPercent / 100);

    // Total cost
    const totalCost = materialCost + packagingCost + overheadCost;
    const unitCost = totalCost / outputQty;

    // Material breakdown
    const materialBreakdown = allocations.map(allocation => ({
      materialName: allocation.materialName || 'Unknown',
      qty: allocation.qty,
      unit: allocation.unit,
      unitCost: allocation.unitCost,
      totalCost: allocation.totalCost,
      batchInfo: allocation.lotCode ? `Lote: ${allocation.lotCode}` : undefined,
    }));

    return {
      materialCost,
      packagingCost,
      overheadCost,
      totalCost,
      unitCost,
      materialBreakdown,
    };
  }

  /**
   * Execute material consumption (update batch quantities)
   */
  async consumeMaterials(
    productionOrderId: string,
    allocations: BatchAllocation[],
    costingMethod: CostingMethod
  ): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      for (const allocation of allocations) {
        // Create production consumption record
        await tx.productionConsumption.create({
          data: {
            productionOrderId,
            materialId: allocation.materialId,
            batchId: allocation.batchId || null,
            qty: allocation.qty,
            unit: allocation.unit,
            unitCostApplied: allocation.unitCost,
            totalCost: allocation.totalCost,
          },
        });

        // Update batch quantities (only for FIFO)
        if (costingMethod === CostingMethod.fifo && allocation.batchId) {
          const batch = await tx.materialBatch.findUnique({
            where: { id: allocation.batchId },
            include: { material: true },
          });

          if (!batch) continue;

          // Convert allocation quantity back to batch unit
          const consumedInBatchUnit = await this.unitConversionService.convertUnit(
            allocation.qty,
            allocation.unit,
            batch.unit,
            allocation.materialId,
            batch.material?.densityGPerMl ? toNumber(batch.material.densityGPerMl) : undefined
          );

          const newQty = toNumber(batch.qty) - consumedInBatchUnit;

          await tx.materialBatch.update({
            where: { id: allocation.batchId },
            data: {
              qty: Math.max(0, newQty),
              status: newQty <= 0 ? BatchStatus.consumed : BatchStatus.available,
            },
          });
        } else if (costingMethod === CostingMethod.wac) {
          // For WAC, proportionally reduce all available batches
          const availableBatches = await tx.materialBatch.findMany({
            where: {
              materialId: allocation.materialId,
              status: BatchStatus.available,
              qty: { gt: 0 },
            },
            include: { material: true },
          });

          let totalAvailableInRequiredUnit = 0;

          // Calculate total available and prepare batch data
          const batchData: { batch: any; convertedQty: number }[] = [];

          for (const batch of availableBatches) {
            const convertedQty = await this.unitConversionService.convertUnit(
              toNumber(batch.qty),
              batch.unit,
              allocation.unit,
              allocation.materialId,
              batch.material?.densityGPerMl ? toNumber(batch.material.densityGPerMl) : undefined
            );

            totalAvailableInRequiredUnit += convertedQty;
            batchData.push({
              batch,
              convertedQty,
            });
          }

          // Proportionally consume from each batch
          for (const { batch, convertedQty } of batchData) {
            const proportion = convertedQty / totalAvailableInRequiredUnit;
            const consumedFromThisBatch = allocation.qty * proportion;

            // Convert back to batch unit
            const consumedInBatchUnit = await this.unitConversionService.convertUnit(
              consumedFromThisBatch,
              allocation.unit,
              batch.unit,
              allocation.materialId,
              batch.material?.densityGPerMl ? toNumber(batch.material.densityGPerMl) : undefined
            );

            const newQty = toNumber(batch.qty) - consumedInBatchUnit;

            await tx.materialBatch.update({
              where: { id: batch.id },
              data: {
                qty: Math.max(0, newQty),
                status: newQty <= 0 ? BatchStatus.consumed : BatchStatus.available,
              },
            });
          }
        }
      }
    });
  }

  /**
   * Update product cost cache
   */
  async updateProductCostCache(
    productId: string,
    unitCost: number,
    method: CostingMethod
  ): Promise<void> {
    await this.prisma.productCostCache.upsert({
      where: { productId },
      update: {
        lastCalculatedAt: new Date(),
        unitCost,
        method,
      },
      create: {
        productId,
        lastCalculatedAt: new Date(),
        unitCost,
        method,
      },
    });
  }

  /**
   * Convert unit cost from one unit to another
   */
  private async convertUnitCost(
    unitCost: number,
    fromUnit: Unit,
    toUnit: Unit,
    materialId: string,
    density?: number
  ): Promise<number> {
    if (fromUnit === toUnit) {
      return unitCost;
    }

    // Get conversion factor
    const conversionFactor = await this.unitConversionService.convertUnit(
      1,
      fromUnit,
      toUnit,
      materialId,
      density
    );

    // Cost per unit in target unit = cost per unit in source unit / conversion factor
    // Example: if 1kg costs $10, and 1kg = 1000g, then 1g costs $10/1000 = $0.01
    return unitCost / conversionFactor;
  }

  /**
   * Get suggested selling price with markup
   */
  async getSuggestedPrice(productId: string, markupPercent: number): Promise<number> {
    const costCache = await this.prisma.productCostCache.findUnique({
      where: { productId },
    });

    if (!costCache) {
      throw new BadRequestException(
        `No cost information available for product ${productId}. Please complete a production order first.`
      );
    }

    const unitCost = toNumber(costCache.unitCost);
    return unitCost * (1 + markupPercent / 100);
  }

  /**
   * Get cost history for a product
   */
  async getProductCostHistory(productId: string, limit = 10) {
    const productionOrders = await this.prisma.productionOrder.findMany({
      where: {
        productId,
        status: ProductionOrderStatus.finished,
        unitCost: { not: null },
      },
      orderBy: { finishedAt: 'desc' },
      take: limit,
      select: {
        id: true,
        unitCost: true,
        totalCost: true,
        actualOutputQty: true,
        costingMethodSnapshot: true,
        finishedAt: true,
        batchCode: true,
      },
    });

    return productionOrders.map(order => ({
      productionOrderId: order.id,
      unitCost: toNumber(order.unitCost),
      totalCost: toNumber(order.totalCost),
      outputQty: toNumber(order.actualOutputQty),
      method: order.costingMethodSnapshot,
      date: order.finishedAt,
      batchCode: order.batchCode,
    }));
  }
}

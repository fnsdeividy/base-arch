import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CostCalculationService } from './cost-calculation.service';
import { MaterialsService } from './materials.service';
import {
  CreateProductionOrderDto,
  UpdateProductionOrderDto,
  StartProductionOrderDto,
  FinishProductionOrderDto,
  MaterialAvailabilityDto,
  ProductionOrderSummaryDto,
  CostBreakdownDto,
} from '../../presentation/dto/production-order.dto';
import {
  ProductionOrderStatus,
  CostingMethod,
  Unit,
} from '../../entities/material.entity';
import { toNumber, toDecimal } from './decimal-utils';

@Injectable()
export class ProductionOrdersService {
  constructor(
    private prisma: PrismaService,
    private costCalculationService: CostCalculationService,
    private materialsService: MaterialsService
  ) { }

  async findAll(): Promise<ProductionOrderSummaryDto[]> {
    const orders = await this.prisma.productionOrder.findMany({
      include: {
        product: true,
        consumptions: {
          include: {
            material: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return Promise.all(
      orders.map(async (order) => {
        const summary: ProductionOrderSummaryDto = {
          id: order.id,
          productName: order.product.name,
          plannedOutputQty: toNumber(order.plannedOutputQty),
          plannedUnit: order.plannedUnit as Unit,
          actualOutputQty: order.actualOutputQty ? toNumber(order.actualOutputQty) : undefined,
          status: order.status as ProductionOrderStatus,
          totalCost: order.totalCost ? toNumber(order.totalCost) : undefined,
          unitCost: order.unitCost ? toNumber(order.unitCost) : undefined,
          batchCode: order.batchCode || undefined,
          createdAt: order.createdAt,
          startedAt: order.startedAt || undefined,
          finishedAt: order.finishedAt || undefined,
        };

        // Add material availability if order is draft
        if (order.status === ProductionOrderStatus.draft) {
          summary.materialAvailability = await this.checkMaterialAvailability(order.id);
        }

        return summary;
      })
    );
  }

  async findById(id: string) {
    const order = await this.prisma.productionOrder.findUnique({
      where: { id },
      include: {
        product: true,
        consumptions: {
          include: {
            material: true,
            batch: true,
          },
        },
        finishedGoods: true,
      },
    });

    if (!order) {
      throw new NotFoundException(`Production order with ID ${id} not found`);
    }

    return order;
  }

  async create(data: CreateProductionOrderDto) {
    // Verify product exists
    const product = await this.prisma.product.findUnique({
      where: { id: data.productId },
    });

    if (!product) {
      throw new NotFoundException(`Product with ID ${data.productId} not found`);
    }

    // Generate batch code
    const batchCode = await this.generateBatchCode(data.productId);

    const order = await this.prisma.productionOrder.create({
      data: {
        ...data,
        overheadPercent: data.overheadPercent || 0,
        packagingCostPerOutputUnit: data.packagingCostPerOutputUnit || 0,
        batchCode,
      },
      include: {
        product: true,
        consumptions: true,
        finishedGoods: true,
      },
    });

    return order;
  }

  async update(id: string, data: UpdateProductionOrderDto) {
    await this.findById(id);

    const order = await this.prisma.productionOrder.update({
      where: { id },
      data: {
        ...data,
        startedAt: data.startedAt ? new Date(data.startedAt) : undefined,
        finishedAt: data.finishedAt ? new Date(data.finishedAt) : undefined,
      },
      include: {
        product: true,
        consumptions: true,
        finishedGoods: true,
      },
    });

    return order;
  }

  async delete(id: string): Promise<void> {
    const order = await this.findById(id);

    if (order.status !== ProductionOrderStatus.draft) {
      throw new BadRequestException(
        'Can only delete draft production orders'
      );
    }

    await this.prisma.productionOrder.delete({ where: { id } });
  }

  async startProduction(id: string, data: StartProductionOrderDto) {
    const order = await this.findById(id);

    if (order.status !== ProductionOrderStatus.draft) {
      throw new BadRequestException(
        'Can only start draft production orders'
      );
    }

    // Check material availability
    const availability = await this.checkMaterialAvailability(id);
    const unavailableMaterials = availability.filter(m => m.status === 'unavailable');

    if (unavailableMaterials.length > 0) {
      throw new BadRequestException(
        `Cannot start production. Unavailable materials: ${unavailableMaterials.map(m => m.materialName).join(', ')}`
      );
    }

    // Reserve materials if using FIFO
    if (order.costingMethodSnapshot === CostingMethod.fifo) {
      await this.reserveMaterials(id);
    }

    return this.prisma.productionOrder.update({
      where: { id },
      data: {
        status: ProductionOrderStatus.in_progress,
        startedAt: new Date(data.startedAt),
      },
      include: {
        product: true,
        consumptions: true,
        finishedGoods: true,
      },
    });
  }

  async finishProduction(id: string, data: FinishProductionOrderDto) {
    const order = await this.findById(id);

    if (order.status !== ProductionOrderStatus.in_progress) {
      throw new BadRequestException(
        'Can only finish production orders that are in progress'
      );
    }

    await this.prisma.$transaction(async (tx) => {
      // Calculate material consumptions
      const consumptions = await this.costCalculationService.calculateMaterialConsumptions(
        order.productId,
        data.actualOutputQty,
        order.plannedUnit as Unit
      );

      // Allocate materials based on costing method
      let allocations;
      if (order.costingMethodSnapshot === CostingMethod.fifo) {
        allocations = await this.costCalculationService.allocateMaterialsFIFO(consumptions);
      } else {
        allocations = await this.costCalculationService.allocateMaterialsWAC(consumptions);
      }

      // Calculate costs
      const costBreakdown = await this.costCalculationService.calculateProductionCost(
        allocations,
        data.actualOutputQty,
        toNumber(order.packagingCostPerOutputUnit),
        toNumber(order.overheadPercent)
      );

      // Consume materials
      await this.costCalculationService.consumeMaterials(
        id,
        allocations,
        order.costingMethodSnapshot as CostingMethod
      );

      // Update production order
      await tx.productionOrder.update({
        where: { id },
        data: {
          status: ProductionOrderStatus.finished,
          finishedAt: new Date(data.finishedAt),
          actualOutputQty: data.actualOutputQty,
          batchCode: data.batchCode || order.batchCode,
          totalMaterialCost: costBreakdown.materialCost,
          totalPackagingCost: costBreakdown.packagingCost,
          totalOverheadCost: costBreakdown.overheadCost,
          totalCost: costBreakdown.totalCost,
          unitCost: costBreakdown.unitCost,
        },
      });

      // Create finished goods inventory entry
      await tx.finishedGoodsInventory.create({
        data: {
          productId: order.productId,
          productionOrderId: id,
          qty: data.actualOutputQty,
          unit: order.plannedUnit,
          unitCost: costBreakdown.unitCost,
          batchCode: data.batchCode || order.batchCode || '',
        },
      });

      // Update product cost cache
      await this.costCalculationService.updateProductCostCache(
        order.productId,
        costBreakdown.unitCost,
        order.costingMethodSnapshot as CostingMethod
      );
    });

    return this.findById(id);
  }

  async cancelProduction(id: string) {
    const order = await this.findById(id);

    if (order.status === ProductionOrderStatus.finished) {
      throw new BadRequestException('Cannot cancel finished production orders');
    }

    // If materials were reserved, unreserve them
    if (order.status === ProductionOrderStatus.in_progress && order.costingMethodSnapshot === CostingMethod.fifo) {
      await this.unreserveMaterials(id);
    }

    return this.prisma.productionOrder.update({
      where: { id },
      data: {
        status: ProductionOrderStatus.canceled,
      },
      include: {
        product: true,
        consumptions: true,
        finishedGoods: true,
      },
    });
  }

  async checkMaterialAvailability(productionOrderId: string): Promise<MaterialAvailabilityDto[]> {
    const order = await this.findById(productionOrderId);

    // Calculate required materials
    const consumptions = await this.costCalculationService.calculateMaterialConsumptions(
      order.productId,
      toNumber(order.plannedOutputQty),
      order.plannedUnit as Unit
    );

    // Check availability for each material
    const availability: MaterialAvailabilityDto[] = [];

    for (const consumption of consumptions) {
      const materialAvailability = await this.materialsService.checkMaterialAvailability(
        consumption.materialId,
        consumption.finalQty,
        consumption.requiredUnit
      );

      availability.push({
        materialId: consumption.materialId,
        materialName: consumption.materialName,
        requiredQty: consumption.finalQty,
        requiredUnit: consumption.requiredUnit,
        availableQty: materialAvailability.totalAvailable,
        status: materialAvailability.status as 'available' | 'partial' | 'unavailable',
        shortfall: materialAvailability.shortfall,
      });
    }

    return availability;
  }

  async getCostBreakdown(productionOrderId: string): Promise<CostBreakdownDto> {
    const order = await this.prisma.productionOrder.findUnique({
      where: { id: productionOrderId },
      include: {
        consumptions: {
          include: {
            material: true,
            batch: true,
          },
        },
      },
    });

    if (!order) {
      throw new NotFoundException(`Production order with ID ${productionOrderId} not found`);
    }

    if (order.status !== ProductionOrderStatus.finished) {
      throw new BadRequestException('Cost breakdown only available for finished production orders');
    }

    const materialBreakdown = order.consumptions.map(consumption => ({
      materialName: consumption.material.name,
      qty: toNumber(consumption.qty),
      unit: consumption.unit as Unit,
      unitCost: toNumber(consumption.unitCostApplied),
      totalCost: toNumber(consumption.totalCost),
      batchInfo: consumption.batch?.lotCode ? `Lote: ${consumption.batch.lotCode}` : undefined,
    }));

    return {
      materialCost: toNumber(order.totalMaterialCost) || 0,
      packagingCost: toNumber(order.totalPackagingCost) || 0,
      overheadCost: toNumber(order.totalOverheadCost) || 0,
      totalCost: toNumber(order.totalCost) || 0,
      unitCost: toNumber(order.unitCost) || 0,
      materialBreakdown,
    };
  }

  private async generateBatchCode(productId: string): Promise<string> {
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
      select: { name: true },
    });

    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');

    // Get daily sequence number
    const startOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const endOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);

    const dailyCount = await this.prisma.productionOrder.count({
      where: {
        productId,
        createdAt: {
          gte: startOfDay,
          lt: endOfDay,
        },
      },
    });

    const sequence = (dailyCount + 1).toString().padStart(3, '0');
    const productCode = product?.name.substring(0, 3).toUpperCase() || 'PRD';

    return `${productCode}${year}${month}${day}${sequence}`;
  }

  private async reserveMaterials(productionOrderId: string): Promise<void> {
    // Implementation for reserving materials in FIFO method
    // This would mark specific batches as reserved
    // For now, we'll skip this as it adds complexity
    // In a full implementation, you'd update batch status to 'reserved'
  }

  private async unreserveMaterials(productionOrderId: string): Promise<void> {
    // Implementation for unreserving materials
    // This would mark reserved batches back to available
    // For now, we'll skip this as it adds complexity
  }

  async getProductionMetrics() {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));

    const [
      totalOrders,
      monthlyOrders,
      weeklyOrders,
      inProgressOrders,
      finishedOrders,
      avgCostPerUnit,
    ] = await Promise.all([
      this.prisma.productionOrder.count(),
      this.prisma.productionOrder.count({
        where: { createdAt: { gte: startOfMonth } },
      }),
      this.prisma.productionOrder.count({
        where: { createdAt: { gte: startOfWeek } },
      }),
      this.prisma.productionOrder.count({
        where: { status: ProductionOrderStatus.in_progress },
      }),
      this.prisma.productionOrder.count({
        where: { status: ProductionOrderStatus.finished },
      }),
      this.prisma.productionOrder.aggregate({
        where: {
          status: ProductionOrderStatus.finished,
          unitCost: { not: null },
        },
        _avg: { unitCost: true },
      }),
    ]);

    return {
      totalOrders,
      monthlyOrders,
      weeklyOrders,
      inProgressOrders,
      finishedOrders,
      avgCostPerUnit: toNumber(avgCostPerUnit._avg.unitCost) || 0,
    };
  }
}
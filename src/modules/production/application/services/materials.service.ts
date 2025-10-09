import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { UnitConversionService } from './unit-conversion.service';
import {
  CreateMaterialDto,
  UpdateMaterialDto,
  CreateMaterialBatchDto,
  UpdateMaterialBatchDto,
  CreateProductBomDto,
  UpdateProductBomDto,
  ScaleRecipeDto,
} from '../../presentation/dto/material.dto';
import { Unit, BatchStatus } from '../../entities/material.entity';
import { toNumber, toDecimal } from './decimal-utils';

@Injectable()
export class MaterialsService {
  constructor(
    private prisma: PrismaService,
    private unitConversionService: UnitConversionService
  ) { }

  // Materials CRUD
  async findAllMaterials() {
    return this.prisma.material.findMany({
      include: {
        batches: {
          where: { status: { not: BatchStatus.consumed } },
          orderBy: { receivedAt: 'asc' },
        },
        bomItems: true,
        conversions: true,
      },
    });
  }

  async findMaterialById(id: string) {
    const material = await this.prisma.material.findUnique({
      where: { id },
      include: {
        batches: {
          orderBy: { receivedAt: 'asc' },
        },
        bomItems: {
          include: {
            product: true,
          },
        },
        conversions: true,
      },
    });

    if (!material) {
      throw new NotFoundException(`Material with ID ${id} not found`);
    }

    return material;
  }

  async createMaterial(data: CreateMaterialDto) {
    return this.prisma.material.create({
      data,
      include: {
        batches: true,
        bomItems: true,
        conversions: true,
      },
    });
  }

  async updateMaterial(id: string, data: UpdateMaterialDto) {
    await this.findMaterialById(id);

    return this.prisma.material.update({
      where: { id },
      data,
      include: {
        batches: true,
        bomItems: true,
        conversions: true,
      },
    });
  }

  async deleteMaterial(id: string): Promise<void> {
    await this.findMaterialById(id);

    // Check if material is used in any BOM
    const bomCount = await this.prisma.productBom.count({
      where: { materialId: id },
    });

    if (bomCount > 0) {
      throw new BadRequestException(
        'Cannot delete material that is used in product recipes'
      );
    }

    // Check if material has available batches
    const availableBatches = await this.prisma.materialBatch.count({
      where: {
        materialId: id,
        status: { in: [BatchStatus.available, BatchStatus.reserved] },
      },
    });

    if (availableBatches > 0) {
      throw new BadRequestException(
        'Cannot delete material that has available or reserved batches'
      );
    }

    await this.prisma.material.delete({ where: { id } });
  }

  // Material Batches CRUD
  async findMaterialBatches(materialId: string) {
    return this.prisma.materialBatch.findMany({
      where: { materialId },
      include: {
        material: true,
        consumptions: true,
      },
      orderBy: { receivedAt: 'asc' },
    });
  }

  async findBatchById(id: string) {
    const batch = await this.prisma.materialBatch.findUnique({
      where: { id },
      include: {
        material: true,
        consumptions: true,
      },
    });

    if (!batch) {
      throw new NotFoundException(`Material batch with ID ${id} not found`);
    }

    return batch;
  }

  async createMaterialBatch(data: CreateMaterialBatchDto) {
    // Verify material exists
    await this.findMaterialById(data.materialId);

    // Calculate total cost
    const totalCost = data.qty * data.unitCost;

    return this.prisma.materialBatch.create({
      data: {
        ...data,
        totalCost,
        receivedAt: new Date(data.receivedAt),
        expiryDate: data.expiryDate ? new Date(data.expiryDate) : null,
      },
      include: {
        material: true,
        consumptions: true,
      },
    });
  }

  async updateMaterialBatch(id: string, data: UpdateMaterialBatchDto) {
    const batch = await this.findBatchById(id);

    // Recalculate total cost if qty or unitCost changed
    const updateData: any = { ...data };
    if (data.qty !== undefined || data.unitCost !== undefined) {
      const newQty = data.qty ?? toNumber(batch.qty);
      const newUnitCost = data.unitCost ?? toNumber(batch.unitCost);
      updateData.totalCost = newQty * newUnitCost;
    }

    if (data.receivedAt) {
      updateData.receivedAt = new Date(data.receivedAt);
    }

    if (data.expiryDate) {
      updateData.expiryDate = new Date(data.expiryDate);
    }

    return this.prisma.materialBatch.update({
      where: { id },
      data: updateData,
      include: {
        material: true,
        consumptions: true,
      },
    });
  }

  async deleteMaterialBatch(id: string): Promise<void> {
    const batch = await this.findBatchById(id);

    if (batch.status === BatchStatus.consumed) {
      throw new BadRequestException('Cannot delete consumed batch');
    }

    // Check if batch has consumptions
    const consumptionCount = await this.prisma.productionConsumption.count({
      where: { batchId: id },
    });

    if (consumptionCount > 0) {
      throw new BadRequestException(
        'Cannot delete batch that has been used in production'
      );
    }

    await this.prisma.materialBatch.delete({ where: { id } });
  }

  // Product BOM (Bill of Materials) CRUD
  async findProductBom(productId: string) {
    return this.prisma.productBom.findMany({
      where: { productId },
      include: {
        material: true,
        product: true,
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  async createBomItem(data: CreateProductBomDto) {
    // Verify product exists
    const product = await this.prisma.product.findUnique({
      where: { id: data.productId },
    });
    if (!product) {
      throw new NotFoundException(`Product with ID ${data.productId} not found`);
    }

    // Verify material exists
    await this.findMaterialById(data.materialId);

    return this.prisma.productBom.create({
      data: {
        ...data,
        wastePercent: data.wastePercent || 0,
      },
      include: {
        material: true,
        product: true,
      },
    });
  }

  async createBomItemsBatch(items: CreateProductBomDto[]) {
    // Validate all items first
    for (const item of items) {
      // Verify product exists
      const product = await this.prisma.product.findUnique({
        where: { id: item.productId },
      });
      if (!product) {
        throw new NotFoundException(`Product with ID ${item.productId} not found`);
      }

      // Verify material exists
      await this.findMaterialById(item.materialId);
    }

    // Create all items in a transaction
    return this.prisma.$transaction(async (tx) => {
      const createdItems: any[] = [];
      for (const item of items) {
        const created = await tx.productBom.create({
          data: {
            ...item,
            wastePercent: item.wastePercent || 0,
          },
          include: {
            material: true,
            product: true,
          },
        });
        createdItems.push(created);
      }
      return createdItems;
    });
  }

  async updateBomItem(id: string, data: UpdateProductBomDto) {
    const bomItem = await this.prisma.productBom.findUnique({
      where: { id },
      include: {
        material: true,
        product: true,
      },
    });

    if (!bomItem) {
      throw new NotFoundException(`BOM item with ID ${id} not found`);
    }

    return this.prisma.productBom.update({
      where: { id },
      data,
      include: {
        material: true,
        product: true,
      },
    });
  }

  async deleteBomItem(id: string): Promise<void> {
    const bomItem = await this.prisma.productBom.findUnique({
      where: { id },
    });

    if (!bomItem) {
      throw new NotFoundException(`BOM item with ID ${id} not found`);
    }

    await this.prisma.productBom.delete({ where: { id } });
  }

  // Recipe scaling
  async scaleRecipe(data: ScaleRecipeDto) {
    const bom = await this.findProductBom(data.productId);

    if (bom.length === 0) {
      throw new NotFoundException(`No recipe found for product ${data.productId}`);
    }

    // Get product info to determine base recipe size
    const product = await this.prisma.product.findUnique({
      where: { id: data.productId },
    });

    if (!product) {
      throw new NotFoundException(`Product with ID ${data.productId} not found`);
    }

    // Assume base recipe is for 100 units of the product's base unit
    const baseRecipeSize = 100;
    const baseRecipeUnit = product.baseUnit || Unit.L;

    // Calculate scaling factor
    let scalingFactor: number;

    if (data.targetUnit === baseRecipeUnit) {
      scalingFactor = data.targetOutputQty / baseRecipeSize;
    } else {
      // Convert target to base unit
      const convertedTarget = await this.unitConversionService.convertUnit(
        data.targetOutputQty,
        data.targetUnit,
        baseRecipeUnit
      );
      scalingFactor = convertedTarget / baseRecipeSize;
    }

    // Scale each ingredient
    const scaledBom = await Promise.all(
      bom.map(async (item) => {
        const scaledQty = toNumber(item.qty) * scalingFactor;
        const wasteMultiplier = 1 + (toNumber(item.wastePercent) / 100);
        const finalQty = scaledQty * wasteMultiplier;

        return {
          materialId: item.materialId,
          materialName: item.material?.name,
          baseQty: toNumber(item.qty),
          scaledQty: scaledQty,
          wastePercent: toNumber(item.wastePercent),
          finalQty: finalQty,
          unit: item.unit,
          notes: item.notes,
        };
      })
    );

    return {
      productId: data.productId,
      targetOutputQty: data.targetOutputQty,
      targetUnit: data.targetUnit,
      scalingFactor,
      ingredients: scaledBom,
    };
  }

  // Material availability check
  async checkMaterialAvailability(materialId: string, requiredQty: number, requiredUnit: Unit) {
    const material = await this.findMaterialById(materialId);

    // Get all available batches
    const availableBatches = await this.prisma.materialBatch.findMany({
      where: {
        materialId,
        status: BatchStatus.available,
        qty: { gt: 0 },
      },
      orderBy: { receivedAt: 'asc' }, // FIFO order
    });

    let totalAvailable = 0;
    const batchDetails: any[] = [];

    for (const batch of availableBatches) {
      // Convert batch quantity to required unit
      const convertedQty = await this.unitConversionService.convertUnit(
        toNumber(batch.qty),
        batch.unit,
        requiredUnit,
        materialId,
        material.densityGPerMl ? toNumber(material.densityGPerMl) : undefined
      );

      totalAvailable += convertedQty;
      batchDetails.push({
        batchId: batch.id,
        lotCode: batch.lotCode,
        availableQty: convertedQty,
        unitCost: toNumber(batch.unitCost),
        expiryDate: batch.expiryDate,
      });
    }

    const status = totalAvailable >= requiredQty ? 'available' :
      totalAvailable > 0 ? 'partial' : 'unavailable';

    return {
      materialId,
      materialName: material.name,
      requiredQty,
      requiredUnit,
      totalAvailable,
      status,
      shortfall: Math.max(0, requiredQty - totalAvailable),
      batches: batchDetails,
    };
  }

  // Get low stock materials
  async getLowStockMaterials() {
    const materials = await this.prisma.material.findMany({
      include: {
        batches: {
          where: { status: BatchStatus.available },
        },
      },
    });

    const lowStockMaterials: any[] = [];

    for (const material of materials) {
      let totalStock = 0;

      for (const batch of material.batches) {
        // Convert to material's base unit for comparison
        const convertedQty = await this.unitConversionService.convertUnit(
          toNumber(batch.qty),
          batch.unit,
          material.baseUnit,
          material.id,
          material.densityGPerMl ? toNumber(material.densityGPerMl) : undefined
        );
        totalStock += convertedQty;
      }

      if (totalStock <= toNumber(material.minStock)) {
        lowStockMaterials.push({
          id: material.id,
          name: material.name,
          currentStock: totalStock,
          minStock: toNumber(material.minStock),
          baseUnit: material.baseUnit,
          shortfall: toNumber(material.minStock) - totalStock,
        });
      }
    }

    return lowStockMaterials;
  }
}
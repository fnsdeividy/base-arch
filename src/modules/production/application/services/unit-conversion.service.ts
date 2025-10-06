import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { Unit } from '../../entities/material.entity';
import { CreateUnitConversionDto } from '../../presentation/dto/material.dto';
import { toNumber, toDecimal } from './decimal-utils';

@Injectable()
export class UnitConversionService {
  constructor(private prisma: PrismaService) { }

  // Standard conversion factors
  private readonly standardConversions = new Map([
    // Mass conversions
    [`${Unit.g}-${Unit.kg}`, 0.001],
    [`${Unit.kg}-${Unit.g}`, 1000],

    // Volume conversions
    [`${Unit.ml}-${Unit.L}`, 0.001],
    [`${Unit.L}-${Unit.ml}`, 1000],
  ]);

  async createConversion(data: CreateUnitConversionDto) {
    // Check if this is a standard conversion that shouldn't be overridden
    const standardKey = `${data.fromUnit}-${data.toUnit}`;
    if (this.standardConversions.has(standardKey) && !data.materialId) {
      throw new BadRequestException(
        `Standard conversion from ${data.fromUnit} to ${data.toUnit} already exists`
      );
    }

    return this.prisma.unitConversion.create({
      data: {
        materialId: data.materialId,
        fromUnit: data.fromUnit,
        toUnit: data.toUnit,
        factor: toDecimal(data.factor),
      },
      include: {
        material: true,
      },
    });
  }

  async getConversions(materialId?: string) {
    return this.prisma.unitConversion.findMany({
      where: materialId ? { materialId } : {},
      include: {
        material: true,
      },
    });
  }

  async deleteConversion(id: string) {
    return this.prisma.unitConversion.delete({
      where: { id },
    });
  }

  /**
   * Convert quantity from one unit to another
   * @param qty - Quantity to convert
   * @param fromUnit - Source unit
   * @param toUnit - Target unit
   * @param materialId - Material ID for material-specific conversions
   * @param density - Density in g/ml for mass-volume conversions
   */
  async convertUnit(
    qty: number,
    fromUnit: Unit,
    toUnit: Unit,
    materialId?: string,
    density?: number
  ): Promise<number> {
    if (fromUnit === toUnit) {
      return qty;
    }

    // Try material-specific conversion first
    if (materialId) {
      const customConversion = await this.prisma.unitConversion.findUnique({
        where: {
          materialId_fromUnit_toUnit: {
            materialId,
            fromUnit,
            toUnit,
          },
        },
      });

      if (customConversion) {
        return qty * toNumber(customConversion.factor);
      }
    }

    // Try standard conversions
    const standardKey = `${fromUnit}-${toUnit}`;
    if (this.standardConversions.has(standardKey)) {
      const factor = this.standardConversions.get(standardKey)!;
      return qty * factor;
    }

    // Try density-based conversions (mass ↔ volume)
    if (density && this.isMassVolumeConversion(fromUnit, toUnit)) {
      return this.convertMassVolume(qty, fromUnit, toUnit, density);
    }

    throw new BadRequestException(
      `Cannot convert from ${fromUnit} to ${toUnit}. Missing conversion factor or density.`
    );
  }

  /**
   * Normalize quantity to standard base units (kg for mass, L for volume)
   */
  async normalizeToBaseUnit(
    qty: number,
    unit: Unit,
    materialId?: string,
    density?: number
  ): Promise<{ qty: number; unit: Unit }> {
    const baseUnit = this.getBaseUnit(unit);
    if (unit === baseUnit) {
      return { qty, unit };
    }

    const convertedQty = await this.convertUnit(qty, unit, baseUnit, materialId, density);
    return { qty: convertedQty, unit: baseUnit };
  }

  /**
   * Get the base unit for a given unit type
   */
  private getBaseUnit(unit: Unit): Unit {
    switch (unit) {
      case Unit.g:
      case Unit.kg:
        return Unit.kg;
      case Unit.ml:
      case Unit.L:
        return Unit.L;
      case Unit.un:
        return Unit.un;
      default:
        return unit;
    }
  }

  /**
   * Check if conversion is between mass and volume units
   */
  private isMassVolumeConversion(fromUnit: Unit, toUnit: Unit): boolean {
    const massUnits = [Unit.g, Unit.kg] as Unit[];
    const volumeUnits = [Unit.ml, Unit.L] as Unit[];

    return (
      (massUnits.includes(fromUnit) && volumeUnits.includes(toUnit)) ||
      (volumeUnits.includes(fromUnit) && massUnits.includes(toUnit))
    );
  }

  /**
   * Convert between mass and volume using density
   */
  private convertMassVolume(
    qty: number,
    fromUnit: Unit,
    toUnit: Unit,
    density: number
  ): number {
    const massUnits = [Unit.g, Unit.kg] as Unit[];
    const volumeUnits = [Unit.ml, Unit.L] as Unit[];

    let massInGrams: number;
    let volumeInMl: number;

    if (massUnits.includes(fromUnit)) {
      // Convert mass to grams first
      massInGrams = fromUnit === Unit.kg ? qty * 1000 : qty;
      // Convert to volume in ml
      volumeInMl = massInGrams / density;

      // Convert to target volume unit
      if (toUnit === Unit.L) {
        return volumeInMl / 1000;
      } else {
        return volumeInMl;
      }
    } else {
      // Convert volume to ml first
      volumeInMl = fromUnit === Unit.L ? qty * 1000 : qty;
      // Convert to mass in grams
      massInGrams = volumeInMl * density;

      // Convert to target mass unit
      if (toUnit === Unit.kg) {
        return massInGrams / 1000;
      } else {
        return massInGrams;
      }
    }
  }

  /**
   * Get all possible conversions for a unit, including standard ones
   */
  async getAvailableConversions(unit: Unit, materialId?: string) {
    const conversions: { fromUnit: Unit; toUnit: Unit; factor: number; isStandard: boolean }[] = [];

    // Add standard conversions
    for (const [key, factor] of this.standardConversions.entries()) {
      const [from, to] = key.split('-') as [Unit, Unit];
      if (from === unit) {
        conversions.push({ fromUnit: from, toUnit: to, factor, isStandard: true });
      }
    }

    // Add custom conversions
    if (materialId) {
      const customConversions = await this.prisma.unitConversion.findMany({
        where: {
          materialId,
          fromUnit: unit,
        },
      });

      for (const conv of customConversions) {
        conversions.push({
          fromUnit: conv.fromUnit as Unit,
          toUnit: conv.toUnit as Unit,
          factor: conv.factor.toNumber(),
          isStandard: false,
        });
      }
    }

    return conversions;
  }
}

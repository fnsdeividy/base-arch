import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';

// Services
import { MaterialsService } from './application/services/materials.service';
import { UnitConversionService } from './application/services/unit-conversion.service';
import { CostCalculationService } from './application/services/cost-calculation.service';
import { ProductionOrdersService } from './application/services/production-orders.service';

// Controllers
import {
  MaterialsController,
  MaterialBatchesController,
  BomController,
  UnitConversionsController,
} from './presentation/http/controllers/materials.controller';
import {
  ProductionOrdersController,
  CostCalculationController,
} from './presentation/http/controllers/production-orders.controller';

@Module({
  imports: [PrismaModule],
  controllers: [
    MaterialsController,
    MaterialBatchesController,
    BomController,
    UnitConversionsController,
    ProductionOrdersController,
    CostCalculationController,
  ],
  providers: [
    UnitConversionService,
    MaterialsService,
    CostCalculationService,
    ProductionOrdersService,
  ],
  exports: [
    MaterialsService,
    UnitConversionService,
    CostCalculationService,
    ProductionOrdersService,
  ],
})
export class ProductionModule {}

import { Module } from '@nestjs/common';
import { StockController } from './presentation/stock.controller';
import { StockService } from './application/stock.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [StockController],
  providers: [StockService],
  exports: [StockService]
})
export class StockModule { }
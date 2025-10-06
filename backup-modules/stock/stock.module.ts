import { Module } from '@nestjs/common';
import { StockController } from '@modules/stock/presentation/http/controllers/stock.controller';
import { StockService } from './application/services/stock.service';

@Module({
  controllers: [StockController],
  providers: [StockService],
  exports: [StockService],
})
export class StockModule { }

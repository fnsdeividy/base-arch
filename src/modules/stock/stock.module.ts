import { Module } from '@nestjs/common';
import { TypeOrmModule, getRepositoryToken } from '@nestjs/typeorm';
import { StockController } from '@modules/stock/presentation/http/controllers/stock.controller';
import { Stock } from '@modules/stock/entities/stock.entity';
import { StockService } from './application/services/stock.service';
import { StockRepository } from './infra/repositories/stock.repository';
import { STOCK_REPOSITORY } from './presentation/interfaces/stock.interface';

@Module({
  imports: [
    TypeOrmModule.forFeature([Stock])
  ],
  controllers: [StockController],
  providers: [
    StockService,
    {
      provide: STOCK_REPOSITORY,
      useFactory: (stockRepository) => new StockRepository(stockRepository),
      inject: [getRepositoryToken(Stock)],
    },
  ],
  exports: [StockService],
})
export class StockModule { }

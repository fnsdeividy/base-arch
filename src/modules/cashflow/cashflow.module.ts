import { Module } from '@nestjs/common';
import { TransactionController } from './presentation/http/controllers/transaction.controller';
import { TransactionService } from './application/services/transaction.service';
import { PrismaModule } from '@modules/prisma';

@Module({
  imports: [PrismaModule],
  controllers: [TransactionController],
  providers: [TransactionService],
  exports: [TransactionService],
})
export class CashflowModule { }

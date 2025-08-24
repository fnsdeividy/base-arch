import { Module } from '@nestjs/common';
import { InvoiceController } from '@modules/invoice/presentation/http/controllers/invoice.controller';
import { InvoiceService } from './application/services/invoice.service';

@Module({
  controllers: [InvoiceController],
  providers: [InvoiceService],
  exports: [InvoiceService],
})
export class InvoicesModule { }

import { Module } from '@nestjs/common';
import { TypeOrmModule, getRepositoryToken } from '@nestjs/typeorm';
import { InvoiceController } from '@modules/invoice/presentation/http/controllers/invoice.controller';
import { InvoiceRepository } from '@modules/invoice/infra/repositories/invoice.repository';
import { INVOICE_REPOSITORY } from '@modules/invoice/presentation/interfaces/invoice.interface';
import { Invoice } from '@modules/invoice/entities/invoice.entity';
import { InvoiceService } from './application/services/invoice.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Invoice])
  ],
  controllers: [InvoiceController],
  providers: [
    InvoiceService,
    {
      provide: INVOICE_REPOSITORY,
      useFactory: (invoiceRepository) => new InvoiceRepository(invoiceRepository),
      inject: [getRepositoryToken(Invoice)],
    },
  ],
  exports: [InvoiceService],
})
export class InvoicesModule { }

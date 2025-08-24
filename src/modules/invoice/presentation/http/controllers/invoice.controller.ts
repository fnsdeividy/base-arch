import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { InvoiceService } from '@modules/invoice/application/services/invoice.service';
import { CreateInvoiceDto } from '@modules/invoice/presentation/dto/createInvoice.dto';
import { UpdateInvoiceDto } from '@modules/invoice/presentation/dto/updateInvoice.dto';
import { JwtAuthGuard } from '@shared/presentation/http/guards/jwt-auth.guard';
import { InvoiceStatus } from '@modules/invoice/entities/invoice.entity';

@Controller('api/v1/invoices')
@UseGuards(JwtAuthGuard)
export class InvoiceController {
  constructor(private readonly invoiceService: InvoiceService) { }

  @Post()
  create(@Body() createInvoiceDto: CreateInvoiceDto) {
    return this.invoiceService.create(createInvoiceDto);
  }

  @Get()
  findAll(
    @Query('status') status?: InvoiceStatus,
    @Query('customerId') customerId?: string,
    @Query('overdue') overdue?: boolean,
  ) {
    return this.invoiceService.findAll({ status, customerId, overdue });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.invoiceService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateInvoiceDto: UpdateInvoiceDto) {
    return this.invoiceService.update(id, updateInvoiceDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.invoiceService.remove(id);
  }

  @Patch(':id/status')
  updateStatus(@Param('id') id: string, @Body('status') status: InvoiceStatus) {
    return this.invoiceService.updateStatus(id, status);
  }

  @Patch(':id/pay')
  markAsPaid(@Param('id') id: string) {
    return this.invoiceService.markAsPaid(id);
  }
}

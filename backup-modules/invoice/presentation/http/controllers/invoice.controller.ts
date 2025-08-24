import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { InvoiceService } from '@modules/invoice/application/services/invoice.service';
import { CreateInvoiceDto } from '@modules/invoice/presentation/dto/createInvoice.dto';
import { UpdateInvoiceDto } from '@modules/invoice/presentation/dto/updateInvoice.dto';
import { JwtAuthGuard } from '@shared/presentation/http/guards/jwt-auth.guard';

@Controller('invoices')
@UseGuards(JwtAuthGuard)
export class InvoiceController {
  constructor(private readonly invoiceService: InvoiceService) { }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createInvoice(@Body() createInvoiceDto: CreateInvoiceDto) {
    return this.invoiceService.createInvoice(createInvoiceDto);
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    return this.invoiceService.findById(id);
  }

  @Put(':id')
  async updateInvoice(
    @Param('id') id: string,
    @Body() updateInvoiceDto: UpdateInvoiceDto,
  ) {
    return this.invoiceService.updateInvoice(id, updateInvoiceDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteInvoice(@Param('id') id: string) {
    return this.invoiceService.deleteInvoice(id);
  }

  @Get('store/:storeId')
  async findByStore(@Param('storeId') storeId: string) {
    return this.invoiceService.findByStore(storeId);
  }

  @Get('customer/:customerId')
  async findByCustomer(@Param('customerId') customerId: string) {
    return this.invoiceService.findByCustomer(customerId);
  }

  @Get('status/:status')
  async findByStatus(@Param('status') status: string) {
    return this.invoiceService.findByStatus(status);
  }
} 
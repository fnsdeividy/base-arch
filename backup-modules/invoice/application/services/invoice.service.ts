import { Injectable, NotFoundException, ConflictException, Inject } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { Invoice } from '@modules/invoice/entities/invoice.entity';
import { CreateInvoiceDto } from '@modules/invoice/presentation/dto/createInvoice.dto';
import { UpdateInvoiceDto } from '@modules/invoice/presentation/dto/updateInvoice.dto';
import { IInvoiceService, IInvoiceRepository, INVOICE_REPOSITORY } from '@modules/invoice/presentation/interfaces/invoice.interface';

@Injectable()
export class InvoiceService implements IInvoiceService {
  constructor(
    @Inject(INVOICE_REPOSITORY)
    private readonly invoiceRepository: IInvoiceRepository
  ) { }

  async createInvoice(createInvoiceDto: CreateInvoiceDto): Promise<Invoice> {
    // Check if invoice with same number already exists
    const existingInvoice = await this.invoiceRepository.findByInvoiceNumber(createInvoiceDto.invoiceNumber);
    if (existingInvoice) {
      throw new ConflictException('Invoice with this number already exists');
    }

    // Calculate final amount if not provided
    const finalAmount = createInvoiceDto.finalAmount ||
      (createInvoiceDto.totalAmount + (createInvoiceDto.taxAmount || 0) - (createInvoiceDto.discountAmount || 0));

    const invoice = await this.invoiceRepository.create({
      id: randomUUID(),
      ...createInvoiceDto,
      finalAmount,
      isActive: createInvoiceDto.isActive ?? true
    });

    return invoice;
  }

  async updateInvoice(id: string, payload: UpdateInvoiceDto): Promise<Invoice | null> {
    const invoice = await this.invoiceRepository.findById(id);
    if (!invoice) {
      throw new NotFoundException('Invoice not found');
    }

    // Check if invoice number is being updated and if it already exists
    if (payload.invoiceNumber && payload.invoiceNumber !== invoice.invoiceNumber) {
      const existingInvoice = await this.invoiceRepository.findByInvoiceNumber(payload.invoiceNumber);
      if (existingInvoice) {
        throw new ConflictException('Invoice with this number already exists');
      }
    }

    // Recalculate final amount if amounts are being updated
    if (payload.totalAmount || payload.taxAmount || payload.discountAmount) {
      const totalAmount = payload.totalAmount ?? invoice.totalAmount;
      const taxAmount = payload.taxAmount ?? invoice.taxAmount;
      const discountAmount = payload.discountAmount ?? invoice.discountAmount;
      payload.finalAmount = totalAmount + taxAmount - discountAmount;
    }

    await this.invoiceRepository.update({ id }, payload);
    return this.invoiceRepository.findById(id);
  }

  async findById(id: string): Promise<Invoice | null> {
    return this.invoiceRepository.findById(id);
  }

  async deleteInvoice(id: string): Promise<void> {
    const invoice = await this.invoiceRepository.findById(id);
    if (!invoice) {
      throw new NotFoundException('Invoice not found');
    }

    await this.invoiceRepository.update({ id }, { isActive: false });
  }

  async findByStore(storeId: string): Promise<Invoice[]> {
    return this.invoiceRepository.findByStore(storeId);
  }

  async findByCustomer(customerId: string): Promise<Invoice[]> {
    return this.invoiceRepository.findByCustomer(customerId);
  }

  async findByStatus(status: string): Promise<Invoice[]> {
    return this.invoiceRepository.findByStatus(status);
  }
} 
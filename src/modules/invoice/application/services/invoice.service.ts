import { Injectable, NotFoundException, ConflictException, Inject } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { Invoice, InvoiceStatus } from '@modules/invoice/entities/invoice.entity';
import { CreateInvoiceDto } from '@modules/invoice/presentation/dto/createInvoice.dto';
import { UpdateInvoiceDto } from '@modules/invoice/presentation/dto/updateInvoice.dto';
import { IInvoiceService, IInvoiceRepository, INVOICE_REPOSITORY } from '@modules/invoice/presentation/interfaces/invoice.interface';

@Injectable()
export class InvoiceService implements IInvoiceService {
  constructor(
    @Inject(INVOICE_REPOSITORY)
    private readonly invoiceRepository: IInvoiceRepository
  ) { }

  async create(createInvoiceDto: CreateInvoiceDto): Promise<Invoice> {
    // Generate invoice number
    const invoiceNumber = this.generateInvoiceNumber();

    // Check if invoice number already exists
    const existingInvoice = await this.invoiceRepository.findByInvoiceNumber(invoiceNumber);
    if (existingInvoice) {
      throw new ConflictException('Invoice number already exists');
    }

    // Calculate total
    const total = this.calculateTotal(createInvoiceDto);

    const invoice = await this.invoiceRepository.create({
      id: randomUUID(),
      invoiceNumber,
      ...createInvoiceDto,
      total,
      dueDate: new Date(createInvoiceDto.dueDate),
      status: createInvoiceDto.status || InvoiceStatus.DRAFT
    });

    return invoice;
  }

  async findAll(filters?: {
    status?: InvoiceStatus;
    customerId?: string;
    overdue?: boolean
  }): Promise<Invoice[]> {
    return this.invoiceRepository.findAll(filters);
  }

  async findOne(id: string): Promise<Invoice> {
    const invoice = await this.invoiceRepository.findById(id);
    if (!invoice) {
      throw new NotFoundException('Invoice not found');
    }
    return invoice;
  }

  async update(id: string, updateInvoiceDto: UpdateInvoiceDto): Promise<Invoice> {
    const invoice = await this.invoiceRepository.findById(id);
    if (!invoice) {
      throw new NotFoundException('Invoice not found');
    }

    // Recalculate total if amounts changed
    let total = invoice.total;
    if (updateInvoiceDto.amount !== undefined ||
      updateInvoiceDto.tax !== undefined ||
      updateInvoiceDto.discount !== undefined) {
      total = this.calculateTotal({
        amount: updateInvoiceDto.amount ?? invoice.amount,
        tax: updateInvoiceDto.tax ?? invoice.tax,
        discount: updateInvoiceDto.discount ?? invoice.discount
      });
    }

    const updateData = {
      ...updateInvoiceDto,
      total,
      dueDate: updateInvoiceDto.dueDate ? new Date(updateInvoiceDto.dueDate) : invoice.dueDate
    };

    await this.invoiceRepository.update({ id }, updateData);
    return await this.invoiceRepository.findById(id) as Invoice;
  }

  async remove(id: string): Promise<void> {
    const invoice = await this.invoiceRepository.findById(id);
    if (!invoice) {
      throw new NotFoundException('Invoice not found');
    }

    await this.invoiceRepository.delete({ id });
  }

  async updateStatus(id: string, status: InvoiceStatus): Promise<Invoice> {
    const invoice = await this.invoiceRepository.findById(id);
    if (!invoice) {
      throw new NotFoundException('Invoice not found');
    }

    await this.invoiceRepository.update({ id }, { status });
    return await this.invoiceRepository.findById(id) as Invoice;
  }

  async markAsPaid(id: string): Promise<Invoice> {
    const invoice = await this.invoiceRepository.findById(id);
    if (!invoice) {
      throw new NotFoundException('Invoice not found');
    }

    await this.invoiceRepository.update({ id }, {
      status: InvoiceStatus.PAID,
      paidAt: new Date()
    });
    return await this.invoiceRepository.findById(id) as Invoice;
  }

  private generateInvoiceNumber(): string {
    const timestamp = Date.now().toString();
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `INV-${timestamp}-${random}`;
  }

  private calculateTotal(invoiceData: { amount: number; tax?: number; discount?: number }): number {
    const amount = invoiceData.amount || 0;
    const tax = invoiceData.tax || 0;
    const discount = invoiceData.discount || 0;

    return amount + tax - discount;
  }
}
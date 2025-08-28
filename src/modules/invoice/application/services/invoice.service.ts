import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { randomUUID } from 'crypto';
import { CreateInvoiceDto } from '@modules/invoice/presentation/dto/createInvoice.dto';
import { UpdateInvoiceDto } from '@modules/invoice/presentation/dto/updateInvoice.dto';
import { PrismaService } from '@modules/prisma/prisma.service';

@Injectable()
export class InvoiceService {
  constructor(
    private readonly prisma: PrismaService,
  ) { }

  async create(createInvoiceDto: CreateInvoiceDto) {
    // Generate invoice number
    const invoiceNumber = this.generateInvoiceNumber();

    // Check if invoice number already exists
    const existingInvoice = await this.prisma.invoice.findUnique({
      where: { invoiceNumber },
    });
    if (existingInvoice) {
      throw new ConflictException('Invoice number already exists');
    }

    // Calculate total
    const total = this.calculateTotal(createInvoiceDto);

    const invoice = await this.prisma.invoice.create({
      data: {
        id: randomUUID(),
        invoiceNumber,
        orderId: createInvoiceDto.orderId,
        customerId: createInvoiceDto.customerId,
        status: createInvoiceDto.status || 'draft',
        dueDate: new Date(createInvoiceDto.dueDate),
        totalAmount: total as any,
        taxAmount: (createInvoiceDto.tax || 0) as any,
        notes: createInvoiceDto.notes,
      },
    });

    return invoice;
  }

  async findAll(filters?: {
    status?: string;
    customerId?: string;
    overdue?: boolean;
  }) {
    return this.prisma.invoice.findMany({
      where: filters,
    });
  }

  async findOne(id: string) {
    const invoice = await this.prisma.invoice.findUnique({
      where: { id },
    });
    if (!invoice) {
      throw new NotFoundException('Invoice not found');
    }
    return invoice;
  }

  async update(
    id: string,
    updateInvoiceDto: UpdateInvoiceDto,
  ) {
    const invoice = await this.prisma.invoice.findUnique({
      where: { id },
    });
    if (!invoice) {
      throw new NotFoundException('Invoice not found');
    }

    // Recalculate total if amounts changed
    let total: any = invoice.totalAmount;
    if (
      updateInvoiceDto.amount !== undefined ||
      updateInvoiceDto.tax !== undefined ||
      updateInvoiceDto.discount !== undefined
    ) {
      total = this.calculateTotal({
        amount: updateInvoiceDto.amount ?? Number(invoice.totalAmount),
        tax: updateInvoiceDto.tax ?? Number(invoice.taxAmount || 0),
        discount: updateInvoiceDto.discount ?? 0,
      });
    }

    const updateData = {
      ...updateInvoiceDto,
      totalAmount: total as any,
      dueDate: updateInvoiceDto.dueDate
        ? new Date(updateInvoiceDto.dueDate)
        : invoice.dueDate,
      taxAmount: (updateInvoiceDto.tax || 0) as any,
    };

    const updatedInvoice = await this.prisma.invoice.update({
      where: { id },
      data: updateData,
    });
    return updatedInvoice;
  }

  async remove(id: string): Promise<void> {
    const invoice = await this.prisma.invoice.findUnique({
      where: { id },
    });
    if (!invoice) {
      throw new NotFoundException('Invoice not found');
    }

    await this.prisma.invoice.delete({
      where: { id },
    });
  }

  async updateStatus(id: string, status: string) {
    const invoice = await this.prisma.invoice.findUnique({
      where: { id },
    });
    if (!invoice) {
      throw new NotFoundException('Invoice not found');
    }

    const updatedInvoice = await this.prisma.invoice.update({
      where: { id },
      data: { status },
    });
    return updatedInvoice;
  }

  async markAsPaid(id: string) {
    const invoice = await this.prisma.invoice.findUnique({
      where: { id },
    });
    if (!invoice) {
      throw new NotFoundException('Invoice not found');
    }

    const updatedInvoice = await this.prisma.invoice.update({
      where: { id },
      data: {
        status: 'paid',
        // Note: Prisma schema doesn't have paidAt field, so we'll skip it
      },
    });
    return updatedInvoice;
  }

  private generateInvoiceNumber(): string {
    const timestamp = Date.now().toString();
    const random = Math.floor(Math.random() * 1000)
      .toString()
      .padStart(3, '0');
    return `INV-${timestamp}-${random}`;
  }

  private calculateTotal(invoiceData: {
    amount: number;
    tax?: number;
    discount?: number;
  }): number {
    const amount = invoiceData.amount || 0;
    const tax = invoiceData.tax || 0;
    const discount = invoiceData.discount || 0;

    return amount + tax - discount;
  }
}

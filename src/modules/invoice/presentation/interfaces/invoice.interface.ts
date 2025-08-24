import { Invoice, InvoiceStatus } from '@modules/invoice/entities/invoice.entity';
import { CreateInvoiceDto } from '@modules/invoice/presentation/dto/createInvoice.dto';
import { UpdateInvoiceDto } from '@modules/invoice/presentation/dto/updateInvoice.dto';

export { CreateInvoiceDto, UpdateInvoiceDto };

export const INVOICE_REPOSITORY = 'INVOICE_REPOSITORY';

export interface IInvoiceRepository {
  create(data: Partial<Invoice>): Promise<Invoice>;
  findById(id: string): Promise<Invoice | null>;
  findByInvoiceNumber(invoiceNumber: string): Promise<Invoice | null>;
  findAll(filters?: { status?: InvoiceStatus; customerId?: string; overdue?: boolean }): Promise<Invoice[]>;
  update(criteria: Partial<Invoice>, data: Partial<Invoice>): Promise<void>;
  delete(criteria: Partial<Invoice>): Promise<void>;
}

export interface IInvoiceService {
  create(createInvoiceDto: CreateInvoiceDto): Promise<Invoice>;
  findAll(filters?: { status?: InvoiceStatus; customerId?: string; overdue?: boolean }): Promise<Invoice[]>;
  findOne(id: string): Promise<Invoice>;
  update(id: string, updateInvoiceDto: UpdateInvoiceDto): Promise<Invoice>;
  remove(id: string): Promise<void>;
  updateStatus(id: string, status: InvoiceStatus): Promise<Invoice>;
  markAsPaid(id: string): Promise<Invoice>;
}

import { IsString, IsUUID, IsNumber, IsOptional, IsEnum, IsDateString } from 'class-validator';
import { InvoiceStatus } from '@modules/invoice/entities/invoice.entity';

export class UpdateInvoiceDto {
  @IsUUID()
  @IsOptional()
  customerId?: string;

  @IsUUID()
  @IsOptional()
  orderId?: string;

  @IsNumber()
  @IsOptional()
  amount?: number;

  @IsNumber()
  @IsOptional()
  tax?: number;

  @IsNumber()
  @IsOptional()
  discount?: number;

  @IsDateString()
  @IsOptional()
  dueDate?: string;

  @IsEnum(InvoiceStatus)
  @IsOptional()
  status?: InvoiceStatus;

  @IsString()
  @IsOptional()
  notes?: string;
}
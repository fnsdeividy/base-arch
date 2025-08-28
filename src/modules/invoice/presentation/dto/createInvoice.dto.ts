import {
  IsString,
  IsUUID,
  IsNumber,
  IsOptional,
  IsEnum,
  IsDateString,
} from 'class-validator';
import { InvoiceStatus } from '@modules/invoice/entities/invoice.entity';

export class CreateInvoiceDto {
  @IsUUID()
  customerId: string;

  @IsUUID()
  @IsOptional()
  orderId?: string;

  @IsNumber()
  amount: number;

  @IsNumber()
  @IsOptional()
  tax?: number;

  @IsNumber()
  @IsOptional()
  discount?: number;

  @IsDateString()
  dueDate: string;

  @IsEnum(InvoiceStatus)
  @IsOptional()
  status?: InvoiceStatus;

  @IsString()
  @IsOptional()
  notes?: string;
}

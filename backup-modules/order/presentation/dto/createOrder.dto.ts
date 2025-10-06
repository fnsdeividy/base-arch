import { IsString, IsNumber, IsOptional, IsUUID, IsBoolean, IsDateString } from 'class-validator';

export class CreateOrderDto {
  @IsString()
  orderNumber: string;

  @IsNumber()
  totalAmount: number;

  @IsNumber()
  @IsOptional()
  taxAmount?: number;

  @IsNumber()
  @IsOptional()
  discountAmount?: number;

  @IsNumber()
  finalAmount: number;

  @IsString()
  @IsOptional()
  status?: string;

  @IsString()
  @IsOptional()
  shippingMethod?: string;

  @IsNumber()
  @IsOptional()
  shippingCost?: number;

  @IsString()
  @IsOptional()
  shippingAddress?: string;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsDateString()
  @IsOptional()
  expectedDeliveryDate?: Date;

  @IsDateString()
  @IsOptional()
  deliveredDate?: Date;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsUUID()
  storeId: string;

  @IsUUID()
  @IsOptional()
  customerId?: string;
} 
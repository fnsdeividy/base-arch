import { IsString, IsNumber, IsOptional, IsUUID } from 'class-validator';

export class UpdateOrderDto {
  @IsString()
  @IsOptional()
  orderNumber?: string;

  @IsNumber()
  @IsOptional()
  totalAmount?: number;

  @IsNumber()
  @IsOptional()
  taxAmount?: number;

  @IsNumber()
  @IsOptional()
  discountAmount?: number;

  @IsNumber()
  @IsOptional()
  shippingCost?: number;

  @IsNumber()
  @IsOptional()
  finalAmount?: number;

  @IsString()
  @IsOptional()
  status?: string;

  @IsUUID()
  @IsOptional()
  customerId?: string;

  @IsUUID()
  @IsOptional()
  storeId?: string;
} 
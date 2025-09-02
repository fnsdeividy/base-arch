import { IsString, IsNumber, IsOptional, IsUUID, IsBoolean, IsDateString } from 'class-validator';

export class CreateStockDto {
  @IsNumber()
  quantity: number;

  @IsNumber()
  @IsOptional()
  minStockLevel?: number;

  @IsNumber()
  @IsOptional()
  maxStockLevel?: number;

  @IsString()
  @IsOptional()
  status?: string;

  @IsString()
  @IsOptional()
  location?: string;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsDateString()
  @IsOptional()
  lastRestockedDate?: Date;

  @IsString()
  @IsOptional()
  expiryDate?: string;

  @IsNumber()
  @IsOptional()
  unitCost?: number;

  @IsString()
  @IsOptional()
  supplier?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsUUID()
  storeId: string;

  @IsUUID()
  productId: string;
} 
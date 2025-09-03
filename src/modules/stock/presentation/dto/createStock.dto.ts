import { IsString, IsNumber, IsOptional, IsUUID, IsBoolean, IsDateString } from 'class-validator';

export class CreateStockDto {
  @IsNumber()
  quantity: number;

  @IsNumber()
  minStockLevel: number;

  @IsNumber()
  @IsOptional()
  maxStockLevel?: number;

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
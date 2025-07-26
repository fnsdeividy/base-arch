import { IsString, IsOptional, IsNumber, IsUrl, IsBoolean, Min, IsPositive } from 'class-validator';

export class UpdateProductDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @IsPositive()
  @IsOptional()
  price?: number;

  @IsNumber()
  @IsPositive()
  @IsOptional()
  costPrice?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  stockQuantity?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  minStockLevel?: number;

  @IsString()
  @IsOptional()
  sku?: string;

  @IsString()
  @IsOptional()
  barcode?: string;

  @IsString()
  @IsOptional()
  category?: string;

  @IsString()
  @IsOptional()
  brand?: string;

  @IsString()
  @IsOptional()
  unit?: string;

  @IsNumber()
  @IsPositive()
  @IsOptional()
  weight?: number;

  @IsString()
  @IsOptional()
  weightUnit?: string;

  @IsUrl()
  @IsOptional()
  imageUrl?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
} 
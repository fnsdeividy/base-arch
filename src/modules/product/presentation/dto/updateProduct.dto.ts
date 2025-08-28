import {
  IsString,
  IsNumber,
  IsOptional,
  IsUUID,
  IsBoolean,
} from 'class-validator';

export class UpdateProductDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @IsOptional()
  price?: number;

  @IsString()
  @IsOptional()
  sku?: string;

  @IsString()
  @IsOptional()
  category?: string;

  @IsString()
  @IsOptional()
  imageUrl?: string;

  @IsUUID()
  @IsOptional()
  storeId?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

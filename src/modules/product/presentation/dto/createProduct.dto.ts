import {
  IsString,
  IsNumber,
  IsOptional,
  IsUUID,
  IsBoolean,
} from 'class-validator';

export class CreateProductDto {
  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  price: number;

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
  storeId: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

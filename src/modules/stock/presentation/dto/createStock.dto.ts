import { IsString, IsNumber, IsOptional, IsUUID } from 'class-validator';

export class CreateStockDto {
  @IsUUID()
  productId: string;

  @IsUUID()
  storeId: string;

  @IsNumber()
  quantity: number;

  @IsOptional()
  @IsNumber()
  minQuantity?: number;

  @IsOptional()
  @IsNumber()
  maxQuantity?: number;
}



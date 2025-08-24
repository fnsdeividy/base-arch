import { IsOptional, IsNumber } from 'class-validator';

export class UpdateStockDto {
  @IsOptional()
  @IsNumber()
  quantity?: number;

  @IsOptional()
  @IsNumber()
  minQuantity?: number;

  @IsOptional()
  @IsNumber()
  maxQuantity?: number;
} 
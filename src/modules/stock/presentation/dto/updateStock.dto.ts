import { IsOptional, IsNumber, IsString, IsEnum, Min } from 'class-validator';
import { StockStatus } from './createStock.dto';

export class UpdateStockDto {
  @IsOptional()
  @IsNumber()
  @Min(0)
  quantity?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  minQuantity?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  maxQuantity?: number;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsEnum(StockStatus)
  status?: StockStatus;
}

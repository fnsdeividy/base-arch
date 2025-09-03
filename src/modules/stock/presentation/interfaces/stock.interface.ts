import { Stock } from '../../entities/stock.entity';

export interface IStockService {
  findAll(): Promise<Stock[]>;
  findOne(id: string): Promise<Stock>;
  create(data: CreateStockDto): Promise<Stock>;
  update(id: string, data: UpdateStockDto): Promise<Stock>;
  remove(id: string): Promise<void>;
  getLowStock(): Promise<Stock[]>;
  getTransactions(): Promise<any[]>;
  getStatistics(): Promise<any>;
}

export interface CreateStockDto {
  productId: string;
  storeId: string;
  quantity: number;
  minStockLevel: number;
  maxStockLevel?: number;
  location?: string;
}

export interface UpdateStockDto {
  quantity?: number;
  minStockLevel?: number;
  maxStockLevel?: number;
  location?: string;
}
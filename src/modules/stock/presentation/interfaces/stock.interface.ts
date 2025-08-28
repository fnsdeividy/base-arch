import { IBaseRepository } from '@shared/presentation/interfaces/baseRepository';
import { Stock } from '@modules/stock/entities/stock.entity';
import { CreateStockDto } from '@modules/stock/presentation/dto/createStock.dto';
import { UpdateStockDto } from '@modules/stock/presentation/dto/updateStock.dto';

export interface IStock {
  id: string;
  quantity: number;
  minStockLevel: number;
  maxStockLevel: number;
  status: string;
  location?: string;
  notes?: string;
  lastRestockedDate?: Date;
  expiryDate?: string;
  unitCost?: number;
  supplier?: string;
  isActive: boolean;
  storeId: string;
  productId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IStockService {
  createStock(createStockDto: CreateStockDto): Promise<Stock>;
  updateStock(id: string, payload: UpdateStockDto): Promise<Stock | null>;
  findById(id: string): Promise<Stock | null>;
  deleteStock(id: string): Promise<void>;
  findByStore(storeId: string): Promise<Stock[]>;
  findByProduct(productId: string): Promise<Stock[]>;
  findByStatus(status: string): Promise<Stock[]>;
  updateQuantity(id: string, quantity: number): Promise<Stock>;
}

export interface IStockRepository extends IBaseRepository<Stock> {
  findById(id: string): Promise<Stock | null>;
  findByStore(storeId: string): Promise<Stock[]>;
  findByProduct(productId: string): Promise<Stock[]>;
  findByStatus(status: string): Promise<Stock[]>;
  findByStoreAndProduct(
    storeId: string,
    productId: string,
  ): Promise<Stock | null>;
  findLowStock(): Promise<Stock[]>;
  update(id: string, data: Partial<Stock>): Promise<Stock | null>;
  delete(id: string): Promise<void>;
}

export const STOCK_REPOSITORY = 'STOCK_REPOSITORY';

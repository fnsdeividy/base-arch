import { Sale, SaleItem } from '@modules/sales/entities/sale.entity';

export const SALES_REPOSITORY = 'SALES_REPOSITORY';

export interface ISalesRepository {
  findAll(page: number, limit: number): Promise<{ sales: Sale[]; total: number; totalPages: number }>;
  findById(id: string): Promise<Sale | null>;
  findByOrderNumber(orderNumber: string): Promise<Sale | null>;
  findByCustomerId(customerId: string, page: number, limit: number): Promise<{ sales: Sale[]; total: number; totalPages: number }>;
  findByStoreId(storeId: string, page: number, limit: number): Promise<{ sales: Sale[]; total: number; totalPages: number }>;
  create(data: Partial<Sale>): Promise<Sale>;
  update(id: string, data: Partial<Sale>): Promise<void>;
  delete(id: string): Promise<void>;
}

export interface ISalesService {
  findAll(page: number, limit: number): Promise<{ sales: Sale[]; total: number; totalPages: number }>;
  findById(id: string): Promise<Sale | null>;
  findByOrderNumber(orderNumber: string): Promise<Sale | null>;
  findByCustomerId(customerId: string, page: number, limit: number): Promise<{ sales: Sale[]; total: number; totalPages: number }>;
  findByStoreId(storeId: string, page: number, limit: number): Promise<{ sales: Sale[]; total: number; totalPages: number }>;
  create(data: Partial<Sale>): Promise<Sale>;
  update(id: string, data: Partial<Sale>): Promise<void>;
  delete(id: string): Promise<void>;
}

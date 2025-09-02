import { Decimal } from '@prisma/client/runtime/library';

export class Product {
  id: string;
  name: string;
  description?: string;
  sku?: string;
  barcode?: string;
  price: Decimal;
  costPrice?: Decimal;
  category?: string;
  brand?: string;
  weight?: Decimal;
  dimensions?: string;
  isActive: boolean;
  storeId: string;
  createdAt: Date;
  updatedAt: Date;
}
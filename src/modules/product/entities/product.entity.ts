export class Product {
  id: string;
  name: string;
  description?: string;
  sku?: string;
  barcode?: string;
  price: number;
  costPrice?: number;
  category?: string;
  brand?: string;
  weight?: number;
  dimensions?: string;
  isActive: boolean;
  storeId: string;
  baseUnit?: string;
  outputUnit?: string;
  outputUnitSize?: number;
  createdAt: Date;
  updatedAt: Date;
}

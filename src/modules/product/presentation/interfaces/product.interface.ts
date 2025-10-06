export interface CreateProductDto {
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
  storeId: string;
  baseUnit?: string;
  outputUnit?: string;
  outputUnitSize?: number;
}

export interface UpdateProductDto {
  name?: string;
  description?: string;
  sku?: string;
  barcode?: string;
  price?: number;
  costPrice?: number;
  category?: string;
  brand?: string;
  weight?: number;
  dimensions?: string;
  isActive?: boolean;
  baseUnit?: string;
  outputUnit?: string;
  outputUnitSize?: number;
}

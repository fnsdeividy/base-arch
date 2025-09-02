export class Stock {
  id: string;
  productId: string;
  storeId: string;
  quantity: number;
  minQuantity: number;
  maxQuantity?: number;
  location?: string;
  createdAt: Date;
  updatedAt: Date;
}
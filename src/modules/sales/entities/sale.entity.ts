export class SaleItem {
  id: string;
  orderId: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  discount: number | null;
  total: number;
  createdAt: Date;
}

export class Sale {
  id: string;
  orderNumber: string;
  customerId: string;
  customerName: string;
  storeId: string;
  status: string;
  totalAmount: number;
  discount: number | null;
  taxAmount: number | null;
  paymentMethod: string;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
  items: SaleItem[];
}

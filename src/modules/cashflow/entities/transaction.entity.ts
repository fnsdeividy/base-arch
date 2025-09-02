export enum TransactionType {
  INCOME = 'income',
  EXPENSE = 'expense',
  TRANSFER = 'transfer',
}

export class Transaction {
  id: string;
  type: TransactionType;
  category: string;
  description: string;
  amount: number;
  date: Date;
  reference?: string;
  storeId?: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
  attachments?: string[];
  notes?: string;

  constructor(partial: Partial<Transaction>) {
    Object.assign(this, partial);
  }
}

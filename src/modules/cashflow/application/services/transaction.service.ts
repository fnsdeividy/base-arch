import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@modules/prisma';
import { CreateTransactionDto } from '@modules/cashflow/presentation/dto/createTransaction.dto';
import { UpdateTransactionDto } from '@modules/cashflow/presentation/dto/updateTransaction.dto';
import { TransactionType } from '@modules/cashflow/entities/transaction.entity';

interface TransactionFilters {
  type?: string | TransactionType;
  category?: string;
  startDate?: string;
  endDate?: string;
  storeId?: string;
  userId?: string;
  minAmount?: number;
  maxAmount?: number;
  page?: number;
  limit?: number;
}

@Injectable()
export class TransactionService {
  constructor(private readonly prisma: PrismaService) { }

  async create(createTransactionDto: CreateTransactionDto, userId: string) {
    const transaction = await this.prisma.transaction.create({
      data: {
        ...createTransactionDto,
        userId,
        date: new Date(createTransactionDto.date),
      },
    });

    return transaction;
  }

  async findAll(filters: TransactionFilters = {}) {
    const {
      type,
      category,
      startDate,
      endDate,
      storeId,
      userId,
      minAmount,
      maxAmount,
      page = 1,
      limit = 20
    } = filters;

    const skip = (page - 1) * limit;

    const where: any = {};

    if (type) where.type = type;
    if (category) where.category = category;
    if (storeId) where.storeId = storeId;
    if (userId) where.userId = userId;
    if (minAmount || maxAmount) {
      where.amount = {};
      if (minAmount) where.amount.gte = minAmount;
      if (maxAmount) where.amount.lte = maxAmount;
    }
    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = new Date(startDate);
      if (endDate) where.date.lte = new Date(endDate);
    }

    const [transactions, total] = await Promise.all([
      this.prisma.transaction.findMany({
        where,
        skip,
        take: limit,
        orderBy: { date: 'desc' },
      }),
      this.prisma.transaction.count({ where }),
    ]);

    return {
      transactions,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findById(id: string) {
    const transaction = await this.prisma.transaction.findUnique({
      where: { id },
    });

    if (!transaction) {
      throw new NotFoundException('Transaction not found');
    }

    return transaction;
  }

  async update(id: string, updateTransactionDto: UpdateTransactionDto) {
    const existingTransaction = await this.prisma.transaction.findUnique({
      where: { id },
    });

    if (!existingTransaction) {
      throw new NotFoundException('Transaction not found');
    }

    const updateData: any = { ...updateTransactionDto };
    if (updateTransactionDto.date) {
      updateData.date = new Date(updateTransactionDto.date);
    }

    const transaction = await this.prisma.transaction.update({
      where: { id },
      data: updateData,
    });

    return transaction;
  }

  async delete(id: string): Promise<void> {
    const existingTransaction = await this.prisma.transaction.findUnique({
      where: { id },
    });

    if (!existingTransaction) {
      throw new NotFoundException('Transaction not found');
    }

    await this.prisma.transaction.delete({
      where: { id },
    });
  }

  async findByDateRange(startDate: string, endDate: string) {
    const transactions = await this.prisma.transaction.findMany({
      where: {
        date: {
          gte: new Date(startDate),
          lte: new Date(endDate),
        },
      },
      orderBy: { date: 'desc' },
    });

    return transactions;
  }

  async findByCategory(category: string) {
    const transactions = await this.prisma.transaction.findMany({
      where: { category },
      orderBy: { date: 'desc' },
    });

    return transactions;
  }

  async findByStore(storeId: string) {
    const transactions = await this.prisma.transaction.findMany({
      where: { storeId },
      orderBy: { date: 'desc' },
    });

    return transactions;
  }

  async findByUser(userId: string) {
    const transactions = await this.prisma.transaction.findMany({
      where: { userId },
      orderBy: { date: 'desc' },
    });

    return transactions;
  }

  async getCashFlowSummary(filters: TransactionFilters = {}) {
    const { startDate, endDate, storeId, userId } = filters;

    const where: any = {};
    if (storeId) where.storeId = storeId;
    if (userId) where.userId = userId;
    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = new Date(startDate);
      if (endDate) where.date.lte = new Date(endDate);
    }

    const transactions = await this.prisma.transaction.findMany({ where });

    const totalIncome = transactions
      .filter(t => t.type === TransactionType.INCOME)
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const totalExpenses = transactions
      .filter(t => t.type === TransactionType.EXPENSE)
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const netFlow = totalIncome - totalExpenses;
    const balance = totalIncome - totalExpenses;

    const incomeByCategory = transactions
      .filter(t => t.type === TransactionType.INCOME)
      .reduce((acc, t) => {
        acc[t.category] = (acc[t.category] || 0) + Number(t.amount);
        return acc;
      }, {} as Record<string, number>);

    const expensesByCategory = transactions
      .filter(t => t.type === TransactionType.EXPENSE)
      .reduce((acc, t) => {
        acc[t.category] = (acc[t.category] || 0) + Number(t.amount);
        return acc;
      }, {} as Record<string, number>);

    // Agrupar por dia para o fluxo diário
    const dailyFlow = transactions.reduce((acc, t) => {
      const date = t.date.toISOString().split('T')[0];
      if (!acc[date]) {
        acc[date] = { date, income: 0, expenses: 0, net: 0 };
      }

      if (t.type === TransactionType.INCOME) {
        acc[date].income += Number(t.amount);
      } else if (t.type === TransactionType.EXPENSE) {
        acc[date].expenses += Number(t.amount);
      }

      acc[date].net = acc[date].income - acc[date].expenses;
      return acc;
    }, {} as Record<string, { date: string; income: number; expenses: number; net: number }>);

    return {
      totalIncome,
      totalExpenses,
      netFlow,
      balance,
      transactionsCount: transactions.length,
      incomeByCategory,
      expensesByCategory,
      dailyFlow: Object.values(dailyFlow),
    };
  }

  async getCategories() {
    const categories = await this.prisma.transaction.groupBy({
      by: ['category'],
      _count: { category: true },
    });

    return categories.map(c => c.category);
  }

  async getStatistics(filters: TransactionFilters = {}) {
    const { startDate, endDate, storeId, userId } = filters;

    const where: any = {};
    if (storeId) where.storeId = storeId;
    if (userId) where.userId = userId;
    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = new Date(startDate);
      if (endDate) where.date.lte = new Date(endDate);
    }

    const transactions = await this.prisma.transaction.findMany({ where });

    const totalTransactions = transactions.length;
    const totalIncome = transactions
      .filter(t => t.type === TransactionType.INCOME)
      .reduce((sum, t) => sum + Number(t.amount), 0);
    const totalExpenses = transactions
      .filter(t => t.type === TransactionType.EXPENSE)
      .reduce((sum, t) => sum + Number(t.amount), 0);
    const averageTransactionValue = totalTransactions > 0
      ? (totalIncome + totalExpenses) / totalTransactions
      : 0;

    const transactionsByType = transactions.reduce((acc, t) => {
      acc[t.type] = (acc[t.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const transactionsByCategory = transactions.reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const transactionsByMonth = transactions.reduce((acc, t) => {
      const month = t.date.toISOString().slice(0, 7); // YYYY-MM
      acc[month] = (acc[month] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const topIncomeCategories = Object.entries(
      transactions
        .filter(t => t.type === TransactionType.INCOME)
        .reduce((acc, t) => {
          acc[t.category] = (acc[t.category] || 0) + Number(t.amount);
          return acc;
        }, {} as Record<string, number>)
    )
      .sort(([, a], [, b]) => (b as number) - (a as number))
      .slice(0, 5)
      .map(([category, amount]) => ({ category, amount }));

    const topExpenseCategories = Object.entries(
      transactions
        .filter(t => t.type === TransactionType.EXPENSE)
        .reduce((acc, t) => {
          acc[t.category] = (acc[t.category] || 0) + Number(t.amount);
          return acc;
        }, {} as Record<string, number>)
    )
      .sort(([, a], [, b]) => (b as number) - (a as number))
      .slice(0, 5)
      .map(([category, amount]) => ({ category, amount }));

    return {
      totalTransactions,
      totalIncome,
      totalExpenses,
      averageTransactionValue,
      transactionsByType,
      transactionsByCategory,
      transactionsByMonth,
      topIncomeCategories,
      topExpenseCategories,
    };
  }

  async exportTransactions(filters: TransactionFilters = {}, format: 'csv' | 'xlsx' = 'csv') {
    const transactions = await this.findAll({ ...filters, limit: 10000 });

    // Aqui você implementaria a lógica de exportação
    // Por enquanto, retornando um URL fictício
    return {
      downloadUrl: `/api/v1/cashflow/export?format=${format}&timestamp=${Date.now()}`,
    };
  }
}

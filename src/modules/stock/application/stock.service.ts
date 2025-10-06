import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Stock } from '../entities/stock.entity';
import { CreateStockDto } from '../presentation/dto/createStock.dto';
import { UpdateStockDto } from '../presentation/interfaces/stock.interface';

@Injectable()
export class StockService {
  constructor(private prisma: PrismaService) { }

  async findAll(): Promise<Stock[]> {
    const stocks = await this.prisma.stock.findMany({
      include: {
        product: true
      }
    });

    return stocks.map(stock => ({
      ...stock,
      maxQuantity: stock.maxQuantity || undefined,
      location: stock.location || undefined,
    })) as Stock[];
  }

  async getLowStock(): Promise<Stock[]> {
    const stocks = await this.prisma.stock.findMany({
      where: {
        quantity: {
          lte: 10
        }
      },
      include: {
        product: true
      }
    });

    return stocks.map(stock => ({
      ...stock,
      maxQuantity: stock.maxQuantity || undefined,
      location: stock.location || undefined,
    })) as Stock[];
  }

  async getStockAlerts() {
    const lowStockItems = await this.prisma.stock.findMany({
      where: {
        quantity: {
          lte: 10
        }
      },
      include: {
        product: true
      }
    });

    const outOfStockItems = await this.prisma.stock.findMany({
      where: {
        quantity: 0
      },
      include: {
        product: true
      }
    });

    return {
      lowStock: lowStockItems.map(stock => ({
        ...stock,
        maxQuantity: stock.maxQuantity || undefined,
        location: stock.location || undefined,
      })),
      outOfStock: outOfStockItems.map(stock => ({
        ...stock,
        maxQuantity: stock.maxQuantity || undefined,
        location: stock.location || undefined,
      })),
      totalAlerts: lowStockItems.length + outOfStockItems.length
    };
  }

  async getTransactions() {
    return this.prisma.stockTransaction.findMany({
      include: {
        stock: {
          include: {
            product: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
  }

  async getStatistics() {
    const totalStock = await this.prisma.stock.aggregate({
      _sum: {
        quantity: true
      }
    });

    const lowStockCount = await this.prisma.stock.count({
      where: {
        quantity: {
          lte: 10
        }
      }
    });

    const totalProducts = await this.prisma.product.count();

    return {
      totalStock: totalStock._sum.quantity || 0,
      lowStockCount,
      totalProducts
    };
  }

  async findOne(id: string): Promise<Stock> {
    const stock = await this.prisma.stock.findUnique({
      where: { id },
      include: {
        product: true
      }
    });

    if (!stock) {
      throw new NotFoundException(`Stock with ID ${id} not found`);
    }

    return {
      ...stock,
      maxQuantity: stock.maxQuantity || undefined,
      location: stock.location || undefined,
    } as Stock;
  }

  async create(data: CreateStockDto): Promise<Stock> {
    // Mapear os campos do DTO para o schema do Prisma
    const stockData: any = {
      productId: data.productId,
      storeId: data.storeId,
      quantity: data.quantity,
    };

    if (data.minStockLevel !== undefined) {
      stockData.minQuantity = data.minStockLevel;
    }

    if (data.maxStockLevel !== undefined) {
      stockData.maxQuantity = data.maxStockLevel;
    }

    if (data.location !== undefined) {
      stockData.location = data.location;
    }

    const stock = await this.prisma.stock.create({
      data: stockData,
      include: {
        product: true
      }
    });

    return {
      ...stock,
      maxQuantity: stock.maxQuantity || undefined,
      location: stock.location || undefined,
    } as Stock;
  }

  async update(id: string, data: UpdateStockDto): Promise<Stock> {
    const stock = await this.findOne(id);

    // Mapear os campos do DTO para o schema do Prisma
    const updateData: any = {};
    if (data.quantity !== undefined) updateData.quantity = data.quantity;
    if (data.minStockLevel !== undefined) updateData.minQuantity = data.minStockLevel;
    if (data.maxStockLevel !== undefined) updateData.maxQuantity = data.maxStockLevel;
    if (data.location !== undefined) updateData.location = data.location;

    const updatedStock = await this.prisma.stock.update({
      where: { id },
      data: updateData,
      include: {
        product: true
      }
    });

    return {
      ...updatedStock,
      maxQuantity: updatedStock.maxQuantity || undefined,
      location: updatedStock.location || undefined,
    } as Stock;
  }

  async remove(id: string): Promise<void> {
    await this.findOne(id);
    await this.prisma.stock.delete({
      where: { id }
    });
  }
}
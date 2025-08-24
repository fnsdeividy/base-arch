import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { Stock } from '@modules/stock/entities/stock.entity';
import { CreateStockDto } from '@modules/stock/presentation/dto/createStock.dto';
import { UpdateStockDto } from '@modules/stock/presentation/dto/updateStock.dto';
import { IStockService, IStockRepository, STOCK_REPOSITORY } from '@modules/stock/presentation/interfaces/stock.interface';

@Injectable()
export class StockService implements IStockService {
  constructor(
    @Inject(STOCK_REPOSITORY)
    private readonly stockRepository: IStockRepository,
  ) { }

  async createStock(createStockDto: CreateStockDto): Promise<Stock> {
    const stock = await this.stockRepository.create(createStockDto);
    return stock;
  }

  async findAll(): Promise<Stock[]> {
    return await this.stockRepository.findAll();
  }

  async findById(id: string): Promise<Stock | null> {
    return await this.stockRepository.findById(id);
  }

  async findByProduct(productId: string): Promise<Stock[]> {
    return await this.stockRepository.findByProduct(productId);
  }

  async findByStore(storeId: string): Promise<Stock[]> {
    return await this.stockRepository.findByStore(storeId);
  }

  async findByStatus(status: string): Promise<Stock[]> {
    return await this.stockRepository.findByStatus(status);
  }

  async findLowStock(): Promise<Stock[]> {
    return await this.stockRepository.findLowStock();
  }

  async updateStock(id: string, updateStockDto: UpdateStockDto): Promise<Stock | null> {
    const stock = await this.findById(id);
    if (!stock) {
      throw new NotFoundException('Stock not found');
    }

    const updatedStock = await this.stockRepository.update(id, updateStockDto);
    return updatedStock;
  }

  async deleteStock(id: string): Promise<void> {
    const stock = await this.findById(id);
    if (!stock) {
      throw new NotFoundException('Stock not found');
    }

    await this.stockRepository.delete(id);
  }

  async updateQuantity(id: string, quantity: number): Promise<Stock> {
    const stock = await this.findById(id);
    if (!stock) {
      throw new NotFoundException('Stock not found');
    }

    const updatedStock = await this.stockRepository.update(id, { quantity });
    if (!updatedStock) {
      throw new NotFoundException('Stock not found after update');
    }

    return updatedStock;
  }

  // Métodos de compatibilidade com o controller existente
  async create(createStockDto: CreateStockDto): Promise<Stock> {
    return this.createStock(createStockDto);
  }

  async findOne(id: string): Promise<Stock> {
    const stock = await this.findById(id);
    if (!stock) {
      throw new NotFoundException('Stock not found');
    }
    return stock;
  }

  async update(id: string, updateStockDto: UpdateStockDto): Promise<Stock> {
    const stock = await this.updateStock(id, updateStockDto);
    if (!stock) {
      throw new NotFoundException('Stock not found after update');
    }
    return stock;
  }

  async remove(id: string): Promise<void> {
    await this.deleteStock(id);
  }

  async updateQuantityByProductAndStore(productId: string, storeId: string, quantity: number): Promise<Stock> {
    const stock = await this.stockRepository.findByStoreAndProduct(storeId, productId);

    if (!stock) {
      throw new NotFoundException('Stock entry not found');
    }

    const updatedStock = await this.stockRepository.update(stock.id, { quantity });
    if (!updatedStock) {
      throw new NotFoundException('Stock not found after update');
    }

    return updatedStock;
  }
}
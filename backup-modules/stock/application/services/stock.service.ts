import { Injectable, NotFoundException, ConflictException, Inject } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { Stock } from '@modules/stock/entities/stock.entity';
import { CreateStockDto } from '@modules/stock/presentation/dto/createStock.dto';
import { UpdateStockDto } from '@modules/stock/presentation/dto/updateStock.dto';
import { IStockService, IStockRepository, STOCK_REPOSITORY } from '@modules/stock/presentation/interfaces/stock.interface';

@Injectable()
export class StockService implements IStockService {
  constructor(
    @Inject(STOCK_REPOSITORY)
    private readonly stockRepository: IStockRepository
  ) { }

  async createStock(createStockDto: CreateStockDto): Promise<Stock> {
    // Check if stock for this product and store already exists
    const existingStock = await this.stockRepository.findByStoreAndProduct(
      createStockDto.storeId,
      createStockDto.productId
    );
    if (existingStock) {
      throw new ConflictException('Stock for this product and store already exists');
    }

    // Determine status based on quantity and min/max levels
    let status = 'IN_STOCK';
    if (createStockDto.quantity <= 0) {
      status = 'OUT_OF_STOCK';
    } else if (createStockDto.minStockLevel && createStockDto.quantity <= createStockDto.minStockLevel) {
      status = 'LOW_STOCK';
    } else if (createStockDto.maxStockLevel && createStockDto.quantity > createStockDto.maxStockLevel) {
      status = 'OVERSTOCK';
    }

    const stock = await this.stockRepository.create({
      id: randomUUID(),
      ...createStockDto,
      status,
      isActive: createStockDto.isActive ?? true
    });

    return stock;
  }

  async updateStock(id: string, payload: UpdateStockDto): Promise<Stock | null> {
    const stock = await this.stockRepository.findById(id);
    if (!stock) {
      throw new NotFoundException('Stock not found');
    }

    // Check if trying to change store or product
    if (payload.storeId && payload.storeId !== stock.storeId) {
      throw new ConflictException('Cannot change store for existing stock');
    }
    if (payload.productId && payload.productId !== stock.productId) {
      throw new ConflictException('Cannot change product for existing stock');
    }

    // Update status based on new quantity and min/max levels
    if (payload.quantity !== undefined || payload.minStockLevel !== undefined || payload.maxStockLevel !== undefined) {
      const quantity = payload.quantity ?? stock.quantity;
      const minStockLevel = payload.minStockLevel ?? stock.minStockLevel;
      const maxStockLevel = payload.maxStockLevel ?? stock.maxStockLevel;

      if (quantity <= 0) {
        payload.status = 'OUT_OF_STOCK';
      } else if (minStockLevel && quantity <= minStockLevel) {
        payload.status = 'LOW_STOCK';
      } else if (maxStockLevel && quantity > maxStockLevel) {
        payload.status = 'OVERSTOCK';
      } else {
        payload.status = 'IN_STOCK';
      }
    }

    await this.stockRepository.update({ id }, payload);
    return this.stockRepository.findById(id);
  }

  async findById(id: string): Promise<Stock | null> {
    return this.stockRepository.findById(id);
  }

  async deleteStock(id: string): Promise<void> {
    const stock = await this.stockRepository.findById(id);
    if (!stock) {
      throw new NotFoundException('Stock not found');
    }

    await this.stockRepository.update({ id }, { isActive: false });
  }

  async findByStore(storeId: string): Promise<Stock[]> {
    return this.stockRepository.findByStore(storeId);
  }

  async findByProduct(productId: string): Promise<Stock[]> {
    return this.stockRepository.findByProduct(productId);
  }

  async findByStatus(status: string): Promise<Stock[]> {
    return this.stockRepository.findByStatus(status);
  }

  async updateQuantity(id: string, quantity: number): Promise<Stock | null> {
    const stock = await this.stockRepository.findById(id);
    if (!stock) {
      throw new NotFoundException('Stock not found');
    }

    // Determine new status based on quantity and min/max levels
    let status = 'IN_STOCK';
    if (quantity <= 0) {
      status = 'OUT_OF_STOCK';
    } else if (stock.minStockLevel && quantity <= stock.minStockLevel) {
      status = 'LOW_STOCK';
    } else if (stock.maxStockLevel && quantity > stock.maxStockLevel) {
      status = 'OVERSTOCK';
    }

    await this.stockRepository.update({ id }, { quantity, status });
    return this.stockRepository.findById(id);
  }
} 
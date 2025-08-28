import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import {
  CreateStockDto,
  StockStatus,
} from '@modules/stock/presentation/dto/createStock.dto';
import { UpdateStockDto } from '@modules/stock/presentation/dto/updateStock.dto';
import { PrismaService } from '@modules/prisma';

@Injectable()
export class StockService {
  constructor(private readonly prisma: PrismaService) {}

  async createStock(createStockDto: CreateStockDto) {
    // Validações adicionais
    if (
      createStockDto.maxQuantity &&
      createStockDto.quantity > createStockDto.maxQuantity
    ) {
      throw new BadRequestException(
        'Quantity cannot be greater than maxQuantity',
      );
    }

    if (
      createStockDto.minQuantity &&
      createStockDto.quantity < createStockDto.minQuantity
    ) {
      throw new BadRequestException('Quantity cannot be less than minQuantity');
    }

    return this.prisma.stock.create({
      data: {
        ...createStockDto,
        minQuantity: createStockDto.minQuantity || 0,
        status: createStockDto.status || StockStatus.ACTIVE,
      },
      include: {
        product: true,
        store: true,
      },
    });
  }

  async findAll() {
    return this.prisma.stock.findMany({
      include: {
        product: true,
        store: true,
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });
  }

  async findById(id: string) {
    const stock = await this.prisma.stock.findUnique({
      where: { id },
      include: {
        product: true,
        store: true,
      },
    });

    if (!stock) {
      throw new NotFoundException('Stock not found');
    }

    return stock;
  }

  async findByProduct(productId: string) {
    return this.prisma.stock.findMany({
      where: { productId },
      include: {
        product: true,
        store: true,
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });
  }

  async findByStore(storeId: string) {
    return this.prisma.stock.findMany({
      where: { storeId },
      include: {
        product: true,
        store: true,
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });
  }

  async findByStatus(status: string) {
    return this.prisma.stock.findMany({
      where: { status },
      include: {
        product: true,
        store: true,
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });
  }

  async findLowStock(threshold: number = 10) {
    return this.prisma.stock.findMany({
      where: {
        quantity: {
          lte: threshold,
        },
        status: StockStatus.ACTIVE,
      },
      include: {
        product: true,
        store: true,
      },
      orderBy: {
        quantity: 'asc',
      },
    });
  }

  async updateStock(id: string, updateStockDto: UpdateStockDto) {
    const stock = await this.findById(id);

    // Validações adicionais
    if (
      updateStockDto.maxQuantity &&
      updateStockDto.quantity &&
      updateStockDto.quantity > updateStockDto.maxQuantity
    ) {
      throw new BadRequestException(
        'Quantity cannot be greater than maxQuantity',
      );
    }

    if (
      updateStockDto.minQuantity &&
      updateStockDto.quantity &&
      updateStockDto.quantity < updateStockDto.minQuantity
    ) {
      throw new BadRequestException('Quantity cannot be less than minQuantity');
    }

    return this.prisma.stock.update({
      where: { id },
      data: updateStockDto,
      include: {
        product: true,
        store: true,
      },
    });
  }

  async deleteStock(id: string): Promise<void> {
    const stock = await this.findById(id);
    await this.prisma.stock.delete({
      where: { id },
    });
  }

  async updateQuantity(id: string, quantity: number) {
    if (quantity < 0) {
      throw new BadRequestException('Quantity cannot be negative');
    }

    const stock = await this.findById(id);
    return this.prisma.stock.update({
      where: { id },
      data: { quantity },
      include: {
        product: true,
        store: true,
      },
    });
  }

  // Métodos de compatibilidade com o controller existente
  async create(createStockDto: CreateStockDto) {
    return this.createStock(createStockDto);
  }

  async findOne(id: string) {
    return this.findById(id);
  }

  async update(id: string, updateStockDto: UpdateStockDto) {
    return this.updateStock(id, updateStockDto);
  }

  async remove(id: string): Promise<void> {
    await this.deleteStock(id);
  }

  async updateQuantityByProductAndStore(
    productId: string,
    storeId: string,
    quantity: number,
  ) {
    if (quantity < 0) {
      throw new BadRequestException('Quantity cannot be negative');
    }

    const stock = await this.prisma.stock.findFirst({
      where: {
        productId,
        storeId,
      },
      include: {
        product: true,
        store: true,
      },
    });

    if (!stock) {
      throw new NotFoundException('Stock entry not found');
    }

    return this.prisma.stock.update({
      where: { id: stock.id },
      data: { quantity },
      include: {
        product: true,
        store: true,
      },
    });
  }

  // Método para buscar estoque com alertas
  async getStockAlerts() {
    const lowStock = await this.findLowStock();
    const outOfStock = await this.prisma.stock.findMany({
      where: {
        quantity: 0,
        status: StockStatus.ACTIVE,
      },
      include: {
        product: true,
        store: true,
      },
    });

    return {
      lowStock,
      outOfStock,
      totalAlerts: lowStock.length + outOfStock.length,
    };
  }
}

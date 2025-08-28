import { Test, TestingModule } from '@nestjs/testing';
import { StockService } from './application/services/stock.service';
import { PrismaService } from '@modules/prisma';
import {
  CreateStockDto,
  StockStatus,
} from './presentation/dto/createStock.dto';
import { UpdateStockDto } from './presentation/dto/updateStock.dto';
import { NotFoundException, BadRequestException } from '@nestjs/common';

describe('StockService', () => {
  let service: StockService;
  let prismaService: PrismaService;

  const mockPrismaService = {
    stock: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  const mockStock = {
    id: '1',
    productId: 'product-1',
    storeId: 'store-1',
    quantity: 10,
    minQuantity: 5,
    maxQuantity: 100,
    location: 'A1',
    status: StockStatus.ACTIVE,
    createdAt: new Date(),
    updatedAt: new Date(),
    product: {
      id: 'product-1',
      name: 'Test Product',
      sku: 'TEST001',
      price: 10.99,
    },
    store: {
      id: 'store-1',
      name: 'Test Store',
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StockService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<StockService>(StockService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createStock', () => {
    it('should create stock successfully', async () => {
      const createStockDto: CreateStockDto = {
        productId: 'product-1',
        storeId: 'store-1',
        quantity: 10,
        minQuantity: 5,
        maxQuantity: 100,
        location: 'A1',
        status: StockStatus.ACTIVE,
      };

      mockPrismaService.stock.create.mockResolvedValue(mockStock);

      const result = await service.createStock(createStockDto);

      expect(result).toEqual(mockStock);
      expect(mockPrismaService.stock.create).toHaveBeenCalledWith({
        data: {
          ...createStockDto,
          minQuantity: 5,
          status: StockStatus.ACTIVE,
        },
        include: {
          product: true,
          store: true,
        },
      });
    });

    it('should throw BadRequestException when quantity > maxQuantity', async () => {
      const createStockDto: CreateStockDto = {
        productId: 'product-1',
        storeId: 'store-1',
        quantity: 150,
        maxQuantity: 100,
      };

      await expect(service.createStock(createStockDto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException when quantity < minQuantity', async () => {
      const createStockDto: CreateStockDto = {
        productId: 'product-1',
        storeId: 'store-1',
        quantity: 3,
        minQuantity: 5,
      };

      await expect(service.createStock(createStockDto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('findAll', () => {
    it('should return all stocks', async () => {
      mockPrismaService.stock.findMany.mockResolvedValue([mockStock]);

      const result = await service.findAll();

      expect(result).toEqual([mockStock]);
      expect(mockPrismaService.stock.findMany).toHaveBeenCalledWith({
        include: {
          product: true,
          store: true,
        },
        orderBy: {
          updatedAt: 'desc',
        },
      });
    });
  });

  describe('findById', () => {
    it('should return stock by id', async () => {
      mockPrismaService.stock.findUnique.mockResolvedValue(mockStock);

      const result = await service.findById('1');

      expect(result).toEqual(mockStock);
      expect(mockPrismaService.stock.findUnique).toHaveBeenCalledWith({
        where: { id: '1' },
        include: {
          product: true,
          store: true,
        },
      });
    });

    it('should throw NotFoundException when stock not found', async () => {
      mockPrismaService.stock.findUnique.mockResolvedValue(null);

      await expect(service.findById('999')).rejects.toThrow(NotFoundException);
    });
  });

  describe('findByProduct', () => {
    it('should return stocks by product id', async () => {
      mockPrismaService.stock.findMany.mockResolvedValue([mockStock]);

      const result = await service.findByProduct('product-1');

      expect(result).toEqual([mockStock]);
      expect(mockPrismaService.stock.findMany).toHaveBeenCalledWith({
        where: { productId: 'product-1' },
        include: {
          product: true,
          store: true,
        },
        orderBy: {
          updatedAt: 'desc',
        },
      });
    });
  });

  describe('findByStore', () => {
    it('should return stocks by store id', async () => {
      mockPrismaService.stock.findMany.mockResolvedValue([mockStock]);

      const result = await service.findByStore('store-1');

      expect(result).toEqual([mockStock]);
      expect(mockPrismaService.stock.findMany).toHaveBeenCalledWith({
        where: { storeId: 'store-1' },
        include: {
          product: true,
          store: true,
        },
        orderBy: {
          updatedAt: 'desc',
        },
      });
    });
  });

  describe('findLowStock', () => {
    it('should return low stock items with default threshold', async () => {
      mockPrismaService.stock.findMany.mockResolvedValue([mockStock]);

      const result = await service.findLowStock();

      expect(result).toEqual([mockStock]);
      expect(mockPrismaService.stock.findMany).toHaveBeenCalledWith({
        where: {
          quantity: {
            lte: 10,
          },
          status: 'active',
        },
        include: {
          product: true,
          store: true,
        },
        orderBy: {
          quantity: 'asc',
        },
      });
    });

    it('should return low stock items with custom threshold', async () => {
      mockPrismaService.stock.findMany.mockResolvedValue([mockStock]);

      const result = await service.findLowStock(5);

      expect(result).toEqual([mockStock]);
      expect(mockPrismaService.stock.findMany).toHaveBeenCalledWith({
        where: {
          quantity: {
            lte: 5,
          },
          status: 'active',
        },
        include: {
          product: true,
          store: true,
        },
        orderBy: {
          quantity: 'asc',
        },
      });
    });
  });

  describe('updateStock', () => {
    it('should update stock successfully', async () => {
      const updateStockDto: UpdateStockDto = {
        quantity: 15,
        minQuantity: 10,
      };

      mockPrismaService.stock.findUnique.mockResolvedValue(mockStock);
      mockPrismaService.stock.update.mockResolvedValue({
        ...mockStock,
        ...updateStockDto,
      });

      const result = await service.updateStock('1', updateStockDto);

      expect(result).toEqual({
        ...mockStock,
        ...updateStockDto,
      });
    });

    it('should throw BadRequestException when quantity > maxQuantity', async () => {
      const updateStockDto: UpdateStockDto = {
        quantity: 150,
        maxQuantity: 100,
      };

      mockPrismaService.stock.findUnique.mockResolvedValue(mockStock);

      await expect(service.updateStock('1', updateStockDto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('deleteStock', () => {
    it('should delete stock successfully', async () => {
      mockPrismaService.stock.findUnique.mockResolvedValue(mockStock);
      mockPrismaService.stock.delete.mockResolvedValue(mockStock);

      await service.deleteStock('1');

      expect(mockPrismaService.stock.delete).toHaveBeenCalledWith({
        where: { id: '1' },
      });
    });
  });

  describe('updateQuantity', () => {
    it('should update quantity successfully', async () => {
      mockPrismaService.stock.findUnique.mockResolvedValue(mockStock);
      mockPrismaService.stock.update.mockResolvedValue({
        ...mockStock,
        quantity: 20,
      });

      const result = await service.updateQuantity('1', 20);

      expect(result).toEqual({
        ...mockStock,
        quantity: 20,
      });
    });

    it('should throw BadRequestException when quantity is negative', async () => {
      await expect(service.updateQuantity('1', -5)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('updateQuantityByProductAndStore', () => {
    it('should update quantity by product and store successfully', async () => {
      mockPrismaService.stock.findFirst.mockResolvedValue(mockStock);
      mockPrismaService.stock.update.mockResolvedValue({
        ...mockStock,
        quantity: 25,
      });

      const result = await service.updateQuantityByProductAndStore(
        'product-1',
        'store-1',
        25,
      );

      expect(result).toEqual({
        ...mockStock,
        quantity: 25,
      });
    });

    it('should throw BadRequestException when quantity is negative', async () => {
      await expect(
        service.updateQuantityByProductAndStore('product-1', 'store-1', -5),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException when stock not found', async () => {
      mockPrismaService.stock.findFirst.mockResolvedValue(null);

      await expect(
        service.updateQuantityByProductAndStore('product-1', 'store-1', 25),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('getStockAlerts', () => {
    it('should return stock alerts', async () => {
      const lowStock = [mockStock];
      const outOfStock = [{ ...mockStock, id: '2', quantity: 0 }];

      mockPrismaService.stock.findMany
        .mockResolvedValueOnce(lowStock)
        .mockResolvedValueOnce(outOfStock);

      const result = await service.getStockAlerts();

      expect(result).toEqual({
        lowStock,
        outOfStock,
        totalAlerts: 2,
      });
    });
  });
});

import { Test, TestingModule } from '@nestjs/testing';
import { StockController } from './presentation/http/controllers/stock.controller';
import { StockService } from './application/services/stock.service';
import {
  CreateStockDto,
  StockStatus,
} from './presentation/dto/createStock.dto';
import { UpdateStockDto } from './presentation/dto/updateStock.dto';
import { JwtAuthGuard } from '@shared/presentation/http/guards/jwt-auth.guard';

// Mock do JwtAuthGuard
const mockJwtAuthGuard = {
  canActivate: jest.fn(() => true),
};

describe('StockController', () => {
  let controller: StockController;
  let service: StockService;

  const mockStockService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    findByProduct: jest.fn(),
    findByStore: jest.fn(),
    findLowStock: jest.fn(),
    updateQuantity: jest.fn(),
    updateQuantityByProductAndStore: jest.fn(),
    getStockAlerts: jest.fn(),
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
      controllers: [StockController],
      providers: [
        {
          provide: StockService,
          useValue: mockStockService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue(mockJwtAuthGuard)
      .compile();

    controller = module.get<StockController>(StockController);
    service = module.get<StockService>(StockService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create stock', async () => {
      const createStockDto: CreateStockDto = {
        productId: 'product-1',
        storeId: 'store-1',
        quantity: 10,
        minQuantity: 5,
        maxQuantity: 100,
        location: 'A1',
        status: StockStatus.ACTIVE,
      };

      mockStockService.create.mockResolvedValue(mockStock);

      const result = await controller.create(createStockDto);

      expect(result).toEqual(mockStock);
      expect(service.create).toHaveBeenCalledWith(createStockDto);
    });
  });

  describe('findAll', () => {
    it('should return all stocks when no query params', async () => {
      mockStockService.findAll.mockResolvedValue([mockStock]);

      const result = await controller.findAll();

      expect(result).toEqual([mockStock]);
      expect(service.findAll).toHaveBeenCalled();
    });

    it('should return low stock when lowStock=true', async () => {
      mockStockService.findLowStock.mockResolvedValue([mockStock]);

      const result = await controller.findAll(undefined, undefined, true);

      expect(result).toEqual([mockStock]);
      expect(service.findLowStock).toHaveBeenCalledWith(undefined);
    });

    it('should return low stock with custom threshold', async () => {
      mockStockService.findLowStock.mockResolvedValue([mockStock]);

      const result = await controller.findAll(undefined, undefined, true, 5);

      expect(result).toEqual([mockStock]);
      expect(service.findLowStock).toHaveBeenCalledWith(5);
    });

    it('should return stocks by product when productId provided', async () => {
      mockStockService.findByProduct.mockResolvedValue([mockStock]);

      const result = await controller.findAll('product-1');

      expect(result).toEqual([mockStock]);
      expect(service.findByProduct).toHaveBeenCalledWith('product-1');
    });

    it('should return stocks by store when storeId provided', async () => {
      mockStockService.findByStore.mockResolvedValue([mockStock]);

      const result = await controller.findAll(undefined, 'store-1');

      expect(result).toEqual([mockStock]);
      expect(service.findByStore).toHaveBeenCalledWith('store-1');
    });
  });

  describe('findLowStock', () => {
    it('should return low stock with default threshold', async () => {
      mockStockService.findLowStock.mockResolvedValue([mockStock]);

      const result = await controller.findLowStock();

      expect(result).toEqual([mockStock]);
      expect(service.findLowStock).toHaveBeenCalledWith(undefined);
    });

    it('should return low stock with custom threshold', async () => {
      mockStockService.findLowStock.mockResolvedValue([mockStock]);

      const result = await controller.findLowStock(5);

      expect(result).toEqual([mockStock]);
      expect(service.findLowStock).toHaveBeenCalledWith(5);
    });
  });

  describe('getStockAlerts', () => {
    it('should return stock alerts', async () => {
      const alerts = {
        lowStock: [mockStock],
        outOfStock: [],
        totalAlerts: 1,
      };

      mockStockService.getStockAlerts.mockResolvedValue(alerts);

      const result = await controller.getStockAlerts();

      expect(result).toEqual(alerts);
      expect(service.getStockAlerts).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return stock by id', async () => {
      mockStockService.findOne.mockResolvedValue(mockStock);

      const result = await controller.findOne('1');

      expect(result).toEqual(mockStock);
      expect(service.findOne).toHaveBeenCalledWith('1');
    });
  });

  describe('update', () => {
    it('should update stock', async () => {
      const updateStockDto: UpdateStockDto = {
        quantity: 15,
        minQuantity: 10,
      };

      const updatedStock = { ...mockStock, ...updateStockDto };
      mockStockService.update.mockResolvedValue(updatedStock);

      const result = await controller.update('1', updateStockDto);

      expect(result).toEqual(updatedStock);
      expect(service.update).toHaveBeenCalledWith('1', updateStockDto);
    });
  });

  describe('updateQuantity', () => {
    it('should update quantity', async () => {
      const updatedStock = { ...mockStock, quantity: 20 };
      mockStockService.updateQuantity.mockResolvedValue(updatedStock);

      const result = await controller.updateQuantity('1', 20);

      expect(result).toEqual(updatedStock);
      expect(service.updateQuantity).toHaveBeenCalledWith('1', 20);
    });
  });

  describe('updateQuantityByProductAndStore', () => {
    it('should update quantity by product and store', async () => {
      const updatedStock = { ...mockStock, quantity: 25 };
      mockStockService.updateQuantityByProductAndStore.mockResolvedValue(
        updatedStock,
      );

      const result = await controller.updateQuantityByProductAndStore(
        'product-1',
        'store-1',
        25,
      );

      expect(result).toEqual(updatedStock);
      expect(service.updateQuantityByProductAndStore).toHaveBeenCalledWith(
        'product-1',
        'store-1',
        25,
      );
    });
  });

  describe('remove', () => {
    it('should delete stock', async () => {
      mockStockService.remove.mockResolvedValue(undefined);

      await controller.remove('1');

      expect(service.remove).toHaveBeenCalledWith('1');
    });
  });
});

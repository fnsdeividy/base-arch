import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { StockModule } from './stock.module';
import { PrismaModule } from '@modules/prisma';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { StockStatus } from './presentation/dto/createStock.dto';
import { JwtAuthGuard } from '@shared/presentation/http/guards/jwt-auth.guard';
import { PrismaService } from '@modules/prisma';

// Mock do JwtAuthGuard
const mockJwtAuthGuard = {
  canActivate: jest.fn(() => true),
};

describe('Stock Integration Tests', () => {
  let app: INestApplication;
  let prismaService: PrismaService;

  const mockJwtSecret = 'test-secret-key';

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          envFilePath: '.env.test',
        }),
        JwtModule.register({
          secret: mockJwtSecret,
          signOptions: { expiresIn: '1h' },
        }),
        PrismaModule,
        StockModule,
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue(mockJwtAuthGuard)
      .compile();

    app = moduleFixture.createNestApplication();
    prismaService = moduleFixture.get<PrismaService>(PrismaService);

    await app.init();
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  beforeEach(async () => {
    // Limpar banco de dados de teste
    await prismaService.stock.deleteMany();
    await prismaService.product.deleteMany();
    await prismaService.store.deleteMany();
  });

  describe('POST /stock', () => {
    it('should create stock successfully', async () => {
      // Criar loja primeiro
      const store = await prismaService.store.create({
        data: {
          name: 'Test Store',
          description: 'Test Store Description',
          address: 'Test Address',
        },
      });

      // Criar produto com o storeId correto
      const product = await prismaService.product.create({
        data: {
          name: 'Test Product',
          sku: 'TEST001',
          price: 10.99,
          category: 'Test',
          storeId: store.id,
        },
      });

      const stockData = {
        productId: product.id,
        storeId: store.id,
        quantity: 10,
        minQuantity: 5,
        maxQuantity: 100,
        location: 'A1',
        status: StockStatus.ACTIVE,
      };

      const response = await request(app.getHttpServer())
        .post('/stock')
        .send(stockData)
        .expect(201);

      expect(response.body).toMatchObject({
        productId: stockData.productId,
        storeId: stockData.storeId,
        quantity: stockData.quantity,
        minQuantity: stockData.minQuantity,
        maxQuantity: stockData.maxQuantity,
        location: stockData.location,
        status: stockData.status,
      });
    });

    it('should return 400 when quantity > maxQuantity', async () => {
      // Criar loja primeiro
      const store = await prismaService.store.create({
        data: {
          name: 'Test Store 2',
          description: 'Test Store Description',
          address: 'Test Address',
        },
      });

      // Criar produto com o storeId correto
      const product = await prismaService.product.create({
        data: {
          name: 'Test Product',
          sku: 'TEST002',
          price: 10.99,
          category: 'Test',
          storeId: store.id,
        },
      });

      const stockData = {
        productId: product.id,
        storeId: store.id,
        quantity: 150,
        maxQuantity: 100,
      };

      await request(app.getHttpServer())
        .post('/stock')
        .send(stockData)
        .expect(400);
    });
  });

  describe('GET /stock', () => {
    it('should return all stocks', async () => {
      // Criar loja primeiro
      const store = await prismaService.store.create({
        data: {
          name: 'Test Store 3',
          description: 'Test Store Description',
          address: 'Test Address',
        },
      });

      // Criar produto com o storeId correto
      const product = await prismaService.product.create({
        data: {
          name: 'Test Product',
          sku: 'TEST003',
          price: 10.99,
          category: 'Test',
          storeId: store.id,
        },
      });

      await prismaService.stock.create({
        data: {
          productId: product.id,
          storeId: store.id,
          quantity: 10,
          minQuantity: 5,
          maxQuantity: 100,
          location: 'A1',
          status: StockStatus.ACTIVE,
        },
      });

      const response = await request(app.getHttpServer())
        .get('/stock')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
    });

    it('should return low stock items', async () => {
      // Criar loja primeiro
      const store = await prismaService.store.create({
        data: {
          name: 'Test Store 4',
          description: 'Test Store Description',
          address: 'Test Address',
        },
      });

      // Criar produto com o storeId correto
      const product = await prismaService.product.create({
        data: {
          name: 'Test Product',
          sku: 'TEST004',
          price: 10.99,
          category: 'Test',
          storeId: store.id,
        },
      });

      await prismaService.stock.create({
        data: {
          productId: product.id,
          storeId: store.id,
          quantity: 5,
          minQuantity: 5,
          maxQuantity: 100,
          location: 'A1',
          status: StockStatus.ACTIVE,
        },
      });

      const response = await request(app.getHttpServer())
        .get('/stock?lowStock=true')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
      expect(response.body[0].quantity).toBeLessThanOrEqual(10);
    });
  });

  describe('GET /stock/:id', () => {
    it('should return stock by id', async () => {
      // Criar loja primeiro
      const store = await prismaService.store.create({
        data: {
          name: 'Test Store 5',
          description: 'Test Store Description',
          address: 'Test Address',
        },
      });

      // Criar produto com o storeId correto
      const product = await prismaService.product.create({
        data: {
          name: 'Test Product',
          sku: 'TEST005',
          price: 10.99,
          category: 'Test',
          storeId: store.id,
        },
      });

      const stock = await prismaService.stock.create({
        data: {
          productId: product.id,
          storeId: store.id,
          quantity: 10,
          minQuantity: 5,
          maxQuantity: 100,
          location: 'A1',
          status: StockStatus.ACTIVE,
        },
      });

      const response = await request(app.getHttpServer())
        .get(`/stock/${stock.id}`)
        .expect(200);

      expect(response.body.id).toBe(stock.id);
      expect(response.body.productId).toBe(product.id);
      expect(response.body.storeId).toBe(store.id);
    });

    it('should return 404 when stock not found', async () => {
      await request(app.getHttpServer())
        .get('/stock/non-existent-id')
        .expect(404);
    });
  });

  describe('PATCH /stock/:id', () => {
    it('should update stock successfully', async () => {
      // Criar loja primeiro
      const store = await prismaService.store.create({
        data: {
          name: 'Test Store 6',
          description: 'Test Store Description',
          address: 'Test Address',
        },
      });

      // Criar produto com o storeId correto
      const product = await prismaService.product.create({
        data: {
          name: 'Test Product',
          sku: 'TEST006',
          price: 10.99,
          category: 'Test',
          storeId: store.id,
        },
      });

      const stock = await prismaService.stock.create({
        data: {
          productId: product.id,
          storeId: store.id,
          quantity: 10,
          minQuantity: 5,
          maxQuantity: 100,
          location: 'A1',
          status: StockStatus.ACTIVE,
        },
      });

      const updateData = {
        quantity: 15,
        minQuantity: 10,
      };

      const response = await request(app.getHttpServer())
        .patch(`/stock/${stock.id}`)
        .send(updateData)
        .expect(200);

      expect(response.body.quantity).toBe(updateData.quantity);
      expect(response.body.minQuantity).toBe(updateData.minQuantity);
    });
  });

  describe('DELETE /stock/:id', () => {
    it('should delete stock successfully', async () => {
      // Criar loja primeiro
      const store = await prismaService.store.create({
        data: {
          name: 'Test Store 7',
          description: 'Test Store Description',
          address: 'Test Address',
        },
      });

      // Criar produto com o storeId correto
      const product = await prismaService.product.create({
        data: {
          name: 'Test Product',
          sku: 'TEST007',
          price: 10.99,
          category: 'Test',
          storeId: store.id,
        },
      });

      const stock = await prismaService.stock.create({
        data: {
          productId: product.id,
          storeId: store.id,
          quantity: 10,
          minQuantity: 5,
          maxQuantity: 100,
          location: 'A1',
          status: StockStatus.ACTIVE,
        },
      });

      await request(app.getHttpServer())
        .delete(`/stock/${stock.id}`)
        .expect(200);

      // Verificar se foi deletado
      const deletedStock = await prismaService.stock.findUnique({
        where: { id: stock.id },
      });
      expect(deletedStock).toBeNull();
    });
  });
});

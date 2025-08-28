import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { StockModule } from '../src/modules/stock/stock.module';
import { PrismaModule } from '../src/modules/prisma/prisma.module';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { JwtAuthGuard } from '../src/shared/presentation/http/guards/jwt-auth.guard';
import { PrismaService } from '../src/modules/prisma/prisma.service';
import { StockStatus } from '../src/modules/stock/presentation/dto/createStock.dto';

// Mock do JwtAuthGuard para testes E2E
const mockJwtAuthGuard = {
  canActivate: jest.fn(() => true),
};

describe('Stock E2E Tests', () => {
  let app: INestApplication;
  let prismaService: PrismaService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          envFilePath: '.env.test',
        }),
        JwtModule.register({
          secret: 'test-secret-key',
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

  afterEach(async () => {
    // Limpar dados entre testes
    await prismaService.stock.deleteMany();
    await prismaService.product.deleteMany();
    await prismaService.store.deleteMany();
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  describe('/stock (POST)', () => {
    it('should create stock successfully', async () => {
      // Criar loja primeiro
      const store = await prismaService.store.create({
        data: {
          name: 'Test Store',
          address: '123 Test St',
          phone: '123-456-7890',
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
          address: '456 Test St',
          phone: '098-765-4321',
        },
      });

      // Criar produto com o storeId correto
      const product = await prismaService.product.create({
        data: {
          name: 'Test Product 2',
          sku: 'TEST002',
          price: 20.99,
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

  describe('/stock (GET)', () => {
    it('should return all stocks', async () => {
      const response = await request(app.getHttpServer())
        .get('/stock')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });

    it('should return low stock items', async () => {
      const response = await request(app.getHttpServer())
        .get('/stock?lowStock=true')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe('/stock/:id (GET)', () => {
    it('should return 404 when stock not found', async () => {
      await request(app.getHttpServer())
        .get('/stock/non-existent-id')
        .expect(404);
    });
  });

  describe('/stock/alerts (GET)', () => {
    it('should return stock alerts', async () => {
      const response = await request(app.getHttpServer())
        .get('/stock/alerts')
        .expect(200);

      expect(response.body).toHaveProperty('lowStock');
      expect(response.body).toHaveProperty('outOfStock');
      expect(response.body).toHaveProperty('totalAlerts');
    });
  });
});

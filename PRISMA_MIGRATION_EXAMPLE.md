# 🔄 Exemplo de Migração: TypeORM → Prisma

Este arquivo mostra como migrar um service existente do TypeORM para o Prisma.

## 📝 Exemplo: StockService

### ❌ Antes (TypeORM)

```typescript
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

  // ... outros métodos
}
```

### ✅ Depois (Prisma)

```typescript
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@modules/prisma';
import { CreateStockDto } from '@modules/stock/presentation/dto/createStock.dto';
import { UpdateStockDto } from '@modules/stock/presentation/dto/updateStock.dto';

@Injectable()
export class StockService {
  constructor(private readonly prisma: PrismaService) {}

  async createStock(createStockDto: CreateStockDto) {
    return this.prisma.stock.create({
      data: createStockDto,
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
    });
  }

  async findById(id: string) {
    return this.prisma.stock.findUnique({
      where: { id },
      include: {
        product: true,
        store: true,
      },
    });
  }

  async findByProduct(productId: string) {
    return this.prisma.stock.findMany({
      where: { productId },
      include: {
        product: true,
        store: true,
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
    });
  }

  async findByStatus(status: string) {
    return this.prisma.stock.findMany({
      where: { status },
      include: {
        product: true,
        store: true,
      },
    });
  }

  async findLowStock() {
    return this.prisma.stock.findMany({
      where: {
        quantity: {
          lte: 10, // Quantidade menor ou igual a 10
        },
      },
      include: {
        product: true,
        store: true,
      },
    });
  }

  async updateStock(id: string, updateStockDto: UpdateStockDto) {
    const stock = await this.findById(id);
    if (!stock) {
      throw new NotFoundException('Stock not found');
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
    if (!stock) {
      throw new NotFoundException('Stock not found');
    }

    await this.prisma.stock.delete({
      where: { id },
    });
  }

  async updateQuantity(id: string, quantity: number) {
    const stock = await this.findById(id);
    if (!stock) {
      throw new NotFoundException('Stock not found');
    }

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
    const stock = await this.findById(id);
    if (!stock) {
      throw new NotFoundException('Stock not found');
    }
    return stock;
  }

  async update(id: string, updateStockDto: UpdateStockDto) {
    const stock = await this.updateStock(id, updateStockDto);
    if (!stock) {
      throw new NotFoundException('Stock not found after update');
    }
    return stock;
  }

  async remove(id: string): Promise<void> {
    await this.deleteStock(id);
  }

  async updateQuantityByProductAndStore(productId: string, storeId: string, quantity: number) {
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
}
```

## 🔑 Principais Mudanças

### 1. **Injeção de Dependência**
```typescript
// ❌ Antes
constructor(
  @Inject(STOCK_REPOSITORY)
  private readonly stockRepository: IStockRepository,
) { }

// ✅ Depois
constructor(private readonly prisma: PrismaService) {}
```

### 2. **Queries**
```typescript
// ❌ Antes
return await this.stockRepository.findAll();

// ✅ Depois
return this.prisma.stock.findMany({
  include: {
    product: true,
    store: true,
  },
});
```

### 3. **Includes/Joins**
```typescript
// ❌ Antes (TypeORM)
const stocks = await this.stockRepository.find({
  relations: ['product', 'store'],
});

// ✅ Depois (Prisma)
const stocks = await this.prisma.stock.findMany({
  include: {
    product: true,
    store: true,
  },
});
```

### 4. **Where Conditions**
```typescript
// ❌ Antes (TypeORM)
const stocks = await this.stockRepository.find({
  where: { status: 'active' },
  relations: ['product', 'store'],
});

// ✅ Depois (Prisma)
const stocks = await this.prisma.stock.findMany({
  where: { status: 'active' },
  include: {
    product: true,
    store: true,
  },
});
```

### 5. **Updates**
```typescript
// ❌ Antes (TypeORM)
return await this.stockRepository.update(id, updateData);

// ✅ Depois (Prisma)
return this.prisma.stock.update({
  where: { id },
  data: updateData,
  include: {
    product: true,
    store: true,
  },
});
```

## 📚 Vantagens do Prisma

1. **Type Safety**: Tipagem automática baseada no schema
2. **Query Builder**: Sintaxe mais intuitiva e legível
3. **Auto-complete**: Melhor suporte do IDE
4. **Migrations**: Sistema robusto de migrations
5. **Seeds**: Facilidade para popular dados de teste
6. **Studio**: Interface visual para o banco de dados

## 🚀 Próximos Passos

1. **Atualizar o Schema**: Adicionar modelos para Stock, Product, Store
2. **Migrar Services**: Aplicar o padrão acima em todos os services
3. **Remover Dependências**: TypeORM, @nestjs/typeorm, pg
4. **Atualizar Tests**: Usar PrismaService nos testes
5. **Documentar**: Atualizar documentação da API

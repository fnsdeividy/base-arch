import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { CreateStoreDto } from '@modules/store/presentation/interfaces/store.interface';
import { UpdateStoreDto } from '@modules/store/presentation/dto/updateStore.dto';
import { PrismaService } from '@modules/prisma/prisma.service';
import { randomUUID } from 'crypto';

@Injectable()
export class StoreService {
  constructor(
    private readonly prisma: PrismaService,
  ) { }

  async createStore(createStoreDto: CreateStoreDto) {
    const existingStore = await this.prisma.store.findFirst({
      where: { name: createStoreDto.name },
    });
    if (existingStore) {
      throw new ConflictException('Store name already exists');
    }

    const store = await this.prisma.store.create({
      data: {
        id: randomUUID(),
        name: createStoreDto.name,
        description: createStoreDto.description,
        address: createStoreDto.address,
        phone: createStoreDto.phone,
        email: createStoreDto.email,
        isActive: createStoreDto.isActive ?? true,
      },
    });

    return store;
  }

  async updateStore(
    id: string,
    updateStoreDto: UpdateStoreDto,
  ) {
    const existingStore = await this.prisma.store.findUnique({
      where: { id },
    });
    if (!existingStore) {
      throw new NotFoundException('Store not found');
    }

    if (updateStoreDto.name && updateStoreDto.name !== existingStore.name) {
      const storeWithName = await this.prisma.store.findFirst({
        where: { name: updateStoreDto.name },
      });
      if (storeWithName) {
        throw new ConflictException('Store name already exists');
      }
    }

    const updatedStore = await this.prisma.store.update({
      where: { id },
      data: updateStoreDto,
    });

    return updatedStore;
  }

  async findById(id: string) {
    const store = await this.prisma.store.findUnique({
      where: { id },
    });
    return store;
  }

  async findAll() {
    const stores = await this.prisma.store.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' },
    });
    return stores;
  }

  async deleteStore(id: string): Promise<void> {
    const existingStore = await this.prisma.store.findUnique({
      where: { id },
    });
    if (!existingStore) {
      throw new NotFoundException('Store not found');
    }

    await this.prisma.store.delete({
      where: { id },
    });
  }
}

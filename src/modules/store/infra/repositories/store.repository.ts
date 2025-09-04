import { Injectable } from '@nestjs/common';
import { PrismaService } from '@modules/prisma/prisma.service';
import { Store } from '@modules/store/entities/store.entity';
import { IStoreRepository } from '@modules/store/presentation/interfaces/store.interface';
import { StoreType } from '@prisma/client';

type PrismaStore = {
  id: string;
  name: string;
  description: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  zipCode: string | null;
  phone: string | null;
  email: string | null;
  type: StoreType;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
};

@Injectable()
export class StoreRepository implements IStoreRepository {
  constructor(private readonly prisma: PrismaService) { }

  private mapPrismaStoreToStore(prismaStore: PrismaStore): Store {
    return {
      ...prismaStore,
      type: prismaStore.type as 'main' | 'branch' | 'kiosk' | null,
    };
  }

  async create(data: Partial<Store>): Promise<Store> {
    const createdStore = await this.prisma.store.create({
      data: data as any,
    });
    return this.mapPrismaStoreToStore(createdStore as PrismaStore);
  }

  async findById(id: string): Promise<Store | null> {
    const store = await this.prisma.store.findUnique({
      where: { id },
    });
    return store ? this.mapPrismaStoreToStore(store as PrismaStore) : null;
  }

  async findByName(name: string): Promise<Store | null> {
    const store = await this.prisma.store.findFirst({
      where: { name },
    });
    return store ? this.mapPrismaStoreToStore(store as PrismaStore) : null;
  }

  async list(): Promise<Store[]> {
    const stores = await this.prisma.store.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return stores.map(store => this.mapPrismaStoreToStore(store as PrismaStore));
  }

  async update(criteria: Partial<Store>, data: Partial<Store>): Promise<void> {
    await this.prisma.store.update({
      where: criteria as any,
      data: data as any,
    });
  }

  async delete(criteria: Partial<Store>): Promise<void> {
    await this.prisma.store.delete({
      where: criteria as any,
    });
  }
}

import { Injectable } from '@nestjs/common';
import { PrismaService } from '@modules/prisma/prisma.service';
import { Store } from '@modules/store/entities/store.entity';
import { IStoreRepository } from '@modules/store/presentation/interfaces/store.interface';

@Injectable()
export class StoreRepository implements IStoreRepository {
  constructor(private readonly prisma: PrismaService) { }

  async create(data: Partial<Store>): Promise<Store> {
    return await this.prisma.store.create({
      data: data as any,
    });
  }

  async findById(id: string): Promise<Store | null> {
    return await this.prisma.store.findUnique({
      where: { id },
    });
  }

  async findByName(name: string): Promise<Store | null> {
    return await this.prisma.store.findFirst({
      where: { name },
    });
  }

  async list(): Promise<Store[]> {
    return await this.prisma.store.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' },
    });
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

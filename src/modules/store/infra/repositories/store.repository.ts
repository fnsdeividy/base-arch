import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Store } from '@modules/store/entities/store.entity';
import { IStoreRepository } from '@modules/store/presentation/interfaces/store.interface';

@Injectable()
export class StoreRepository implements IStoreRepository {
  constructor(private readonly repository: Repository<Store>) { }

  async create(data: Partial<Store>): Promise<Store> {
    const store = this.repository.create(data);
    return await this.repository.save(store);
  }

  async findById(id: string): Promise<Store | null> {
    return await this.repository.findOne({ where: { id } });
  }

  async findByName(name: string): Promise<Store | null> {
    return await this.repository.findOne({ where: { name } });
  }

  async list(): Promise<Store[]> {
    return await this.repository.find({
      where: { isActive: true },
      order: { createdAt: 'DESC' }
    });
  }

  async update(criteria: Partial<Store>, data: Partial<Store>): Promise<void> {
    await this.repository.update(criteria, data);
  }

  async delete(criteria: Partial<Store>): Promise<void> {
    await this.repository.delete(criteria);
  }
}

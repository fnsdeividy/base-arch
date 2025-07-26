import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Store } from '@modules/store/entities/store.entity';
import {
  IStoreRepository,
} from '@modules/store/presentation/interfaces/store.interface';
import { BaseRepository } from '@shared/infra/repository/baseRepository';

@Injectable()
export class StoreRepository extends BaseRepository<Store> implements IStoreRepository {
  constructor(
    private readonly storeRepository: Repository<Store>
  ) {
    super(storeRepository);
  }

  async findById(id: string): Promise<Store | null> {
    const result = await this.findBy('id', id);
    return result || null;
  }

  async findByName(name: string): Promise<Store | null> {
    const result = await this.findBy('name', name);
    return result || null;
  }
} 
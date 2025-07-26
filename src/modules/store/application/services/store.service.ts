import {
  Injectable,
  Inject,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { CreateStoreDto, IStoreRepository, IStoreService, STORE_REPOSITORY } from '@modules/store/presentation/interfaces/store.interface';
import { UpdateStoreDto } from '@modules/store/presentation/dto/updateStore.dto';
import { Store } from '@modules/store/entities/store.entity';
import { randomUUID } from 'crypto';

@Injectable()
export class StoreService implements IStoreService {
  constructor(
    @Inject(STORE_REPOSITORY)
    private readonly storeRepository: IStoreRepository,
  ) { }

  async createStore(createStoreDto: CreateStoreDto): Promise<Store> {
    const existingStore = await this.storeRepository.findByName(createStoreDto.name);
    if (existingStore) {
      throw new ConflictException('Store name already exists');
    }

    const store = await this.storeRepository.create({
      id: randomUUID(),
      ...createStoreDto,
    });

    return store;
  }

  async updateStore(id: string, payload: UpdateStoreDto): Promise<Store | null> {
    const existingStore = await this.storeRepository.findById(id);
    if (!existingStore) {
      throw new NotFoundException('Store not found');
    }

    if (payload.name && payload.name !== existingStore.name) {
      const storeWithName = await this.storeRepository.findByName(payload.name);
      if (storeWithName) {
        throw new ConflictException('Store name already exists');
      }
    }

    await this.storeRepository.update({ id }, payload);
    const updatedStore = await this.storeRepository.findById(id);

    return updatedStore;
  }

  async findById(id: string): Promise<Store | null> {
    const store = await this.storeRepository.findById(id);
    return store;
  }

  async findAll(): Promise<Store[]> {
    const stores = await this.storeRepository.list();
    return stores;
  }

  async deleteStore(id: string): Promise<void> {
    const existingStore = await this.storeRepository.findById(id);
    if (!existingStore) {
      throw new NotFoundException('Store not found');
    }

    await this.storeRepository.delete({ id });
  }
} 
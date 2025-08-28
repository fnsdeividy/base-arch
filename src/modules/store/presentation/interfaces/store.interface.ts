import { Store } from '@modules/store/entities/store.entity';
import { CreateStoreDto } from '@modules/store/presentation/dto/createStore.dto';
import { UpdateStoreDto } from '@modules/store/presentation/dto/updateStore.dto';

export { CreateStoreDto, UpdateStoreDto };

export const STORE_REPOSITORY = 'STORE_REPOSITORY';

export interface IStoreRepository {
  create(data: Partial<Store>): Promise<Store>;
  findById(id: string): Promise<Store | null>;
  findByName(name: string): Promise<Store | null>;
  list(): Promise<Store[]>;
  update(criteria: Partial<Store>, data: Partial<Store>): Promise<void>;
  delete(criteria: Partial<Store>): Promise<void>;
}

export interface IStoreService {
  createStore(createStoreDto: CreateStoreDto): Promise<Store>;
  findAll(): Promise<Store[]>;
  findById(id: string): Promise<Store | null>;
  updateStore(
    id: string,
    updateStoreDto: UpdateStoreDto,
  ): Promise<Store | null>;
  deleteStore(id: string): Promise<void>;
}

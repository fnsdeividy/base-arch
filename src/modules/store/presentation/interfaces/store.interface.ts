import { IBaseRepository } from '@shared/presentation/interfaces/baseRepository';
import { Store } from '@modules/store/entities/store.entity';

export interface IStore {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  phone: string;
  email?: string;
  website?: string;
  isActive: boolean;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IStoreService {
  createStore(createStoreDto: CreateStoreDto): Promise<Store>
  updateStore(id: string, payload: UpdateStoreDto): Promise<Store | null>
  findById(id: string): Promise<Store | null>
  findAll(): Promise<Store[]>
  deleteStore(id: string): Promise<void>
}

export interface IStoreRepository extends IBaseRepository<Store> {
  findById(id: string): Promise<Store | null>;
  findByName(name: string): Promise<Store | null>;
}

export interface CreateStoreDto {
  name: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  phone: string;
  email?: string;
  website?: string;
  description?: string;
}

export interface UpdateStoreDto {
  name?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  phone?: string;
  email?: string;
  website?: string;
  isActive?: boolean;
  description?: string;
}

export const STORE_REPOSITORY = 'STORE_REPOSITORY'; 
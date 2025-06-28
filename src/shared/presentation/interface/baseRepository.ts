import { DeepPartial, FindOptionsWhere, UpdateResult, DeleteResult } from 'typeorm';

export type OrderDirection = 'ASC' | 'DESC';

export interface PaginateOptions<T> {
  page?: number;
  perPage?: number;
  sortBy?: keyof T;
  direction?: OrderDirection;
  where?: FindOptionsWhere<T>;
}

export interface PaginateResult<T> {
  data: T[];
  meta: {
    page: number;
    perPage: number;
    total: number;
    lastPage: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

export interface DefaultOptions<T> {
  where?: FindOptionsWhere<T>;
  relations?: string[];
  select?: (keyof T)[];
  order?: Record<keyof T, OrderDirection>;
}

export interface IBaseRepository<T> {
  create(payload: DeepPartial<T>): Promise<T>;
  createMany(payloads: DeepPartial<T>[]): Promise<T[]>;
  findBy<K extends keyof T>(field: K, value: T[K], opts?: DefaultOptions<T>): Promise<T | null>;
  list(opts?: DefaultOptions<T>): Promise<T[]>;
  paginate(options: PaginateOptions<T>): Promise<PaginateResult<T>>;
  first(opts?: DefaultOptions<T>): Promise<T | null>;
  count(opts?: DefaultOptions<T>): Promise<number>;
  firstOrCreate(search: Partial<T>, payload: DeepPartial<T>): Promise<T>;
  update(where: FindOptionsWhere<T>, payload: Partial<T>): Promise<UpdateResult>;
  delete(where: FindOptionsWhere<T>): Promise<DeleteResult>;

}

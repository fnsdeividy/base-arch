import { FindOptionsWhere } from 'typeorm';

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

import { Injectable } from '@nestjs/common';
import {
  OrderDirection,
  DefaultOptions,
  PaginateOptions,
  PaginateResult,
} from 'src/shared/presentation/interface/baseRepository';
import {
  DataSource,
  ObjectLiteral,
  DeepPartial,
  FindOptionsWhere,
  UpdateResult,
  DeleteResult,
  Repository,
  FindManyOptions,
} from 'typeorm';

@Injectable()
export class BaseRepository<T extends ObjectLiteral> {
  protected entityClass: new () => T;
  protected repository: Repository<T>;

  static ORDER_ASC = 'ASC' as const;
  static ORDER_DESC = 'DESC' as const;

  protected DEFAULT_PAGE = 1;
  protected DEFAULT_PER_PAGE = 10;
  protected DEFAULT_SORT = 'id' as keyof T;
  protected DEFAULT_DIRECTION: OrderDirection = 'ASC';

  constructor(
    protected dataSource: DataSource,
    entityClass: new () => T,
  ) {
    this.entityClass = entityClass;
    this.repository = this.dataSource.getRepository(entityClass);
  }

  /**
   * ------------------------------------------------------
   * CRUD Operations
   * ------------------------------------------------------
   */
  async create(payload: DeepPartial<T>): Promise<T> {
    const entity = this.repository.create(payload);
    return this.repository.save(entity);
  }

  async createMany(payloads: DeepPartial<T>[]): Promise<T[]> {
    const entities = this.repository.create(payloads);
    return this.repository.save(entities);
  }

  async findBy<K extends keyof T>(
    field: K,
    value: T[K],
    opts?: DefaultOptions<T>,
  ): Promise<T | null> {
    const where = { [field]: value, ...opts?.where } as FindOptionsWhere<T>;
    const options = { where } as any;
    if (opts?.relations) options.relations = opts.relations;
    if (opts?.select) options.select = opts.select;
    return this.repository.findOne(options);
  }

  async list(opts?: DefaultOptions<T>): Promise<T[]> {
    const options: FindManyOptions<T> = {
      where: opts?.where,
      relations: opts?.relations,
      select: opts?.select as any,
    };

    if (opts?.order) {
      (options as any).order = opts.order;
    } else {
      (options as any).order = { [this.DEFAULT_SORT]: this.DEFAULT_DIRECTION };
    }

    return this.repository.find(options);
  }

  async paginate(options: PaginateOptions<T>): Promise<PaginateResult<T>> {
    const page = options.page || this.DEFAULT_PAGE;
    const perPage = options.perPage || this.DEFAULT_PER_PAGE;
    const skip = (page - 1) * perPage;

    const [data, total] = await this.repository.findAndCount({
      where: options.where,
      skip,
      take: perPage,
      order: {
        [options.sortBy || this.DEFAULT_SORT]:
          options.direction || this.DEFAULT_DIRECTION,
      } as any,
    });

    const lastPage = Math.ceil(total / perPage);

    return {
      data,
      meta: {
        page,
        perPage,
        total,
        lastPage,
        hasNextPage: page < lastPage,
        hasPreviousPage: page > 1,
      },
    };
  }

  async first(opts?: DefaultOptions<T>): Promise<T | null> {
    const options = { where: opts?.where } as any;
    if (opts?.relations) options.relations = opts.relations;
    if (opts?.select) options.select = opts.select;
    return this.repository.findOne(options);
  }

  async count(opts?: DefaultOptions<T>): Promise<number> {
    return this.repository.count({ where: opts?.where });
  }

  async firstOrCreate(search: Partial<T>, payload: DeepPartial<T>): Promise<T> {
    const existing = await this.repository.findOne({
      where: search as FindOptionsWhere<T>,
    });
    if (existing) return existing;

    return this.create(payload);
  }

  async update(
    where: FindOptionsWhere<T>,
    payload: Partial<T>,
  ): Promise<UpdateResult> {
    return this.repository.update(where, payload);
  }

  async delete(where: FindOptionsWhere<T>): Promise<DeleteResult> {
    return this.repository.delete(where);
  }

  /**
   * ------------------------------------------------------
   * Transaction Support
   * ------------------------------------------------------
   */
  async transaction<R>(callback: (queryRunner: any) => Promise<R>): Promise<R> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const result = await callback(queryRunner);
      await queryRunner.commitTransaction();
      return result;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * ------------------------------------------------------
   * Raw Query Support
   * ------------------------------------------------------
   */
  // protected async query<T>(text: string, params?: any[]): Promise<T> {
  //   const start = Date.now();
  //   const res = await this.dataSource.query(text, params);
  //   const duration = Date.now() - start;

  //   console.log('Executed query', { text, duration, rows: res.length });
  //   return res;
  // }

  /**
   * ------------------------------------------------------
   * Helpers
   * ------------------------------------------------------
   */
  protected validateSortBy(sort: string): void {
    const entityColumns = Object.keys(new this.entityClass());
    if (!entityColumns.includes(sort)) {
      throw new Error(
        `Invalid sort key: ${sort}. Must be one of: ${entityColumns.join(', ')}`,
      );
    }
  }

  protected validateDirection(direction: string): void {
    if (
      direction !== BaseRepository.ORDER_ASC &&
      direction !== BaseRepository.ORDER_DESC
    ) {
      throw new Error(
        `Invalid direction. Must be "${BaseRepository.ORDER_ASC}" or "${BaseRepository.ORDER_DESC}".`,
      );
    }
  }
}

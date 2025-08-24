import { Module } from '@nestjs/common';
import { TypeOrmModule, getRepositoryToken } from '@nestjs/typeorm';
import { StoreController } from '@modules/store/presentation/http/controllers/store.controller';
import { StoreRepository } from '@modules/store/infra/repositories/store.repository';
import { STORE_REPOSITORY } from '@modules/store/presentation/interfaces/store.interface';
import { Store } from '@modules/store/entities/store.entity';
import { StoreService } from './application/services/store.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Store])
  ],
  controllers: [StoreController],
  providers: [
    StoreService,
    {
      provide: STORE_REPOSITORY,
      useFactory: (storeRepository) => new StoreRepository(storeRepository),
      inject: [getRepositoryToken(Store)],
    },
  ],
  exports: [StoreService],
})
export class StoresModule { }

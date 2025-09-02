import { Module } from '@nestjs/common';
import { StoreController } from '@modules/store/presentation/http/controllers/store.controller';
import { StoreService } from './application/services/store.service';
import { StoreRepository } from './infra/repositories/store.repository';
import { PrismaModule } from '@modules/prisma/prisma.module';
import { STORE_REPOSITORY } from './presentation/interfaces/store.interface';

@Module({
  imports: [PrismaModule],
  controllers: [StoreController],
  providers: [
    StoreService,
    {
      provide: STORE_REPOSITORY,
      useClass: StoreRepository,
    },
  ],
  exports: [StoreService],
})
export class StoresModule { }

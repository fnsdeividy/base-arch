import { Module } from '@nestjs/common';
import { StoreController } from '@modules/store/presentation/http/controllers/store.controller'
import { StoreService } from './application/services/store.service';

@Module({
  controllers: [StoreController],
  providers: [StoreService],
  exports: [StoreService],
})
export class StoresModule { }

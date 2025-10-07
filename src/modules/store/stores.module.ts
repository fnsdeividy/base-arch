import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { StoresController } from './presentation/stores.controller';
import { StoresService } from './application/stores.service';

@Module({
  imports: [PrismaModule],
  controllers: [StoresController],
  providers: [StoresService],
  exports: [StoresService],
})
export class StoresModule { }

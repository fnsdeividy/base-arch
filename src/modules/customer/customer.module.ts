import { Module } from '@nestjs/common';
import { CustomerController } from './presentation/customer.controller';
import { CustomerService } from './application/customer.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [CustomerController],
  providers: [CustomerService],
  exports: [CustomerService],
})
export class CustomerModule { }

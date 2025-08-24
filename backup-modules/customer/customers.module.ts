import { Module } from '@nestjs/common';
import { CustomerController } from '@modules/customer/presentation/http/controllers/customer.controller';
import { CustomerService } from './application/services/customer.service';

@Module({
  controllers: [CustomerController],
  providers: [CustomerService],
  exports: [CustomerService],
})
export class CustomersModule { }

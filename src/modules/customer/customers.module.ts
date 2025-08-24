import { Module } from '@nestjs/common';
import { TypeOrmModule, getRepositoryToken } from '@nestjs/typeorm';
import { CustomerController } from '@modules/customer/presentation/http/controllers/customer.controller';
import { CustomerRepository } from '@modules/customer/infra/repositories/customer.repository';
import { CUSTOMER_REPOSITORY } from '@modules/customer/presentation/interfaces/customer.interface';
import { Customer } from '@modules/customer/entities/customer.entity';
import { CustomerService } from './application/services/customer.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Customer])
  ],
  controllers: [CustomerController],
  providers: [
    CustomerService,
    {
      provide: CUSTOMER_REPOSITORY,
      useFactory: (customerRepository) => new CustomerRepository(customerRepository),
      inject: [getRepositoryToken(Customer)],
    },
  ],
  exports: [CustomerService],
})
export class CustomersModule { }

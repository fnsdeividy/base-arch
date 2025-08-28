import { Customer } from '@modules/customer/entities/customer.entity';
import { CreateCustomerDto } from '@modules/customer/presentation/dto/createCustomer.dto';
import { UpdateCustomerDto } from '@modules/customer/presentation/dto/updateCustomer.dto';

export { CreateCustomerDto, UpdateCustomerDto };

export const CUSTOMER_REPOSITORY = 'CUSTOMER_REPOSITORY';

export interface ICustomerRepository {
  create(data: Partial<Customer>): Promise<Customer>;
  findById(id: string): Promise<Customer | null>;
  findByEmail(email: string): Promise<Customer | null>;
  findAll(filters?: {
    search?: string;
    isActive?: boolean;
  }): Promise<Customer[]>;
  update(criteria: Partial<Customer>, data: Partial<Customer>): Promise<void>;
  delete(criteria: Partial<Customer>): Promise<void>;
}

export interface ICustomerService {
  create(createCustomerDto: CreateCustomerDto): Promise<Customer>;
  findAll(filters?: {
    search?: string;
    isActive?: boolean;
  }): Promise<Customer[]>;
  findOne(id: string): Promise<Customer>;
  update(id: string, updateCustomerDto: UpdateCustomerDto): Promise<Customer>;
  remove(id: string): Promise<void>;
}

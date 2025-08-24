import { Injectable, NotFoundException, ConflictException, Inject } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { Customer } from '@modules/customer/entities/customer.entity';
import { CreateCustomerDto } from '@modules/customer/presentation/dto/createCustomer.dto';
import { UpdateCustomerDto } from '@modules/customer/presentation/dto/updateCustomer.dto';
import { ICustomerService, ICustomerRepository, CUSTOMER_REPOSITORY } from '@modules/customer/presentation/interfaces/customer.interface';

@Injectable()
export class CustomerService implements ICustomerService {
  constructor(
    @Inject(CUSTOMER_REPOSITORY)
    private readonly customerRepository: ICustomerRepository
  ) {}

  async create(createCustomerDto: CreateCustomerDto): Promise<Customer> {
    // Check if customer with same email already exists
    if (createCustomerDto.email) {
      const existingCustomer = await this.customerRepository.findByEmail(createCustomerDto.email);
      if (existingCustomer) {
        throw new ConflictException('Customer with this email already exists');
      }
    }

    const customer = await this.customerRepository.create({
      id: randomUUID(),
      ...createCustomerDto,
      isActive: createCustomerDto.isActive ?? true
    });

    return customer;
  }

  async findAll(filters?: { search?: string; isActive?: boolean }): Promise<Customer[]> {
    return this.customerRepository.findAll(filters);
  }

  async findOne(id: string): Promise<Customer> {
    const customer = await this.customerRepository.findById(id);
    if (!customer) {
      throw new NotFoundException('Customer not found');
    }
    return customer;
  }

  async update(id: string, updateCustomerDto: UpdateCustomerDto): Promise<Customer> {
    const customer = await this.customerRepository.findById(id);
    if (!customer) {
      throw new NotFoundException('Customer not found');
    }

    // Check if email is being updated and if it already exists
    if (updateCustomerDto.email && updateCustomerDto.email !== customer.email) {
      const existingCustomer = await this.customerRepository.findByEmail(updateCustomerDto.email);
      if (existingCustomer) {
        throw new ConflictException('Customer with this email already exists');
      }
    }

    await this.customerRepository.update({ id }, updateCustomerDto);
    return await this.customerRepository.findById(id) as Customer;
  }

  async remove(id: string): Promise<void> {
    const customer = await this.customerRepository.findById(id);
    if (!customer) {
      throw new NotFoundException('Customer not found');
    }

    await this.customerRepository.update({ id }, { isActive: false });
  }
} 
import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { randomUUID } from 'crypto';
import { CreateCustomerDto } from '@modules/customer/presentation/dto/createCustomer.dto';
import { UpdateCustomerDto } from '@modules/customer/presentation/dto/updateCustomer.dto';
import { PrismaService } from '@modules/prisma/prisma.service';

@Injectable()
export class CustomerService {
  constructor(
    private readonly prisma: PrismaService,
  ) { }

  async create(createCustomerDto: CreateCustomerDto) {
    // Check if customer with same email already exists
    if (createCustomerDto.email) {
      const existingCustomer = await this.prisma.customer.findUnique({
        where: { email: createCustomerDto.email },
      });
      if (existingCustomer) {
        throw new ConflictException('Customer with this email already exists');
      }
    }

    const customer = await this.prisma.customer.create({
      data: {
        id: randomUUID(),
        firstName: createCustomerDto.firstName,
        lastName: createCustomerDto.lastName,
        email: createCustomerDto.email || '',
        phone: createCustomerDto.phone,
        address: createCustomerDto.address,
        city: createCustomerDto.city,
        state: createCustomerDto.state,
        zipCode: createCustomerDto.zipCode,
        isActive: createCustomerDto.isActive ?? true,
      },
    });

    return customer;
  }

  async findAll(filters?: {
    search?: string;
    isActive?: boolean;
  }) {
    return this.prisma.customer.findMany({
      where: filters,
    });
  }

  async findOne(id: string) {
    const customer = await this.prisma.customer.findUnique({
      where: { id },
    });
    if (!customer) {
      throw new NotFoundException('Customer not found');
    }
    return customer;
  }

  async update(
    id: string,
    updateCustomerDto: UpdateCustomerDto,
  ) {
    const customer = await this.prisma.customer.findUnique({
      where: { id },
    });
    if (!customer) {
      throw new NotFoundException('Customer not found');
    }

    // Check if email is being updated and if it already exists
    if (updateCustomerDto.email && updateCustomerDto.email !== customer.email) {
      const existingCustomer = await this.prisma.customer.findUnique({
        where: { email: updateCustomerDto.email },
      });
      if (existingCustomer) {
        throw new ConflictException('Customer with this email already exists');
      }
    }

    const updatedCustomer = await this.prisma.customer.update({
      where: { id },
      data: updateCustomerDto,
    });
    return updatedCustomer;
  }

  async remove(id: string): Promise<void> {
    const customer = await this.prisma.customer.findUnique({
      where: { id },
    });
    if (!customer) {
      throw new NotFoundException('Customer not found');
    }

    await this.prisma.customer.update({
      where: { id },
      data: { isActive: false },
    });
  }
}

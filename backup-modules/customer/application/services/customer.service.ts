import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { PrismaService } from '@shared/infra/prisma/prisma.service';
import { CreateCustomerDto } from '@modules/customer/presentation/dto/createCustomer.dto';
import { UpdateCustomerDto } from '@modules/customer/presentation/dto/updateCustomer.dto';

@Injectable()
export class CustomerService {
  constructor(private readonly prisma: PrismaService) { }

  async createCustomer(createCustomerDto: CreateCustomerDto) {
    // Check if customer with same email already exists
    if (createCustomerDto.email) {
      const existingCustomer = await this.prisma.customer.findFirst({
        where: { email: createCustomerDto.email }
      });
      if (existingCustomer) {
        throw new ConflictException('Customer with this email already exists');
      }
    }

    const customer = await this.prisma.customer.create({
      data: {
        id: randomUUID(),
        ...createCustomerDto
      }
    });

    return customer;
  }

  async updateCustomer(id: string, payload: UpdateCustomerDto) {
    const customer = await this.prisma.customer.findUnique({ where: { id } });
    if (!customer) {
      throw new NotFoundException('Customer not found');
    }

    // Check if email is being updated and if it already exists
    if (payload.email && payload.email !== customer.email) {
      const existingCustomer = await this.prisma.customer.findFirst({
        where: { email: payload.email }
      });
      if (existingCustomer) {
        throw new ConflictException('Customer with this email already exists');
      }
    }

    const updatedCustomer = await this.prisma.customer.update({
      where: { id },
      data: payload
    });

    return updatedCustomer;
  }

  async findById(id: string) {
    return this.prisma.customer.findUnique({ where: { id } });
  }

  async deleteCustomer(id: string): Promise<void> {
    const customer = await this.prisma.customer.findUnique({ where: { id } });
    if (!customer) {
      throw new NotFoundException('Customer not found');
    }

    await this.prisma.customer.delete({ where: { id } });
  }

  async findByStore(storeId: string) {
    return this.prisma.customer.findMany({
      where: { storeId }
    });
  }
} 
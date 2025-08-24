import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { CustomerService } from '@modules/customer/application/services/customer.service';
import { CreateCustomerDto } from '@modules/customer/presentation/dto/createCustomer.dto';
import { UpdateCustomerDto } from '@modules/customer/presentation/dto/updateCustomer.dto';
import { JwtAuthGuard } from '@shared/presentation/http/guards/jwt-auth.guard';

@Controller('customers')
@UseGuards(JwtAuthGuard)
export class CustomerController {
  constructor(private readonly customerService: CustomerService) { }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createCustomer(@Body() createCustomerDto: CreateCustomerDto) {
    return this.customerService.createCustomer(createCustomerDto);
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    return this.customerService.findById(id);
  }

  @Put(':id')
  async updateCustomer(
    @Param('id') id: string,
    @Body() updateCustomerDto: UpdateCustomerDto,
  ) {
    return this.customerService.updateCustomer(id, updateCustomerDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteCustomer(@Param('id') id: string) {
    return this.customerService.deleteCustomer(id);
  }

  @Get('store/:storeId')
  async findByStore(@Param('storeId') storeId: string) {
    return this.customerService.findByStore(storeId);
  }
} 
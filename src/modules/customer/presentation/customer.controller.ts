import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { CustomerService } from '../application/customer.service';

@Controller('customers')
export class CustomerController {
  constructor(private readonly customerService: CustomerService) { }

  @Get()
  async findAll(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '20',
    @Query('search') search?: string,
    @Query('isActive') isActive?: string,
    @Query('city') city?: string,
    @Query('state') state?: string,
    @Query('hasEmail') hasEmail?: string,
    @Query('hasPhone') hasPhone?: string,
  ) {
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);

    const filters = {
      search,
      isActive: isActive !== undefined ? isActive === 'true' : undefined,
      city,
      state,
      hasEmail: hasEmail !== undefined ? hasEmail === 'true' : undefined,
      hasPhone: hasPhone !== undefined ? hasPhone === 'true' : undefined,
    };

    return this.customerService.findAll(pageNum, limitNum, filters);
  }

  @Get('statistics')
  async getStatistics() {
    return this.customerService.getStatistics();
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    return this.customerService.findById(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createCustomerDto: any) {
    return this.customerService.create(createCustomerDto);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateCustomerDto: any,
  ) {
    return this.customerService.update(id, updateCustomerDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('id') id: string) {
    return this.customerService.delete(id);
  }

  @Post(':id/activate')
  async activate(@Param('id') id: string) {
    return this.customerService.activate(id);
  }

  @Post(':id/deactivate')
  async deactivate(@Param('id') id: string) {
    return this.customerService.deactivate(id);
  }

  @Get(':id/orders')
  async getCustomerOrders(
    @Param('id') id: string,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
  ) {
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    return this.customerService.getCustomerOrders(id, pageNum, limitNum);
  }
}

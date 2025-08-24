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
import { OrderService } from '@modules/order/application/services/order.service';
import { CreateOrderDto } from '@modules/order/presentation/dto/createOrder.dto';
import { UpdateOrderDto } from '@modules/order/presentation/dto/updateOrder.dto';
import { JwtAuthGuard } from '@shared/presentation/http/guards/jwt-auth.guard';

@Controller('orders')
@UseGuards(JwtAuthGuard)
export class OrderController {
  constructor(private readonly orderService: OrderService) { }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createOrder(@Body() createOrderDto: CreateOrderDto) {
    return this.orderService.createOrder(createOrderDto);
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    return this.orderService.findById(id);
  }

  @Put(':id')
  async updateOrder(
    @Param('id') id: string,
    @Body() updateOrderDto: UpdateOrderDto,
  ) {
    return this.orderService.updateOrder(id, updateOrderDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteOrder(@Param('id') id: string) {
    return this.orderService.deleteOrder(id);
  }

  @Get('store/:storeId')
  async findByStore(@Param('storeId') storeId: string) {
    return this.orderService.findByStore(storeId);
  }

  @Get('customer/:customerId')
  async findByCustomer(@Param('customerId') customerId: string) {
    return this.orderService.findByCustomer(customerId);
  }

  @Get('status/:status')
  async findByStatus(@Param('status') status: string) {
    return this.orderService.findByStatus(status);
  }
} 
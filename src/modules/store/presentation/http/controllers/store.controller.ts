import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Put,
  Get,
  Param,
  Delete,
  Patch,
  UseGuards
} from '@nestjs/common';
import {
  CreateStoreDto,
  UpdateStoreDto
} from '@modules/store/presentation/interfaces/store.interface';
import { StoreService } from '@modules/store/application/services/store.service';
// import { JwtAuthGuard } from '@shared/presentation/http/guards/jwt-auth.guard';

@Controller('stores')
// @UseGuards(JwtAuthGuard)
export class StoreController {
  constructor(private readonly storeService: StoreService) { }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() payload: CreateStoreDto) {
    return this.storeService.createStore(payload);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  async findAll() {
    const stores = await this.storeService.findAll();
    return {
      stores,
      total: stores.length,
      page: 1,
      limit: stores.length,
      totalPages: 1
    };
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  findById(@Param('id') id: string) {
    return this.storeService.findById(id);
  }

  @Put(':id')
  @HttpCode(HttpStatus.OK)
  update(@Param('id') id: string, @Body() payload: UpdateStoreDto) {
    return this.storeService.updateStore(id, payload);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  delete(@Param('id') id: string) {
    return this.storeService.deleteStore(id);
  }

  @Patch(':id/activate')
  @HttpCode(HttpStatus.OK)
  activate(@Param('id') id: string) {
    return this.storeService.updateStore(id, { isActive: true });
  }

  @Patch(':id/deactivate')
  @HttpCode(HttpStatus.OK)
  deactivate(@Param('id') id: string) {
    return this.storeService.updateStore(id, { isActive: false });
  }
} 
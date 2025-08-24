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
  UseGuards
} from '@nestjs/common';
import {
  CreateStoreDto,
  IStoreService,
  UpdateStoreDto
} from '@modules/store/presentation/interfaces/store.interface';
import { JwtAuthGuard } from '@shared/presentation/http/guards/jwt-auth.guard';

@Controller('api/v1/stores')
@UseGuards(JwtAuthGuard)
export class StoreController {
  constructor(private readonly storeService: IStoreService) { }

  @Post('create')
  @HttpCode(HttpStatus.CREATED)
  create(@Body() payload: CreateStoreDto) {
    return this.storeService.createStore(payload);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  findAll() {
    return this.storeService.findAll();
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
} 
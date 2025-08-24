import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { StoreService } from '@modules/store/application/services/store.service';
import { CreateStoreDto } from '@modules/store/presentation/dto/createStore.dto';
import { UpdateStoreDto } from '@modules/store/presentation/dto/updateStore.dto';
import { JwtAuthGuard } from '@shared/presentation/http/guards/jwt-auth.guard';

@Controller('api/v1/stores')
@UseGuards(JwtAuthGuard)
export class StoreController {
  constructor(private readonly storeService: StoreService) { }

  @Post()
  create(@Body() createStoreDto: CreateStoreDto) {
    return this.storeService.createStore(createStoreDto);
  }

  @Get()
  findAll(
    @Query('search') search?: string,
    @Query('isActive') isActive?: boolean,
  ) {
    return this.storeService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.storeService.findById(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateStoreDto: UpdateStoreDto) {
    return this.storeService.updateStore(id, updateStoreDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.storeService.deleteStore(id);
  }
}

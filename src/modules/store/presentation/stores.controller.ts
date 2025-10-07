import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Patch,
  Body,
  Param,
  Query,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { StoresService } from '../application/stores.service';

@Controller('stores')
export class StoresController {
  constructor(private readonly storesService: StoresService) { }

  @Get()
  async findAll(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '20',
    @Query('search') search?: string,
    @Query('status') status?: string,
    @Query('type') type?: string,
    @Query('city') city?: string,
    @Query('state') state?: string,
  ) {
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);

    const filters = {
      search,
      status,
      type,
      city,
      state,
    };

    return this.storesService.findAll(pageNum, limitNum, filters);
  }

  @Get('statistics')
  async getStatistics() {
    return this.storesService.getStatistics();
  }

  @Get('by-city/:city')
  async findByCity(@Param('city') city: string) {
    return this.storesService.findByCity(city);
  }

  @Get('by-state/:state')
  async findByState(@Param('state') state: string) {
    return this.storesService.findByState(state);
  }

  @Get('by-type/:type')
  async findByType(@Param('type') type: string) {
    return this.storesService.findByType(type);
  }

  @Get('by-manager/:managerId')
  async findByManager(@Param('managerId') managerId: string) {
    return this.storesService.findByManager(managerId);
  }

  @Get('nearby')
  async findNearby(
    @Query('lat') latitude: string,
    @Query('lng') longitude: string,
    @Query('radius') radius: string = '10',
  ) {
    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);
    const radiusKm = parseFloat(radius);

    return this.storesService.findNearby(lat, lng, radiusKm);
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    return this.storesService.findById(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createStoreDto: any) {
    return this.storesService.create(createStoreDto);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateStoreDto: any,
  ) {
    return this.storesService.update(id, updateStoreDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('id') id: string) {
    return this.storesService.delete(id);
  }

  @Patch(':id/activate')
  async activate(@Param('id') id: string) {
    return this.storesService.activate(id);
  }

  @Patch(':id/deactivate')
  async deactivate(@Param('id') id: string) {
    return this.storesService.deactivate(id);
  }

  @Patch(':id/maintenance')
  async putInMaintenance(
    @Param('id') id: string,
    @Body() body: { reason?: string },
  ) {
    return this.storesService.putInMaintenance(id, body.reason);
  }
}

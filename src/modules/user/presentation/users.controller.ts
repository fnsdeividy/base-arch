import { Controller, Get, Post, Body, Param, Put, Delete, Patch, HttpCode, HttpStatus } from '@nestjs/common';
import { UsersService } from '../application/users.service';
import { CreateUserDto, UpdateUserDto } from '../presentation/interfaces/user.interface';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  @Get()
  async findAll() {
    const users = await this.usersService.findAll();
    return {
      users,
      total: users.length,
      page: 1,
      limit: users.length,
      totalPages: 1
    };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Post()
  async create(@Body() data: CreateUserDto) {
    return this.usersService.create(data);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() data: UpdateUserDto) {
    return this.usersService.update(id, data);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }

  @Patch(':id/activate')
  @HttpCode(HttpStatus.OK)
  async activate(@Param('id') id: string) {
    return this.usersService.update(id, { isActive: true });
  }

  @Patch(':id/deactivate')
  @HttpCode(HttpStatus.OK)
  async deactivate(@Param('id') id: string) {
    return this.usersService.update(id, { isActive: false });
  }
}



import { Controller, Get, Post, Body, Patch, Param, Delete, Put, HttpCode, HttpStatus } from '@nestjs/common';
import { UsersService } from '../application/users.service';
import { CreateUserDto, UpdateUserDto } from './interfaces/user.interface';
import { Public } from '../../../shared/decorators/public.decorator';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }

  @Put(':id')
  updatePut(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }

  // Rota temporária para atualizar senhas em texto plano para hash
  @Public()
  @Post('update-plaintext-passwords')
  @HttpCode(HttpStatus.OK)
  async updatePlaintextPasswords() {
    if (process.env.NODE_ENV !== 'development') {
      return { error: 'Rota disponível apenas em ambiente de desenvolvimento' };
    }
    return this.usersService.updatePlaintextPasswords();
  }
}
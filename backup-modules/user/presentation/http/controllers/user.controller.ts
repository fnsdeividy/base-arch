import { Controller, Post, Body, HttpCode, HttpStatus, Request, Put, Get, Param, Delete, UseGuards } from '@nestjs/common';
import { AuthenticatedRequest, CreateUserDto, IUserService } from '@modules/user/presentation/interfaces/user.interface';
import { UpdateUserDto } from '@modules/user/presentation/dto/updateUser.dto';
import { JwtAuthGuard } from '@shared/presentation/http/guards/jwt-auth.guard';




@Controller('api/v1/users')
export class UserController {
  constructor(private readonly userService: IUserService) { }

  @Post('create')
  @HttpCode(HttpStatus.CREATED)
  create(@Body() payload: CreateUserDto) {
    return this.userService.createUser(payload);
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  getProfile(@Request() req: AuthenticatedRequest) {
    return this.userService.findById(req.user.userId);
  }

  @Put('update')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  update(@Request() req: AuthenticatedRequest, @Body() payload: UpdateUserDto) {
    return this.userService.updateUser(req.user.userId, payload);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  findById(@Param('id') id: string) {
    return this.userService.findById(id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  delete(@Param('id') id: string) {
    return this.userService.deleteUser(id);
  }
}
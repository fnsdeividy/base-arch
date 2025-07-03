import { Controller, Post, Body, HttpCode, HttpStatus, Request, Put } from '@nestjs/common';
import { AuthenticatedRequest, CreateUserDto, IUserService } from '@modules/user/presentation/interfaces/user.interface';
import { UpdateUserDto } from '../../dto/updateUser.dto';




@Controller('api/v1/users')
export class UserController {
  constructor(private readonly userService: IUserService) { }

  @Post('create')
  @HttpCode(HttpStatus.CREATED)
  create(@Body() payload: CreateUserDto) {
    return this.userService.createUser(payload);
  }

  @Put('update')
  @HttpCode(HttpStatus.OK)
  update(@Request() req: AuthenticatedRequest, @Body() payload: UpdateUserDto) {
    return this.userService.updateUser(req.user.userId, payload);
  }

}
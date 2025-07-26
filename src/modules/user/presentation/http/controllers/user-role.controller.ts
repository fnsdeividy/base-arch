import { Controller, Post, Delete, Get, Param, Body, UseGuards } from '@nestjs/common';
import { UserRoleService } from '../../../application/services/user-role.service';
import { JwtAuthGuard } from '@shared/presentation/http/guards/jwt-auth.guard';
import { RolesGuard } from '@shared/presentation/http/guards/roles.guard';
import { Roles } from '@shared/presentation/http/decorators/roles.decorator';

@Controller('users/:userId/roles')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UserRoleController {
  constructor(private readonly userRoleService: UserRoleService) { }

  @Post(':roleId')
  @Roles('super-admin', 'admin')
  assignRoleToUser(
    @Param('userId') userId: string,
    @Param('roleId') roleId: string,
  ) {
    return this.userRoleService.assignRoleToUser(userId, roleId);
  }

  @Delete(':roleId')
  @Roles('super-admin', 'admin')
  removeRoleFromUser(
    @Param('userId') userId: string,
    @Param('roleId') roleId: string,
  ) {
    return this.userRoleService.removeRoleFromUser(userId, roleId);
  }

  @Get()
  @Roles('super-admin', 'admin')
  getUserRoles(@Param('userId') userId: string) {
    return this.userRoleService.getUserRoles(userId);
  }

  @Post('batch')
  @Roles('super-admin', 'admin')
  setUserRoles(
    @Param('userId') userId: string,
    @Body() body: { roleIds: string[] },
  ) {
    return this.userRoleService.setUserRoles(userId, body.roleIds);
  }
} 
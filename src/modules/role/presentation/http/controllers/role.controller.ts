import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { RoleService } from '@modules/role/application/services/role.service';
import { CreateRoleDto } from '@modules/role/presentation/dto/createRole.dto';
import { UpdateRoleDto } from '@modules/role/presentation/dto/updateRole.dto';
import { JwtAuthGuard } from '@shared/presentation/http/guards/jwt-auth.guard';
import { RolesGuard } from '@shared/presentation/http/guards/roles.guard';
import { Roles } from '@shared/presentation/http/decorators/roles.decorator';

@Controller('roles')
@UseGuards(JwtAuthGuard, RolesGuard)
export class RoleController {
  constructor(private readonly roleService: RoleService) { }

  @Post()
  @Roles('super-admin', 'admin')
  create(@Body() createRoleDto: CreateRoleDto) {
    return this.roleService.create(createRoleDto);
  }

  @Get()
  @Roles('super-admin', 'admin')
  findAll() {
    return this.roleService.findAll();
  }

  @Get('system')
  @Roles('super-admin', 'admin')
  findSystemRoles() {
    return this.roleService.findSystemRoles();
  }

  @Get(':id')
  @Roles('super-admin', 'admin')
  findOne(@Param('id') id: string) {
    return this.roleService.findOne(id);
  }

  @Get(':id/permissions')
  @Roles('super-admin', 'admin')
  findWithPermissions(@Param('id') id: string) {
    return this.roleService.findWithPermissions(id);
  }

  @Patch(':id')
  @Roles('super-admin', 'admin')
  update(@Param('id') id: string, @Body() updateRoleDto: UpdateRoleDto) {
    return this.roleService.update(id, updateRoleDto);
  }

  @Delete(':id')
  @Roles('super-admin')
  remove(@Param('id') id: string) {
    return this.roleService.remove(id);
  }
} 
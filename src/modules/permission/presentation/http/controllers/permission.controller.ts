import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { PermissionService } from '@modules/permission/application/services/permission.service';
import { CreatePermissionDto } from '@modules/permission/presentation/dto/createPermission.dto';
import { UpdatePermissionDto } from '@modules/permission/presentation/dto/updatePermission.dto';
import { JwtAuthGuard } from '@shared/presentation/http/guards/jwt-auth.guard';
import { RolesGuard } from '@shared/presentation/http/guards/roles.guard';
import { Roles } from '@shared/presentation/http/decorators/roles.decorator';

@Controller('permissions')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PermissionController {
  constructor(private readonly permissionService: PermissionService) { }

  @Post()
  @Roles('super-admin')
  create(@Body() createPermissionDto: CreatePermissionDto) {
    return this.permissionService.create(createPermissionDto);
  }

  @Get()
  @Roles('super-admin', 'admin')
  findAll() {
    return this.permissionService.findAll();
  }

  @Get('resource/:resource')
  @Roles('super-admin', 'admin')
  findByResource(@Param('resource') resource: string) {
    return this.permissionService.findByResource(resource);
  }

  @Get('check')
  @Roles('super-admin', 'admin')
  findByResourceAndAction(
    @Query('resource') resource: string,
    @Query('action') action: string
  ) {
    return this.permissionService.findByResourceAndAction(resource, action);
  }

  @Get(':id')
  @Roles('super-admin', 'admin')
  findOne(@Param('id') id: string) {
    return this.permissionService.findOne(id);
  }

  @Patch(':id')
  @Roles('super-admin')
  update(@Param('id') id: string, @Body() updatePermissionDto: UpdatePermissionDto) {
    return this.permissionService.update(id, updatePermissionDto);
  }

  @Delete(':id')
  @Roles('super-admin')
  remove(@Param('id') id: string) {
    return this.permissionService.remove(id);
  }
} 
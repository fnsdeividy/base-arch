import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RoleService } from '@modules/role/application/services/role.service';
import { RoleController } from '@modules/role/presentation/http/controllers/role.controller';
import { RoleRepository } from '@modules/role/infra/repositories/role.repository';
import { Role } from '@modules/role/entities/role.entity';
import { Permission } from '@modules/permission/entities/permission.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Role, Permission])],
  controllers: [RoleController],
  providers: [RoleService, RoleRepository],
  exports: [RoleService, RoleRepository],
})
export class RoleModule { } 
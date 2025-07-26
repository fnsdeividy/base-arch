import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PermissionRepository } from '@modules/permission/infra/repositories/permission.repository';
import { Permission } from '@modules/permission/entities/permission.entity';
import { CreatePermissionDto } from '@modules/permission/presentation/dto/createPermission.dto';
import { UpdatePermissionDto } from '@modules/permission/presentation/dto/updatePermission.dto';

@Injectable()
export class PermissionService {
  constructor(private readonly permissionRepository: PermissionRepository) { }

  async create(createPermissionDto: CreatePermissionDto): Promise<Permission> {
    const existingPermission = await this.permissionRepository.findByName(createPermissionDto.name);
    if (existingPermission) {
      throw new ConflictException('Permission with this name already exists');
    }

    return await this.permissionRepository.create(createPermissionDto);

  }

  async findAll(): Promise<Permission[]> {
    return await this.permissionRepository.list();
  }

  async findOne(id: string): Promise<Permission> {
    const permission = await this.permissionRepository.findBy('id', id);
    if (!permission) {
      throw new NotFoundException('Permission not found');
    }
    return permission;
  }

  async update(id: string, updatePermissionDto: UpdatePermissionDto): Promise<Permission> {
    const permission = await this.findOne(id);

    if (updatePermissionDto.name && updatePermissionDto.name !== permission.name) {
      const existingPermission = await this.permissionRepository.findByName(updatePermissionDto.name);
      if (existingPermission) {
        throw new ConflictException('Permission with this name already exists');
      }
    }

    Object.assign(permission, updatePermissionDto);
    await this.permissionRepository.update({ id: permission.id }, updatePermissionDto);

    return permission;
  }

  async remove(id: string): Promise<void> {
    const permission = await this.findOne(id);
    await this.permissionRepository.delete(permission);
  }

  async findByResource(resource: string): Promise<Permission[]> {
    return this.permissionRepository.findByResource(resource);
  }

  async findByResourceAndAction(resource: string, action: string): Promise<Permission | null> {
    return this.permissionRepository.findByResourceAndAction(resource, action);
  }
} 
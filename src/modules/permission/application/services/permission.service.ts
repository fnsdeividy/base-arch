import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PermissionRepository } from '../../infra/repositories/permission.repository';
import { Permission } from '../../entities/permission.entity';
import { CreatePermissionDto } from '../../presentation/dto/createPermission.dto';
import { UpdatePermissionDto } from '../../presentation/dto/updatePermission.dto';

@Injectable()
export class PermissionService {
  constructor(private readonly permissionRepository: PermissionRepository) { }

  async create(createPermissionDto: CreatePermissionDto): Promise<Permission> {
    const existingPermission = await this.permissionRepository.findByName(createPermissionDto.name);
    if (existingPermission) {
      throw new ConflictException('Permission with this name already exists');
    }

    const permission = this.permissionRepository.create(createPermissionDto);
    return this.permissionRepository.save(permission);
  }

  async findAll(): Promise<Permission[]> {
    return this.permissionRepository.find();
  }

  async findOne(id: string): Promise<Permission> {
    const permission = await this.permissionRepository.findOne(id);
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
    return this.permissionRepository.save(permission);
  }

  async remove(id: string): Promise<void> {
    const permission = await this.findOne(id);
    await this.permissionRepository.remove(permission);
  }

  async findByResource(resource: string): Promise<Permission[]> {
    return this.permissionRepository.findByResource(resource);
  }

  async findByResourceAndAction(resource: string, action: string): Promise<Permission | null> {
    return this.permissionRepository.findByResourceAndAction(resource, action);
  }
} 
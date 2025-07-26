import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { RoleRepository } from '@modules/role/infra/repositories/role.repository';
import { Role } from '@modules/role/entities/role.entity';
import { CreateRoleDto } from '@modules/role/presentation/dto/createRole.dto';
import { UpdateRoleDto } from '@modules/role/presentation/dto/updateRole.dto';

@Injectable()
export class RoleService {
  constructor(private readonly roleRepository: RoleRepository) { }

  async create(createRoleDto: CreateRoleDto): Promise<Role> {
    const existingRole = await this.roleRepository.findByName(createRoleDto.name);
    if (existingRole) {
      throw new ConflictException('Role with this name already exists');
    }

    return this.roleRepository.create(createRoleDto);

  }

  async findAll(): Promise<Role[]> {
    return this.roleRepository.list();
  }

  async findOne(id: string): Promise<Role> {
    const role = await this.roleRepository.findBy('id', id);
    if (!role) {
      throw new NotFoundException('Role not found');
    }
    return role;
  }

  async findWithPermissions(id: string): Promise<Role> {
    const role = await this.roleRepository.findWithPermissions(id);
    if (!role) {
      throw new NotFoundException('Role not found');
    }
    return role;
  }

  async update(id: string, updateRoleDto: UpdateRoleDto): Promise<Role> {
    const role = await this.findOne(id);

    if (updateRoleDto.name && updateRoleDto.name !== role.name) {
      const existingRole = await this.roleRepository.findByName(updateRoleDto.name);
      if (existingRole) {
        throw new ConflictException('Role with this name already exists');
      }
    }

    Object.assign(role, updateRoleDto);
    await this.roleRepository.update({ id: role.id }, updateRoleDto);
    return role;
  }

  async remove(id: string): Promise<void> {
    const role = await this.findOne(id);

    if (role.isSystem) {
      throw new ConflictException('Cannot delete system roles');
    }

    await this.roleRepository.delete(role);
  }

  async findSystemRoles(): Promise<Role[]> {
    return this.roleRepository.findSystemRoles();
  }
} 
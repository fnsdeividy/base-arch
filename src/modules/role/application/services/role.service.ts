import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { RoleRepository } from '../../infra/repositories/role.repository';
import { Role } from '../../entities/role.entity';
import { CreateRoleDto } from '../../presentation/dto/createRole.dto';
import { UpdateRoleDto } from '../../presentation/dto/updateRole.dto';

@Injectable()
export class RoleService {
  constructor(private readonly roleRepository: RoleRepository) { }

  async create(createRoleDto: CreateRoleDto): Promise<Role> {
    const existingRole = await this.roleRepository.findByName(createRoleDto.name);
    if (existingRole) {
      throw new ConflictException('Role with this name already exists');
    }

    const role = this.roleRepository.create(createRoleDto);
    return this.roleRepository.save(role);
  }

  async findAll(): Promise<Role[]> {
    return this.roleRepository.find();
  }

  async findOne(id: string): Promise<Role> {
    const role = await this.roleRepository.findOne(id);
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
    return this.roleRepository.save(role);
  }

  async remove(id: string): Promise<void> {
    const role = await this.findOne(id);

    if (role.isSystem) {
      throw new ConflictException('Cannot delete system roles');
    }

    await this.roleRepository.remove(role);
  }

  async findSystemRoles(): Promise<Role[]> {
    return this.roleRepository.findSystemRoles();
  }
} 
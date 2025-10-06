import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../entities/user.entity';
import { Role } from '../../role/entities/role.entity';

@Injectable()
export class UserRoleService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
  ) { }

  async assignRoleToUser(userId: string, roleId: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['roles']
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const role = await this.roleRepository.findOne({
      where: { id: roleId }
    });

    if (!role) {
      throw new NotFoundException('Role not found');
    }

    // Check if user already has this role
    const hasRole = user.roles.some(userRole => userRole.id === roleId);
    if (hasRole) {
      throw new ConflictException('User already has this role');
    }

    user.roles.push(role);
    return this.userRepository.save(user);
  }

  async removeRoleFromUser(userId: string, roleId: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['roles']
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const role = await this.roleRepository.findOne({
      where: { id: roleId }
    });

    if (!role) {
      throw new NotFoundException('Role not found');
    }

    // Check if role is system role and user is trying to remove it
    if (role.isSystem) {
      throw new ConflictException('Cannot remove system roles');
    }

    user.roles = user.roles.filter(userRole => userRole.id !== roleId);
    return this.userRepository.save(user);
  }

  async getUserRoles(userId: string): Promise<Role[]> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['roles']
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user.roles;
  }

  async setUserRoles(userId: string, roleIds: string[]): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['roles']
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const roles = await this.roleRepository.findByIds(roleIds);
    if (roles.length !== roleIds.length) {
      throw new NotFoundException('One or more roles not found');
    }

    user.roles = roles;
    return this.userRepository.save(user);
  }
} 
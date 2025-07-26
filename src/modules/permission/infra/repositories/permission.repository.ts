import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Permission } from '../../entities/permission.entity';
import { BaseRepository } from '../../../shared/infra/repository/baseRepository';

@Injectable()
export class PermissionRepository extends BaseRepository<Permission> {
  constructor(
    @InjectRepository(Permission)
    private readonly permissionRepository: Repository<Permission>,
  ) {
    super(permissionRepository);
  }

  async findByName(name: string): Promise<Permission | null> {
    return this.permissionRepository.findOne({ where: { name } });
  }

  async findByResourceAndAction(resource: string, action: string): Promise<Permission | null> {
    return this.permissionRepository.findOne({
      where: { resource, action }
    });
  }

  async findByResource(resource: string): Promise<Permission[]> {
    return this.permissionRepository.find({ where: { resource } });
  }
} 
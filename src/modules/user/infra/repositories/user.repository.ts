import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { User } from '@modules/user/entities/user.entity';
import { IUserRepository } from '@modules/user/presentation/interfaces/user.interface';

@Injectable()
export class UserRepository implements IUserRepository {
  constructor(private readonly repository: Repository<User>) { }

  async create(data: Partial<User>): Promise<User> {
    const user = this.repository.create(data);
    return await this.repository.save(user);
  }

  async findById(id: string): Promise<User | null> {
    return await this.repository.findOne({ where: { id } });
  }

  async findByEmail(email: string): Promise<User | null> {
    return await this.repository.findOne({ where: { email } });
  }

  async findBy(field: keyof User, value: any): Promise<User | null> {
    return await this.repository.findOne({ where: { [field]: value } as any });
  }

  async update(criteria: Partial<User>, data: Partial<User>): Promise<void> {
    await this.repository.update(criteria, data);
  }

  async delete(criteria: Partial<User>): Promise<void> {
    await this.repository.delete(criteria);
  }

  async findAll(): Promise<User[]> {
    return await this.repository.find();
  }
}

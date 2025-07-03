import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { User } from '@modules/user/domain/entities/user.model';
import {
  IUserRepository,
} from '@modules/user/presentation/interfaces/user.interface';
import { BaseRepository } from '@shared/infra/repository/baseRepository';

@Injectable()
export class UserRepository extends BaseRepository<User> implements IUserRepository {
  constructor(
    private readonly userRepository: Repository<User>
  ) {
    super(userRepository);

  }

  async findByEmail(email: string): Promise<User | null> {

    const result = await this.findBy('email', email);
    return result || null;
  }

  async findById(id: string): Promise<User | null> {
    const result = await this.findBy('id', Number(id));
    return result || null;
  }


}

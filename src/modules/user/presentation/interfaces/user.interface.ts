import { User } from '@modules/user/entities/user.entity';
import { CreateUserDto } from '@modules/user/presentation/dto/createUser.dto';
import { UpdateUserDto } from '@modules/user/presentation/dto/updateUser.dto';
import { Request } from 'express';

export { CreateUserDto, UpdateUserDto };

export const USER_REPOSITORY = 'USER_REPOSITORY';

export interface IUserRepository {
  create(data: Partial<User>): Promise<User>;
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  findBy(field: keyof User, value: any): Promise<User | null>;
  update(criteria: Partial<User>, data: Partial<User>): Promise<void>;
  delete(criteria: Partial<User>): Promise<void>;
  findAll(): Promise<User[]>;
}

export interface IUserService {
  createUser(createUserDto: CreateUserDto): Promise<Omit<User, 'password'>>;
  updateUser(id: string, updateUserDto: UpdateUserDto): Promise<User | null>;
  findById(id: string): Promise<Omit<User, 'password'> | null>;
  deleteUser(id: string): Promise<void>;
}

export interface AuthenticatedRequest extends Request {
  user: {
    userId: string;
    email: string;
  };
}

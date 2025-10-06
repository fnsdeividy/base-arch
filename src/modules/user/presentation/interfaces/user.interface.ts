import { User } from '../../entities/user.entity';
import { Request } from 'express';

export interface IUserService {
  findAll(): Promise<User[]>;
  findOne(id: string): Promise<User>;
  create(data: CreateUserDto): Promise<User>;
  update(id: string, data: UpdateUserDto): Promise<User>;
  remove(id: string): Promise<void>;
}

export interface CreateUserDto {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role?: string;
  storeId?: string;
}

export interface UpdateUserDto {
  email?: string;
  password?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  role?: string;
  storeId?: string;
  isActive?: boolean;
}

export interface AuthenticatedRequest extends Request {
  user?: User;
}
import { User } from '../../domain/user.model';

export interface IUser {
  id: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateUserDto {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
}

export interface IUserRepository {
  findByEmail(email: string): Promise<User | null>;
  findById(id: string): Promise<User | null>;
  create(userData: CreateUserDto): Promise<User>;
  update(id: string, userData: Partial<CreateUserDto>): Promise<User | null>;
  delete(id: string): Promise<boolean>;
}

export const USER_REPOSITORY = 'USER_REPOSITORY';

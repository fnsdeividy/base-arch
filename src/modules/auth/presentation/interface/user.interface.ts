import { IBaseRepository } from '@shared/presentation/interface/baseRepository';
import { User } from '@modules/auth/domain/user.model';

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

export interface IUserRepository extends IBaseRepository<User> {
  findByEmail(email: string): Promise<User | null>;
  findById(id: string): Promise<User | null>;
}

export interface CreateUserDto {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
}


export const USER_REPOSITORY = 'USER_REPOSITORY';

import { IBaseRepository } from '@shared/presentation/interfaces/baseRepository';
import { User } from '@modules/user/entities/user.entity';
import { UpdateUserDto } from '@modules/user/presentation/dto/updateUser.dto';

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

export interface IUserService {
  createUser(createUserDto: CreateUserDto): Promise<User>
  updateUser(id: string, payload: UpdateUserDto): Promise<User | null>

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

export interface AuthenticatedRequest extends Request {
  user: { userId: string },
}


export const USER_REPOSITORY = 'USER_REPOSITORY';

import {
  Injectable,
  Inject,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto, IUserRepository, IUserService, USER_REPOSITORY } from '@modules/user/presentation/interfaces/user.interface';
import { UpdateUserDto } from '@modules/user/presentation/dto/updateUser.dto';
import { User } from '@modules/user/entities/user.entity';
import { HashService } from '@shared/application/services/hash.service';
import { randomUUID } from 'crypto';

@Injectable()
export class UserService implements IUserService {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
    private readonly hashService: HashService,
  ) { }

  async createUser(createUserDto: CreateUserDto): Promise<User> {
    const existingUser = await this.userRepository.findByEmail(createUserDto.email);
    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    const hashedPassword = await this.hashService.hash(createUserDto.password);

    const user = await this.userRepository.create({
      id: randomUUID(),
      ...createUserDto,
      password: hashedPassword,
    });

    const userResponse = { ...user };
    delete userResponse.password;
    return userResponse;
  }

  async updateUser(id: string, payload: UpdateUserDto): Promise<User | null> {
    const existingUser = await this.userRepository.findById(id);
    if (!existingUser) {
      throw new NotFoundException('User not found');
    }

    if (payload.email && payload.email !== existingUser.email) {
      const userWithEmail = await this.userRepository.findByEmail(payload.email);
      if (userWithEmail) {
        throw new ConflictException('Email already exists');
      }
    }

    await this.userRepository.update({ id }, payload);
    const updatedUser = await this.userRepository.findById(id);

    if (updatedUser) {
      const userResponse = { ...updatedUser };
      delete userResponse.password;
      return userResponse;
    }

    return updatedUser;
  }

  async findById(id: string): Promise<User | null> {
    const user = await this.userRepository.findById(id);
    if (user) {
      const userResponse = { ...user };
      delete userResponse.password;
      return userResponse;
    }
    return user;
  }

  async deleteUser(id: string): Promise<void> {
    const existingUser = await this.userRepository.findById(id);
    if (!existingUser) {
      throw new NotFoundException('User not found');
    }

    await this.userRepository.delete({ id });
  }
}

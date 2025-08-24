import { Injectable, NotFoundException, ConflictException, Inject } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { User } from '@modules/user/entities/user.entity';
import { CreateUserDto } from '@modules/user/presentation/dto/createUser.dto';
import { UpdateUserDto } from '@modules/user/presentation/dto/updateUser.dto';
import { IUserService, IUserRepository, USER_REPOSITORY } from '@modules/user/presentation/interfaces/user.interface';
import { HashService } from '@shared/application/services/hash.service';

@Injectable()
export class UserService implements IUserService {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
    private readonly hashService: HashService,
  ) { }

  async createUser(createUserDto: CreateUserDto): Promise<Omit<User, 'password'>> {
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

    const userResponse: Omit<User, 'password'> = { ...user };

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
      return userResponse;
    }

    return updatedUser;
  }

  async findById(id: string): Promise<Omit<User, 'password'> | null> {
    const user = await this.userRepository.findById(id);
    if (user) {
      const userResponse: Omit<User, 'password'> = { ...user };
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

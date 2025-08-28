import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from '@modules/user/presentation/interfaces/user.interface';
import { UpdateUserDto } from '@modules/user/presentation/dto/updateUser.dto';
import { HashService } from '@shared/application/services/hash.service';
import { PrismaService } from '@modules/prisma';

@Injectable()
export class UserService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly hashService: HashService,
  ) {}

  async createUser(createUserDto: CreateUserDto) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: createUserDto.email },
    });

    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    const hashedPassword = await this.hashService.hash(createUserDto.password);

    const user = await this.prisma.user.create({
      data: {
        ...createUserDto,
        password: hashedPassword,
      },
    });

    const { password, ...userResponse } = user;
    return userResponse;
  }

  async updateUser(id: string, payload: UpdateUserDto) {
    const existingUser = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      throw new NotFoundException('User not found');
    }

    if (payload.email && payload.email !== existingUser.email) {
      const userWithEmail = await this.prisma.user.findUnique({
        where: { email: payload.email },
      });
      if (userWithEmail) {
        throw new ConflictException('Email already exists');
      }
    }

    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: payload,
    });

    const { password, ...userResponse } = updatedUser;
    return userResponse;
  }

  async findById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (user) {
      const { password, ...userResponse } = user;
      return userResponse;
    }
    return user;
  }

  async deleteUser(id: string): Promise<void> {
    const existingUser = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      throw new NotFoundException('User not found');
    }

    await this.prisma.user.delete({
      where: { id },
    });
  }
}

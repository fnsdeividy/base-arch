import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { User } from '../entities/user.entity';
import { CreateUserDto, UpdateUserDto } from '../presentation/interfaces/user.interface';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) { }

  async findAll(): Promise<User[]> {
    const users = await this.prisma.user.findMany({
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        isActive: true,
        emailVerified: true,
        createdAt: true,
        updatedAt: true,
      }
    });

    return users.map(user => ({
      ...user,
      name: `${user.firstName} ${user.lastName}`,
      role: 'user', // Valor padrão para compatibilidade com frontend
      storeId: undefined, // Valor padrão para compatibilidade com frontend
      status: user.isActive ? 'active' : 'inactive', // Converter isActive para status
    })) as User[];
  }

  async findOne(id: string): Promise<User> {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        isActive: true,
        emailVerified: true,
        createdAt: true,
        updatedAt: true,
      }
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return {
      ...user,
      name: `${user.firstName} ${user.lastName}`,
      role: 'user', // Valor padrão para compatibilidade com frontend
      storeId: undefined, // Valor padrão para compatibilidade com frontend
      status: user.isActive ? 'active' : 'inactive', // Converter isActive para status
    } as User;
  }

  async create(data: CreateUserDto): Promise<User> {
    // Extrair campos que não existem no modelo User
    const { role, storeId, ...userData } = data;

    const user = await this.prisma.user.create({
      data: {
        ...userData,
        isActive: true,
        emailVerified: false,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        isActive: true,
        emailVerified: true,
        createdAt: true,
        updatedAt: true,
      }
    });

    return {
      ...user,
      name: `${user.firstName} ${user.lastName}`,
      role: role || 'user', // Manter role para compatibilidade com frontend
      storeId: storeId, // Manter storeId para compatibilidade com frontend
      status: user.isActive ? 'active' : 'inactive', // Converter isActive para status
    } as User;
  }

  async update(id: string, data: UpdateUserDto): Promise<User> {
    const user = await this.findOne(id);

    // Extrair campos que não existem no modelo User
    const { role, storeId, ...userData } = data;

    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: userData,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        isActive: true,
        emailVerified: true,
        createdAt: true,
        updatedAt: true,
      }
    });

    return {
      ...updatedUser,
      name: `${updatedUser.firstName} ${updatedUser.lastName}`,
      role: role || 'user', // Manter role para compatibilidade com frontend
      storeId: storeId, // Manter storeId para compatibilidade com frontend
      status: updatedUser.isActive ? 'active' : 'inactive', // Converter isActive para status
    } as User;
  }

  async remove(id: string): Promise<void> {
    await this.findOne(id);
    await this.prisma.user.delete({
      where: { id }
    });
  }
}
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { User } from '../entities/user.entity';
import { CreateUserDto, UpdateUserDto } from '../presentation/interfaces/user.interface';
import * as bcrypt from 'bcryptjs';

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
    const { role, storeId, password, ...userData } = data;

    // Hash da senha antes de salvar
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await this.prisma.user.create({
      data: {
        ...userData,
        password: hashedPassword,
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
    const { role, storeId, password, ...userData } = data;

    // Preparar dados para atualização
    let updateData: any = userData;

    // Se a senha foi fornecida, fazer hash dela
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      updateData = { ...userData, password: hashedPassword };
    }

    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: updateData,
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

  // Método para atualizar senhas em texto plano existentes para hash
  async updatePlaintextPasswords(): Promise<{ updated: number }> {
    // Buscar usuários com senhas em texto plano (não começam com $2b$ ou $2a$)
    const users = await this.prisma.user.findMany({
      where: {
        NOT: {
          OR: [
            { password: { startsWith: '$2b$' } },
            { password: { startsWith: '$2a$' } }
          ]
        }
      },
      select: { id: true, password: true }
    });

    let updatedCount = 0;

    for (const user of users) {
      const hashedPassword = await bcrypt.hash(user.password, 10);
      await this.prisma.user.update({
        where: { id: user.id },
        data: { password: hashedPassword }
      });
      updatedCount++;
    }

    return { updated: updatedCount };
  }
}
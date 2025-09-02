import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../prisma/prisma.service';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) { }

  async validateUser(email: string, password: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    const { password: _, ...result } = user;
    return result;
  }

  async login(email: string, password: string) {
    const user = await this.validateUser(email, password);

    // Get user roles
    const userRoles = await this.prisma.userRole.findMany({
      where: { userId: user.id },
      include: { role: true }
    });

    const roles = userRoles.map(ur => ur.role.name);
    const primaryRole = roles.length > 0 ? roles[0] : 'user';

    const payload = {
      sub: user.id,
      email: user.email,
      roles: roles,
      role: primaryRole,
      name: user.firstName + ' ' + user.lastName
    };

    return {
      user: {
        ...user,
        roles: roles
      },
      access_token: this.jwtService.sign(payload),
    };
  }

  async validateToken(token: string) {
    try {
      const payload = await this.jwtService.verifyAsync(token);

      // Verificar se o usuário ainda existe e está ativo
      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          isActive: true,
        },
      });

      if (!user || !user.isActive) {
        throw new UnauthorizedException('Usuário não encontrado ou inativo');
      }

      // Buscar roles do usuário
      const userRoles = await this.prisma.userRole.findMany({
        where: { userId: user.id },
        include: { role: true }
      });

      const roles = userRoles.map(ur => ur.role.name);
      const primaryRole = roles.length > 0 ? roles[0] : 'user';

      return {
        user: {
          id: user.id,
          email: user.email,
          name: `${user.firstName} ${user.lastName}`,
          role: primaryRole,
          roles: roles,
        }
      };
    } catch {
      throw new UnauthorizedException('Token inválido');
    }
  }
}

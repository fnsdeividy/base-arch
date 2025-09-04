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
    console.log('Tentando autenticar usuário:', email);

    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      console.log('Usuário não encontrado:', email);
      throw new UnauthorizedException('Credenciais inválidas');
    }

    console.log('Usuário encontrado, verificando senha');
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      console.log('Senha inválida para o usuário:', email);
      throw new UnauthorizedException('Credenciais inválidas');
    }

    console.log('Autenticação bem-sucedida para:', email);
    const { password: _, ...result } = user;
    return result;
  }

  async login(email: string, password: string) {
    try {
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

      console.log('Login bem-sucedido. Payload:', { ...payload, sub: '***' });

      const token = this.jwtService.sign(payload);

      return {
        user: {
          id: user.id,
          email: user.email,
          name: `${user.firstName} ${user.lastName}`,
          role: primaryRole,
          roles: roles
        },
        token: token,
      };
    } catch (error) {
      console.error('Erro durante o login:', error);
      throw error;
    }
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
    } catch (error) {
      console.error('Erro na validação do token:', error);
      throw new UnauthorizedException('Token inválido');
    }
  }

  // Método auxiliar para debug
  async checkUserPassword(email: string, password: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        password: true,
      },
    });

    if (!user) {
      return { exists: false };
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    const isHashed = user.password.startsWith('$2b$') || user.password.startsWith('$2a$');

    return {
      exists: true,
      passwordValid: isPasswordValid,
      isHashed: isHashed,
      passwordHash: user.password.substring(0, 10) + '...',
    };
  }
}
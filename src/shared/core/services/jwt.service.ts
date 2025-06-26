import { Injectable } from '@nestjs/common';
import { JwtService as NestJwtService } from '@nestjs/jwt';

export interface TokenPayload {
  userId: string;
  email: string;
  type: 'access' | 'refresh';
}

export interface Tokens {
  accessToken: string;
  refreshToken: string;
}

@Injectable()
export class JwtService {
  constructor(
    private readonly jwtService: NestJwtService,
    private readonly redisService: RedisService,
  ) {}

  async generateTokens(userId: string, email: string): Promise<Tokens> {
    const accessToken = await this.jwtService.sign(
      { userId, email, type: 'access' },
      { expiresIn: '15m' },
    );

    const refreshToken = this.jwtService.sign(
      { userId, email, type: 'refresh' },
      { expiresIn: '7d' },
    );

    return { accessToken, refreshToken };
  }

  async verifyAccessToken(token: string): Promise<TokenPayload | null> {
    try {
      const payload = this.jwtService.verify(token) as TokenPayload;
      return payload.type === 'access' ? payload : null;
    } catch {
      return null;
    }
  }

  async verifyRefreshToken(token: string): Promise<TokenPayload | null> {
    try {
      const payload = this.jwtService.verify(token) as TokenPayload;
      return payload.type === 'refresh' ? payload : null;
    } catch {
      return null;
    }
  }



  async validateSession(
    userId: string,
    refreshToken: string,
  ): Promise<boolean> {
    const storedToken = await this.getSession(userId);
    return storedToken === refreshToken;
  }
}

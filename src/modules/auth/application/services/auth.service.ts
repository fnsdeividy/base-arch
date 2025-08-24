import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  Inject,
} from '@nestjs/common';
import { JwtService } from '@shared/application/services/jwt.service';
import { HashService } from '@shared/application/services/hash.service';
import { IUserRepository, USER_REPOSITORY } from '@modules/user/presentation/interfaces/user.interface';
import { SignInDto } from '@modules/auth/presentation/dto/signin.dto';
import { SignUpDto } from '@modules/auth/presentation/dto/signup.dto';
import { IAuthService } from '@modules/auth/presentation/interfaces/auth.interface';
import { randomUUID } from 'crypto';

@Injectable()
export class AuthService implements IAuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly hashService: HashService,
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
  ) { }

  async signIn(signInDto: SignInDto) {
    const user = await this.userRepository.findByEmail(signInDto.email);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await this.hashService.compare(
      signInDto.password,
      user.password || '',
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const tokens = this.jwtService.generateTokens(user.id.toString(), user.email);

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: {
        id: user.id.toString(),
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
      },
    };
  }

  async signUp(signUpDto: SignUpDto) {
    const existingUser = await this.userRepository.findByEmail(signUpDto.email);

    if (existingUser) {
      throw new ConflictException('User already exists');
    }

    const hashedPassword = await this.hashService.hash(signUpDto.password);

    const user = await this.userRepository.create({
      id: randomUUID(),
      ...signUpDto,
      password: hashedPassword,
    });

    const tokens = this.jwtService.generateTokens(user.id.toString(), user.email);

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: {
        id: user.id.toString(),
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
      },
    };
  }

  signOut(userId: string) {
    return { message: `Successfully signed out ${userId}` };
  }

  async refreshToken(refreshToken: string) {
    const payload = this.jwtService.verifyRefreshToken(refreshToken);

    if (!payload) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const user = await this.userRepository.findBy('id', payload.userId);

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const tokens = this.jwtService.generateTokens(user.id.toString(), user.email);

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    };
  }
}

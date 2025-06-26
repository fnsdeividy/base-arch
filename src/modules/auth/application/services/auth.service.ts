import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '../../../../shared/core/services/jwt.service';
import { HashService } from '../../../../shared/core/services/hash.service';
import { UserRepository } from '../../infra/repositories/user.repository';
import { SignInDto } from '../../presentation/dto/sign-in.dto';
import { SignUpDto } from '../../presentation/dto/sign-up.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly hashService: HashService,
    private readonly userRepository: UserRepository,
  ) {}

  async signIn(signInDto: SignInDto) {
    const user = await this.userRepository.findByEmail(signInDto.email);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await this.hashService.compare(
      signInDto.password,
      user.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const tokens = await this.jwtService.generateTokens(user.id, user.email);

    // Store session in Redis
    //await this.jwtService.storeSession(user.id, tokens.refreshToken);

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: {
        id: user.id,
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
      ...signUpDto,
      password: hashedPassword,
    });

    const tokens = await this.jwtService.generateTokens(user.id, user.email);

    // Store session in Redis
    //await this.jwtService.storeSession(user.id, tokens.refreshToken);

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
      },
    };
  }

  signOut(userId: string) {
    // Remove session from Redis
    // await this.jwtService.removeSession(userId);
    return { message: `Successfully signed out ${userId}` };
  }

  async refreshToken(refreshToken: string) {
    const payload = await this.jwtService.verifyRefreshToken(refreshToken);

    if (!payload) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const user = await this.userRepository.findById(payload.userId);

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const tokens = await this.jwtService.generateTokens(user.id, user.email);

    // Update session in Redis
    //await this.jwtService.storeSession(user.id, tokens  .refreshToken);

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    };
  }
}

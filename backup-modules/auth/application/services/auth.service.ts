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
import { AuthorizationService } from '@shared/application/services/authorization.service';


@Injectable()
export class AuthService implements IAuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly hashService: HashService,
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
    private readonly authorizationService: AuthorizationService,
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

    // Get user roles and permissions
    const userRoles = await this.authorizationService.getUserRoles(user.id);
    const userPermissions = await this.authorizationService.getUserPermissions(user.id);

    const tokens = this.jwtService.generateTokens(user.id.toString(), user.email);

    // Store session in Redis
    //await this.jwtService.storeSession(user.id, tokens.refreshToken);

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: {
        id: user.id.toString(),
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        roles: userRoles.map(role => ({
          id: role.id,
          name: role.name,
          description: role.description
        })),
        permissions: userPermissions.map(permission => ({
          id: permission.id,
          name: permission.name,
          resource: permission.resource,
          action: permission.action
        }))
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

    // Get user roles and permissions
    const userRoles = await this.authorizationService.getUserRoles(user.id);
    const userPermissions = await this.authorizationService.getUserPermissions(user.id);

    const tokens = this.jwtService.generateTokens(user.id.toString(), user.email);

    // Store session in Redis
    //await this.jwtService.storeSession(user.id, tokens.refreshToken);

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: {
        id: user.id.toString(),
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        roles: userRoles.map(role => ({
          id: role.id,
          name: role.name,
          description: role.description
        })),
        permissions: userPermissions.map(permission => ({
          id: permission.id,
          name: permission.name,
          resource: permission.resource,
          action: permission.action
        }))
      },
    };
  }

  signOut(userId: string) {
    // Remove session from Redis
    // await this.jwtService.removeSession(userId);
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

    // Update session in Redis
    //await this.jwtService.storeSession(user.id, tokens  .refreshToken);

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    };
  }
}

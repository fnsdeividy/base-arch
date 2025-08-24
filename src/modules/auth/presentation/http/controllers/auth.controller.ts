import { Controller, Post, Body, HttpCode, HttpStatus, UseGuards, Request } from '@nestjs/common';
import { AuthService } from '@modules/auth/application/services/auth.service';
import { SignInDto } from '@modules/auth/presentation/dto/signin.dto';
import { SignUpDto } from '@modules/auth/presentation/dto/signup.dto';
import { JwtAuthGuard } from '@shared/presentation/http/guards/jwt-auth.guard';
import { AuthenticatedRequest } from '@modules/user/presentation/interfaces/user.interface';

@Controller('api/v1/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Post('signin')
  @HttpCode(HttpStatus.OK)
  async signIn(@Body() signInDto: SignInDto) {
    return this.authService.signIn(signInDto);
  }

  @Post('signup')
  @HttpCode(HttpStatus.CREATED)
  async signUp(@Body() signUpDto: SignUpDto) {
    return this.authService.signUp(signUpDto);
  }

  @Post('signout')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  signOut(@Request() req: AuthenticatedRequest) {
    return this.authService.signOut(req.user.userId);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refreshToken(@Body('refreshToken') refreshToken: string) {
    return this.authService.refreshToken(refreshToken);
  }
}

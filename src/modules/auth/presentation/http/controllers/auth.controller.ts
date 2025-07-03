import { Controller, Post, Body, HttpCode, HttpStatus, UseGuards, Request } from '@nestjs/common';
import { AuthService } from '@modules/auth/application/services/auth.service';
import { SignInDto } from '@modules/auth/presentation/dto/sign-in.dto';
import { SignUpDto } from '@modules/auth/presentation/dto/sign-up.dto';
import { JwtAuthGuard } from '@shared/presentation/http/guards/jwt-auth.guard';

@Controller('api/v1/sessions')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Post('sign-in')
  @HttpCode(HttpStatus.OK)
  async signIn(@Body() signInDto: SignInDto) {
    return this.authService.signIn(signInDto);
  }

  @Post('sign-up')
  @HttpCode(HttpStatus.CREATED)
  async signUp(@Body() signUpDto: SignUpDto) {
    return this.authService.signUp(signUpDto);
  }

  @Post('sign-out')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  signOut(@Request() req: any) {
    return this.authService.signOut(req.user.userId);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refreshToken(@Body() refreshToken: string) {
    return this.authService.refreshToken(refreshToken);
  }
} 
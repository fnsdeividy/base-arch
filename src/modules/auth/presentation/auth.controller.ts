import { Controller, Post, Body, HttpCode, HttpStatus, Get, UseGuards, Request } from '@nestjs/common';
import { AuthService } from '../application/auth.service';
import { Public } from '../../../shared/decorators/public.decorator';
import { JwtAuthGuard } from '../../../shared/presentation/http/guards/jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: { email: string; password: string }) {
    return this.authService.login(loginDto.email, loginDto.password);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getProfile(@Request() req) {
    return req.user;
  }

  @Public()
  @Post('validate-token')
  @HttpCode(HttpStatus.OK)
  async validateToken(@Body() body: { token: string }) {
    return this.authService.validateToken(body.token);
  }
}

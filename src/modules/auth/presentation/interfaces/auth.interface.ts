import { SignInDto } from '@modules/auth/presentation/dto/signin.dto';
import { SignUpDto } from '@modules/auth/presentation/dto/signup.dto';

export interface IAuthService {
  signIn(signInDto: SignInDto): Promise<any>;
  signUp(signUpDto: SignUpDto): Promise<any>;
  signOut(userId: string): any;
  refreshToken(refreshToken: string): Promise<any>;
}
